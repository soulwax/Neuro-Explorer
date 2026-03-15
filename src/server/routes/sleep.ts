import {
	defaultSleepParams,
	simulateSleep,
	type SleepParams,
} from '../../core/sleep';

function parseParams(url: URL): SleepParams {
	const params = { ...defaultSleepParams };

	for (const key of Object.keys(defaultSleepParams) as (keyof SleepParams)[]) {
		const raw = url.searchParams.get(key);
		if (raw === null) {
			continue;
		}

		const parsed = Number.parseFloat(raw);
		if (!Number.isNaN(parsed)) {
			params[key] = parsed;
		}
	}

	return params;
}

export function handleSleep(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulateSleep(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
