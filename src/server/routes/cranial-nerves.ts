import {
	cranialNerves,
	cranialNerveSyndromes,
	cranialNervePresets,
	getCranialNerve,
	getCranialNerveSyndrome,
} from '../../core/cranial-nerves';

export function handleCranialNerves(request: Request): Response {
	const url = new URL(request.url);
	const nerveNumber = url.searchParams.get('nerve');
	const syndromeId = url.searchParams.get('syndrome');

	if (nerveNumber) {
		const nerve = getCranialNerve(Number(nerveNumber));
		if (!nerve) {
			return Response.json({ error: `CN ${nerveNumber} not found` }, { status: 404 });
		}
		return Response.json(nerve, { headers: { 'Content-Type': 'application/json' } });
	}

	if (syndromeId) {
		const syndrome = getCranialNerveSyndrome(syndromeId);
		if (!syndrome) {
			return Response.json({ error: `Syndrome ${syndromeId} not found` }, { status: 404 });
		}
		return Response.json(syndrome, { headers: { 'Content-Type': 'application/json' } });
	}

	return Response.json(
		{ nerves: cranialNerves, syndromes: cranialNerveSyndromes, presets: cranialNervePresets },
		{ headers: { 'Content-Type': 'application/json' } },
	);
}
