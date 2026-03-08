/**
 * 12-Lead ECG Simulator
 *
 * Generates a synthetic 12-lead ECG using a simple dipole-style model
 * with tweakable morphology and rhythm parameters.
 */

const LEAD_NAMES = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as const;
type LeadName = (typeof LEAD_NAMES)[number];

interface ECGParams {
	heartRate: number;
	duration: number;
	dt: number;
	axisDegrees: number;
	pAmp: number;
	qrsAmp: number;
	tAmp: number;
	prInterval: number;
	qrsDuration: number;
	qtInterval: number;
	stShift: number;
	rhythmIrregularity: number;
	noise: number;
	baselineWander: number;
	precordialRotation: number;
	gain: number;
}

interface ECGPoint {
	t: number;
	mv: number;
}

type ECGPhase = 'Baseline' | 'P wave' | 'QRS' | 'ST segment' | 'T wave';

interface LeadAxis {
	name: LeadName;
	group: 'limb' | 'precordial';
	x: number;
	y: number;
	z: number;
}

interface ActivationFrame {
	t: number;
	phase: ECGPhase;
	vector: {
		x: number;
		y: number;
		z: number;
		magnitude: number;
	};
	regions: {
		atria: number;
		septum: number;
		rightVentricle: number;
		leftVentricle: number;
		repolarization: number;
	};
	dominantLead: LeadName;
	dominantProjection: number;
}

interface ECGResult {
	params: ECGParams;
	leads: Record<LeadName, ECGPoint[]>;
	activation: {
		beatMs: number;
		frames: ActivationFrame[];
		leadAxes: LeadAxis[];
	};
	summary: {
		beatsEstimated: number;
		rrMsNominal: number;
		qtcBazettMs: number;
		electricalAxis: string;
		dominantRhythm: string;
	};
	explanation: {
		model: string;
		notes: string[];
	};
}

const DEFAULTS: ECGParams = {
	heartRate: 72,
	duration: 6000,
	dt: 4,
	axisDegrees: 45,
	pAmp: 0.14,
	qrsAmp: 1.1,
	tAmp: 0.34,
	prInterval: 160,
	qrsDuration: 95,
	qtInterval: 380,
	stShift: 0,
	rhythmIrregularity: 0.04,
	noise: 0.015,
	baselineWander: 0.045,
	precordialRotation: 0,
	gain: 1,
};

const DEG_TO_RAD = Math.PI / 180;
const SQRT3_OVER_2 = 0.8660254;

const LEAD_AXES = ([
	{ name: 'I', group: 'limb', x: 1, y: 0, z: 0 },
	{ name: 'II', group: 'limb', x: 0.5, y: SQRT3_OVER_2, z: 0 },
	{ name: 'III', group: 'limb', x: -0.5, y: SQRT3_OVER_2, z: 0 },
	{ name: 'aVR', group: 'limb', x: -0.75, y: -SQRT3_OVER_2 / 2, z: 0 },
	{ name: 'aVL', group: 'limb', x: 0.75, y: -SQRT3_OVER_2 / 2, z: 0 },
	{ name: 'aVF', group: 'limb', x: 0, y: SQRT3_OVER_2, z: 0 },
	{ name: 'V1', group: 'precordial', x: -0.62, y: 0.14, z: 1.25 },
	{ name: 'V2', group: 'precordial', x: -0.44, y: 0.18, z: 1.05 },
	{ name: 'V3', group: 'precordial', x: -0.18, y: 0.28, z: 0.76 },
	{ name: 'V4', group: 'precordial', x: 0.02, y: 0.34, z: 0.48 },
	{ name: 'V5', group: 'precordial', x: 0.24, y: 0.39, z: 0.23 },
	{ name: 'V6', group: 'precordial', x: 0.4, y: 0.43, z: 0.08 },
] as const).map((axis) => {
	const magnitude = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z) || 1;
	return {
		...axis,
		x: axis.x / magnitude,
		y: axis.y / magnitude,
		z: axis.z / magnitude,
	};
}) as LeadAxis[];

