import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const defaultBasePath = isProd ? "/Dental_SoftwareUI" : "";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : defaultBasePath;

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
