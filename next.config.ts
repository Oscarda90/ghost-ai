import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Clerk-hosted user avatars (collaborator presence).
    remotePatterns: [{ protocol: "https", hostname: "img.clerk.com", pathname: "/**" }],
  },
};

export default nextConfig;
