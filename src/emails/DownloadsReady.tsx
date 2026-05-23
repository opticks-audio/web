import * as React from "react";
import { Section, Text, Link } from "@react-email/components";
import { EmailShell, H1, P, Eyebrow, Small } from "./_shared";

/**
 * Sent when a confirmed subscriber requests download links.
 *
 * Editorial intent:
 *   - Headline communicates the gift: "Your Opticks Collection is ready".
 *   - One card per plug-in with platform-specific buttons. Reads like
 *     a release-notes page, not a flat list of links.
 *   - Right-click → Open instructions for Mac Gatekeeper because we
 *     are not yet code-signing the builds. Sets expectations honestly.
 *   - "Links expire in 24 hours" — clear, no surprises.
 */
export type DownloadArtefact = {
  slug: "reflexion" | "refraction" | "inflexion";
  version: string;
  releaseNotes: string | null;
  mac: string | null;
  windows: string | null;
};

const PLUGIN_LABEL: Record<DownloadArtefact["slug"], string> = {
  reflexion: "REFLEXION",
  refraction: "REFRACTION",
  inflexion: "INFLEXION",
};

const PLUGIN_TAGLINE: Record<DownloadArtefact["slug"], string> = {
  reflexion: "Algorithmic Reverb · 8-channel modulated FDN",
  refraction: "Tape-Style Spatial Delay · Authentic head model",
  inflexion: "Dynamics · VCA / FET / OPTO + transformer saturation",
};

export default function DownloadsReady({
  artefacts,
}: {
  artefacts: DownloadArtefact[];
}) {
  return (
    <EmailShell preview="Your Opticks Collection is ready to download.">
      <Eyebrow>Beta build ready</Eyebrow>
      <H1>Your Opticks Collection is ready.</H1>
      <P>
        The links below are signed for your email and expire in 24 hours.
        Download once, then keep the files locally — you can request fresh
        links any time from your plug-in page.
      </P>

      {artefacts.map((a, idx) => (
        <PluginCard key={a.slug} artefact={a} last={idx === artefacts.length - 1} />
      ))}

      <Section
        style={{
          padding: "20px 22px",
          borderRadius: 12,
          backgroundColor: "#06060a",
          border: "1px solid rgba(255,255,255,0.06)",
          margin: "12px 0 20px",
        }}
      >
        <Text
          style={{
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#9a9aa6",
            margin: "0 0 12px",
            fontWeight: 500,
          }}
        >
          Installation on macOS
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#c9c9d2",
            lineHeight: "22px",
            margin: 0,
          }}
        >
          These beta builds are not yet code-signed. macOS Gatekeeper will warn
          you the first time you open them. To bypass:{" "}
          <strong style={{ color: "#f5f5f7" }}>
            right-click → Open → Open again
          </strong>
          . You only need to do this once per plug-in. Your DAW will then load
          them normally on every project.
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#9a9aa6",
            lineHeight: "20px",
            margin: "12px 0 0",
          }}
        >
          VST3 lives in{" "}
          <code style={{ color: "#f5f5f7" }}>
            /Library/Audio/Plug-Ins/VST3
          </code>
          {" · "}
          AU in{" "}
          <code style={{ color: "#f5f5f7" }}>
            /Library/Audio/Plug-Ins/Components
          </code>
          .
        </Text>
      </Section>

      <P>
        We&apos;re iterating fast. New tuning, new visualisers, new modes —
        we&apos;ll email you when a meaningful version lands. Reply to this
        email if anything sounds off; the DSP team reads every note.
      </P>

      <Small>
        Need help?{" "}
        <Link
          href="mailto:beta@opticksaudio.com"
          style={{ color: "#9a9aa6", textDecoration: "underline" }}
        >
          beta@opticksaudio.com
        </Link>
        . We read every reply.
      </Small>
    </EmailShell>
  );
}

function PluginCard({
  artefact,
  last,
}: {
  artefact: DownloadArtefact;
  last: boolean;
}) {
  const label = PLUGIN_LABEL[artefact.slug];
  const tagline = PLUGIN_TAGLINE[artefact.slug];

  return (
    <Section
      style={{
        padding: "24px 24px",
        borderRadius: 12,
        backgroundColor: "#06060a",
        border: "1px solid rgba(255,255,255,0.06)",
        margin: last ? "0 0 28px" : "0 0 16px",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#9a9aa6",
          margin: "0 0 6px",
          fontWeight: 500,
        }}
      >
        {tagline}
      </Text>
      <Text
        style={{
          fontSize: 24,
          fontFamily:
            "'Instrument Serif', 'Hoefler Text', Georgia, serif",
          color: "#f5f5f7",
          margin: "0 0 4px",
          fontWeight: 400,
          letterSpacing: -0.3,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#6b6b78",
          margin: "0 0 18px",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
        }}
      >
        v{artefact.version}
      </Text>

      {artefact.releaseNotes ? (
        <Text
          style={{
            fontSize: 14,
            color: "#c9c9d2",
            lineHeight: "22px",
            margin: "0 0 20px",
          }}
        >
          {artefact.releaseNotes}
        </Text>
      ) : null}

      {/* Download buttons row */}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{ borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            {artefact.mac && (
              <td style={{ paddingRight: 10 }}>
                <Link
                  href={artefact.mac}
                  style={{
                    display: "inline-block",
                    padding: "12px 22px",
                    backgroundColor: "#f5f5f7",
                    color: "#050507",
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: 0.1,
                    borderRadius: 999,
                    textDecoration: "none",
                  }}
                >
                  Download for Mac
                </Link>
              </td>
            )}
            {artefact.windows && (
              <td>
                <Link
                  href={artefact.windows}
                  style={{
                    display: "inline-block",
                    padding: "11px 22px",
                    backgroundColor: "transparent",
                    color: "#f5f5f7",
                    fontWeight: 500,
                    fontSize: 14,
                    letterSpacing: 0.1,
                    borderRadius: 999,
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  Download for Windows
                </Link>
              </td>
            )}
            {!artefact.mac && !artefact.windows && (
              <td>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#9a9aa6",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  This build isn&apos;t ready yet. We&apos;ll email you the
                  moment it ships.
                </Text>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
