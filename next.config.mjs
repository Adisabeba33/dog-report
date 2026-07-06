// Static export config. On GitHub Pages the app is served from a repo
// subpath (e.g. /dog-report), passed in via PAGES_BASE_PATH by the deploy
// workflow. Locally the variable is unset, so the app runs at the root.
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
