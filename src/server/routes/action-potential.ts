import {
	defaultActionPotentialParams,
	simulateActionPotential,
	type ActionPotentialParams,
} from '../../core/action-potential';

function parseParams(url: URL): ActionPotentialParams {
	const params = { ...defaultActionPotentialParams };

	for (const key of Object.keys(defaultActionPotentialParams) as (keyof ActionPotentialParams)[]) {
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

export function handleActionPotential(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulateActionPotential(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
