import {
	vascularTerritories,
	strokePresets,
	getVascularTerritory,
} from '../../core/stroke';

export function handleStroke(request: Request): Response {
	const url = new URL(request.url);
	const territoryId = url.searchParams.get('territory');

	if (territoryId) {
		const territory = getVascularTerritory(territoryId);
		if (!territory) {
			return Response.json({ error: `Territory ${territoryId} not found` }, { status: 404 });
		}
		return Response.json(territory, { headers: { 'Content-Type': 'application/json' } });
	}

	return Response.json(
		{ territories: vascularTerritories, presets: strokePresets },
		{ headers: { 'Content-Type': 'application/json' } },
	);
}
