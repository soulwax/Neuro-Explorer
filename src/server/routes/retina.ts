import {
	defaultRetinaParams,
	simulateRetina,
	type RetinaParams,
} from '../../core/retina';

function parseParams(url: URL): RetinaParams {
	const params = { ...defaultRetinaParams };

	for (const key of Object.keys(defaultRetinaParams) as (keyof RetinaParams)[]) {
		if (key === 'stimulusType') {
			continue;
		}

		const raw = url.searchParams.get(key);
		if (raw === null) {
			continue;
		}

		const parsed = Number.parseFloat(raw);
		if (!Number.isNaN(parsed)) {
			params[key] = parsed;
		}
	}

	const stimulusType = url.searchParams.get('stimulusType');
	if (
		stimulusType === 'spot' ||
		stimulusType === 'annulus' ||
		stimulusType === 'edge'
	) {
		params.stimulusType = stimulusType;
	}

	return params;
}

export function handleRetina(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulateRetina(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
