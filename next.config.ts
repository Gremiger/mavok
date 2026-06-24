import type { NextConfig } from "next";
import { execSync } from "child_process";

const commitSha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  execSync("git rev-parse HEAD").toString().trim();

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
};

export default nextConfig;