interface CycleMorphology {
	cycleMs: number;
	pr: number;
	qrsDuration: number;
	qt: number;
	pCenter: number;
	qrsStart: number;
	qrsCenter: number;
	qCenter: number;
	rCenter: number;
	sCenter: number;
	tCenter: number;
	stStart: number;
	tStart: number;
}

interface WaveState {
	pWave: number;
	qWave: number;
	rWave: number;
	sWave: number;
	tWave: number;
	stComponent: number;
	core: number;
	phase: ECGPhase;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 4): number {
	return parseFloat(value.toFixed(digits));
}

function gaussian(x: number, center: number, width: number): number {
	const sigma = Math.max(width, 1);
	const dx = x - center;
	return Math.exp(-(dx * dx) / (2 * sigma * sigma));
}

function smoothWindow(x: number, start: number, end: number, slope: number): number {
	const rise = 1 / (1 + Math.exp(-(x - start) / slope));
	const fall = 1 / (1 + Math.exp(-(x - end) / slope));
	return rise - fall;
}

function randomNormal(): number {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function classifyAxis(axisDegrees: number): string {
	if (axisDegrees < -30) {
		return 'Left axis deviation';
	}
	if (axisDegrees > 90) {
		return 'Right axis deviation';
	}
	return 'Normal frontal axis';
}

function getCycleMorphology(cycleMs: number, params: ECGParams): CycleMorphology {
	const pr = Math.min(params.prInterval, cycleMs * 0.38);
	const qrsDuration = Math.min(params.qrsDuration, cycleMs * 0.22);
	const qt = Math.min(params.qtInterval, cycleMs * 0.72);
	const pCenter = pr * 0.45;
	const qrsStart = pr;
	const qrsCenter = qrsStart + qrsDuration * 0.45;
	const qCenter = qrsCenter - qrsDuration * 0.18;
	const rCenter = qrsCenter;
	const sCenter = qrsCenter + qrsDuration * 0.24;
	const tCenter = Math.min(cycleMs - 70, qrsStart + qt * 0.66);
	const stStart = qrsStart + qrsDuration * 0.95;
	const tStart = tCenter - Math.max(20, qt * 0.12);

	return {
		cycleMs,
		pr,
		qrsDuration,
		qt,
		pCenter,
		qrsStart,
		qrsCenter,
		qCenter,
		rCenter,
		sCenter,
		tCenter,
		stStart,
		tStart,
	};
}

function classifyPhase(phaseMs: number, morphology: CycleMorphology): ECGPhase {
	const pEnd = morphology.pCenter + Math.max(18, morphology.pr * 0.22);
	const qrsEnd = morphology.qrsStart + morphology.qrsDuration * 1.08;
	const tEnd = morphology.tCenter + Math.max(34, morphology.qt * 0.2);

	if (phaseMs <= pEnd) {
		return 'P wave';
	}
	if (phaseMs >= morphology.qrsStart - 4 && phaseMs <= qrsEnd) {
		return 'QRS';
	}
	if (phaseMs > qrsEnd && phaseMs < morphology.tStart) {
		return 'ST segment';
	}
	if (phaseMs >= morphology.tStart && phaseMs <= tEnd) {
		return 'T wave';
	}
	return 'Baseline';
}

function computeWaveState(phaseMs: number, morphology: CycleMorphology, params: ECGParams): WaveState {
	const pWave = params.pAmp * gaussian(phaseMs, morphology.pCenter, Math.max(8, morphology.pr * 0.18));
	const qWave = -0.24 * params.qrsAmp * gaussian(phaseMs, morphology.qCenter, Math.max(4, morphology.qrsDuration * 0.08));
	const rWave = params.qrsAmp * gaussian(phaseMs, morphology.rCenter, Math.max(6, morphology.qrsDuration * 0.1));
	const sWave = -0.36 * params.qrsAmp * gaussian(phaseMs, morphology.sCenter, Math.max(5, morphology.qrsDuration * 0.11));
	const tWave = params.tAmp * gaussian(phaseMs, morphology.tCenter, Math.max(24, morphology.qt * 0.17));
	const stPlateau = smoothWindow(phaseMs, morphology.stStart, morphology.tStart, 6);
	const stComponent = params.stShift * stPlateau;

	return {
		pWave,
		qWave,
		rWave,
		sWave,
		tWave,
		stComponent,
		core: pWave + qWave + rWave + sWave + tWave + stComponent,
		phase: classifyPhase(phaseMs, morphology),
	};
}

function computeSpatialVector(
	core: number,
	derivative: number,
	waves: WaveState,
	params: ECGParams,
	axisRad: number,
	precordialRotRad: number
): { x: number; y: number; z: number; xr: number; zr: number } {
	const x = core * Math.cos(axisRad) + derivative * 0.0009;
	const y = core * Math.sin(axisRad) + derivative * 0.0007;
	const z = -0.52 * waves.qWave + 0.25 * waves.rWave - 0.88 * waves.sWave + 0.32 * waves.tWave + 0.08 * waves.pWave;
	const xr = x * Math.cos(precordialRotRad) - z * Math.sin(precordialRotRad);
	const zr = x * Math.sin(precordialRotRad) + z * Math.cos(precordialRotRad);
	return { x, y, z, xr, zr };
}

function dominantLeadProjection(x: number, y: number, z: number): { name: LeadName; projection: number } {
	let bestName: LeadName = 'II';
	let bestProjection = 0;
	let bestAbs = -1;

	for (const axis of LEAD_AXES) {
		const projection = x * axis.x + y * axis.y + z * axis.z;
		const absProjection = Math.abs(projection);
		if (absProjection > bestAbs) {
			bestAbs = absProjection;
			bestProjection = projection;
			bestName = axis.name;
		}
	}

	return { name: bestName, projection: bestProjection };
}

function computeActivationRegions(waves: WaveState, x: number, z: number, params: ECGParams): ActivationFrame['regions'] {
	const atria = clamp(Math.abs(waves.pWave) / Math.max(params.pAmp, 0.001), 0, 1);
	const qrsEnergy = Math.abs(waves.qWave) + Math.abs(waves.rWave) + Math.abs(waves.sWave);
	const depolarization = clamp(qrsEnergy / Math.max(params.qrsAmp * 1.55, 0.001), 0, 1);
	const repolarization = clamp(Math.abs(waves.tWave + waves.stComponent * 0.4) / Math.max(params.tAmp + Math.abs(params.stShift) * 0.6, 0.001), 0, 1);
	const lateralBias = clamp(0.5 + 0.32 * (x / Math.max(params.qrsAmp, 0.25)) - 0.14 * (z / Math.max(params.qrsAmp, 0.25)), 0.08, 0.92);
	const anteriorBias = clamp(0.5 + 0.24 * (z / Math.max(params.qrsAmp, 0.25)) - 0.12 * (x / Math.max(params.qrsAmp, 0.25)), 0.08, 0.92);

	return {
		atria: round(atria, 4),
		septum: round(clamp(depolarization * (0.35 + 0.35 * Math.max(0, -x / Math.max(params.qrsAmp, 0.25))), 0, 1), 4),
		rightVentricle: round(clamp(depolarization * anteriorBias, 0, 1), 4),
		leftVentricle: round(clamp(depolarization * lateralBias, 0, 1), 4),
		repolarization: round(repolarization, 4),
	};
}

function buildActivationFrames(params: ECGParams): ECGResult['activation'] {
	const beatMs = 60000 / params.heartRate;
	const frameCount = 120;
	const dt = beatMs / frameCount;
	const axisRad = params.axisDegrees * DEG_TO_RAD;
	const precordialRotRad = params.precordialRotation * DEG_TO_RAD;
	const morphology = getCycleMorphology(beatMs, params);
	const frames: ActivationFrame[] = [];
	let previousCore = 0;

	for (let i = 0; i <= frameCount; i++) {
		const phaseMs = i * dt;
		const waves = computeWaveState(phaseMs, morphology, params);
		const derivative = (waves.core - previousCore) / Math.max(dt / 1000, 0.001);
		previousCore = waves.core;
		const vector = computeSpatialVector(waves.core, derivative, waves, params, axisRad, precordialRotRad);
		const dominant = dominantLeadProjection(vector.x, vector.y, vector.z);

		frames.push({
			t: round(phaseMs, 2),
			phase: waves.phase,
			vector: {
				x: round(vector.x, 4),
				y: round(vector.y, 4),
				z: round(vector.z, 4),
				magnitude: round(Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z), 4),
			},
			regions: computeActivationRegions(waves, vector.x, vector.z, params),
			dominantLead: dominant.name,
			dominantProjection: round(dominant.projection, 4),
		});
	}

	return {
		beatMs: round(beatMs, 2),
		frames,
		leadAxes: LEAD_AXES.map((axis) => ({
			name: axis.name,
			group: axis.group,
			x: round(axis.x, 4),
			y: round(axis.y, 4),
			z: round(axis.z, 4),
		})),
	};
}

