import { describe, expect, it } from "vitest";
import { createAiClientFromRuntime } from "../src/server/ai/from-env";

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
});
