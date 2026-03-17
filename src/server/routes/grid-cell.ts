/**
 * Grid Cell Navigator
 *
 * Simulates a rodent exploring a square arena while a medial entorhinal
 * cortex grid cell fires with a hexagonal spatial tuning pattern.
 */

interface GridCellParams {
	arenaSize: number;
	durationSec: number;
	dtMs: number;
	speed: number;
	spacing: number;
	orientation: number;
	phaseX: number;
	phaseY: number;
	sharpness: number;
	maxRate: number;
	thetaMod: number;
	turnNoise: number;
}

interface PathPoint {
	t: number;
	x: number;
	y: number;
	rateHz: number;
}

interface SpikePoint {
	t: number;
	x: number;
	y: number;
}

interface GridCellResult {
	params: GridCellParams;
	path: PathPoint[];
	spikes: SpikePoint[];
	rateMap: number[][];
	summary: {
		spikeCount: number;
		meanRateHz: number;
		coveragePct: number;
		peakRateHz: number;
		orientationDeg: number;
		spacingCm: number;
	};
	explanation: {
		model: string;
		notes: string[];
	};
}

const DEFAULTS: GridCellParams = {
	arenaSize: 120,
	durationSec: 90,
	dtMs: 40,
	speed: 18,
	spacing: 32,
	orientation: 18,
	phaseX: 6,
	phaseY: -4,
	sharpness: 1.8,
	maxRate: 18,
	thetaMod: 0.45,
	turnNoise: 0.22,
};

const HEATMAP_BINS = 24;
const DEG_TO_RAD = Math.PI / 180;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 3): number {
	return parseFloat(value.toFixed(digits));
}