function parseParams(url: URL): ECGParams {
	const params = { ...DEFAULTS };
	for (const key of Object.keys(DEFAULTS) as (keyof ECGParams)[]) {
		const raw = url.searchParams.get(key);
		if (raw !== null) {
			const parsed = parseFloat(raw);
			if (!isNaN(parsed)) {
				params[key] = parsed;
			}
		}
	}

	params.heartRate = clamp(params.heartRate, 30, 220);
	params.duration = clamp(params.duration, 1500, 12000);
	params.dt = clamp(params.dt, 1, 10);
	params.axisDegrees = clamp(params.axisDegrees, -180, 180);
	params.pAmp = clamp(params.pAmp, 0, 0.5);
	params.qrsAmp = clamp(params.qrsAmp, 0.2, 3);
	params.tAmp = clamp(params.tAmp, 0, 1.2);
	params.prInterval = clamp(params.prInterval, 80, 320);
	params.qrsDuration = clamp(params.qrsDuration, 50, 220);
	params.qtInterval = clamp(params.qtInterval, 220, 700);
	params.stShift = clamp(params.stShift, -0.5, 0.5);
	params.rhythmIrregularity = clamp(params.rhythmIrregularity, 0, 0.25);
	params.noise = clamp(params.noise, 0, 0.15);
	params.baselineWander = clamp(params.baselineWander, 0, 0.25);
	params.precordialRotation = clamp(params.precordialRotation, -45, 45);
	params.gain = clamp(params.gain, 0.25, 3);

	return params;
}

