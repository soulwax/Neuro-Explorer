import {
	defaultGridCellParams,
	simulateGridCell,
	type GridCellParams,
} from '../../core/grid-cell';

function parseParams(url: URL): GridCellParams {
	const params = { ...defaultGridCellParams };

	for (const key of Object.keys(defaultGridCellParams) as (keyof GridCellParams)[]) {
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

export function handleGridCell(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulateGridCell(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
