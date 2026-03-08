import { env } from "~/env";
import { createAiClientFromEnv } from "~/server/ai/from-env";
import { handleApiRequest } from "~/server/app";

export const dynamic = "force-dynamic";

async function route(request: Request): Promise<Response> {
  return handleApiRequest(request, {
    ai: createAiClientFromEnv(env),
  });
}

export { route as GET, route as POST, route as OPTIONS, route as HEAD };
