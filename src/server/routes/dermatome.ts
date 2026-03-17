import {
	simulateSensoryLesion,
	dermatomes,
	sensoryModalities,
	sensoryTracts,
	sensoryLesionLevels,
	sensoryPresets,
} from '../../core/dermatome';

export function handleDermatome(request: Request): Response {
	const url = new URL(request.url);
	const lesionId = url.searchParams.get('lesionId');

	if (lesionId) {
		const result = simulateSensoryLesion(lesionId);
		return Response.json(result, { headers: { 'Content-Type': 'application/json' } });
	}

	return Response.json(
		{
			dermatomes,
			modalities: sensoryModalities,
			tracts: sensoryTracts,
			lesionLevels: sensoryLesionLevels,
			presets: sensoryPresets,
		},
		{ headers: { 'Content-Type': 'application/json' } },
	);
}
