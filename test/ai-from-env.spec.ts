import { describe, expect, it } from "vitest";
import {
  createAiClientFromEnv,
  createAiClientFromRuntime,
} from "../src/server/ai/from-env";
import { createRestAiClient } from "../src/server/ai/client";

describe("AI runtime selection", () => {
  it("prefers the Cloudflare AI binding when present", async () => {
    const calls: Array<{ model: string; input: unknown }> = [];
    const client = createAiClientFromRuntime({
      processEnv: {},
      cloudflareEnv: {
        AI: {
          async run(model, input) {
            calls.push({ model, input });
            return { ok: true };
          },
        },
      },
    });

    const result = await client.run("@cf/meta/llama", { prompt: "test" });

    expect(result).toEqual({ ok: true });
    expect(calls).toEqual([
      {
        model: "@cf/meta/llama",
        input: { prompt: "test" },
      },
    ]);
  });

  it("falls back to REST credentials when no binding is present", async () => {
    const originalFetch = globalThis.fetch;
    const requests: string[] = [];

    globalThis.fetch = (async (input) => {
      requests.push(String(input));
      return new Response(
        JSON.stringify({
          success: true,
          result: { source: "rest" },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }) as typeof fetch;

    try {
      const client = createAiClientFromRuntime({
        processEnv: {
          CLOUDFLARE_ACCOUNT_ID: "acct",
          CLOUDFLARE_API_TOKEN: "token",
        },
      });

      const result = await client.run("@cf/meta/llama", { prompt: "test" });

      expect(result).toEqual({ source: "rest" });
      expect(requests[0]).toContain("/accounts/acct/ai/run/@cf/meta/llama");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("treats quote-only or blank credentials as missing configuration", async () => {
    const client = createAiClientFromEnv({
      CLOUDFLARE_ACCOUNT_ID: ' "acct" ',
      CLOUDFLARE_API_TOKEN: ' "" ',
    });

    await expect(client.run("@cf/meta/llama", { prompt: "test" })).rejects.toThrow(
      "Cloudflare AI is not configured.",
    );
  });

  it("normalizes wrapped credential values before using REST fallback", async () => {
    const originalFetch = globalThis.fetch;
    const requests: Array<{ url: string; auth: string | null }> = [];

    globalThis.fetch = (async (input, init) => {
      requests.push({
        url: String(input),
        auth: new Headers(init?.headers).get("Authorization"),
      });

      return new Response(
        JSON.stringify({
          success: true,
          result: { source: "rest" },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }) as typeof fetch;

    try {
      const client = createAiClientFromEnv({
        CLOUDFLARE_ACCOUNT_ID: ' "acct" ',
        CLOUDFLARE_API_TOKEN: " 'token' ",
      });

      const result = await client.run("@cf/meta/llama", { prompt: "test" });

      expect(result).toEqual({ source: "rest" });
      expect(requests).toEqual([
        {
          url: "https://api.cloudflare.com/client/v4/accounts/acct/ai/run/@cf/meta/llama",
          auth: "Bearer token",
        },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("surfaces a clearer authentication error for invalid REST credentials", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          success: false,
          errors: [{ code: 10000, message: "Authentication error" }],
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )) as typeof fetch;

    try {
      const client = createRestAiClient({
        accountId: "acct",
        apiToken: "bad-token",
      });

      await expect(client.run("@cf/meta/llama", { prompt: "test" })).rejects.toThrow(
        "Workers AI authentication failed.",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
