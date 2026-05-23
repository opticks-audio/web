import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages doesn't implement Next.js' /_next/image optimizer
  // endpoint, so served <Image> components 404. Disabling the optimizer
  // makes Next render plain <img> tags and Cloudflare's CDN (Polish +
  // Mirage) handles compression at the edge instead.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
