/**
 * 12-Lead ECG Simulator
 *
 * Generates a synthetic 12-lead ECG using a dipole-style model with
 * tweakable morphology, autonomic tone, and rhythm parameters.
 */

import {
	defaultEcgParams,
	ecgLeadNames,
	type ECGActivationFrame,
	type ECGBeatLandmarks,
	type ECGPoint,
	type ECGLeadAxis,
	type ECGLeadName,
	type ECGNeurocardiacSummary,
	type ECGParams,
	type ECGPhase,
	type ECGResult,
} from '../../core/ecg';

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
}) as ECGLeadAxis[];

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

function classifyRhythm(params: ECGParams): string {
	if (params.heartRate < 60) {
		return params.rhythmIrregularity > 0.06
			? 'Respiratory sinus bradycardia-like pattern'
			: 'Sinus bradycardia-like pattern';
	}
	if (params.heartRate > 100) {
		return params.rhythmIrregularity > 0.04
			? 'Autonomic tachycardia with residual respiratory modulation'
			: 'Sympathetic sinus tachycardia-like pattern';
	}
	if (params.rhythmIrregularity > 0.08) {
		return 'Respiratory sinus arrhythmia-like pattern';
	}
	if (params.rhythmIrregularity > 0.03) {
		return 'Sinus rhythm with mild respiratory modulation';
	}
	return 'Regular sinus-like rhythm';
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

function dominantLeadProjection(x: number, y: number, z: number): { name: ECGLeadName; projection: number } {
	let bestName: ECGLeadName = 'II';
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

function computeActivationRegions(
	waves: WaveState,
	x: number,
	z: number,
	params: ECGParams
): ECGActivationFrame['regions'] {
	const atria = clamp(Math.abs(waves.pWave) / Math.max(params.pAmp, 0.001), 0, 1);
	const qrsEnergy = Math.abs(waves.qWave) + Math.abs(waves.rWave) + Math.abs(waves.sWave);
	const depolarization = clamp(qrsEnergy / Math.max(params.qrsAmp * 1.55, 0.001), 0, 1);
	const repolarization = clamp(
		Math.abs(waves.tWave + waves.stComponent * 0.4) / Math.max(params.tAmp + Math.abs(params.stShift) * 0.6, 0.001),
		0,
		1
	);
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
	const frames: ECGActivationFrame[] = [];
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

function buildBeatLandmarks(morphology: CycleMorphology): ECGBeatLandmarks {
	const pHalfWidth = Math.max(8, morphology.pr * 0.18) * 1.6;
	const qrsStart = morphology.qrsStart;
	const qrsEnd = morphology.qrsStart + morphology.qrsDuration * 1.05;
	const tHalfWidth = Math.max(24, morphology.qt * 0.17) * 1.7;

	return {
		pOnset: round(Math.max(0, morphology.pCenter - pHalfWidth), 1),
		pPeak: round(morphology.pCenter, 1),
		pOffset: round(Math.min(morphology.cycleMs, morphology.pCenter + pHalfWidth), 1),
		qrsOnset: round(qrsStart, 1),
		rPeak: round(morphology.rCenter, 1),
		qrsOffset: round(Math.min(morphology.cycleMs, qrsEnd), 1),
		tOnset: round(Math.max(qrsEnd, morphology.tStart), 1),
		tPeak: round(morphology.tCenter, 1),
		tOffset: round(Math.min(morphology.cycleMs, morphology.tCenter + tHalfWidth), 1),
	};
}

function buildNeurocardiacSummary(params: ECGParams, qtcBazettMs: number): ECGNeurocardiacSummary {
	const vagalTone = clamp(
		0.45 * clamp((78 - params.heartRate) / 38, 0, 1) +
			0.35 * clamp(params.rhythmIrregularity / 0.16, 0, 1) +
			0.2 * clamp((params.prInterval - 150) / 90, 0, 1),
		0,
		1
	);
	const sympatheticDrive = clamp(
		0.55 * clamp((params.heartRate - 72) / 58, 0, 1) +
			0.15 * clamp((150 - params.prInterval) / 50, 0, 1) +
			0.15 * clamp((380 - params.qtInterval) / 80, 0, 1) +
			0.15 * clamp(params.noise / 0.06, 0, 1),
		0,
		1
	);
	const respiratoryCoupling = clamp(
		0.75 * clamp(params.rhythmIrregularity / 0.18, 0, 1) +
			0.25 * clamp(params.baselineWander / 0.12, 0, 1),
		0,
		1
	);
	const avNodalBrake = clamp(
		0.7 * clamp((params.prInterval - 155) / 105, 0, 1) + 0.3 * vagalTone,
		0,
		1
	);

	let autonomicState = 'Balanced autonomic expression';
	let narrative =
		'Medullary vagal braking and sympathetic drive are close to balance, producing a conventional sinus-like teaching pattern.';
	let neurocriticalContext =
		'No dominant neurocritical ECG teaching context is being forced; the strip behaves like a balanced reference state.';
	let hemodynamicRisk: ECGNeurocardiacSummary['hemodynamicRisk'] = 'low';

	if (vagalTone - sympatheticDrive > 0.18) {
		autonomicState = 'Vagal-leaning autonomic state';
		narrative =
			'Brainstem vagal output is emphasized here, slowing SA node firing, lengthening AV nodal transit slightly, and making respiratory variability easier to see on the strip.';
	} else if (sympatheticDrive - vagalTone > 0.18) {
		autonomicState = 'Sympathetic-leaning autonomic state';
		narrative =
			'Catecholaminergic drive dominates this pattern, so the sinus node accelerates, the rhythm becomes more metronomic, and repolarization shortens relative to rest.';
	}

	if (sympatheticDrive > 0.68 && params.heartRate >= 118) {
		neurocriticalContext =
			'This behaves like an acute sympathetic storm pattern, as in subarachnoid hemorrhage, post-ictal discharge, or intense central catecholamine spillover.';
		hemodynamicRisk = 'high';
	} else if (vagalTone > 0.66 && params.heartRate <= 48) {
		neurocriticalContext =
			'This behaves like a pressure-linked vagal crisis pattern, where rising central pressure or brainstem stress slows the sinus node and AV conduction.';
		hemodynamicRisk = 'high';
	} else if (respiratoryCoupling > 0.62 && params.rhythmIrregularity > 0.1) {
		neurocriticalContext =
			'This behaves like unstable central autonomic modulation, where brainstem state shifts produce visible rhythm lability rather than one fixed conduction defect.';
		hemodynamicRisk = 'moderate';
	} else if (respiratoryCoupling < 0.12 && params.rhythmIrregularity < 0.01) {
		neurocriticalContext =
			'This behaves like blunted autonomic output, where the expected sinus lability is absent and the strip can look deceptively calm.';
		hemodynamicRisk = 'moderate';
	}

	const notes = [
		respiratoryCoupling > 0.55
			? 'Beat-to-beat variability is prominent, so the tracing behaves more like respiratory sinus arrhythmia than a metronomic rhythm.'
			: 'Respiratory coupling is present but muted, so the rhythm strip reads closer to a steady sinus cadence.',
		avNodalBrake > 0.48
			? 'The PR interval suggests stronger AV nodal braking, which is a classic place for vagal influence to appear on surface ECG.'
			: 'AV nodal timing remains relatively brisk, so autonomic changes are expressed more through rate than through marked PR prolongation.',
		qtcBazettMs > 450
			? 'The repolarization window is relatively long in this teaching model, so autonomic slowing is easier to connect with QT behavior.'
			: qtcBazettMs < 360
				? 'The shorter corrected QT fits a faster, more adrenergic teaching state with compressed repolarization timing.'
				: 'Corrected QT stays in a mid-range teaching zone, which keeps the emphasis on autonomic tone rather than repolarization extremes.',
	];

	const consultPearls = [
		sympatheticDrive > 0.62
			? 'The ECG is behaving like a high-catecholamine surface signal, so repolarization language must be correlated with the neurological trigger before it is equated to primary cardiac injury.'
			: 'The strip is not overwhelmingly catecholamine-driven, so rhythm interpretation should stay anchored to rate, intervals, and surface morphology rather than neurogenic stress alone.',
		vagalTone > 0.58
			? 'Bradycardia and PR delay are coherent with central vagal braking here, which means physiology may explain the nodal pattern better than isolated conduction disease.'
			: 'Vagal braking is present but not dominant, so nodal timing should be interpreted alongside sympathetic load and baseline rhythm behavior.',
		respiratoryCoupling < 0.15
			? 'The relative absence of sinus lability can itself be a teaching clue when the autonomic system should be dynamic.'
			: 'Respiratory-linked variability is still visible, so the tracing should be read as a physiologic interaction rather than a perfectly fixed metronome.',
	];

	const mimicsToAvoid = [
		sympatheticDrive > 0.6
			? 'Do not overcall primary ACS from rate and repolarization appearance alone when acute CNS stress is the stronger physiological story.'
			: 'Do not force every rhythm change into an autonomic explanation if the surface morphology and context point elsewhere.',
		avNodalBrake > 0.5
			? 'Do not mistake vagally weighted PR prolongation for fixed conduction-system disease without symptom and context correlation.'
			: 'Do not assume a normal-looking PR interval excludes meaningful autonomic involvement elsewhere in the tracing.',
	];

	const nextData = [
		sympatheticDrive > 0.58
			? 'Trend the ECG and cardiac biomarkers over time, not as a single static snapshot.'
			: 'Correlate the strip with bedside autonomic context rather than reading it in isolation.',
		respiratoryCoupling > 0.45
			? 'Watch the rhythm against breathing or posture to see whether sinus variability is physiology rather than instability.'
			: 'Ask whether expected sinus variability is absent in a setting where the autonomic system should still be dynamic.',
		avNodalBrake > 0.46
			? 'Review medications, vagal triggers, and symptom timing before labeling the nodal delay as structural disease.'
			: 'Use interval behavior plus bedside state, not rate alone, to decide whether the pattern is compensatory or pathological.',
	];

	const monitoringPriorities = [
		hemodynamicRisk === 'high'
			? 'Trend ECG, hemodynamics, and neurological status together rather than in separate silos.'
			: 'Keep bedside autonomic context tied to the strip instead of reading the tracing in isolation.',
		sympatheticDrive > 0.62
			? 'Watch for evolving repolarization change or biomarker drift before declaring primary coronary pathology.'
			: 'Track whether expected autonomic variability returns as the clinical state stabilizes.',
		vagalTone > 0.62
			? 'Monitor for worsening bradycardia, AV delay, or pressure-linked neurological deterioration.'
			: 'Monitor interval behavior and sinus variability rather than rate alone.',
	];

	const redFlags = [
		hemodynamicRisk === 'high'
			? 'The strip is sitting in a high-risk neurocritical teaching zone; bedside deterioration should outrank waveform familiarity.'
			: 'A comfortable-looking strip can still be pathologic if the autonomic physiology is blunted or mismatched to the context.',
		params.heartRate <= 42
			? 'Profound bradycardia in a deteriorating neurological context is a warning sign, not a reassurance.'
			: 'Rapid adrenergic patterns need serial follow-up before they are reduced to one static label.',
	];

	return {
		autonomicState,
		vagalTone: round(vagalTone, 3),
		sympatheticDrive: round(sympatheticDrive, 3),
		respiratoryCoupling: round(respiratoryCoupling, 3),
		avNodalBrake: round(avNodalBrake, 3),
		neurocriticalContext,
		hemodynamicRisk,
		narrative,
		notes,
		consultPearls,
		mimicsToAvoid,
		nextData,
		monitoringPriorities,
		redFlags,
	};
}

function parseParams(url: URL): ECGParams {
	const params = { ...defaultEcgParams };
	for (const key of Object.keys(defaultEcgParams) as (keyof ECGParams)[]) {
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
	const leads = Object.fromEntries(ecgLeadNames.map((name) => [name, [] as ECGPoint[]])) as Record<ECGLeadName, ECGPoint[]>;
	const stepCount = Math.floor(params.duration / params.dt);
	const axisRad = params.axisDegrees * DEG_TO_RAD;
	const precordialRotRad = params.precordialRotation * DEG_TO_RAD;

	let phaseMs = 0;
	let previousCore = 0;

	for (let i = 0; i <= stepCount; i++) {
		const t = i * params.dt;
		const seconds = t / 1000;

		const instantRate = clamp(
			params.heartRate * (1 + params.rhythmIrregularity * Math.sin(2 * Math.PI * 0.1 * seconds)),
			30,
			240
		);
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

		const values: Record<ECGLeadName, number> = {
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

		for (const name of ecgLeadNames) {
			leads[name].push({
				t: round(t, 2),
				mv: round(values[name], 4),
			});
		}
	}

	const rrMsNominal = 60000 / params.heartRate;
	const qtcBazettMs = params.qtInterval / Math.sqrt(rrMsNominal / 1000);
	const representativeMorphology = getCycleMorphology(rrMsNominal, params);
	const beat = {
		rhythmStripLead: 'II' as const,
		intervals: {
			rrMs: round(rrMsNominal, 1),
			prMs: round(params.prInterval, 1),
			qrsMs: round(params.qrsDuration, 1),
			qtMs: round(params.qtInterval, 1),
		},
		landmarks: buildBeatLandmarks(representativeMorphology),
	};

	return {
		params,
		leads,
		activation: buildActivationFrames(params),
		beat,
		summary: {
			beatsEstimated: Math.max(1, Math.round(params.duration / rrMsNominal)),
			rrMsNominal: round(rrMsNominal, 1),
			qtcBazettMs: round(qtcBazettMs, 1),
			electricalAxis: classifyAxis(params.axisDegrees),
			dominantRhythm: classifyRhythm(params),
		},
		neurocardiac: buildNeurocardiacSummary(params, qtcBazettMs),
		explanation: {
			model: 'Synthetic Gaussian-wave ECG model projected to 12 leads and a 3-axis cardiac dipole, then interpreted through an autonomic teaching lens.',
			notes: [
				'This is an educational forward model, not a diagnostic-grade simulator.',
				'Limb leads follow Einthoven relationships (III = II - I; augmented leads derived from I/II).',
				'Precordial leads are generated from a rotated dipole projection to mimic R-wave progression and chest lead dominance shifts.',
				'The neurocardiac layer estimates how vagal braking, sympathetic drive, and respiratory coupling would change the surface rhythm in a teaching context.',
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
