import {
  createBindingAiClient,
  createRestAiClient,
  type AiBindingLike,
  type AiClient,
} from "./client";

const MISSING_AI_CONFIG_MESSAGE =
  "Cloudflare AI is not configured. Set CLOUDFLARE_ACCOUNT_ID (or CF_ACCOUNT_ID) and CLOUDFLARE_API_TOKEN (or CF_API_TOKEN).";

const missingAiClient: AiClient = {
  async run() {
    throw new Error(MISSING_AI_CONFIG_MESSAGE);
  },
};

function normalizeAiCredential(value?: string): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const withoutWrappingQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  return withoutWrappingQuotes || undefined;
}

export function createAiClientFromEnv(env: {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CF_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CF_API_TOKEN?: string;
}): AiClient {
  const accountId = normalizeAiCredential(
    env.CLOUDFLARE_ACCOUNT_ID ?? env.CF_ACCOUNT_ID,
  );
  const apiToken = normalizeAiCredential(
    env.CLOUDFLARE_API_TOKEN ?? env.CF_API_TOKEN,
  );

  if (!accountId || !apiToken) {
    return missingAiClient;
  }

  return createRestAiClient({ accountId, apiToken });
}

export function createAiClientFromRuntime(options: {
  processEnv: {
    CLOUDFLARE_ACCOUNT_ID?: string;
    CF_ACCOUNT_ID?: string;
    CLOUDFLARE_API_TOKEN?: string;
    CF_API_TOKEN?: string;
  };
  cloudflareEnv?: {
    AI?: AiBindingLike | undefined;
  };
}): AiClient {
  const binding = options.cloudflareEnv?.AI;

  if (binding) {
    return createBindingAiClient(binding);
  }

  return createAiClientFromEnv(options.processEnv);
}
