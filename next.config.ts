import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/shall-we",
        assetPrefix: "/shall-we/",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