function simulate(params: ECGParams): ECGResult {
	const leads = Object.fromEntries(LEAD_NAMES.map((name) => [name, [] as ECGPoint[]])) as Record<LeadName, ECGPoint[]>;
	const stepCount = Math.floor(params.duration / params.dt);
	const axisRad = params.axisDegrees * DEG_TO_RAD;
	const precordialRotRad = params.precordialRotation * DEG_TO_RAD;

	let phaseMs = 0;
	let previousCore = 0;

	for (let i = 0; i <= stepCount; i++) {
		const t = i * params.dt;
		const seconds = t / 1000;

		const instantRate = clamp(params.heartRate * (1 + params.rhythmIrregularity * Math.sin(2 * Math.PI * 0.1 * seconds)), 30, 240);
		const cycleMs = 60000 / instantRate;

		phaseMs += params.dt;
		if (phaseMs >= cycleMs) {
			phaseMs -= cycleMs;
		}

		const morphology = getCycleMorphology(cycleMs, params);
		const waves = computeWaveState(phaseMs, morphology, params);

		const baseline =
			params.baselineWander * Math.sin(2 * Math.PI * 0.33 * seconds) +
			params.baselineWander * 0.35 * Math.sin(2 * Math.PI * 0.08 * seconds + 1.2);
		const noise = params.noise * randomNormal();

		const derivative = (waves.core - previousCore) / Math.max(params.dt / 1000, 0.001);
		previousCore = waves.core;

		const vector = computeSpatialVector(waves.core, derivative, waves, params, axisRad, precordialRotRad);

		const leadI = vector.x;
		const leadII = 0.5 * vector.x + SQRT3_OVER_2 * vector.y;
		const leadIII = leadII - leadI;
		const aVR = -(leadI + leadII) / 2;
		const aVL = leadI - leadII / 2;
		const aVF = leadII - leadI / 2;

		const v1 = -0.62 * vector.xr + 0.14 * vector.y + 1.25 * vector.zr + waves.stComponent * 0.5;
		const v2 = -0.44 * vector.xr + 0.18 * vector.y + 1.05 * vector.zr + waves.stComponent * 0.5;
		const v3 = -0.18 * vector.xr + 0.28 * vector.y + 0.76 * vector.zr + waves.stComponent * 0.45;
		const v4 = 0.02 * vector.xr + 0.34 * vector.y + 0.48 * vector.zr + waves.stComponent * 0.4;
		const v5 = 0.24 * vector.xr + 0.39 * vector.y + 0.23 * vector.zr + waves.stComponent * 0.35;
		const v6 = 0.4 * vector.xr + 0.43 * vector.y + 0.08 * vector.zr + waves.stComponent * 0.3;

		const common = baseline + noise;
		const perLeadNoise = params.noise * 0.25;
		const gain = params.gain;

		const values: Record<LeadName, number> = {
			I: leadI * gain + common + perLeadNoise * randomNormal(),
			II: leadII * gain + common + perLeadNoise * randomNormal(),
			III: leadIII * gain + common + perLeadNoise * randomNormal(),
			aVR: aVR * gain + common + perLeadNoise * randomNormal(),
			aVL: aVL * gain + common + perLeadNoise * randomNormal(),
			aVF: aVF * gain + common + perLeadNoise * randomNormal(),
			V1: v1 * gain + common + perLeadNoise * randomNormal(),
			V2: v2 * gain + common + perLeadNoise * randomNormal(),
			V3: v3 * gain + common + perLeadNoise * randomNormal(),
			V4: v4 * gain + common + perLeadNoise * randomNormal(),
			V5: v5 * gain + common + perLeadNoise * randomNormal(),
			V6: v6 * gain + common + perLeadNoise * randomNormal(),
		};

		for (const name of LEAD_NAMES) {
			leads[name].push({
				t: parseFloat(t.toFixed(2)),
				mv: parseFloat(values[name].toFixed(4)),
			});
		}
	}

	const rrMsNominal = 60000 / params.heartRate;
	const qtcBazettMs = params.qtInterval / Math.sqrt(rrMsNominal / 1000);

	return {
		params,
		leads,
		activation: buildActivationFrames(params),
		summary: {
			beatsEstimated: Math.max(1, Math.round(params.duration / rrMsNominal)),
			rrMsNominal: parseFloat(rrMsNominal.toFixed(1)),
			qtcBazettMs: parseFloat(qtcBazettMs.toFixed(1)),
			electricalAxis: classifyAxis(params.axisDegrees),
			dominantRhythm:
				params.rhythmIrregularity < 0.03 ? 'Regular sinus-like rhythm' : params.rhythmIrregularity < 0.1 ? 'Mild sinus arrhythmia-like variability' : 'Marked rhythm variability',
		},
		explanation: {
			model: 'Synthetic Gaussian-wave ECG model projected to 12 leads and a 3-axis cardiac dipole',
			notes: [
				'This is an educational forward model, not a diagnostic-grade simulator.',
				'Limb leads follow Einthoven relationships (III = II - I; augmented leads derived from I/II).',
				'Precordial leads are generated from a rotated dipole projection to mimic R-wave progression.',
				'The 3D view reuses the same dipole and highlights which lead is most aligned with the instantaneous vector.',
			],
		},
	};
}

export function handleECG(request: Request): Response {
	const url = new URL(request.url);
	const params = parseParams(url);
	const result = simulate(params);
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
