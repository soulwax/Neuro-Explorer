import {
	defaultPlasticityParams,
	simulatePlasticity,
	type PlasticityParams,
} from '../../core/plasticity';

function parseParams(url: URL): PlasticityParams {
	const params = { ...defaultPlasticityParams };

	for (const key of Object.keys(defaultPlasticityParams) as (keyof PlasticityParams)[]) {
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

export function handlePlasticity(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulatePlasticity(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