function createRng(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state += 0x6d2b79f5;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function makeSeed(params: GridCellParams): number {
	const values = [
		params.arenaSize,
		params.durationSec,
		params.dtMs,
		params.speed,
		params.spacing,
		params.orientation,
		params.phaseX,
		params.phaseY,
		params.sharpness,
		params.maxRate,
		params.thetaMod,
		params.turnNoise,
	];
	return values.reduce((acc, value, index) => {
		const scaled = Math.round((value + 500) * 1000);
		return (acc ^ (scaled + index * 2654435761)) >>> 0;
	}, 2166136261);
}

function parseParams(url: URL): GridCellParams {
	const params = { ...DEFAULTS };
	for (const key of Object.keys(DEFAULTS) as (keyof GridCellParams)[]) {
		const raw = url.searchParams.get(key);
		if (raw !== null) {
			const parsed = parseFloat(raw);
			if (!isNaN(parsed)) {
				params[key] = parsed;
			}
		}
	}

	params.arenaSize = clamp(params.arenaSize, 60, 240);
	params.durationSec = clamp(params.durationSec, 20, 240);
	params.dtMs = clamp(params.dtMs, 20, 120);
	params.speed = clamp(params.speed, 4, 60);
	params.spacing = clamp(params.spacing, 12, 80);
	params.orientation = clamp(params.orientation, -90, 90);
	params.phaseX = clamp(params.phaseX, -params.arenaSize / 2, params.arenaSize / 2);
	params.phaseY = clamp(params.phaseY, -params.arenaSize / 2, params.arenaSize / 2);
	params.sharpness = clamp(params.sharpness, 0.4, 4);
	params.maxRate = clamp(params.maxRate, 2, 40);
	params.thetaMod = clamp(params.thetaMod, 0, 1);
	params.turnNoise = clamp(params.turnNoise, 0.02, 0.7);

	return params;
}

function gridRate(x: number, y: number, params: GridCellParams): number {
	const k = (4 * Math.PI) / (Math.sqrt(3) * params.spacing);
	const px = x - params.arenaSize / 2 - params.phaseX;
	const py = y - params.arenaSize / 2 - params.phaseY;
	const baseAngle = params.orientation * DEG_TO_RAD;

	let sum = 0;
	for (let i = 0; i < 3; i++) {
		const angle = baseAngle + i * (Math.PI / 3);
		sum += Math.cos(k * (Math.cos(angle) * px + Math.sin(angle) * py));
	}

	return Math.exp(params.sharpness * (sum - 3));
}

function simulate(params: GridCellParams): GridCellResult {
	const dtSec = params.dtMs / 1000;
	const steps = Math.floor(params.durationSec / dtSec);
	const rng = createRng(makeSeed(params));
	const path: PathPoint[] = [];
	const spikes: SpikePoint[] = [];
	const occupancy = Array.from({ length: HEATMAP_BINS }, () => Array.from({ length: HEATMAP_BINS }, () => 0));
	const spikeMap = Array.from({ length: HEATMAP_BINS }, () => Array.from({ length: HEATMAP_BINS }, () => 0));

	let x = params.arenaSize * 0.56;
	let y = params.arenaSize * 0.52;
	let heading = 0.7;
	let rateSum = 0;
	let peakRateHz = 0;

	for (let i = 0; i <= steps; i++) {
		const t = i * dtSec;

		heading += (rng() - 0.5) * params.turnNoise;
		heading += 0.04 * Math.sin(t * 0.37) + 0.02 * Math.cos(t * 0.18);

		let dx = Math.cos(heading) * params.speed * dtSec;
		let dy = Math.sin(heading) * params.speed * dtSec;

		if (x + dx < 0 || x + dx > params.arenaSize) {
			heading = Math.PI - heading;
			dx = Math.cos(heading) * params.speed * dtSec;
		}
		if (y + dy < 0 || y + dy > params.arenaSize) {
			heading = -heading;
			dy = Math.sin(heading) * params.speed * dtSec;
		}

		x = clamp(x + dx, 0, params.arenaSize);
		y = clamp(y + dy, 0, params.arenaSize);

		const thetaFactor = 1 - params.thetaMod * 0.5 + params.thetaMod * 0.5 * (1 + Math.sin(2 * Math.PI * 8 * t));
		const normalizedRate = gridRate(x, y, params);
		const rateHz = 0.05 + params.maxRate * Math.pow(normalizedRate, 0.92) * thetaFactor;
		const spikeProbability = clamp(rateHz * dtSec, 0, 0.95);
		const spiked = rng() < spikeProbability;

		path.push({
			t: round(t, 2),
			x: round(x, 2),
			y: round(y, 2),
			rateHz: round(rateHz, 3),
		});

		if (spiked) {
			spikes.push({ t: round(t, 2), x: round(x, 2), y: round(y, 2) });
		}

		const binX = clamp(Math.floor((x / params.arenaSize) * HEATMAP_BINS), 0, HEATMAP_BINS - 1);
		const binY = clamp(Math.floor((y / params.arenaSize) * HEATMAP_BINS), 0, HEATMAP_BINS - 1);
		occupancy[binY]![binX]! += dtSec;
		if (spiked) {
			spikeMap[binY]![binX]! += 1;
		}

		rateSum += rateHz;
		peakRateHz = Math.max(peakRateHz, rateHz);
	}

	let visitedBins = 0;
	const rateMap = occupancy.map((row, rowIndex) =>
		row.map((seconds, colIndex) => {
			if (seconds <= 0) {
				return 0;
			}
			visitedBins += 1;
			return round(spikeMap[rowIndex]![colIndex]! / seconds, 2);
		})
	);

	return {
		params,
		path,
		spikes,
		rateMap,
		summary: {
			spikeCount: spikes.length,
			meanRateHz: round(spikes.length / params.durationSec, 2),
			coveragePct: round((visitedBins / (HEATMAP_BINS * HEATMAP_BINS)) * 100, 1),
			peakRateHz: round(peakRateHz, 2),
			orientationDeg: round(params.orientation, 1),
			spacingCm: round(params.spacing, 1),
		},
		explanation: {
			model: 'A simplified entorhinal grid-cell firing field generated from three cosine gratings separated by 60 degrees.',
			notes: [
				'Grid cells tile physical space with a hexagonal lattice that supports path integration and spatial mapping.',
				'Changing spacing rescales the lattice, while orientation rotates the whole firing pattern in the arena.',
				'Theta modulation increases firing on an 8 Hz rhythm, loosely echoing rodent hippocampal-entorhinal theta states.',
			],
		},
	};
}

export function handleGridCell(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulate(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
