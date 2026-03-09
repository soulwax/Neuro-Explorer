import path from "node:path";
import { fileURLToPath } from "node:url";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

import "./src/env.js";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

/** @type {import("next").NextConfig} */
const config = {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default config;
