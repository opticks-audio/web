import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverEnv } from "@/lib/env";

/**
 * Cloudflare R2 client (S3-compatible).
 *
 * R2's S3 API treats the bucket region as `auto`. We use the AWS SDK
 * exclusively for `GetObject` presigning — uploads happen manually
 * via the dashboard or wrangler, not from the web app.
 *
 * One client per Node process is plenty: presigning is pure arithmetic
 * over the credentials and the URL, no network call.
 */

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  const env = serverEnv();
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_ENDPOINT) {
    throw new Error(
      "[opticks-audio] R2 not configured — set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_ENDPOINT.",
    );
  }
  cachedClient = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    // R2 prefers path-style addressing; the SDK default is virtual-hosted.
    forcePathStyle: true,
  });
  return cachedClient;
}

export type PluginSlug = "reflexion" | "refraction" | "inflexion";
export type Platform = "mac" | "windows";

/**
 * R2 object key for a given plug-in / platform / version.
 *
 * Layout:  reflexion/v0.1.0/Reflexion-mac-v0.1.0.zip
 *
 * The platform is part of the file *name* (not a folder) so the same
 * version directory holds every artefact for that release. Easier to
 * audit at a glance from the R2 dashboard.
 */
export function pluginObjectKey(
  slug: PluginSlug,
  platform: Platform,
  version: string,
): string {
  const cap = slug.charAt(0).toUpperCase() + slug.slice(1);
  return `${slug}/v${version}/${cap}-${platform}-v${version}.zip`;
}

/**
 * Issue a short-lived signed URL for downloading a plug-in artefact.
 *
 * The returned URL is meant to land directly in an email — the user
 * clicks it, gets a `.zip`. Default TTL is 24 hours; long enough that
 * the email isn't a race against the clock, short enough that the link
 * can't be forwarded around indefinitely.
 */
export async function signPluginDownloadUrl(params: {
  slug: PluginSlug;
  platform: Platform;
  version: string;
  /** Override the default 24h validity. Useful for tests. */
  ttlSeconds?: number;
}): Promise<string> {
  const env = serverEnv();
  const client = getClient();
  const key = pluginObjectKey(params.slug, params.platform, params.version);

  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    // Force browser to download the file with a clean filename instead
    // of opening it inline.
    ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
  });

  return getSignedUrl(client, command, {
    expiresIn: params.ttlSeconds ?? 60 * 60 * 24, // 24 h
  });
}

/**
 * Returns true if the plug-in/platform/version object actually exists
 * in R2. We HEAD the object instead of GET so we don't pay for egress
 * just to check availability.
 *
 * Useful to gate the "Get download links" UI: we only show a platform
 * if its artefact is actually uploaded.
 */
export async function pluginObjectExists(
  slug: PluginSlug,
  platform: Platform,
  version: string,
): Promise<boolean> {
  const env = serverEnv();
  const client = getClient();
  const key = pluginObjectKey(slug, platform, version);
  try {
    await client.send(
      new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }),
    );
    return true;
  } catch (err) {
    // S3 SDK throws a 404 wrapper for missing objects; treat anything
    // other than a 200 as "not available".
    const status =
      (err as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode ?? 0;
    if (status === 404 || status === 403) return false;
    throw err;
  }
}
