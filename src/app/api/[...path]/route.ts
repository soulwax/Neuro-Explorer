import { getCloudflareContext } from "@opennextjs/cloudflare";
import { env } from "~/env";
import { createAiClientFromRuntime } from "~/server/ai/from-env";
import { handleApiRequest } from "~/server/app";

export const dynamic = "force-dynamic";

async function route(request: Request): Promise<Response> {
  let cloudflareEnv:
    | {
        AI?: { run(model: string, input: unknown): Promise<unknown> };
      }
    | undefined;

  try {
    cloudflareEnv = (
      await getCloudflareContext({ async: true })
    ).env as typeof cloudflareEnv;
  } catch {
    cloudflareEnv = undefined;
  }

  return handleApiRequest(request, {
    ai: createAiClientFromRuntime({
      processEnv: env,
      cloudflareEnv,
    }),
  });
}

export { route as GET, route as POST, route as OPTIONS, route as HEAD };
