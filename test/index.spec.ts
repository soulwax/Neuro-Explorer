import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Neuro Explorer worker', () => {
	it('returns API route metadata (unit style)', async () => {
		const request = new IncomingRequest('http://example.com/routes');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			name: string;
			routes: Record<string, string>;
		};
		expect(data.name).toBe('Neuro Explorer');
		expect(data.routes['/ask']).toContain('Socratic neuroscience tutor');
	});

	it('serves the HTML UI shell at root (integration style)', async () => {
		const response = await SELF.fetch('https://example.com/');
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toContain('text/html');
		expect(await response.text()).toContain('Neuro Explorer');
	});
});
