import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "admin.rff.giize.com" }],
        destination: "/admin/:path*",
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "status.rff.giize.com" }],
        destination: "/status/:path*",
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "fantasy.rff.giize.com" }],
        destination: "/fantasy/:path*",
      },
    ];
  },
};

export default nextConfig;
