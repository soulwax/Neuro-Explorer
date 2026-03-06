import { handleRequest } from '../src/app';
import { createRestAiClient, type AiClient } from '../src/ai/client';

const MISSING_AI_CONFIG_MESSAGE =
	'Workers AI is not configured. Set CLOUDFLARE_ACCOUNT_ID (or CF_ACCOUNT_ID) and CLOUDFLARE_API_TOKEN (or CF_API_TOKEN).';

function normalizeExternalPath(pathname: string): string {
	if (!pathname) {
		return '/';
	}
	return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function withOriginalPath(request: Request): Request {
	const url = new URL(request.url);
	const rewrittenPath = url.searchParams.get('__pathname');
	if (!rewrittenPath) {
		return request;
	}

	url.pathname = normalizeExternalPath(rewrittenPath);
	url.searchParams.delete('__pathname');
	return new Request(url.toString(), request);
}

function createVercelAiClient(): AiClient {
	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? process.env.CF_ACCOUNT_ID;
	const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CF_API_TOKEN;

	if (!accountId || !apiToken) {
		return {
			async run() {
				throw new Error(MISSING_AI_CONFIG_MESSAGE);
			},
		};
	}

	return createRestAiClient({ accountId, apiToken });
}

const aiClient = createVercelAiClient();

export default {
	async fetch(request: Request): Promise<Response> {
		return handleRequest(withOriginalPath(request), { ai: aiClient });
	},
};
