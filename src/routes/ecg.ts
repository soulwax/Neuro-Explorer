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

interface ECGResult {
	params: ECGParams;
	leads: Record<LeadName, ECGPoint[]>;
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

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
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
	const sqrt3Over2 = 0.8660254;

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

		const pWave = params.pAmp * gaussian(phaseMs, pCenter, Math.max(8, pr * 0.18));
		const qWave = -0.24 * params.qrsAmp * gaussian(phaseMs, qCenter, Math.max(4, qrsDuration * 0.08));
		const rWave = params.qrsAmp * gaussian(phaseMs, rCenter, Math.max(6, qrsDuration * 0.1));
		const sWave = -0.36 * params.qrsAmp * gaussian(phaseMs, sCenter, Math.max(5, qrsDuration * 0.11));
		const tWave = params.tAmp * gaussian(phaseMs, tCenter, Math.max(24, qt * 0.17));

		const stStart = qrsStart + qrsDuration * 0.95;
		const tStart = tCenter - Math.max(20, qt * 0.12);
		const stPlateau = smoothWindow(phaseMs, stStart, tStart, 6);
		const stComponent = params.stShift * stPlateau;

		const baseline =
			params.baselineWander * Math.sin(2 * Math.PI * 0.33 * seconds) +
			params.baselineWander * 0.35 * Math.sin(2 * Math.PI * 0.08 * seconds + 1.2);
		const noise = params.noise * randomNormal();

		const core = pWave + qWave + rWave + sWave + tWave + stComponent;
		const derivative = (core - previousCore) / Math.max(params.dt / 1000, 0.001);
		previousCore = core;

		const x = core * Math.cos(axisRad) + derivative * 0.0009;
		const y = core * Math.sin(axisRad) + derivative * 0.0007;
		const z = -0.52 * qWave + 0.25 * rWave - 0.88 * sWave + 0.32 * tWave + 0.08 * pWave;

		const xr = x * Math.cos(precordialRotRad) - z * Math.sin(precordialRotRad);
		const zr = x * Math.sin(precordialRotRad) + z * Math.cos(precordialRotRad);

		const leadI = x;
		const leadII = 0.5 * x + sqrt3Over2 * y;
		const leadIII = leadII - leadI;
		const aVR = -(leadI + leadII) / 2;
		const aVL = leadI - leadII / 2;
		const aVF = leadII - leadI / 2;

		const v1 = -0.62 * xr + 0.14 * y + 1.25 * zr + stComponent * 0.5;
		const v2 = -0.44 * xr + 0.18 * y + 1.05 * zr + stComponent * 0.5;
		const v3 = -0.18 * xr + 0.28 * y + 0.76 * zr + stComponent * 0.45;
		const v4 = 0.02 * xr + 0.34 * y + 0.48 * zr + stComponent * 0.4;
		const v5 = 0.24 * xr + 0.39 * y + 0.23 * zr + stComponent * 0.35;
		const v6 = 0.4 * xr + 0.43 * y + 0.08 * zr + stComponent * 0.3;

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
		summary: {
			beatsEstimated: Math.max(1, Math.round(params.duration / rrMsNominal)),
			rrMsNominal: parseFloat(rrMsNominal.toFixed(1)),
			qtcBazettMs: parseFloat(qtcBazettMs.toFixed(1)),
			electricalAxis: classifyAxis(params.axisDegrees),
			dominantRhythm:
				params.rhythmIrregularity < 0.03 ? 'Regular sinus-like rhythm' : params.rhythmIrregularity < 0.1 ? 'Mild sinus arrhythmia-like variability' : 'Marked rhythm variability',
		},
		explanation: {
			model: 'Synthetic Gaussian-wave ECG model projected to 12 leads',
			notes: [
				'This is an educational forward model, not a diagnostic-grade simulator.',
				'Limb leads follow Einthoven relationships (III = II - I; augmented leads derived from I/II).',
				'Precordial leads are generated from a rotated dipole projection to mimic R-wave progression.',
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
