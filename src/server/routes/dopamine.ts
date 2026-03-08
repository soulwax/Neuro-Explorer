import {
	defaultDopamineParams,
	simulateDopamine,
	type DopamineParams,
} from '../../core/dopamine';

function parseParams(url: URL): DopamineParams {
	const params = { ...defaultDopamineParams };

	for (const key of Object.keys(defaultDopamineParams) as (keyof DopamineParams)[]) {
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

export function handleDopamine(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulateDopamine(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
