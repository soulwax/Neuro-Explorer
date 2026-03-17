import {
	defaultEEGParams,
	simulateEEG,
	type EEGParams,
} from '../../core/eeg';

type EEGStringKey = 'focalSlowing' | 'epileptiform';
type EEGNumericKey = Exclude<keyof EEGParams, EEGStringKey>;

const STRING_KEYS = new Set<EEGStringKey>(['focalSlowing', 'epileptiform']);

const FOCAL_VALUES = new Set(['none', 'left-temporal', 'right-temporal', 'left-frontal', 'right-frontal']);
const EPI_VALUES = new Set(['none', 'left-temporal-spikes', 'right-temporal-spikes', 'generalized-spike-wave', 'burst-suppression']);

function parseParams(url: URL): EEGParams {
	const params = { ...defaultEEGParams };

	for (const key of Object.keys(defaultEEGParams) as (keyof EEGParams)[]) {
		const raw = url.searchParams.get(key);
		if (raw === null) {
			continue;
		}

		if (STRING_KEYS.has(key as EEGStringKey)) {
			if (key === 'focalSlowing' && FOCAL_VALUES.has(raw)) {
				params.focalSlowing = raw as EEGParams['focalSlowing'];
			}
			if (key === 'epileptiform' && EPI_VALUES.has(raw)) {
				params.epileptiform = raw as EEGParams['epileptiform'];
			}
			continue;
		}

		const parsed = Number.parseFloat(raw);
		if (!Number.isNaN(parsed)) {
			(params as Record<EEGNumericKey, number>)[key as EEGNumericKey] = parsed;
		}
	}

	return params;
}

export function handleEEG(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulateEEG(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
