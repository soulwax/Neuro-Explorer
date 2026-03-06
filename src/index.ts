import { handleRequest } from './app';
import { createBindingAiClient, type AiBindingLike } from './ai/client';

export interface Env {
	AI: AiBindingLike;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		return handleRequest(request, { ai: createBindingAiClient(env.AI) });
	},
} satisfies ExportedHandler<Env>;
