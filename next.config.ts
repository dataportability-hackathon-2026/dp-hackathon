import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Optimize specific heavy packages for tree-shaking
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@radix-ui/react-icons",
      "@livekit/components-react",
      "motion",
      "@xyflow/react",
      "@tanstack/react-table",
    ],
    // Enable strict CSS chunking for smaller per-route CSS
    cssChunking: "strict",
    // Preload entries for faster navigation
    preloadEntriesOnStart: true,
  },
};

export default nextConfig;
