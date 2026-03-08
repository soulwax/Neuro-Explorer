import path from "node:path";
import { fileURLToPath } from "node:url";

import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default config;
