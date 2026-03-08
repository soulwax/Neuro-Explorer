import { createRestAiClient, type AiClient } from "./client";

const MISSING_AI_CONFIG_MESSAGE =
  "Cloudflare AI is not configured. Set CLOUDFLARE_ACCOUNT_ID (or CF_ACCOUNT_ID) and CLOUDFLARE_API_TOKEN (or CF_API_TOKEN).";

const missingAiClient: AiClient = {
  async run() {
    throw new Error(MISSING_AI_CONFIG_MESSAGE);
  },
};

export function createAiClientFromEnv(env: {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CF_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CF_API_TOKEN?: string;
}): AiClient {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID ?? env.CF_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN ?? env.CF_API_TOKEN;

  if (!accountId || !apiToken) {
    return missingAiClient;
  }

  return createRestAiClient({ accountId, apiToken });
}
