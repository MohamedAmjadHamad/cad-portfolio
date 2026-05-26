import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No special config needed — Turbopack root warning is caused by a stray
  // package-lock.json in the parent directory; delete it to silence the warning.
};

export default nextConfig;
