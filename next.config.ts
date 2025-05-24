import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   eslint: {
    ignoreDuringBuilds: true, //  هذا يعطّل lint أثناء build فقط
  },
};

export default nextConfig;
