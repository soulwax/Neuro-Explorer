import {
	defaultNeuronParams,
	simulateNeuron,
	type NeuronParams,
} from '../../core/neuron';

function parseParams(url: URL): NeuronParams {
	const params = { ...defaultNeuronParams };

	for (const key of Object.keys(defaultNeuronParams) as (keyof NeuronParams)[]) {
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

export function handleNeuron(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulateNeuron(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
