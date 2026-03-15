import { simulateMotorLesion } from '../../core/motor-pathway';

export function handleMotorPathway(request: Request): Response {
	const url = new URL(request.url);
	const lesionId = url.searchParams.get('lesionId') ?? 'motor-cortex';
	const result = simulateMotorLesion(lesionId);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
