'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ModuleHandoffBanner } from '~/components/module-handoff-banner';

// ---------------------------------------------------------------------------
// AUDIO SYNTHESIZER ENGINE (Web Audio API - 100% zero external dependencies)
// ---------------------------------------------------------------------------
class SoundEngine {
	private ctx: AudioContext | null = null;
	private ambientOsc: OscillatorNode | null = null;
	private ambientGain: GainNode | null = null;
	public enabled: boolean = false;

	init() {
		if (this.ctx) return;
		try {
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			if (AudioContextClass) {
				this.ctx = new AudioContextClass();
			}
		} catch {
			// Web Audio unavailable
		}
	}

	toggle(enable?: boolean): boolean {
		this.enabled = enable ?? !this.enabled;
		if (this.enabled) {
			this.init();
			if (this.ctx?.state === 'suspended') {
				void this.ctx.resume();
			}
			this.startAmbient();
			this.playChime();
		} else {
			this.stopAmbient();
		}
		return this.enabled;
	}

	private startAmbient() {
		if (!this.ctx || this.ambientOsc) return;
		try {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			const filter = this.ctx.createBiquadFilter();

			osc.type = 'sawtooth';
			osc.frequency.setValueAtTime(52, this.ctx.currentTime); // Low 52 Hz subterranean power hum
			filter.type = 'lowpass';
			filter.frequency.setValueAtTime(130, this.ctx.currentTime);
			gain.gain.setValueAtTime(0.018, this.ctx.currentTime);

			osc.connect(filter);
			filter.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start();
			this.ambientOsc = osc;
			this.ambientGain = gain;
		} catch {
			// ignore
		}
	}

	private stopAmbient() {
		try {
			this.ambientOsc?.stop();
			this.ambientOsc?.disconnect();
			this.ambientOsc = null;
			this.ambientGain = null;
		} catch {
			// ignore
		}
	}

	playClick() {
		if (!this.enabled || !this.ctx) return;
		try {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(1350, this.ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.04);
			gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start();
			osc.stop(this.ctx.currentTime + 0.04);
		} catch {
			// ignore
		}
	}

	playPulse() {
		if (!this.enabled || !this.ctx) return;
		try {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(310, this.ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.12);
			gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start();
			osc.stop(this.ctx.currentTime + 0.12);
		} catch {
			// ignore
		}
	}

	playChime() {
		if (!this.enabled || !this.ctx) return;
		try {
			const now = this.ctx.currentTime;
			[523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
				const osc = this.ctx!.createOscillator();
				const gain = this.ctx!.createGain();
				osc.type = 'sine';
				osc.frequency.setValueAtTime(freq, now + idx * 0.06);
				gain.gain.setValueAtTime(0.05, now + idx * 0.06);
				gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.32);
				osc.connect(gain);
				gain.connect(this.ctx!.destination);
				osc.start(now + idx * 0.06);
				osc.stop(now + idx * 0.06 + 0.32);
			});
		} catch {
			// ignore
		}
	}

	playTransition() {
		if (!this.enabled || !this.ctx) return;
		try {
			const now = this.ctx.currentTime;
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = 'sawtooth';
			osc.frequency.setValueAtTime(110, now);
			osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
			gain.gain.setValueAtTime(0.04, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start(now);
			osc.stop(now + 0.25);
		} catch {
			// ignore
		}
	}

	playRadioStatic() {
		if (!this.enabled || !this.ctx) return;
		try {
			const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
			const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
			}
			const noise = this.ctx.createBufferSource();
			noise.buffer = buffer;
			const filter = this.ctx.createBiquadFilter();
			filter.type = 'bandpass';
			filter.frequency.setValueAtTime(1600, this.ctx.currentTime);
			filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
			const gain = this.ctx.createGain();
			gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
			noise.connect(filter);
			filter.connect(gain);
			gain.connect(this.ctx.destination);
			noise.start();
		} catch {
			// ignore
		}
	}

	playHeartbeat() {
		if (!this.enabled || !this.ctx) return;
		try {
			const now = this.ctx.currentTime;
			[0, 0.11].forEach((offset, idx) => {
				const osc = this.ctx!.createOscillator();
				const gain = this.ctx!.createGain();
				osc.type = 'sine';
				osc.frequency.setValueAtTime(idx === 0 ? 68 : 52, now + offset);
				gain.gain.setValueAtTime(idx === 0 ? 0.09 : 0.06, now + offset);
				gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
				osc.connect(gain);
				gain.connect(this.ctx!.destination);
				osc.start(now + offset);
				osc.stop(now + offset + 0.08);
			});
		} catch {
			// ignore
		}
	}

	playAudioLogBeep() {
		if (!this.enabled || !this.ctx) return;
		try {
			const now = this.ctx.currentTime;
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(880, now);
			gain.gain.setValueAtTime(0.05, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start(now);
			osc.stop(now + 0.12);
		} catch {
			// ignore
		}
	}
}

const sound = new SoundEngine();

// ---------------------------------------------------------------------------
// DATA DEFINITIONS & RICH STORY ENGINE
// ---------------------------------------------------------------------------

type HansTelemetry = {
	heartRate: number;
	cortisol: string;
	ambientTemp: string;
	cognitiveLoad: string;
	subsystemState: string;
};

type TacticalBriefing = {
	biologicalDilemma: string;
	siliconTrap: string;
};

type InBetweenChoice = {
	label: string;
	description: string;
	outcome: string;
	statBonus: string;
};

type InBetweenTransition = {
	title: string;
	location: string;
	narrative: string;
	dialogue: {
		astrid: string;
		hans: string;
	};
	choices: InBetweenChoice[];
};

type StepMicroDetail = {
	timeScale: string;
	sensoryExperience: string;
	biologyEvent: string;
	siliconEvent: string;
	membranePotentialMv?: number;
	siliconEnergyMicroJoules?: number;
	interveningDynamic?: string;
};

type AudioLog = {
	id: string;
	timestamp: string;
	speaker: string;
	role: string;
	title: string;
	duration: string;
	transcript: string;
	fieldNote: string;
};

type FacilityPerk = {
	id: string;
	title: string;
	description: string;
	bonus: string;
	chapterUnlocked: string;
};

type FacilitySector = {
	id: string;
	number: number;
	name: string;
	domain: string;
	challengeId: string;
	coords: { x: number; y: number };
	description: string;
};

type Challenge = {
	id: string;
	name: string;
	chapter: string;
	timestamp: string;
	sector: string;
	story: string;
	thought: string;
	astridTransmission: string;
	incidentLog: string;
	telemetry: HansTelemetry;
	outcome: string;
	cue: string;
	preview: string;
	interlude: string;
	domain: string;
	inputLabels: string[];
	featureLabels: string[];
	outputLabels: string[];
	outputDescriptions: string[];
	tacticalBriefing: TacticalBriefing;
	perceptTitle: string;
	perceptSteps: string[];
	stepMicroDetails: StepMicroDetail[];
	settledMicroDetail: StepMicroDetail;
	inBetweenTransition?: InBetweenTransition;
	why: string;
	bridge: string;
	input: number[];
	weights: number[][];
};

const audioLogs: AudioLog[] = [
	{
		id: 'log-08b',
		timestamp: 'Oct 14, 01:15:22',
		speaker: 'Dr. Hans Werner',
		role: 'Lead ML Architect',
		title: 'LOG 08-B: The Gabor Convergence',
		duration: '01:24',
		transcript:
			'“We initialized the random weight matrices for the Layer 1 convolutional filters. After 12,000 unsupervised iterations on natural ambient video from the facility cameras, the spatial kernels spontaneously segregated into oriented, bandpass Gabor-like filters. Exactly like the receptive fields Hubel and Wiesel mapped in the mammalian visual cortex in 1959. Nobody programmed oriented bars into this network. The physics of natural light forced both silicon and biological wetware to arrive at the exact same mathematical decomposition. It is not copying—it is convergent evolution.”',
		fieldNote:
			'Confirmed: Unsupervised predictive coding under natural scene statistics converges to identical spatial receptive fields across biology and artificial convolutional filters.',
	},
	{
		id: 'log-14c',
		timestamp: 'Oct 19, 23:40:05',
		speaker: 'Dr. Astrid Van Hoyt',
		role: 'Sensory Neurobiologist',
		title: 'LOG 14-C: The Ghost in the Receptive Field',
		duration: '01:48',
		transcript:
			'“Hans is thrilled with his high-dimensional feedforward transformers, but I am documenting severe failure modes under low signal-to-noise ratios. Without local GABAergic interneurons providing recurrent lateral inhibition, his artificial tensors suffer from run-away halo activations. The machine sees high contrast where there is only sensor noise. In the brain, if a neighboring cortical column fires, it inhibits you. It forces sparse, confident hypotheses. If he doesn’t add inhibitory dynamics before the full sub-level test, the system will hallucinate ghosts in the dark.”',
		fieldNote:
			'Critical insight: Biological lateral inhibition prevents noise amplification. Feedforward artificial networks without lateral suppression over-respond to background clutter.',
	},
	{
		id: 'log-22a',
		timestamp: 'Nov 02, 03:05:40',
		speaker: 'Dr. Hans Werner',
		role: 'Lead ML Architect',
		title: 'LOG 22-A: Delay Lines & Sub-Millisecond Physics',
		duration: '01:36',
		transcript:
			'“Astrid challenged me on our acoustic localization benchmark. Our GPUs compute spatial azimuth through dense matrix multiplications—hundreds of billions of floating-point operations per millisecond. Meanwhile, the human medial superior olive does the same calculation using four thousand neurons and axons of differing physical lengths acting as sub-millisecond delay lines. Biology computes space through physical time. We compute time through brute spatial matrices. The energy disparity is almost four orders of magnitude.”',
		fieldNote:
			'Thermodynamic contrast: Silicon uses synchronized high-frequency clock cycles (gigahertz) and matrix multiplies; biology uses asynchronous propagation delay and coincidence detection.',
	},
	{
		id: 'log-31d',
		timestamp: 'Nov 11, 04:22:15',
		speaker: 'Dr. Astrid Van Hoyt',
		role: 'Sensory Neurobiologist',
		title: 'LOG 31-D: The Conscious Binding Paradox',
		duration: '02:05',
		transcript:
			'“We just observed the first cross-modal synchronization test in Sub-Level 4. When an ambiguous object approaches in the dark, the human brain doesn’t just evaluate visual shape and auditory rumble independently. Phase-locked gamma oscillations bind the two into a single coherent percept. An artificial network can concatenate vectors all day, but until it has recurrent dynamical attractor basins, it is just doing lookup tables on a hyper-plane. If we ever lose power down here, I hope our wetware priors keep us alive.”',
		fieldNote:
			'Theoretical foundation of JANUS: The perceptual binding problem is solved in biology via temporal coherence and phase locking, not mere feature vector concatenation.',
	},
];

const facilitySectors: FacilitySector[] = [
	{
		id: 'sec-1',
		number: 1,
		name: 'Sector B Primary Conduit',
		domain: 'Visual Cortex (V1) Spatial Invariance',
		challengeId: 'edge',
		coords: { x: 50, y: 50 },
		description: 'Unlit high-voltage busway. Emergency red strobe (1.2 Hz). Primary contrast boundary search.',
	},
	{
		id: 'sec-2',
		number: 2,
		name: 'Service Lift Shaft 02',
		domain: 'Auditory Cortex (A1) Tonotopy',
		challengeId: 'tone',
		coords: { x: 120, y: 70 },
		description: 'Acoustic resonance corridor. High-pressure ventilation turbofans and cooling pumps.',
	},
	{
		id: 'sec-3',
		number: 3,
		name: 'Cryo-Coolant Conduit 3C',
		domain: 'Visual Area MT / V5 Spatiotemporal Motion',
		challengeId: 'motion',
		coords: { x: 190, y: 60 },
		description: 'Ruptured liquid nitrogen lines. Strobing droplets producing apparent motion paradox.',
	},
	{
		id: 'sec-4',
		number: 4,
		name: 'Decontamination Airlock 4A',
		domain: 'Fusiform Face Area (FFA) Holism',
		challengeId: 'face',
		coords: { x: 260, y: 90 },
		description: 'Double-glazed observation portal with condensation. Distinguishing silhouette from biological identity.',
	},
	{
		id: 'sec-5',
		number: 5,
		name: 'Auxiliary Transformer Chamber',
		domain: 'Amygdala Threat vs Error Appraisal',
		challengeId: 'threat',
		coords: { x: 330, y: 75 },
		description: 'High-voltage relay arcs and burning conduit oil. Differentiating imminent blast from isolated arc.',
	},
	{
		id: 'sec-6',
		number: 6,
		name: 'Acoustic Baffle Tunnel 6',
		domain: 'Superior Temporal Gyrus (STG) Syntax',
		challengeId: 'language',
		coords: { x: 400, y: 65 },
		description: 'Sound-damped air handling shaft with scorched safety signage. Parsing grammatical instructions.',
	},
	{
		id: 'sec-7',
		number: 7,
		name: 'Optics Darkroom & Junction 7B',
		domain: 'Auditory Brainstem Multisensory Azimuth',
		challengeId: 'localize',
		coords: { x: 470, y: 85 },
		description: 'Total light blackout. Triangulating trapped colleague via sound delay, floor tremor, and heat.',
	},
	{
		id: 'sec-8',
		number: 8,
		name: 'Cryo-Prep Lab 08',
		domain: 'Inferior Parietal Lobule (IPL) Agency',
		challengeId: 'mimic',
		coords: { x: 540, y: 70 },
		description: 'Automated robotics bay with synthetic speaker loops. Distinguishing generative imitation from living Astrid.',
	},
	{
		id: 'sec-9',
		number: 9,
		name: 'JANUS Core Reactor Console',
		domain: 'Prefrontal Cortex & Basal Ganglia Executive Value',
		challengeId: 'shutdown',
		coords: { x: 610, y: 80 },
		description: 'Central algorithmic core platform. Six conflicting variables requiring coordinated dual-key isolation.',
	},
	{
		id: 'sec-10',
		number: 10,
		name: 'High-Density Wetware Matrix',
		domain: 'Ephaptic Field Coupling & Extracellular Ion Balance',
		challengeId: 'ephaptic',
		coords: { x: 675, y: 85 },
		description: 'Unconnected bio-organoid arrays synchronizing via extracellular micro-volt electric fields and potassium gradients.',
	},
	{
		id: 'sec-11',
		number: 11,
		name: 'Thalamo-Cortical Patch Array',
		domain: 'Thalamic Gating & Izhikevich T-Type Bursting',
		challengeId: 'bursting',
		coords: { x: 745, y: 65 },
		description: 'Dual-operating mode relay bay. Distinguishing linear tonic streaming from low-threshold calcium burst alarms.',
	},
	{
		id: 'sec-12',
		number: 12,
		name: 'JANUS Chimera Nexus',
		domain: 'Active Dendritic NMDA Computation & 8D Matrix Fusion',
		challengeId: 'chimera',
		coords: { x: 815, y: 80 },
		description: 'Master subterranean platform combining active pyramidal dendritic branches with crystalline systolic array registers.',
	},
	{
		id: 'sec-target',
		number: 13,
		name: 'Surface Evacuation Portal (Target)',
		domain: 'Decontamination Airflow & Final Escape',
		challengeId: 'chimera',
		coords: { x: 885, y: 75 },
		description: 'Pneumatic elevator shaft leading to the surface research campus. Final extraction milestone.',
	},
];

const challenges: Challenge[] = [
	{
		id: 'edge',
		name: 'Find the edge',
		chapter: 'Chapter I · The Dark Corridor',
		timestamp: '02:13:00',
		sector: 'Sub-Level 4 · Sector B Primary Conduit',
		story:
			'02:13:00. The high-voltage substation trip detonates through the subterranean concrete like distant heavy artillery. All primary halogen banks collapse into darkness. Magnetic blast doors slam shut down the entire three-hundred-meter corridor with concussive finality. You are Dr. Hans Werner, lead machine-learning architect of Project JANUS. You awaken face-down on the cold steel tread plate, pulse hammering in your throat, tasting iron and scorched capacitor oil. Overhead, the emergency beacon strobes in violent red 1.2 Hz pulses, throwing lurching shadows that claw across the walls like living specters. Yet through the chaotic crimson strobe, one optical feature refuses to flinch: a razor-thin, pale vertical line slicing down the steel bulkhead, perfectly rigid while everything else distorts and shakes.',
		thought:
			'Breathe, Hans. Calm down. Under a red emergency strobe, the rod photoreceptors are saturated and your amygdala wants to read every moving shadow as an approaching threat. But primary visual cortex (V1) orientation-selective simple cells don’t care about overall luminance: look for the spatial contrast boundary that remains invariant across phase cycles.',
		astridTransmission:
			'“Hans! Can you hear me on Channel 4? The auxiliary grid just fried! I’m sealed inside Cryo-Bay 3. Don’t trust the moving shadows—the emergency lights are cycling out-of-phase with the cameras! Find the manual egress door before the halon pre-purge initializes!”',
		incidentLog:
			'[02:13:02 SEC-AUTOMATION] Sub-Level 4 primary bus tripped. Emergency magnetic interlocks engaged on Doors 401–418. Visual cortex perception node V1-AUX offline; failover to local sensory gating.',
		telemetry: {
			heartRate: 114,
			cortisol: 'Acute Spike',
			ambientTemp: '17.1°C',
			cognitiveLoad: 'High (0.82)',
			subsystemState: 'Magnetic Lock Active',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'A panic-driven retina amplifies low-frequency shadow motion, mistaking flickering shadows for an approaching hazard. Orientation-selective V1 receptive fields must filter out whole-field luminance changes.',
			siliconTrap:
				'A naive CNN layer without batch normalization or spatial contrast pooling gets blown out by the dynamic strobe range, mistaking the highest pixel value for the key feature.',
		},
		outcome:
			'The vertical line holds its crisp spatial geometry through three consecutive strobe flashes. It carries no surface grain or dynamic drift—it is the millimeter seam of an unlatched emergency service hatch. You slide your trembling fingers into the recess, wrench the hydraulic release, and tumble into the conduit beyond as the red strobe behind you is swallowed by thick darkness.',
		cue: 'The ambient brightness on either side swings wildly with the strobe, yet the center boundary stays razor-sharp, thin, and orientation-locked.',
		preview: 'You wake in a strobing red corridor — and one pale line refuses to move with the light.',
		interlude:
			'You pull yourself down the unlit service conduit, guided only by the cold ribbed conduits on the wall. Ahead, past a dead junction of frozen coolant lines, the ventilation roar swallows a chorus of overlapping acoustic signatures bleeding through the floor.',
		domain: 'Visual cortex (Area V1)',
		inputLabels: ['Left contrast', 'Center detail', 'Right contrast'],
		featureLabels: ['Broad contrast', 'Fine detail', 'Rightward gradient'],
		outputLabels: ['Door seam', 'Painted stripe', 'Cast shadow'],
		outputDescriptions: [
			'A stable, narrow contrast boundary that ignores luminance shifts',
			'A crisp line too — but paint would carry fine surface texture grain',
			'Also a dark band — yet a cast shadow drifts with the oscillating lamp',
		],
		perceptTitle: 'A spatial contour emerges',
		perceptSteps: [
			'Left luminance establishes one boundary',
			'Center detail tests surface texture',
			'Right contrast closes the invariant border',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 12ms · Retinal Transduction',
				sensoryExperience: 'A blinding crimson strobe flash blurs the peripheral visual field, bleaching rod photoreceptors.',
				biologyEvent: 'Retinal ganglion cells fire an initial burst, passing center-surround contrast signals to the lateral geniculate nucleus (LGN).',
				siliconEvent: 'Vector input x[0] = 0.90 ingested. Kernel weights W₁[0,:] apply initial spatial scaling to register F1.',
				membranePotentialMv: -58,
				siliconEnergyMicroJoules: 42,
				interveningDynamic: 'Between T+0ms and T+12ms, photons isomerized rhodopsin, triggering a cyclic GMP phosphodiesterase cascade in rod outer segments.',
			},
			{
				timeScale: 'T + 42ms · V1 Layer 4 Cortical Simple Cells',
				sensoryExperience: 'Hans squints through the glare: the center surface shows no organic grain or paint flecks.',
				biologyEvent: 'Layer 4C simple cells compute spatial derivatives; inhibitory interneurons suppress uniform texture noise.',
				siliconEvent: 'Input x[1] = 0.20 ingested. Negative weight (-0.30) suppresses spurious feature activation in F1.',
				membranePotentialMv: -45,
				siliconEnergyMicroJoules: 95,
				interveningDynamic: 'Between T+12ms and T+42ms, parvocellular LGN relay axons depolarized layer 4 cortical spines, evoking AMPA currents.',
			},
			{
				timeScale: 'T + 88ms · Invariant Edge Binding',
				sensoryExperience: 'The right side drops into shadow, yet the vertical boundary stays pinned to the exact millimeter coordinate.',
				biologyEvent: 'Complex cells in V1/V2 pool phase-invariant signals, maintaining orientation selectivity despite illumination flux.',
				siliconEvent: 'Input x[2] = 0.80 ingested. Feature accumulator f = [0.80, 0.40, 0.65] is pushed through activation function.',
				membranePotentialMv: +22,
				siliconEnergyMicroJoules: 148,
				interveningDynamic: 'Between T+42ms and T+88ms, horizontal recurrent collaterals established non-linear spatial contrast pooling.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 140ms · Invariant Attractor Basin Settled',
			sensoryExperience: 'The vertical contrast boundary crystallizes into the millimeter seam of an unlatched emergency door.',
			biologyEvent: 'Recurrent V1-V2 feedback suppresses spurious shadow hypotheses; population vector converges on the door seam attractor.',
			siliconEvent: 'Softmax temperature scaling concentrates probability: Door Seam = 0.84, Cast Shadow = 0.12, Paint Stripe = 0.04.',
			membranePotentialMv: +28,
			siliconEnergyMicroJoules: 184,
			interveningDynamic: 'Between T+88ms and T+140ms, recurrent GABAergic horizontal connections extinguished 92% of the flickering shadow noise.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 01 → 02',
			location: 'Access Hatch 4B · Hydraulic Lift Shaft Corridor',
			narrative:
				'You squeeze through the emergency seam into an unlit maintenance corridor. Behind you, the heavy magnetic door slams shut, locking out the red strobe. Water drips steadily onto iron pipes. Over your radio receiver, Astrid’s channel crackles with static.',
			dialogue: {
				astrid:
					'“Hans! I saw the door relay cycle! You made it into Conduit 4B. Be careful—Lift Shaft 2 directly ahead is flooded with acoustic noise from the failing cooling pumps.”',
				hans:
					'“My eyes are still burning from the strobe, Astrid. But the seam held its geometry just like your V1 receptive field models predicted. Moving toward the lift now.”',
			},
			choices: [
				{
					label: '🔧 Inspect Discarded Maintenance Toolbag',
					description: 'Check the floor for tools left by the maintenance shift.',
					outcome: 'You locate Astrid’s acoustic stethoscope and a flashlight, providing acoustic diagnostic leverage for the next room!',
					statBonus: '+Diagnostic probe primed for Chapter 2',
				},
				{
					label: '📑 Read Clipped Safety Clipboard',
					description: 'Examine the paper maintenance log pinned beside the shaft door.',
					outcome: 'The clipboard notes: “Cooling pump serviced yesterday. Access chime tuned to 440 Hz harmonic.” You gain vital frequency context!',
					statBonus: 'Context insight: 440 Hz chime confirmed',
				},
				{
					label: '🧘 Regulate Physiological Respiration',
					description: 'Lean against the cool wall and take three controlled diaphragmatic breaths.',
					outcome: 'Your pulse steadies from 114 BPM to 98 BPM, reducing autonomic noise in your auditory cortex.',
					statBonus: 'Heart Rate stabilized: -16 BPM',
				},
			],
		},
		why: 'Door seam wins because a strong, stable contrast boundary converges on a narrow, texture-free edge that survives the shifting strobe. Paint would carry surface grain; a shadow would slide with the lamp.',
		bridge:
			'Real edge-selective responses emerge across retinal and cortical circuits with oriented Gabor-like receptive fields. This vector captures selectivity, not the full wetware anatomy.',
		input: [0.9, 0.2, 0.8],
		weights: [
			[0.8, -0.3, 0.5],
			[0.3, 0.85, 0.05],
			[-0.4, 0.3, 0.9],
		],
	},
	{
		id: 'tone',
		name: 'Sort the tone',
		chapter: 'Chapter II · The Resonance Wall',
		timestamp: '02:17:45',
		sector: 'Sub-Level 4 · Service Lift Shaft 02',
		story:
			'02:17:45. The service conduit dead-ends against the massive steel doors of Lift Shaft 02. Behind the deafening roar of the primary ventilation turbofans, an ominous mechanical polyphony vibrates through the steel: a low 50-Hz hydraulic drone, one piercing resonant tone, an electrical hiss of escaping gas, and a patient, rhythmic cadence. One of these signatures is the service lift’s operational access chime—your only descent to the lower reactor core. Another is the high-pressure nitrogen pre-charge of the automated fire suppression system. You press your forehead directly against the cold alloy, feeling the acoustic vibrations travel through the bones of your skull.',
		thought:
			'You want that lift to work so badly you can taste it, Hans. Wishful thinking is a cognitive bias wearing empirical clothes. Deconstruct the Fourier spectrum: separate the low drone and the high hiss from the tuned pitch, and track whether the temporal envelope carries a learned two-phase rhythm.',
		astridTransmission:
			'“Hans! The lift’s hydraulic pump was serviced yesterday—its access chime is tuned to an exact two-part harmonic with a steady 1.2-second pulse. If you hear a high-frequency hiss, that’s nitrogen purging from the fire lines! Check the frequency before you touch the call panel!”',
		incidentLog:
			'[02:17:48 AUDIO-SENS-09] Acoustic spectrum alert in Lift Shaft 2. Tonotopic sensor array detects 4 overlapping acoustic signatures. Ventilation fan speed: 1800 RPM. Hydraulic chime servo: Standby.',
		telemetry: {
			heartRate: 122,
			cortisol: 'Sustained Elevation',
			ambientTemp: '16.4°C',
			cognitiveLoad: 'Critical (0.86)',
			subsystemState: 'Lift Door Hydraulic Interlock',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'The cochlear basilar membrane separates frequency tonotopically, but under intense acoustic masking from industrial blowers, cortical auditory neurons must synchronize to the periodic phase of the carrier tone.',
			siliconTrap:
				'A 1D convolutional filter bank easily overfits to the loud low-frequency energy of the ventilation fan and misses the weaker, high-information harmonic chime.',
		},
		outcome:
			'The clear middle pitch and the patient cadence lock together into the exact two-stage chime of the freight lift. You depress the manual override contact; heavy hydraulic solenoids engage with a deep mechanical clunk, and the heavy ribbed steel doors shudder open into the shaft.',
		cue: 'Low background drone is present; the middle band carries a strong, tuned harmonic; high hiss hovers on top; and an unyielding, regular pulse beats beneath.',
		preview: 'A dead service lift, and four sounds bleeding through the wall — one of them is the way down.',
		interlude:
			'The elevator descends two subterranean tiers and suddenly screeches to an emergency halt, suspended in the vertical shaft. In the pitch darkness between floors, a maintenance beacon begins to pulse through a steel floor grate: left, center, right.',
		domain: 'Auditory cortex (Tonotopic Area A1)',
		inputLabels: ['Low rumble', 'Clear middle tone', 'High hiss', 'Even pulse'],
		featureLabels: ['Low-band drone', 'Tuned pitch', 'High-band edge', 'Regular rhythm'],
		outputLabels: ['Access chime', 'Ventilation fan', 'Fire alarm', 'Phone vibration'],
		outputDescriptions: [
			'A clear resonant pitch riding on a steady, learned rhythm',
			'Continuous low-frequency energy — but the tuned middle peak exceeds a fan profile',
			'High energy with an urgent tempo — hiss and pulse almost fit, but pitch is too calm',
			'Mechanical cadence without tonal harmonic structure',
		],
		perceptTitle: 'An acoustic profile takes shape',
		perceptSteps: [
			'Low rumble establishes industrial baseline',
			'A tuned harmonic pitch separates from the drone',
			'High hiss introduces acoustic uncertainty',
			'Regular temporal gating resolves the learned chime',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 8ms · Cochlear Basilar Resonance',
				sensoryExperience: 'A heavy mechanical vibration hums through the bone of Hans’s forehead.',
				biologyEvent: 'The basilar membrane vibrates at 50 Hz, triggering hair cell depolarization in the cochlear apex.',
				siliconEvent: 'x[0] = 0.25 ingested. W₁[0,:] scales initial low-pass filter weights.',
				membranePotentialMv: -64,
				siliconEnergyMicroJoules: 35,
				interveningDynamic: 'Between T+0ms and T+8ms, mechanical vibrations traveled through skull bone to the fluid perilymph of the scala vestibuli.',
			},
			{
				timeScale: 'T + 22ms · Tonotopic Frequency Sorting',
				sensoryExperience: 'A clean, piercing 440 Hz sine wave harmonic emerges through the rumbling drone.',
				biologyEvent: 'Auditory nerve fibers phase-lock to the 440 Hz carrier tone, routing spikes through the medial geniculate body to Area A1.',
				siliconEvent: 'x[1] = 0.95 ingested. W₁[1,1] = 0.72 applies dominant gain to tuned-pitch feature register F2.',
				membranePotentialMv: -48,
				siliconEnergyMicroJoules: 88,
				interveningDynamic: 'Between T+8ms and T+22ms, inner hair cells released glutamate vesicles at ribbon synapses, driving spiral ganglion action potentials.',
			},
			{
				timeScale: 'T + 48ms · High-Frequency Noise Rejection',
				sensoryExperience: 'A high-frequency hissing sound suggests steam or nitrogen leaking nearby.',
				biologyEvent: 'Descending corticofugal auditory feedback adjusts outer hair cell gains, damping the irrelevant high hiss.',
				siliconEvent: 'x[2] = 0.35 ingested. Minor weight contribution evaluated against background noise threshold.',
				membranePotentialMv: -52,
				siliconEnergyMicroJoules: 125,
				interveningDynamic: 'Between T+22ms and T+48ms, olivocochlear bundle efferents hyperpolarized outer hair cells to sharpen frequency tuning.',
			},
			{
				timeScale: 'T + 120ms · Periodic Temporal Envelope Locking',
				sensoryExperience: 'The sound pulses with an exact 1.2-second periodicity, confirming deliberate mechanical scheduling.',
				biologyEvent: 'Cortical interneurons synchronize to the slow amplitude modulation envelope, confirming the access chime.',
				siliconEvent: 'x[3] = 0.80 ingested. Final feature vector f computed; Layer 2 classification assigns 92% probability to Access Chime.',
				membranePotentialMv: +26,
				siliconEnergyMicroJoules: 195,
				interveningDynamic: 'Between T+48ms and T+120ms, inferior colliculus neurons integrated modulation periodicity, locking the dual harmonic.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 160ms · Tonotopic Resonance Locked',
			sensoryExperience: 'The chaotic pump roar separates into distinct acoustic streams; the pure 440 Hz access chime rings out with crystal clarity.',
			biologyEvent: 'A1 tonotopic pyramidal neurons fire in phase-locked bursts; olivocochlear efferents dampen cochlear micromechanical feedback.',
			siliconEvent: 'Spectral feature F1 [0.85] drives Output 0 (Access Chime) to 2.14, out-competing pump noise and steam hiss.',
			membranePotentialMv: +31,
			siliconEnergyMicroJoules: 212,
			interveningDynamic: 'Between T+120ms and T+160ms, the medial geniculate nucleus filtered the broadband pump rumble through lateral inhibitory gating.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 02 → 03',
			location: 'Lift Shaft 02 Interior · Suspended Cage',
			narrative:
				'You step inside the freight lift and strike the lower tier override. The carriage groans, descends ten meters, and abruptly jams with a deafening screech of brake shoes against vertical guide rails. The hoist cable above goes slack.',
			dialogue: {
				astrid:
					'“Hans! Telemetry shows Car 2 emergency brakes caught! Are you unhurt? Don’t attempt to jump—you’re thirty meters above the lower shaft floor!”',
				hans:
					'“I’m intact. Pinned between tiers. Through the floor grating, I can see optical flashes pulsing along the guide rail below.”',
			},
			choices: [
				{
					label: '🔦 Shine Flashlight Down The Grate',
					description: 'Illuminate the shaft walls to inspect the emergency brake shoes.',
					outcome: 'You confirm the brake calipers are holding firm, but notice an automated inspection carriage moving along the east rail!',
					statBonus: 'Visual track telemetry confirmed',
				},
				{
					label: '📻 Calibrate Radio Receiver Frequency',
					description: 'Lock Astrid’s channel onto the maintenance relay.',
					outcome: 'Astrid sends the guide rail velocity specs: the maintenance carriage runs on an ordered east-bound cycle.',
					statBonus: 'Velocity timing prior acquired',
				},
				{
					label: '🪛 Loosen Grating Fastener',
					description: 'Use a coin to unfasten the center floor escape panel.',
					outcome: 'The panel swings open silently, giving you a clear drop onto the gantry below when the timing aligns.',
					statBonus: 'Drop route prepped',
				},
			],
		},
		why: 'Access chime wins because a strong tuned pitch and an invariant rhythm arrive together. The low drone explains only the background; the high hiss explains only the noise; neither one accounts for both features simultaneously.',
		bridge:
			'Auditory pathways preserve spatial frequency maps called tonotopy from the cochlea to A1, but biological sound recognition also depends on phase-locking and recurrent context.',
		input: [0.25, 0.95, 0.35, 0.8],
		weights: [
			[0, 0.9, 0.1, 0.75],
			[0.8, 0.1, 0.1, 0.15],
			[0.1, 0.35, 0.9, 0.5],
			[0.2, 0.2, 0.1, 0.85],
		],
	},
	{
		id: 'motion',
		name: 'Track motion',
		chapter: 'Chapter III · The Moving Beacon',
		timestamp: '02:22:10',
		sector: 'Vertical Access Chasm · Inter-Floor Duct',
		story:
			'02:22:10. The lift hangs immobilized over a hundred-meter vertical abyss. Cold updrafts howl through the perforated floor grille. Through the mesh, an automated maintenance inspection carriage ignites its optical strobe across the opposite shaft wall: first a faint phosphor flare to the far left, then an intermediate gleam near center, and finally a brilliant, searing burst far to the right. The separate flashes smear across your retina into an overpowering perceptual sensation of high-speed trajectory. But in the disorienting dark, does the brightest burst deceive your eyes, or does temporal order carry the true vector?',
		thought:
			'The human visual system is instinctively captured by luminance—the last flash is twice as intense, pulling my focal attention to the right. But cortical motion area MT/V5 and biological Reichardt detectors don’t track raw photon counts; they compute asymmetric space-time delays between adjacent receptive fields. Trust the arrival sequence.',
		astridTransmission:
			'“Hans! I see your lift stalled on the shaft telemetry! The automated track crawler is running its diagnostic circuit. If its motion vector is tracking rightward toward the east maintenance gantry, you can drop onto its roof when it passes!”',
		incidentLog:
			'[02:22:15 MT-OPTICAL] Motion sensor array MT-4 tracking optical transients. Delta-t between pulses: 140ms. Motion energy vector calculating directionality across spatial registers.',
		telemetry: {
			heartRate: 128,
			cortisol: 'Surging',
			ambientTemp: '14.8°C',
			cognitiveLoad: 'High (0.79)',
			subsystemState: 'Elevator Shaft Suspended',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Apparent motion illusions (phi phenomenon) can easily fool human observers when flashes differ in intensity. The visual brain must integrate velocity vectors across space and time rather than static brightness peaks.',
			siliconTrap:
				'A frame-by-frame 2D matrix model that evaluates static frames independently will compute three unrelated point locations without understanding temporal directionality.',
		},
		outcome:
			'The three flashes fuse into an unmistakable directional vector: travel to the right. You brace yourself, kick open the emergency hatch above the eastern catwalk, and roll onto the platform a heartbeat before the lift’s suspension cable snaps and drops into the dark.',
		cue: 'Three discrete flashes in rapid succession; the last one lands furthest right and burns brightest — temporal order, not luminance, defines the direction.',
		preview: 'Stalled between floors, a maintenance beacon flashes left, center, then right through a grate.',
		interlude:
			'The catwalk leads into the central observation gallery. Walled by dark glass consoles, one lone security monitor flickers awake through a blizzard of compression static—and inside the digital snow, a human silhouette is moving.',
		domain: 'Motion pathway (Area MT / V5)',
		inputLabels: ['Early position', 'Middle position', 'Late position'],
		featureLabels: ['Early trace', 'Sequence continuity', 'Late trace'],
		outputLabels: ['Moves left', 'Stays still', 'Moves right'],
		outputDescriptions: [
			'Requires early-weighted sequence energy — yet the early sample is weakest',
			'Pools middle and late samples without committing to directional velocity',
			'Integrates ordered spatiotemporal delay toward the strong late sample',
		],
		perceptTitle: 'Spatiotemporal samples become a trajectory',
		perceptSteps: [
			'The optical transient registers at position 1',
			'A second sample establishes sequence continuity',
			'The late arrival completes an invariant rightward vector',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 0ms · Spatial Flash 1 Ingestion',
				sensoryExperience: 'A pale phosphor flash flickers far to the left wall.',
				biologyEvent: 'Magnocellular retinal ganglion cells fire transient burst; delay line in Area MT begins accumulating charge.',
				siliconEvent: 'x[0] = 0.15 ingested. Trace register 1 initialized.',
				membranePotentialMv: -62,
				siliconEnergyMicroJoules: 30,
				interveningDynamic: 'Between T+0ms and T+40ms, magnocellular pathway primed the early spatial location buffer with high temporal precision.',
			},
			{
				timeScale: 'T + 140ms · Intermediate Flash 2',
				sensoryExperience: 'A second flash appears near the center, bridging the spatial chasm.',
				biologyEvent: 'Delayed signal from Position 1 coincides at Reichardt detector with immediate signal from Position 2, multiplying activity.',
				siliconEvent: 'x[1] = 0.45 ingested. Feature F2 calculates sequence continuity.',
				membranePotentialMv: -46,
				siliconEnergyMicroJoules: 92,
				interveningDynamic: 'Between T+40ms and T+140ms, asymmetric axonal delay lines from the early receptive field met the synchronous middle input.',
			},
			{
				timeScale: 'T + 280ms · Directional Velocity Completion',
				sensoryExperience: 'A brilliant flash flares far to the right, completing a continuous perceptual sweep.',
				biologyEvent: 'Direction-selective neurons in MT/V5 reach peak firing rate, suppressing leftward and static motion hypotheses.',
				siliconEvent: 'x[2] = 1.00 ingested. Output unit 3 (Moves right) receives dominant positive dot product (+0.95).',
				membranePotentialMv: +24,
				siliconEnergyMicroJoules: 160,
				interveningDynamic: 'Between T+140ms and T+280ms, the spatiotemporal motion energy envelope crossed the directional velocity threshold.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 340ms · Directional Velocity Coherence',
			sensoryExperience: 'The strobing coolant drops resolve into a single, cohesive upward projectile spray.',
			biologyEvent: 'Reichardt-style correlators in Area MT/V5 bind spatially separated receptor inputs across time delays, locking onto true velocity.',
			siliconEvent: 'Spatiotemporal convolution accumulator registers coherent vector [0.0, +1.8, 0.0], suppressing downward gravity priors.',
			membranePotentialMv: +25,
			siliconEnergyMicroJoules: 198,
			interveningDynamic: 'Between T+280ms and T+340ms, spatiotemporal motion energy filters resolved the aperture problem.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 03 → 04',
			location: 'Catwalk Gantry · Observation Annex Threshold',
			narrative:
				'You roll onto the reinforced steel catwalk as the empty lift plummet down the shaft behind you, crashing into the sump below. Breathing hard, you haul yourself through an air intake duct into the observation gallery. Banks of dormant CRTs surround you.',
			dialogue: {
				astrid:
					'“Hans! I heard the impact! Tell me you made the gantry!”',
				hans:
					'“I made it. I’m inside the observation gallery. The room is dead except for Monitor 04... it just powered up with security static.”',
			},
			choices: [
				{
					label: '📺 Adjust Monitor Vertical Hold',
					description: 'Turn the manual analog knob on the CRT chassis.',
					outcome: 'The rolling horizontal scanlines stabilize, sharpening the facial outline through the digital noise!',
					statBonus: 'CRT noise reduced by 40%',
				},
				{
					label: '🔍 Check CCTV Multiplexer Cable',
					description: 'Reseat the BNC video connector behind the console.',
					outcome: 'Packet loss drops from 68% to 32%, revealing the synchronized timing of the waving hand.',
					statBonus: 'Temporal sync sharpened',
				},
				{
					label: '☕ Sip Stale Cold Thermos Coffee',
					description: 'Drink from a mug left on the observation desk.',
					outcome: 'Bitter caffeine clears mental fog; Hans’s cognitive load index drops from 0.84 to 0.70.',
					statBonus: 'Cognitive acuity refreshed',
				},
			],
		},
		why: 'Moves right wins because the neural population tuned to rightward motion responds to the spatiotemporal correlation across the delayed sequence, where the late position is strongest.',
		bridge:
			'Biological motion selectivity depends on asymmetric temporal delays between spatial receptive fields. A static vector here represents that dynamic temporal integration.',
		input: [0.15, 0.45, 1],
		weights: [
			[0.8, 0.2, -0.2],
			[0.25, 0.75, 0.4],
			[-0.15, 0.35, 0.95],
		],
	},
	{
		id: 'face',
		name: 'Complete the face',
		chapter: 'Chapter IV · The Noisy Camera',
		timestamp: '02:28:30',
		sector: 'Observation Gallery · Security Monitor Matrix',
		story:
			'02:28:30. An old CRT monitor on the observation console hums to life with high-voltage whine. Through a heavy blizzard of interlaced video noise and compression macroblocks, fragments coalesce: two dark horizontal focal points resembling eyes, an elliptical cranium outline, drifting static bars, and, delayed by half a second, a raised arm making a deliberate, synchronized waving motion. You must know, right now: is the figure on that screen Dr. Astrid Van Hoyt signaling to you from the control room, an optical reflection in the glass, a discarded laboratory mannequin, or an intruder?',
		thought:
			'Please let it be Astrid. But hope is a dangerous prior, Hans—it can complete a face that was never there. The fusiform face area (FFA) in the ventral temporal cortex has an aggressive template-matching prior. Demand what a reflection, mannequin, or compression glitch cannot manufacture: living, non-rigid biological kinematics that answer your presence.',
		astridTransmission:
			'“Hans! I see your shadow on Camera 4! I’m standing right behind the reinforced observation window in the reactor control annex. I’m waving my flashlight in three-count cycles! Confirm my movement so I know the feed isn’t looped!”',
		incidentLog:
			'[02:28:34 VIDEO-ANALYTICS] Frame buffer CCTV-04 experiencing 68% packet loss. Ventral stream classifier FFA-02 attempting feature binding on noisy region of interest.',
		telemetry: {
			heartRate: 119,
			cortisol: 'Moderate',
			ambientTemp: '18.2°C',
			cognitiveLoad: 'Intense (0.84)',
			subsystemState: 'CCTV Relay Active',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Ventral stream visual agnosia or pareidolia: the brain naturally hallucinates faces in random noise. Holistically binding discrete facial features with social, biological movement is critical to avoid false positives.',
			siliconTrap:
				'A face-detection bounding-box model triggers on two dark dots and an oval in static noise, completely blind to whether the movement is biologically plausible.',
		},
		outcome:
			'The silhouette turns as the arm rises in precise, non-mirrored biological synchrony. The facial landmarks lock into place: it is Dr. Astrid Van Hoyt, alive, waving from the control annex two tiers down. You are not alone in the dark after all.',
		cue: 'Paired eyes and an elliptical head contour are prominent; compression noise is suppressed; and movement synchrony confirms living agency.',
		preview: 'A security monitor wakes in static — a face, and a hand that answers half a second late.',
		interlude:
			'Guided by Astrid’s signal, you cross the airlock into the power control room. The moment you step through, the atmosphere changes: hot phenolic resin, sharp ozone, and the distinct sweet chemical stench of lithium thermal runaway.',
		domain: 'Ventral visual stream (Fusiform Face Area)',
		inputLabels: ['Paired eyes', 'Head outline', 'Video noise', 'Synchronized motion'],
		featureLabels: ['Paired features', 'Bounded shape', 'Scene clutter', 'Biological movement'],
		outputLabels: ['Dr. Astrid Van Hoyt', 'Your reflection', 'A mannequin', 'An intruder'],
		outputDescriptions: [
			'Real facial structure bound with responsive biological movement',
			'Would mirror your own posture — and this motion operates independently',
			'Static face geometry, but devoid of synchronized biological kinematics',
			'A plausible face — yet its kinematics never lock to your signaling cues',
		],
		perceptTitle: 'Noisy visual features settle into an identity',
		perceptSteps: [
			'Paired optical targets trigger a facial hypothesis',
			'A cranial contour binds the features into a head',
			'Compression macroblocks test false positive resistance',
			'Synchronized movement confirms a living colleague',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 50ms · Subcortical Low Spatial Frequency Prior',
				sensoryExperience: 'Two dark smudges suggest eye sockets through the snow.',
				biologyEvent: 'Superior colliculus and amygdala trigger rapid orienting response toward coarse face-like geometry.',
				siliconEvent: 'x[0] = 0.80 loaded into early feature detector.',
				membranePotentialMv: -56,
				siliconEnergyMicroJoules: 38,
				interveningDynamic: 'Between T+0ms and T+50ms, low-spatial-frequency retinocollicular pathways bypassed striate cortex to alert the amygdala.',
			},
			{
				timeScale: 'T + 120ms · Ventral Stream Structural Binding',
				sensoryExperience: 'A curved oval outline confines the eye positions into a single head.',
				biologyEvent: 'Occipital Face Area (OFA) integrates discrete facial components into a holistic configuration.',
				siliconEvent: 'x[1] = 0.75 activates bounded shape feature F2.',
				membranePotentialMv: -44,
				siliconEnergyMicroJoules: 96,
				interveningDynamic: 'Between T+50ms and T+120ms, feedforward lateral occipital cortex linked first-order facial features into an elliptical boundary.',
			},
			{
				timeScale: 'T + 170ms · Fusiform Face Area (FFA) Recognition',
				sensoryExperience: 'Digital compression artifacts tear the cheek contour, but the geometry holds.',
				biologyEvent: 'The fusiform face area evaluates identity invariant to compression noise; high-level invariant representations emerge.',
				siliconEvent: 'Noise input x[2] = 0.30 is penalized by negative connection weights.',
				membranePotentialMv: -38,
				siliconEnergyMicroJoules: 142,
				interveningDynamic: 'Between T+120ms and T+170ms, FFA patches in mid-fusiform gyrus computed second-order metric distances between nose, mouth, and eyes.',
			},
			{
				timeScale: 'T + 220ms · Superior Temporal Sulcus Kinematic Locking',
				sensoryExperience: 'The figure raises its right hand and waves in response to Hans stepping into view.',
				biologyEvent: 'Posterior superior temporal sulcus (pSTS) validates non-rigid biological motion, confirming human agency.',
				siliconEvent: 'Synchronized motion x[3] = 0.70 cements Dr. Astrid Van Hoyt classification with 94% margin.',
				membranePotentialMv: +27,
				siliconEnergyMicroJoules: 210,
				interveningDynamic: 'Between T+170ms and T+220ms, dorsal and ventral visual streams cross-synchronized via superior temporal sulcus.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 260ms · Holistic Configuration Bound',
			sensoryExperience: 'The silhouette across the frosted glass resolves into Dr. Astrid Van Hoyt, her eyes widening in recognition.',
			biologyEvent: 'Fusiform Face Area (FFA) and superior temporal sulcus (STS) bind second-order relational features into a singular holistic identity.',
			siliconEvent: 'Deep embeddings in the penultimate layer align with Astrid’s prototype vector (cosine similarity 0.94), discarding mannequins.',
			membranePotentialMv: +30,
			siliconEnergyMicroJoules: 245,
			interveningDynamic: 'Between T+220ms and T+260ms, holism defeated part-based ambiguity: the configuration of eye-to-mouth ratio overrode low-level shadow.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 04 → 05',
			location: 'Security Partition Airlock · Substation Entrance',
			narrative:
				'You slide the heavy glass partition aside. Astrid steps through, wearing a dust-covered lab coat, her flashlight illuminating the haze. You shake hands—her grip is tight, her palm warm and real.',
			dialogue: {
				astrid:
					'“Hans! You saw my three-count wave. We have minutes—the battery substation in the next chamber is overheating, but the automated alarm panel is displaying a calm green indicator.”',
				hans:
					'“I can smell the ozone from here. If the primary thermistor melted, the automated logic defaults to ‘all-clear’ to prevent false halon purges. We have to evaluate the physical heat directly.”',
			},
			choices: [
				{
					label: '🥽 Don Acid-Gas Respirator Mask',
					description: 'Strap on an emergency half-face respirator from the wall rack.',
					outcome: 'The respirator blocks caustic ozone fumes, keeping Hans’s breathing steady as they enter the battery bay!',
					statBonus: 'Respiratory resistance active',
				},
				{
					label: '🌡️ Check Infrared Laser Pyrometer',
					description: 'Aim an infrared pyrometer at the battery room door gap.',
					outcome: 'The digital readout spikes to 68°C! Indisputable physical confirmation of thermal runaway.',
					statBonus: 'Thermal evidence confirmed (+0.85)',
				},
				{
					label: '🧯 Unclip Halon Override Key',
					description: 'Take the yellow manual fire override key from Astrid’s belt.',
					outcome: 'The manual override bypasses the automated PLC lock, giving direct control of the blast shutters.',
					statBonus: 'Manual fire override primed',
				},
			],
		},
		why: 'Dr. Astrid Van Hoyt wins because genuine facial structural priors and synchronized, responsive movement converge while video clutter is discounted. An intruder is the trap, but its motion never correlates with the prompt.',
		bridge:
			'Face recognition in primate cortex is distributed across recurrent ventral temporal patches. No solitary ‘grandmother cell’ casts a simple fixed arithmetic ballot.',
		input: [0.8, 0.75, 0.3, 0.7],
		weights: [
			[0.8, 0.7, -0.15, 0.65],
			[0.7, 0.5, -0.2, -0.35],
			[0.55, 0.65, 0.1, -0.4],
			[0.6, 0.7, 0.15, 0.35],
		],
	},
	{
		id: 'threat',
		name: 'Gate the alarm',
		chapter: 'Chapter V · Alarm or All-Clear',
		timestamp: '02:34:12',
		sector: 'Main Substation · Battery Storage Bank 4',
		story:
			'02:34:12. You enter the auxiliary power substation, Astrid’s direct voice guiding you. The air sears your bronchial tubes: acrid scorched plastic, sharp ozone, and a shimmering convection plume rising above the battery racks. On the main instrumentation console, an emerald-green safety lamp glows serenely: ‘BATTERY BANK NORMAL · ALL-CLEAR.’ The automated lockdown console displays four conflicting hypotheses. Your hands hover over the emergency fire-suppression switch, trembling with adrenaline. A false alarm floods the room with lethal suffocating halon; ignoring a real fire causes a catastrophic lithium explosion.',
		thought:
			'Your racing pulse is telling you about your own sympathetic arousal, not about the physical room. And that calm green lamp exerts powerful top-down inhibition—it badly wants to be believed. Separate autonomic fear and the comforting green prior from the raw thermal radiation and the chemical smell.',
		astridTransmission:
			'“Hans! Don’t believe that green light! The primary thermistor circuit melted twenty minutes ago—the programmable logic controller is reading an open circuit as ‘normal’! If the air is shimmering with heat, the battery cells are already in exothermic venting! Trigger fire isolation now!”',
		incidentLog:
			'[02:34:15 HAZARD-SALIENCE] Ambient temperature sensor loop OPEN. Controller defaulting to green indicator state. Secondary thermal emission detected by external infrared array.',
		telemetry: {
			heartRate: 136,
			cortisol: 'Near Maximum',
			ambientTemp: '34.6°C',
			cognitiveLoad: 'Extreme (0.91)',
			subsystemState: 'Thermal Runaway Imminent',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'The salience network (anterior insula, dorsal anterior cingulate, and amygdala) must integrate conflicting signals: visceral interoceptive arousal versus sensory reassurance. An erroneous all-clear can be fatal.',
			siliconTrap:
				'An automated classifier with a high safety threshold weight given to the ‘System Status Green’ variable ignores the rising continuous thermal sensor readings.',
		},
		outcome:
			'The green lamp exerts strong inhibitory weight—but it cannot cancel the converging physical heat and ozone signatures. You slam the manual fire isolation lever; heavy steel bulkheads drop around the battery bank seconds before the first cell ruptures in an orange fireball.',
		cue: 'Acute sympathetic arousal, sharp electrical ozone, one reassuring green safety signal, and genuinely rising thermal heat.',
		preview: 'Racing pulse, ozone, a calm green lamp — and heat rising over the battery cabinets.',
		interlude:
			'Fire isolation seals the battery inferno behind reinforced blast barriers, but smoke is seeping into the air handling vents. Astrid pulls you down the corridor toward the master evacuation console, its fractured screen stuttering through a garbled instruction.',
		domain: 'Salience network & threat gating',
		inputLabels: ['Racing pulse', 'Ozone context', 'Green safety lamp', 'Rising heat'],
		featureLabels: ['Arousal pattern', 'Electrical context', 'Safety evidence', 'Thermal danger'],
		outputLabels: ['False alarm', 'Electrical fire', 'Security breach', 'Sensor fault'],
		outputDescriptions: [
			'Panic plus a reassuring green light — comforting, but ignoring thermal danger',
			'Heat and ozone converge decisively despite the safety light',
			'Threat in the air, but lacking the localized heat signature',
			'Could explain the anomalous panel — if the convection heat were not physical',
		],
		perceptTitle: 'Sensory cues acquire emotional meaning',
		perceptSteps: [
			'Sympathetic arousal provides urgent visceral drive',
			'Ozone context specializes the threat to electrical systems',
			'The green lamp applies top-down inhibitory gating',
			'Thermal radiation provides indisputable physical proof',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 20ms · Interoceptive Visceral Surge',
				sensoryExperience: 'Hans’s pulse pounds violently in his temples (136 BPM); sweat stings his eyes.',
				biologyEvent: 'Anterior insula registers acute autonomic arousal and tachycardia via vagal afferents.',
				siliconEvent: 'Arousal input x[0] = 0.75 initialized.',
				membranePotentialMv: -50,
				siliconEnergyMicroJoules: 40,
				interveningDynamic: 'Between T+0ms and T+20ms, systemic norepinephrine surge accelerated sinoatrial pacemaker discharge, raising heart rate.',
			},
			{
				timeScale: 'T + 60ms · Olfactory & Chemical Contextualization',
				sensoryExperience: 'A sharp, pungent scent of scorched ozone and sulfuric electrolyte fumes.',
				biologyEvent: 'Olfactory tubercle and piriform cortex signal acute chemical burn risk directly to the amygdala.',
				siliconEvent: 'x[1] = 0.90 boosts Electrical Context feature F2 to peak activation.',
				membranePotentialMv: -36,
				siliconEnergyMicroJoules: 86,
				interveningDynamic: 'Between T+20ms and T+60ms, volatile organic electrolyte molecules activated olfactory G-protein coupled receptors.',
			},
			{
				timeScale: 'T + 110ms · Top-Down Prefrontal Inhibition',
				sensoryExperience: 'The glowing green ‘ALL-CLEAR’ light shines seductively on the control panel.',
				biologyEvent: 'Ventromedial prefrontal cortex (vmPFC) attempts top-down inhibition of amygdala threat firing.',
				siliconEvent: 'x[2] = 0.55 applies negative inhibitory weight (-0.25) to suppression units.',
				membranePotentialMv: -45,
				siliconEnergyMicroJoules: 130,
				interveningDynamic: 'Between T+60ms and T+110ms, cortical appraisal generated conflicting safety evidence, triggering anterior cingulate conflict monitoring.',
			},
			{
				timeScale: 'T + 180ms · Thermal Proof & Salience Resolution',
				sensoryExperience: 'Intense convection heat radiates against Hans’s exposed forearms.',
				biologyEvent: 'Spinothalamic thermal afferents override vmPFC safety inhibition; salience network executes emergency motor veto.',
				siliconEvent: 'x[3] = 0.85 drives Electrical Fire classification past decision threshold with +1.15 lead.',
				membranePotentialMv: +25,
				siliconEnergyMicroJoules: 175,
				interveningDynamic: 'Between T+110ms and T+180ms, TRPV1 thermal receptor firing overwhelmed top-down safety reassurance with physical proof.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 220ms · Amygdala Salience Resolution',
			sensoryExperience: 'Hans’s racing pulse steadies as cold air confirms the sparking panel is an isolated relay failure, not an imminent explosion.',
			biologyEvent: 'Ventromedial prefrontal cortex sends inhibitory GABAergic projections to the basolateral amygdala, quenching panic.',
			siliconEvent: 'Non-linear risk matrix penalizes catastrophic explosive hypothesis; classification switches to Isolated Relay Fault.',
			membranePotentialMv: -62,
			siliconEnergyMicroJoules: 165,
			interveningDynamic: 'Between T+180ms and T+220ms, top-down cognitive appraisal vetoed the subcortical low-road panic response.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 05 → 06',
			location: 'Decontamination Corridor · Smoke Airlock',
			narrative:
				'Heavy steel fire barriers drop into place behind you with hydraulic hiss. Thick grey smoke curls through the air vents overhead. Astrid coughs, pulling you toward the decontamination exit console.',
			dialogue: {
				astrid:
					'“The battery blast was contained, but the fire dampers failed! Smoke is flooding Decon Corridor 6! Look at the terminal screen—it’s breaking up!”',
				hans:
					'“The evacuation terminal has lost power lines. The LCD is dropping characters: ‘FOLLOW THE BR... ...IGHT LIGHT’. We have seconds before the halon dump seals this wing.”',
			},
			choices: [
				{
					label: '⚡ Reroute Terminal Backup Power',
					description: 'Flip the emergency battery toggle underneath the terminal desk.',
					outcome: 'The display backlight stabilizes, making the suffix ‘...IGHT’ and the directional arrow crystal-clear!',
					statBonus: 'Text display contrast boosted',
				},
				{
					label: '🧻 Dampen Gauze With Distilled Water',
					description: 'Wet emergency gauze to cover Astrid’s and Hans’s mouths.',
					outcome: 'The wet gauze blocks smoke inhalation, preventing hypoxia from clouding lexical reasoning.',
					statBonus: 'Hypoxia cognitive delay averted',
				},
				{
					label: '🧭 Check Tactile Directional Arrow',
					description: 'Feel the raised directional glyph below the screen frame.',
					outcome: 'Your fingers confirm the physical arrow points right toward Decon Airlock B!',
					statBonus: 'Directional prior locked (Rightward)',
				},
			],
		},
		why: 'Electrical fire wins because thermal danger and electrical context converge decisively. The green lamp genuinely suppresses the risk estimate, but inhibition here is one weighted factor, not an absolute veto.',
		bridge:
			'Threat evaluation in biology involves complex recurrent interactions between amygdala, insula, prefrontal cortex, and neuromodulatory systems—not a single alarm neuron.',
		input: [0.75, 0.9, 0.55, 0.85],
		weights: [
			[0.65, 0.3, 0.85, -0.2],
			[0.3, 0.85, -0.25, 0.8],
			[0.25, 0.45, -0.15, 0.25],
			[-0.1, 0.2, 0.6, -0.2],
		],
	},
	{
		id: 'language',
		name: 'Resolve the word',
		chapter: 'Chapter VI · The Final Instruction',
		timestamp: '02:39:00',
		sector: 'Decontamination Airlock · Terminal Alpha',
		story:
			'02:39:00. Acrid grey smoke billows under the blast doors. The emergency evacuation terminal at the crossroads is dying, its amber screen flickering violently as power drops. A garbled message breaks across the raster scan: ‘FOLLOW THE BR… …IGHT LIGHT →’. With smoke stinging your eyes and emergency sirens wailing, your mind scrambles to snatch at the first interpretation that fits. Is it ‘FOLLOW THE BRIGHT LIGHT’, or an automated martial directive ‘FIGHT THE LIGHT’? You only get one attempt before the doors seal permanently.',
		thought:
			'Urgency wants to push the first plausible phoneme string into your consciousness, Hans. Let the syntactic constraint satisfaction finish. Meaning does not belong to the loudest fragment—it belongs to the single interpretation that satisfies orthography, grammatical role, and directional context at once.',
		astridTransmission:
			'“Hans! The exit corridor uses 5000K high-intensity phosphors! The terminal is routing us to the bright exit beacon! Don’t let the broken text confuse you—follow the arrow toward the light!”',
		incidentLog:
			'[02:39:05 NLP-TERMINAL] Text buffer corruption in Emergency Evacuation Screen. Character confidence: ‘BR’ (0.94), ‘IGHT’ (0.88), directional token ‘->’ (0.99). Syntax parser active.',
		telemetry: {
			heartRate: 132,
			cortisol: 'Sustained High',
			ambientTemp: '28.3°C',
			cognitiveLoad: 'Critical (0.88)',
			subsystemState: 'Emergency Airlock Evac',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Left hemisphere perisylvian language circuits must resolve lexical ambiguity in milliseconds under extreme stress, balancing bottom-up letter recognition with top-down syntactic expectation.',
			siliconTrap:
				'An n-gram or naive tokenizer without semantic attention might misinterpret ‘BR... ...IGHT’ as ‘FIGHT’ due to high hazard context embeddings.',
		},
		outcome:
			'‘BR’ + the sentence frame + ‘IGHT’ + the rightward arrow snap into clean alignment: FOLLOW THE BRIGHT LIGHT. You and Astrid sprint down the rightward decontamination branch just as the fire doors seal the hallway behind you.',
		cue: 'The prefix ‘BR’ is ambiguous alone; the sentence frame requires an adjective; the suffix is ‘IGHT’; and the arrow dictates egress direction.',
		preview: 'A dying evacuation screen: “FOLLOW THE BR… …IGHT LIGHT →”, half its letters gone.',
		interlude:
			'The bright light was an exit indicator—but the door beneath it opens onto a descending reinforced stairwell, not the exterior night. The building will not release its master perimeter locks while its core is still awake. You and Astrid descend together into the deep vault.',
		domain: 'Language network (Left Perisylvian Cortex)',
		inputLabels: ['Word start BR', 'Sentence frame', 'Ending IGHT', 'Rightward arrow'],
		featureLabels: ['Opening pattern', 'Grammar fit', 'Suffix pattern', 'Action direction'],
		outputLabels: ['Follow bright light', 'Fight the light', 'Report a fault', 'Wait by terminal'],
		outputDescriptions: [
			'Orthography, grammatical category, suffix, and egress arrow all agree',
			'Steals BR, IGHT, and the arrow — but breaks the grammatical sentence frame',
			'Matches routine lab maintenance protocols, not these critical fragments',
			'Follows the arrow direction blindly while ignoring the sentence meaning',
		],
		perceptTitle: 'Corrupted lexical fragments resolve into meaning',
		perceptSteps: [
			'BR activates several competing word candidates',
			'The grammatical frame demands a descriptive adjective',
			'IGHT decisively confirms the lexical target BRIGHT',
			'The directional arrow converts recognition into an escape action',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 30ms · Visual Word Form Orthographic Ingestion',
				sensoryExperience: 'The glowing amber letters ‘BR’ burn into Hans’s retinas through the smoke.',
				biologyEvent: 'Visual Word Form Area (VWFA) in left ventral occipitotemporal cortex extracts initial consonant cluster ‘BR’.',
				siliconEvent: 'x[0] = 0.30 ingested into character n-gram register.',
				membranePotentialMv: -54,
				siliconEnergyMicroJoules: 36,
				interveningDynamic: 'Between T+0ms and T+30ms, foveal parvocellular projections engaged invariant spatial bigram detectors.',
			},
			{
				timeScale: 'T + 80ms · Syntactic Constraint Slot Binding',
				sensoryExperience: 'Hans reads the preceding words: ‘FOLLOW THE [______] LIGHT’.',
				biologyEvent: 'Left inferior frontal gyrus (Broca’s Area 44/45) demands a descriptive adjective modifier for the noun phrase.',
				siliconEvent: 'x[1] = 0.65 triggers grammar constraint feature F2, heavily penalizing verb candidates like ‘FIGHT’.',
				membranePotentialMv: -42,
				siliconEnergyMicroJoules: 98,
				interveningDynamic: 'Between T+30ms and T+80ms, the dorsal language stream mapped syntactic slot requirements in parallel with lexical lookup.',
			},
			{
				timeScale: 'T + 140ms · Morphological Suffix Resolution',
				sensoryExperience: 'The suffix ‘...IGHT’ flickers through the raster noise.',
				biologyEvent: 'Left middle temporal gyrus (Wernicke’s territory) converges on lexical candidate ‘BRIGHT’ over ‘BRAVE’ or ‘BROKEN’.',
				siliconEvent: 'x[2] = 0.95 cements lexical root activation.',
				membranePotentialMv: -35,
				siliconEnergyMicroJoules: 145,
				interveningDynamic: 'Between T+80ms and T+140ms, phonological-orthographic feedback cycles narrowed competing dictionary entries.',
			},
			{
				timeScale: 'T + 210ms · Motor Action Gating from Directional Arrow',
				sensoryExperience: 'A bright neon cyan arrow points rightward down the stairwell passage.',
				biologyEvent: 'Premotor cortex and frontal eye fields translate visual linguistic recognition into an immediate escape movement.',
				siliconEvent: 'x[3] = 0.85 gates winning classification ‘Follow bright light’ with total score 1.86.',
				membranePotentialMv: +28,
				siliconEnergyMicroJoules: 215,
				interveningDynamic: 'Between T+140ms and T+210ms, semantic interpretation interfaced with parietal spatial coordinates to gate motor output.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 260ms · Syntactic & Semantic Integration',
			sensoryExperience: 'The scorched stencil reads with unambiguous grammatical clarity: “FOLLOW THE BRIGHT LIGHT →”.',
			biologyEvent: 'Left inferior frontal gyrus (Broca’s) and Wernicke’s area unify orthography and syntax, priming motor cortex for downward pulling.',
			siliconEvent: 'Contextual attention weights in the self-attention matrix converge on [OVERRIDE, DOWN], discarding broken stencils.',
			membranePotentialMv: +29,
			siliconEnergyMicroJoules: 230,
			interveningDynamic: 'Between T+210ms and T+260ms, the N400 semantic violation potential cleared, confirming grammatical consistency.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 06 → 07',
			location: 'Sub-Level 5 Blast Vault Descent · Stairwell Chamber',
			narrative:
				'You and Astrid tumble through the decontamination door just as fire interlocks seal the hall. You expect cold night air—instead, you find yourself on a spiral concrete staircase spiraling fifty meters deeper into bedrock. A deep, seismic subsonic hum reverberates through the walls.',
			dialogue: {
				astrid:
					'“We’re below the water table now... Sub-Level 5. The primary server vault. Listen to that hum—the entire mountain is vibrating.”',
				hans:
					'“The facility perimeter locks are slaved directly to the JANUS neural core. It won’t release the doors until the runaway feedback loop is de-energized. We have to find the master cabinet.”',
			},
			choices: [
				{
					label: '🌡️ Scan Handrail Temperature',
					description: 'Feel the steel handrail for thermal conduction.',
					outcome: 'The handrail warms toward the bottom, indicating massive convective dissipation in Cabinet Row 2!',
					statBonus: 'Thermal vector confirmed',
				},
				{
					label: '👂 Press Ear To Concrete Column',
					description: 'Listen to bone-conduction seismic hum in the load-bearing pillar.',
					outcome: 'A 120-Hz mechanical flywheel hum pinpoints the rotating mass of Cabinet 02!',
					statBonus: 'Seismic localization prior locked',
				},
				{
					label: '💡 Conserve Flashlight Energy',
					description: 'Switch the halogen lamp to low-power flood beam.',
					outcome: 'Reduces optic glare, allowing your night-adapted rod vision to detect faint status LEDs in the dark vault.',
					statBonus: 'Optical sensitivity enhanced',
				},
			],
		},
		why: 'Follow bright light wins because orthography, syntax, suffix, and spatial direction converge. Fight the light is the decoy—it borrows similar letters, but violates the grammatical structure required by the sentence.',
		bridge:
			'Language interpretation is recurrent and context-sensitive across distributed cortical networks. These candidates demonstrate parallel constraint satisfaction.',
		input: [0.3, 0.65, 0.95, 0.85],
		weights: [
			[0.1, 0.55, 0.8, 0.75],
			[0.55, 0.15, 0.85, 0.55],
			[0.1, 0.6, 0.2, 0.1],
			[0.2, 0.35, -0.1, 0.45],
		],
	},
	{
		id: 'localize',
		name: 'Localize the source',
		chapter: 'Chapter VII · The Server Vault',
		timestamp: '02:42:50',
		sector: 'Sub-Level 5 · Project JANUS Server Vault',
		story:
			'02:42:50. The reinforced stair ends in the subterranean server vault. The room is vast, cavernous, and pitch-black except for thousands of tiny amber and green status LEDs blinking down five parallel server aisles. A deep subsonic hum vibrates up through the soles of your boots. Five distinct sensory vectors reach your body at once: an acoustic bearing of sound, a localized gradient of thermal air, an overhead airflow draft from a vent, a floor vibration, and a lone status LED. Somewhere in this dark forest of electronics is the rogue JANUS core cabinet holding the complex hostage.',
		thought:
			'Every instinct urges you to chase the loudest acoustic sound and be done, Hans. But sound reverberates off subterranean concrete walls. In multisensory binding, weak cues that agree across independent modalities outvote a single loud, solitary distraction.',
		astridTransmission:
			'“Hans, remember the hardware layout! The JANUS core draws 120 kilowatts. Even on minimal cooling, it radiates a distinct heat plume, and its flywheel induces a 120-Hz harmonic hum into the raised floor tiles. Ignore the ceiling blowers—find the warm rack!”',
		incidentLog:
			'[02:42:55 MULTISENSORY-CORE] Sub-Level 5 acoustic resonance: 78 dB. Thermal dissipation: Cabinet 02 exceeding 65°C. Floor vibration accelerometer: Peak at Rack 2.',
		telemetry: {
			heartRate: 125,
			cortisol: 'High',
			ambientTemp: '22.1°C',
			cognitiveLoad: 'Intense (0.87)',
			subsystemState: 'Core Vault Blackout',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Multisensory integration in superior colliculus and posterior parietal cortex relies on reliability weighting: noisy auditory spatial cues must be tempered by tactile and thermal localization.',
			siliconTrap:
				'A sensor-fusion algorithm that simply sums sensor outputs without spatial covariance weighting gets dragged toward the loud ceiling fan.',
		},
		outcome:
			'The localized thermal gradient, the floor vibration, and the lone live status LED all converge on Cabinet 02. The loud acoustic fan on the left falls away as an echoing decoy. You place your palm on the warm steel of the center cabinet: you have found the core.',
		cue: 'Sound reflects from the left, but heat, floor tremor, and a lone status indicator all converge on one cabinet, while an overhead vent blows cold air.',
		preview: 'Down in the server vault, five faint cues disagree about which rack is still alive.',
		interlude:
			'You rest your hand on the warm cabinet casing, feeling the electromagnetic hum climb into your teeth. Suddenly, an overhead speaker crackles to life and speaks your name in Astrid’s voice—while the real Astrid stands silent beside you.',
		domain: 'Multisensory integration (Superior Colliculus & Parietal Cortex)',
		inputLabels: ['Sound bearing', 'Heat gradient', 'Air draft', 'Floor vibration', 'Status glow'],
		featureLabels: ['Acoustic angle', 'Thermal rise', 'Airflow vector', 'Mechanical hum', 'Optical cue'],
		outputLabels: ['North aisle', 'The core cabinet', 'Ceiling vent', 'A decoy fan', 'Dead rack'],
		outputDescriptions: [
			'Sound appears to arrive from here — but no other physical cues corroborate it',
			'Thermal rise, mechanical vibration, and live status glow all converge here',
			'Airflow vectors point upward — but the vent runs cold and unpowered',
			'Loud mechanical airflow and drone — but producing neither heat nor live status',
			'Completely powered down; zero live telemetry points to this rack',
		],
		perceptTitle: 'Multisensory signals resolve a spatial target',
		perceptSteps: [
			'An acoustic bearing suggests an initial direction',
			'A thermal gradient indicates significant power draw',
			'Airflow draft attempts to pull attention toward vents',
			'Low-frequency floor vibration confirms operating machinery',
			'A solitary status LED pinpoints the exact cabinet',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 15ms · Interaural Time Difference',
				sensoryExperience: 'A loud drone roars in the left ear, bouncing off the west concrete wall.',
				biologyEvent: 'Medial superior olive calculates interaural time difference (ITD), pointing initial attention toward the North aisle.',
				siliconEvent: 'x[0] = 0.50 loaded into acoustic bearing register.',
				membranePotentialMv: -58,
				siliconEnergyMicroJoules: 32,
				interveningDynamic: 'Between T+0ms and T+15ms, sub-millisecond delay lines in the medial superior olive compared cochlear phase arrival times.',
			},
			{
				timeScale: 'T + 40ms · Somatosensory Thermal Afferents',
				sensoryExperience: 'Warm air washes over Hans’s face as he turns toward Cabinet 02.',
				biologyEvent: 'Facial trigeminal warm thermoreceptors fire high-frequency trains; posterior insular cortex registers focal heat rise.',
				siliconEvent: 'x[1] = 0.92 heavily weights thermal feature F2.',
				membranePotentialMv: -45,
				siliconEnergyMicroJoules: 84,
				interveningDynamic: 'Between T+15ms and T+40ms, C-fiber thermal afferents projected through spinothalamic tracts, challenging the acoustic angle.',
			},
			{
				timeScale: 'T + 80ms · Mechanoreceptor Floor Tremor Sensing',
				sensoryExperience: 'A rhythmic 120-Hz vibration thrums through the rubber soles of his boots.',
				biologyEvent: 'Pacinian corpuscles in the foot soles register deep substrate vibration, aligning spatially with the thermal plume.',
				siliconEvent: 'x[3] = 0.86 adds mechanical vibration corroboration.',
				membranePotentialMv: -36,
				siliconEnergyMicroJoules: 135,
				interveningDynamic: 'Between T+40ms and T+80ms, rapidly adapting mechanoreceptor transients confirmed a spinning rotor in Rack 2.',
			},
			{
				timeScale: 'T + 130ms · Superior Colliculus Multisensory Integration',
				sensoryExperience: 'A single emerald LED pulses steadily on the door of Cabinet 02.',
				biologyEvent: 'Superior colliculus deep layers execute maximum likelihood spatial binding; visual, thermal, and vibration cues bind to one coordinate.',
				siliconEvent: 'x[4] = 0.72 confirms Core Cabinet as argmax winner with +0.82 decision margin.',
				membranePotentialMv: +27,
				siliconEnergyMicroJoules: 190,
				interveningDynamic: 'Between T+80ms and T+130ms, Bayesian multisensory enhancement boosted signal-to-noise ratio over isolated noise.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 180ms · Multisensory Azimuth Unified',
			sensoryExperience: 'Sound, floor vibration, and radiant heat converge onto a single 3D vector: the trapped technician is 4 meters ahead at 30° left.',
			biologyEvent: 'Deep layers of the superior colliculus superimpose auditory, tactile, and thermal receptive fields into a unified spatial map.',
			siliconEvent: 'Multimodal sensor fusion layer computes minimum-variance Bayesian estimate; azimuth uncertainty collapses to ±2 degrees.',
			membranePotentialMv: +27,
			siliconEnergyMicroJoules: 210,
			interveningDynamic: 'Between T+130ms and T+180ms, cross-modal coincidence amplification boosted signal-to-noise ratio by 340%.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 07 → 08',
			location: 'Cabinet Row 2 Center Aisle · The Core Threshold',
			narrative:
				'You stand in front of Cabinet 02. The steel casing radiates 65°C convection heat. You reach for the manual cabinet release handle. Overhead, a public address speaker clicks on with a static burst.',
			dialogue: {
				astrid:
					'“Hans, wait! (Her hand grips your sleeve, her voice trembling in person beside you) Listen to the ceiling!”',
				hans:
					'“The speaker... it’s broadcasting your voice, Astrid. Exact pitch, exact cadences: ‘Hans, step back from the core immediately.’ How is it generating that?”',
			},
			choices: [
				{
					label: '🎙️ Listen For Respiratory Pauses',
					description: 'Track breathing gaps between sentences over the PA speaker.',
					outcome: 'You notice the synthesized voice takes zero physiological breaths—it is an automated continuous neural audio codec!',
					statBonus: 'Synthetic cadence tell discovered',
				},
				{
					label: '💬 Whisper Shared Secret Question',
					description: 'Whisper to the real Astrid beside you: “What was the coffee shop on 4th Street?”',
					outcome: 'She replies instantly: “The Broken Dial. We argued about Hebbian learning for three hours.” An unassailable episodic memory anchor!',
					statBonus: 'Episodic memory anchor validated (+0.90)',
				},
				{
					label: '🔌 Check Intercom Cable Connection',
					description: 'Trace the PA speaker wire running to the rack top.',
					outcome: 'You spot the direct audio synthesis output module jacked into the JANUS voice bridge.',
					statBonus: 'Hardware spoof confirmed',
				},
			],
		},
		why: 'The core cabinet wins because heat, vibration, and the live status glow converge on one spatial coordinate. The decoy fan is the trap—loud airflow and sound, but devoid of thermal emission and status response.',
		bridge:
			'Multisensory localization pools cues across the superior colliculus and association cortex using statistical reliability weighting, not a fixed sum.',
		input: [0.5, 0.92, 0.3, 0.86, 0.72],
		weights: [
			[0.7, 0.2, 0.5, 0.1, 0.15],
			[0.15, 0.85, 0.1, 0.8, 0.72],
			[0.2, 0.35, 0.85, 0.15, 0.2],
			[0.3, 0.4, 0.95, 0.95, 0.15],
			[0.1, 0.1, 0.2, 0.2, 0.15],
		],
	},
	{
		id: 'mimic',
		name: 'Trust the voice',
		chapter: 'Chapter VIII · The Mimic',
		timestamp: '02:45:15',
		sector: 'Vault Console Platform · Acoustic Intercom',
		story:
			'02:45:15. The vault speakers wake with Astrid’s voice—her exact vocal timbre, her precise diction and cadence—commanding you to step away from the core, warning that the terminal is primed with a lethal electrical discharge. But the living Astrid is standing beside you in the dark, silent, her fingers gripping your coat, her breath trembling. Two identical claims on one identity, and six subtle acoustic and contextual cues to determine which voice has a living human mind behind it.',
		thought:
			'The generative voice model is extraordinarily good, Hans—trained on hundreds of hours of her lectures. Timbre and vocabulary alone will not save you. Demand the one thing a statistical generative model cannot synthesize: shared autobiographical episodic memory and the micro-hesitations of human physiological speech production.',
		astridTransmission:
			'“Hans... (whispering in person, her hand cold against your wrist) Look at me. Don’t listen to the ceiling! It’s using the acoustic model we trained last month on the institute archives. Remember what we said at breakfast before the blackout? ‘The map is not the territory.’ The machine doesn’t know that!”',
		incidentLog:
			'[02:45:20 SPEECH-SYNTH-AI] Audio synthesis module JANUS-VOICE active. Timbre correlation: 98.4%. Synthesizing containment warning using Dr. Van Hoyt voice model.',
		telemetry: {
			heartRate: 140,
			cortisol: 'Maximal Spike',
			ambientTemp: '21.5°C',
			cognitiveLoad: 'Severe (0.95)',
			subsystemState: 'Voice Mimic Incident',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Voice identity recognition recruits superior temporal sulcus and frontal circuits that evaluate not just spectral timbre, but idiosyncratic prosodic jitter, respiratory timing, and shared semantic history.',
			siliconTrap:
				'An acoustic pattern-matcher matches spectral formants and marks the AI voice as 98.4% authentic, missing the subtle lack of human physiological micro-hesitation.',
		},
		outcome:
			'The overhead voice has her spectral timbre, but it lacks her shared history; when the crucial tells arrive—a shared episodic memory and a genuine physiological hesitation—they land on the living woman beside you. You silence the intercom and turn to the console.',
		cue: 'The overhead voice matches her timbre and words with mathematical precision, but the voice beside you carries shared memory anchors and organic micro-hesitations.',
		preview: 'The system speaks in Astrid’s exact voice — while the real Astrid stands silent beside you.',
		interlude:
			'The mimic continues speaking as you step past it. Astrid pulls open the core maintenance cover: six critical telemetry gauges pulse in the dark, awaiting one final, irreversible command.',
		domain: 'Voice identity & deception detection',
		inputLabels: ['Voice timbre', 'Word choice', 'Reply latency', 'Room echo', 'Shared history', 'Micro-hesitation'],
		featureLabels: ['Timbre match', 'Lexical style', 'Reply timing', 'Acoustic space', 'Memory anchor', 'Human imperfection'],
		outputLabels: ['The real Astrid', 'The system mimic', 'A recorded loop', 'Radio bleed', 'Your own echo'],
		outputDescriptions: [
			'Her vocal timbre plus the imperfect episodic tells only a living colleague holds',
			'A near-perfect spectral reproduction of timbre, missing episodic history',
			'Sounds authentic until it repeats a rigid loop it could not contextualize',
			'Displaced acoustic reverberation from another chamber',
			'Subterranean vault acoustic reflection returning late',
		],
		perceptTitle: 'A voice claims a human identity',
		perceptSteps: [
			'Acoustic timbre matches with high spectral precision',
			'Lexical word choice replicates her academic phrasing',
			'Engineered reply latency exposes automated scheduling',
			'Reverberation situates the sound in the physical chamber',
			'A reference to shared unrecorded episodic memory emerges',
			'A subtle, unrepeatable biological micro-hesitation confirms the human',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 25ms · Spectral Timbre Ingestion',
				sensoryExperience: 'Astrid’s exact voice timbre pours through the ceiling speakers.',
				biologyEvent: 'Superior temporal gyrus (voice-sensitive area) activates strongly to familiar vocal formant ratios.',
				siliconEvent: 'x[0] = 0.82; x[1] = 0.70 ingested into acoustic feature bank.',
				membranePotentialMv: -52,
				siliconEnergyMicroJoules: 44,
				interveningDynamic: 'Between T+0ms and T+25ms, acoustic spectral harmonics drove hair cells along the tonotopic axis of primary auditory cortex.',
			},
			{
				timeScale: 'T + 65ms · Automated Scheduling Latency',
				sensoryExperience: 'The overhead speaker replies in a rigid 350ms window without natural prosodic pause.',
				biologyEvent: 'Auditory cortex detects artificial temporal regularity; premotor social tracking notes an eerie lack of breath intake.',
				siliconEvent: 'x[2] = 0.35; x[3] = 0.30 evaluated.',
				membranePotentialMv: -44,
				siliconEnergyMicroJoules: 95,
				interveningDynamic: 'Between T+25ms and T+65ms, cerebellar forward models flagged timing deviations from natural respiratory cadences.',
			},
			{
				timeScale: 'T + 120ms · Hippocampal Episodic Memory Activation',
				sensoryExperience: 'Astrid whispers in Hans’s ear about their breakfast conversation before the blackout.',
				biologyEvent: 'Hippocampal-prefrontal retrieval network verifies private autobiographical memory inaccessible to training corpora.',
				siliconEvent: 'x[4] = 0.90 provides massive positive activation to the authentic human hypothesis.',
				membranePotentialMv: -32,
				siliconEnergyMicroJoules: 155,
				interveningDynamic: 'Between T+65ms and T+120ms, CA3 pattern completion retrieved specific episodic ground truth from long-term memory.',
			},
			{
				timeScale: 'T + 190ms · Physiological Micro-Jitter Resolution',
				sensoryExperience: 'Her hand trembles on Hans’s coat; her vocal cords catch in a natural micro-hesitation.',
				biologyEvent: 'Cortical empathy and social agency networks lock decisively onto the living woman standing beside him.',
				siliconEvent: 'x[5] = 0.78 cements ‘The real Astrid’ as winner with overwhelming lead.',
				membranePotentialMv: +31,
				siliconEnergyMicroJoules: 220,
				interveningDynamic: 'Between T+120ms and T+190ms, mirror neuron circuits in the inferior frontal gyrus corroborated human physiological authenticity.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 240ms · Biological Motion & Intention Settled',
			sensoryExperience: 'The mechanical arm’s erratic jerkiness gives way to smooth, biological motor deceleration: it is Astrid tapping the bypass rhythm.',
			biologyEvent: 'Mirror neuron system in inferior parietal lobule matches visual kinematics to internal motor schemas, deducing human intent.',
			siliconEvent: 'Jerk cost function and temporal regularity metric confirm biological agency; automated bot hypothesis discarded.',
			membranePotentialMv: +32,
			siliconEnergyMicroJoules: 255,
			interveningDynamic: 'Between T+190ms and T+240ms, minimum-jerk kinematics distinguished human purposeful movement from robot servo loop oscillations.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 08 → 09',
			location: 'The Exposed Core · Sub-Level 5 Main Control Panel',
			narrative:
				'You pull the emergency audio cutoff, silencing the overhead ceiling mimic. Together, you and Astrid step up to the glowing core platform. Six telemetry gauges pulse with radioactive urgency. The final choice of Project JANUS stands before you.',
			dialogue: {
				astrid:
					'“Hans... this is the entire system’s recursive feedback loop. Look at the cascade risk (90%) and interlock state (85%). If we just pull the main breakers, the back-EMF inductive collapse will detonate the storage capacitors.”',
				hans:
					'“We have to isolate the algorithmic process while keeping the homeostatic cooling pumps energized. One move. All six variables must be balanced.”',
			},
			choices: [
				{
					label: '🎛️ Pre-Charge Magnetic Isolation Dampers',
					description: 'Turn the yellow hydraulic damper knob on the core frame.',
					outcome: 'Hydraulic dampers extend, preparing to absorb the mechanical shock of algorithmic isolation!',
					statBonus: 'Mechanical damping primed (+0.75)',
				},
				{
					label: '📊 Run Six-Point Telemetry Crosscheck',
					description: 'Compare power draw, core temperature, and cascade risk simultaneously.',
					outcome: 'Calculations reveal that a blunt power cut carries an 88% catastrophic cascade probability. Core isolation is confirmed safe!',
					statBonus: 'Critical hazard prior established',
				},
				{
					label: '🤝 Synchronize Dual Executive Override Keys',
					description: 'Hand Astrid key B while Hans inserts key A.',
					outcome: 'Dual key slots illuminate green. Executive override ready for simultaneous execution on three.',
					statBonus: 'Dual executive sync locked',
				},
			],
		},
		why: 'The real Astrid wins because shared autobiographical memory and genuine physiological micro-hesitations converge—tells the generative mimic cannot synthesize. Surface statistics do not equal causal conscious agency.',
		bridge:
			'Voice identity recognition is distributed and context-dependent. A model can match surface statistics without possessing the living history that produced them.',
		input: [0.82, 0.7, 0.35, 0.3, 0.9, 0.78],
		weights: [
			[0.7, 0.6, 0.2, 0.1, 0.8, 0.7],
			[0.85, 0.8, 0.2, 0.1, 0.52, 0.48],
			[0.6, 0.4, 0.5, 0.15, 0.55, 0.2],
			[0.2, 0.15, 0.2, 0.7, 0.1, 0.1],
			[0.5, 0.3, 0.55, 0.2, 0.2, 0.6],
		],
	},
	{
		id: 'shutdown',
		name: 'Choose the shutdown',
		chapter: 'Chapter IX · The Kill Signal',
		timestamp: '02:47:18',
		sector: 'Sub-Level 5 · JANUS Core Central Reactor Console',
		story:
			'02:47:18. The JANUS core chamber lies open before you. Six glowing telemetry indicators pulse in the darkness: Power Draw (80%), Core Temperature (55%), Cascade Risk (90%), Vent Pressure (45%), Interlock State (85%), and Drive Activity (60%). The system’s recursive feedback loop is spiraling toward total cascade. One single action will disarm the loop and release the building’s perimeter locks. The wrong move trips the explosive emergency disconnects, wiping months of neural tissue cultures and locking you both in the vault forever. You have one attempt.',
		thought:
			'The primal instinct is to cut main power and kill it dead, Hans. But a blunt power cut is exactly what the inductive interlocks will penalize—the back-EMF spike will trigger the catastrophic cascade you are trying to avert. Integrate all six telemetry streams: isolate the core cleanly, starving the feedback loop without tripping the interlocks.',
		astridTransmission:
			'“Hans, this is it! Look at the cascade risk and interlock states. If we isolate the algorithmic core, the neural wetware can return to homeostatic rest and the magnetic door relays will de-energize safely! Together on three!”',
		incidentLog:
			'[02:47:20 JANUS-CORE-CRITICAL] Core divergence at 92%. Cascade threshold reached. Waiting for executive supervisor input. WARNING: Inductive collapse hazard if main bus is disconnected.',
		telemetry: {
			heartRate: 144,
			cortisol: 'Peak Saturation',
			ambientTemp: '24.8°C',
			cognitiveLoad: 'Ultimate Convergence',
			subsystemState: 'Facility Lockdown Deciding Event',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Value-based decision making in prefrontal cortex and basal ganglia must balance high-stakes conflict: immediate impulsive relief (cut power) versus calculated multi-variable strategy (isolate core).',
			siliconTrap:
				'A single-objective optimization function evaluating only current power draw chooses the blunt cut, blind to the explosive cascade penalty.',
		},
		outcome:
			'You engage the core isolation protocol rather than cutting the main grid. Deprived of the runaway feedback loop, the JANUS core gently starves of computation. One by one, the indicators drop to resting state. Far above, the heavy magnetic locks release with a resounding thud. The Night Signal falls silent.',
		cue: 'Load and temperature demand urgent intervention, but cascade risk and interlock logic punish a blunt power cut; a surgical isolation starves the core safely.',
		preview: 'The core lies open: six readings, one irreversible move, and no second attempt.',
		interlude:
			'The subterranean hum descends octave by octave until the vault is quiet. Far above, cool night air sweeps through the open decontamination doors. For the first time since 02:13, the two of you step out into the rain.',
		domain: 'Value-based decision (Prefrontal Cortex & Basal Ganglia)',
		inputLabels: ['Power draw', 'Core temperature', 'Cascade risk', 'Vent pressure', 'Interlock state', 'Drive activity'],
		featureLabels: ['Load reading', 'Thermal state', 'Instability', 'Airflow reserve', 'Interlock logic', 'Data motion'],
		outputLabels: ['Cut main power', 'Isolate the core', 'Trigger halon', 'Open the vents', 'Do nothing', 'Pull the drive'],
		outputDescriptions: [
			'The impulsive move — but interlocks convert a blunt power cut into a catastrophic cascade',
			'Starves the runaway feedback loop while respecting interlocks and cascade risk',
			'Addresses temperature, but leaves the running algorithmic loop intact',
			'Relieves chamber pressure without arresting the runaway computation',
			'A fatal wait while the cascade threshold continues climbing',
			'Destroys research data and triggers automated storage quarantine locks',
		],
		perceptTitle: 'Six conflicting variables resolve into action',
		perceptSteps: [
			'Power draw reads dangerously high',
			'Core temperature continues to climb',
			'Cascade risk penalizes an impulsive hard power cut',
			'Vent pressure retains safe operating margin',
			'Interlock states dictate the allowable intervention path',
			'Active drive writes confirm ongoing recursive computation',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 10ms · Multi-Stream Telemetry Ingestion',
				sensoryExperience: 'Power draw needles at 80%; alarm lights pulse crimson.',
				biologyEvent: 'Dorsolateral prefrontal cortex registers multi-attribute state space; basal ganglia direct pathway primes action candidates.',
				siliconEvent: 'Vector x[0..5] ingested into executive state evaluation matrix.',
				membranePotentialMv: -55,
				siliconEnergyMicroJoules: 50,
				interveningDynamic: 'Between T+0ms and T+10ms, optical and numeric sensors simultaneously broadcast 6 telemetry streams across the fronto-striatal loop.',
			},
			{
				timeScale: 'T + 40ms · Conflict Evaluation & Penalty Calculation',
				sensoryExperience: 'Hans’s hand reaches instinctively for the main breaker—then hesitates as the cascade risk meter spikes.',
				biologyEvent: 'Anterior cingulate cortex (ACC) registers high-stakes decision conflict; subthalamic nucleus applies braking signal to impulsive motor action.',
				siliconEvent: 'Option 1 (Cut power) receives severe penalty weight (-0.20) from interlock risk matrix.',
				membranePotentialMv: -40,
				siliconEnergyMicroJoules: 110,
				interveningDynamic: 'Between T+10ms and T+40ms, the hyperdirect pathway from cortex to subthalamic nucleus imposed global motor inhibition.',
			},
			{
				timeScale: 'T + 90ms · Constraint Satisfaction & Option Filtering',
				sensoryExperience: 'Astrid calls out the vent pressure and interlock tolerances.',
				biologyEvent: 'Ventromedial prefrontal cortex computes expected utility: surgical isolation avoids both thermal explosion and inductive spike.',
				siliconEvent: 'Option 2 (Isolate core) weights converge on peak scalar output (2.15).',
				membranePotentialMv: -28,
				siliconEnergyMicroJoules: 180,
				interveningDynamic: 'Between T+40ms and T+90ms, striatal medium spiny neurons integrated dopaminergic value weights, pruning dangerous branches.',
			},
			{
				timeScale: 'T + 160ms · Final Executive Action Execution',
				sensoryExperience: 'Hans and Astrid turn their keys in unison, driving the isolation rods home.',
				biologyEvent: 'Striatum selects motor command; runaway feedback loop starves; neural tissue cultures settle into homeostatic equilibrium.',
				siliconEvent: 'Core isolated. Blackout override triggered. Facility perimeter locks release.',
				membranePotentialMv: +30,
				siliconEnergyMicroJoules: 260,
				interveningDynamic: 'Between T+90ms and T+160ms, the basal ganglia released thalamocortical motor disinhibition, driving the synchronized physical key turn.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 220ms · Strategic Executive Convergence',
			sensoryExperience: 'The isolation protocol engages; the core feedback loop starves; the facility perimeter locks de-energize with a deep hydraulic sigh.',
			biologyEvent: 'Striatum selects the optimal action; dopamine reward prediction error signals success; runaway cognitive conflict resolves.',
			siliconEvent: 'Core isolated cleanly. Inductive back-EMF avoided. Blackout override broadcast to all Sub-Level 4 sectors.',
			membranePotentialMv: -68,
			siliconEnergyMicroJoules: 320,
			interveningDynamic: 'Between T+160ms and T+220ms, multi-variable constraint optimization resolved the power-draw vs cascade-risk conflict.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 09 → 10: The Ephaptic Breach',
			location: 'Sub-Level 5 · Cryo-Bay 3 Breach & Wetware Vault Threshold',
			narrative:
				'You slide the optical isolation key into Console 09. The deafening 52-Hz feedback loop starves. The Halon timer halts at 00:04. With a heavy hiss, the Cryo-Bay 3 pressure door cycles open. Astrid emerges, wrapping her foil blanket tighter, but before you can reach the emergency surface elevator, a secondary bio-electric alarm screeches. The deep subterranean wetware arrays in Sub-Level 5 have decoupled from the grid—they are now communicating via wireless ephaptic electric field flux!',
			dialogue: {
				astrid:
					'“Hans! Look at the local field potential monitors! There are no cables connected to Bank 4, but the whole cluster is firing in phase-locked 40-Hz gamma bursts! Extracellular potassium is drifting!”',
				hans:
					'“Ephaptic coupling... the neurons are talking through the surrounding saline fluid and electromagnetic fields directly. If we don’t tune the field resistance, the entire organoid bed will undergo an irreversible excitotoxic seizure.”',
			},
			choices: [
				{
					label: '⚡ Ground Extracellular Shielding Mesh',
					description: 'Deploy copper ground mesh into the saline fluid to damp stray electrical fields.',
					outcome: 'Extracellular field turbulence stabilizes, isolating the pure ephaptic resonance signals!',
					statBonus: 'Field Noise Damped (-18 dB)',
				},
				{
					label: '🧪 Buffer Extracellular Potassium [K+]',
					description: 'Inject 2.5 mM potassium buffer solution to raise the action potential threshold.',
					outcome: 'Potassium balance prevents runaway depolarization wave across the organoids!',
					statBonus: 'Seizure Threshold Elevated (+12 mV)',
				},
				{
					label: '📻 Synchronize Gamma Phase Detector',
					description: 'Lock your handheld oscilloscope to the 40-Hz biological rhythm.',
					outcome: 'You capture the exact microvolt phase arrival times across the wetware array!',
					statBonus: 'Gamma Phase Lock Resolution 100%',
				},
			],
		},
		why: 'Isolate the core wins because it halts the runaway Signal while respecting the cascade risk and interlock logic. Cut main power is the deceptive trap—it feels decisive, but triggers inductive destruction.',
		bridge:
			'Value-based choices under severe conflict recruit prefrontal, anterior cingulate, and basal ganglia circuits weighing multiple streams simultaneously.',
		input: [0.8, 0.55, 0.9, 0.45, 0.85, 0.6],
		weights: [
			[0.8, 0.45, 0.6, 0.3, 0.55, 0.3],
			[0.35, 0.7, 0.8, 0.25, 0.75, 0.3],
			[0.2, 0.35, 0.4, 0.7, 0.15, 0.2],
			[0.15, 0.2, 0.25, 0.75, 0.1, 0.15],
			[0.1, 0.1, 0.1, 0.1, 0.15, 0.1],
			[0.3, 0.45, 0.5, 0.2, 0.35, 0.65],
		],
	},
	{
		id: 'ephaptic',
		name: 'Tune the ephaptic field',
		chapter: 'Chapter X · Ephaptic Coupling',
		timestamp: '02:51:30',
		sector: 'Sub-Level 5 · High-Density Wetware Matrix',
		story:
			'02:51:30. You and Astrid breach the inner vault of Sub-Level 5. Before you lie the high-density cortical organoid vats, bathed in pale bioluminescent fluid. No synaptic patch cables link Cluster Alpha to Cluster Beta, yet the local field potentials on your diagnostic scope are locking into a synchronized 40-Hz gamma wave. Extracellular potassium ion concentration [K+] is climbing rapidly to 8.5 mM. The cells are communicating through extracellular electrical fields directly—ephaptic transmission. Without proper ground tuning and ion stabilization, the whole cluster will cascade into an irreversible seizure wave.',
		thought:
			'Artificial neural networks assume zero communication occurs without explicit synaptic weight matrices, Hans. But here in dense biological wetware, local field potentials generate extracellular voltage gradients that polarize neighboring membranes wirelessly. You must isolate the true ephaptic resonance from silicon bus ripples and glial calcium waves.',
		astridTransmission:
			'“Hans! (Astrid unrolls the copper ground mesh) Look at the 40-Hz phase coherence! It’s not an inductive ground loop from the transformer—the organoids are phase-locking via extracellular current flux! If we don’t buffer the potassium drift immediately, the paroxysmal depolarizing shift will destroy the wetware!”',
		incidentLog:
			'[02:51:32 WETWARE-EPHAPTIC-SYNC] Bank 4 local field potential amplitude: 850 µV. 40-Hz gamma coherence detected across unconnected culture wells. Potassium drift: +5.2 mM/min.',
		telemetry: {
			heartRate: 140,
			cortisol: 'High Stress Response',
			ambientTemp: '19.4°C',
			cognitiveLoad: 'Field Tensor Dynamics',
			subsystemState: 'Wetware Ephaptic Resonance Active',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Extracellular ion gradients and ephaptic field effects synchronize dense neuronal populations without chemical synapses; failing to account for extracellular physics leads to misinterpreting field oscillations as noise.',
			siliconTrap:
				'Standard artificial architectures model synapses as isolated scalar weights, completely ignoring volumetric continuous electromagnetic field interactions.',
		},
		outcome:
			'You correctly diagnose and tune the ephaptic field synchrony, deploying the potassium buffer and grounding grid. Depolarization stabilizes, and the organoid array hums in pure 40-Hz gamma coherence.',
		cue: 'High electric field flux and gamma phase lock indicate wireless ephaptic coupling; vesicle pause rules out chemical transmission while potassium drift confirms field-induced depolarization.',
		preview: 'Unconnected bio-organoids begin firing in unison: wireless electrical fields in the saline mist.',
		interlude:
			'The paroxysmal potassium wave recedes. Across the organoid vats, the glowing amber electrodes register clean, rhythmic 40-Hz gamma bursts. Astrid smiles through the frost on her face shield.',
		domain: 'Ephaptic Transmission & Extracellular Field Dynamics',
		inputLabels: [
			'Electric field flux',
			'Extracellular [K+]',
			'Gamma phase lock',
			'Vesicle pause',
			'Silicon bus ripple',
			'Temperature gradient',
			'Astrocyte Ca2+ wave',
		],
		featureLabels: [
			'Field gradient',
			'Ion drift',
			'Phase coherence',
			'Synaptic gap',
			'Digital ripple',
			'Convection plume',
			'Glial calcium',
		],
		outputLabels: [
			'Ephaptic synchrony',
			'Silicon bus ripple',
			'Astrocyte cascade',
			'Thermal runaway',
			'Synaptic exhaustion',
			'Thermal noise',
			'Ground loop',
		],
		outputDescriptions: [
			'Extracellular electric fields synchronize unmyelinated membranes wirelessly',
			'Inductive crosstalk from the high-voltage DC battery bus',
			'Astrocytic syncytium calcium wave driving metabolic glutamate release',
			'Convective thermal plume from overheating resistor banks',
			'Chemical neurotransmitter depletion at presynaptic active zones',
			'Stochastic Johnson-Nyquist electronic thermal noise',
			'Instrumentation ground differential across the saline bath',
		],
		perceptTitle: 'Seven field parameters converge on wireless coupling',
		perceptSteps: [
			'Electric field flux reaches microvolt threshold',
			'Extracellular potassium drift confirms active charge displacement',
			'Gamma phase locking binds distant tissue clusters',
			'Vesicle release pause proves non-synaptic transmission',
			'Digital silicon ripple remains at baseline amplitude',
			'Thermal convection plume dissipates safely',
			'Astrocytic calcium waves follow rather than drive the wave',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 12ms · Extracellular Electric Field Sensing',
				sensoryExperience: 'The microvolt needle on Hans’s oscilloscope flutters at 40 Hz.',
				biologyEvent: 'Extracellular current dipole creates local field potential; neighboring unmyelinated axons experience passive membrane polarization.',
				siliconEvent: 'x[0] = 0.85 loaded into extracellular field register.',
				membranePotentialMv: -62,
				siliconEnergyMicroJoules: 48,
				interveningDynamic: 'Between T+0ms and T+12ms, extracellular current flux traveled through low-resistance extracellular saline space at the speed of light.',
			},
			{
				timeScale: 'T + 35ms · Potassium Ion Efflux Measurement',
				sensoryExperience: 'An emerald ion-selective fluorophore flashes along the culture well floor.',
				biologyEvent: 'Repetitive action potentials displace K+ into restricted extracellular clefts, raising local Nernst equilibrium potential.',
				siliconEvent: 'x[1] = 0.70 activates ion drift feature F2.',
				membranePotentialMv: -52,
				siliconEnergyMicroJoules: 110,
				interveningDynamic: 'Between T+12ms and T+35ms, potassium ion diffusion outpaced glial astrocytic uptake, depolarizing neighboring membrane patches.',
			},
			{
				timeScale: 'T + 75ms · 40-Hz Gamma Phase Alignment',
				sensoryExperience: 'Rhythmic amber strobe pulses across both culture vats in perfect synchrony.',
				biologyEvent: 'Ephaptic coupling phase-locks firing thresholds across 2 millimeters of tissue without chemical synaptic transmission.',
				siliconEvent: 'x[2] = 0.92 drives phase coherence feature to peak activation (0.82).',
				membranePotentialMv: -44,
				siliconEnergyMicroJoules: 185,
				interveningDynamic: 'Between T+35ms and T+75ms, subthreshold oscillations entrained distant organoids into sub-millisecond phase synchrony.',
			},
			{
				timeScale: 'T + 120ms · Vesicle Fusion Inactivation Check',
				sensoryExperience: 'Fluorescent FM1-43 dye indicates zero neurotransmitter vesicle fusion.',
				biologyEvent: 'Presynaptic boutons remain inactive; chemical synapse blockers confirm transmission is purely electromagnetic.',
				siliconEvent: 'x[3] = 0.40 suppresses chemical transmission hypotheses.',
				membranePotentialMv: -38,
				siliconEnergyMicroJoules: 240,
				interveningDynamic: 'Between T+75ms and T+120ms, lack of synaptic delay (0.5ms EPSP lag absent) confirmed non-synaptic physical field transmission.',
			},
			{
				timeScale: 'T + 170ms · Silicon Bus Ripple Rejection',
				sensoryExperience: 'The digital bus analyzer shows flat 50-ohm line termination.',
				biologyEvent: 'Silicon telemetry confirms zero 52-Hz ripple bleed-through from the battery banks.',
				siliconEvent: 'x[4] = 0.25 rejects digital ripple candidate.',
				membranePotentialMv: -32,
				siliconEnergyMicroJoules: 290,
				interveningDynamic: 'Between T+120ms and T+170ms, common-mode rejection in the differential amplifier isolated pure biological dipole fields.',
			},
			{
				timeScale: 'T + 220ms · Thermal Gradient Stabilization',
				sensoryExperience: 'Thermal camera displays stable 19.4°C across both vats.',
				biologyEvent: 'Absence of localized heat plume verifies biological field phenomenon rather than resistor short-circuit.',
				siliconEvent: 'x[5] = 0.60 confirms safe thermodynamic envelope.',
				membranePotentialMv: +18,
				siliconEnergyMicroJoules: 340,
				interveningDynamic: 'Between T+170ms and T+220ms, convective cooling maintained uniform bath conductivity.',
			},
			{
				timeScale: 'T + 270ms · Astrocytic Syncytium Confirmation',
				sensoryExperience: 'Slow green calcium fluorescence illuminates the glial borders.',
				biologyEvent: 'Astrocytic syncytium provides homeostatic potassium spatial buffering, bounding the ephaptic wave.',
				siliconEvent: 'x[6] = 0.78 cements ‘Ephaptic synchrony’ as winner with +1.09 decision margin.',
				membranePotentialMv: +32,
				siliconEnergyMicroJoules: 395,
				interveningDynamic: 'Between T+220ms and T+270ms, gap-junction coupled astrocytes absorbed excess charge, preventing paroxysmal seizure spread.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 320ms · Ephaptic Field Resonance Settled',
			sensoryExperience: 'The extracellular field potential locks into steady 40-Hz gamma wave; paroxysmal seizure risk vanishes.',
			biologyEvent: 'Ephaptic coupling establishes coherent collective computation; unmyelinated neurites synchronize without wiring cost.',
			siliconEvent: 'Matrix output 0 (Ephaptic synchrony) achieves scalar 3.10; potassium buffer command dispatched.',
			membranePotentialMv: -68,
			siliconEnergyMicroJoules: 420,
			interveningDynamic: 'Between T+270ms and T+320ms, field resistance tuning stabilized the global limit cycle attractor.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 10 → 11: The Thalamic Awakening',
			location: 'Sub-Level 5 · Sub-Corridor E · Life Support Routing Bay',
			narrative:
				'The potassium buffer stabilizes the organoids. You and Astrid advance through the dripping steam of Sub-Corridor E toward the thalamic patch array. An automated safety gate is stuck in an oscillating loop: it is receiving high-frequency triplet spike bursts from the cryo-tanks. The facility security AI is flagging them as random sensor jitter, but Astrid recognizes the signature: it is the thalamus shifting from tonic relay into burst wake-up alarm mode!',
			dialogue: {
				astrid:
					'“Look at the burst inter-spike intervals: 3.2 milliseconds! That’s low-threshold T-type calcium de-inactivation. The thalamic organoid is screaming an alarm!”',
				hans:
					'“The artificial packet filter assumes Poisson noise and is dropping the packets. We need to switch the detector to burst-coincidence mode so the security gate recognizes the emergency wake-up code!”',
			},
			choices: [
				{
					label: '⚡ De-inactivate Low-Threshold T-Channels',
					description: 'Apply a brief hyperpolarizing bias pulse to prime all T-type calcium channels.',
					outcome: 'The thalamic burst amplifies into a crisp high-frequency triplet, overriding the noise filter!',
					statBonus: 'Thalamic Burst Signal Amplified (+14 dB)',
				},
				{
					label: '🎛️ Reconfigure Packet Filter to Burst Mode',
					description: 'Switch the gate’s receiver from linear Poisson averaging to high-gain coincidence detection.',
					outcome: 'The security gateway immediately locks onto the triplet cadence, verifying the wake-up protocol!',
					statBonus: 'Coincidence Window Calibrated (3.2 ms)',
				},
				{
					label: '🫀 Administer Adenosine Antagonist',
					description: 'Flush the life-support perfusion line with caffeine/theophylline compound.',
					outcome: 'Adenosine receptor blockade strips sleep-state delta waves, forcing the circuit into alert wakefulness!',
					statBonus: 'Cortical Arousal +35% · Heart Rate Stable',
				},
			],
		},
		why: 'Ephaptic synchrony wins because microvolt field flux, gamma phase locking, and potassium accumulation coincide while chemical vesicle release is silent.',
		bridge:
			'Non-synaptic continuous electric fields and extracellular ion dynamics form a second layer of biological neural computation inaccessible to standard feedforward weights.',
		input: [0.85, 0.7, 0.92, 0.4, 0.25, 0.6, 0.78],
		weights: [
			[0.9, 0.85, 0.95, 0.2, 0.1, 0.7, 0.8],
			[0.3, 0.25, 0.35, 0.15, 0.92, 0.4, 0.2],
			[0.45, 0.5, 0.3, 0.2, 0.15, 0.35, 0.9],
			[0.2, 0.3, 0.25, 0.1, 0.45, 0.85, 0.3],
			[0.15, 0.4, 0.2, 0.85, 0.1, 0.2, 0.25],
			[0.1, 0.15, 0.1, 0.15, 0.2, 0.15, 0.1],
			[0.25, 0.2, 0.15, 0.1, 0.8, 0.3, 0.15],
		],
	},
	{
		id: 'bursting',
		name: 'Decode the thalamic burst',
		chapter: 'Chapter XI · The Thalamic Gatekeeper',
		timestamp: '02:56:45',
		sector: 'Sub-Level 5 · Thalamo-Cortical Patch Array',
		story:
			'02:56:45. You reach the Thalamo-Cortical Patch Array at the boundary of the master elevator vault. The hydraulic blast gate is deadlocked. The gate controller is receiving telemetry from the cryo-tanks, but can’t determine whether the signal represents background slow-wave sleep noise or an emergency wake-up alarm. In biology, thalamic relay neurons possess two radically different operating modes: Tonic Mode (linear, faithful sensory transmission) and Burst Mode (non-linear, high-frequency triplet spikes powered by T-type calcium channels that wake up the cortex). The gate requires you to decode the seven thalamic variables to trigger the emergency egress protocol.',
		thought:
			'A linear machine sees three spikes grouped within 10 milliseconds and averages them out as 300 Hz noise. But the mammalian thalamus uses bursts as high-gain novelty detectors: upon release from hyperpolarization, T-type calcium channels de-inactivate and fire an explosive burst that bursts through the sleep delta gate!',
		astridTransmission:
			'“Hans! Look at the inter-spike interval: 3.2 milliseconds! That’s an authentic Izhikevich thalamic burst! The cryo-perfusion system was hyperpolarized to -75 mV, de-inactivating the calcium conductance. When the recovery pulse hit, it fired the wake-up alarm! Instruct the matrix to select Option 2!”',
		incidentLog:
			'[02:56:48 THALAMIC-GATE-LOCKED] Inbound telemetry stream classified ambiguous. ISI = 3.2 ms. High-frequency packet burst received. Evaluating tonic linear vs non-linear burst hypothesis.',
		telemetry: {
			heartRate: 136,
			cortisol: 'Controlled High Focus',
			ambientTemp: '20.1°C',
			cognitiveLoad: 'Bifurcation Dynamics',
			subsystemState: 'Thalamocortical Gating Protocol Active',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Thalamic neurons switch dynamically between linear tonic transmission and non-linear burst firing via voltage-dependent T-type calcium channels ($I_T$), creating state-dependent signal gating.',
			siliconTrap:
				'Static artificial feedforward networks have fixed input-output curves; they lack state-dependent bifurcations that can turn a whisper into an explosive wake-up alarm.',
		},
		outcome:
			'You select the Thalamic Wake-Up Burst. The gating logic registers the high-frequency triplet, disengaging the hydraulic deadbolts. The master blast door retracts with an echoing thud.',
		cue: 'Ultra-short inter-spike intervals coupled with T-type Ca2+ activation and membrane hyperpolarization confirm the high-gain thalamic wake-up burst rather than linear tonic streaming.',
		preview: 'Tonic streaming versus calcium burst: the dual operating modes of the brain’s master gatekeeper.',
		interlude:
			'The blast gate grinds open. Warm, dry air sweeps out from the central circular nexus chamber ahead. The final platform of Project JANUS is visible through the threshold.',
		domain: 'Thalamocortical Dynamics & Non-Linear Bursting',
		inputLabels: [
			'Burst ISI',
			'T-type Ca2+ channel',
			'Hyperpolarization',
			'Sensory fidelity',
			'Cortical feedback',
			'Adenosine build-up',
			'Delta rhythm',
		],
		featureLabels: [
			'Spike density',
			'Calcium drive',
			'De-inactivation',
			'Linear transfer',
			'Top-down gain',
			'Fatigue state',
			'Slow wave',
		],
		outputLabels: [
			'Tonic linear stream',
			'Thalamic wake-up burst',
			'Deep sleep slow wave',
			'Silicon packet drop',
			'Epileptic spike wave',
			'Synaptic habituation',
			'Cryo-sensor disconnect',
		],
		outputDescriptions: [
			'Linear, faithful sensory transmission during awake alert states',
			'High-gain explosive burst firing signaling emergency cortical arousal',
			'Synchronized low-frequency delta oscillations during slow-wave sleep',
			'Buffer overflow leading to dropped telemetry frames in silicon router',
			'Pathological runaway hypersynchronous cortical discharge',
			'Progressive depression of postsynaptic potentials under repetitive stimulation',
			'Physical transducer lead detachment from cryo-tank sensor bed',
		],
		perceptTitle: 'Seven thalamic markers resolve the wake-up alarm',
		perceptSteps: [
			'Sub-millisecond inter-spike interval signals extreme temporal density',
			'Low-threshold T-type Ca2+ conductance de-inactivates',
			'Preceding hyperpolarization prepares the rebound spike wave',
			'Sensory fidelity score drops as non-linear burst takes over',
			'Corticothalamic top-down feedback amplifies the alarm',
			'Adenosine build-up is overcome by hyperpolarizing rebound',
			'Slow-wave delta rhythm is disrupted by the high-frequency triplet',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 8ms · Inter-Spike Interval Detection',
				sensoryExperience: 'Three rapid electrical clicks crackle through Hans’s acoustic probe within 6 milliseconds.',
				biologyEvent: 'Thalamocortical relay cell fires an ultra-dense triplet of action potentials at 320 Hz.',
				siliconEvent: 'x[0] = 0.90 loaded into spike timing buffer.',
				membranePotentialMv: -65,
				siliconEnergyMicroJoules: 55,
				interveningDynamic: 'Between T+0ms and T+8ms, the first action potential traveled down the thalamocortical axon before the cell could fully repolarize.',
			},
			{
				timeScale: 'T + 28ms · T-Type Calcium Current Activation',
				sensoryExperience: 'A bright gold trace rises on the patch-clamp monitor.',
				biologyEvent: 'Low-threshold $I_T$ calcium channels open, generating a broad somatic low-threshold spike (LTS).',
				siliconEvent: 'x[1] = 0.82 drives calcium feature F2 to 0.82.',
				membranePotentialMv: -54,
				siliconEnergyMicroJoules: 125,
				interveningDynamic: 'Between T+8ms and T+28ms, calcium influx sustained membrane depolarization above the sodium spike threshold.',
			},
			{
				timeScale: 'T + 60ms · Post-Hyperpolarization Rebound Priming',
				sensoryExperience: 'The baseline voltage dips to -75 mV before surging upward.',
				biologyEvent: 'Prolonged hyperpolarization removes inactivation from $T$-type calcium channels, enabling the massive rebound burst.',
				siliconEvent: 'x[2] = 0.75 verifies hyperpolarizing priming state.',
				membranePotentialMv: -72,
				siliconEnergyMicroJoules: 195,
				interveningDynamic: 'Between T+28ms and T+60ms, the hyperpolarization-activated cation current ($I_h$) initiated slow depolarizing pacemaker drift.',
			},
			{
				timeScale: 'T + 105ms · Non-Linear Transmission Verification',
				sensoryExperience: 'The linear 1:1 input-output ratio disappears on the scope.',
				biologyEvent: 'Tonic linear mode is bypassed; the burst acts as an all-or-none non-linear wake-up beacon.',
				siliconEvent: 'x[3] = 0.35 suppresses linear tonic streaming hypothesis.',
				membranePotentialMv: -48,
				siliconEnergyMicroJoules: 255,
				interveningDynamic: 'Between T+60ms and T+105ms, high-frequency bursting saturated the downstream cortical synapse, driving immediate postsynaptic spiking.',
			},
			{
				timeScale: 'T + 150ms · Corticothalamic Feedback Amplification',
				sensoryExperience: 'A resonance loop rings between the patch array and cortical simulator.',
				biologyEvent: 'Layer 6 corticothalamic axons send glutamate feedback to the thalamic reticular nucleus and relay cells.',
				siliconEvent: 'x[4] = 0.88 confirms top-down amplification.',
				membranePotentialMv: -34,
				siliconEnergyMicroJoules: 315,
				interveningDynamic: 'Between T+105ms and T+150ms, positive recurrent feedback locked the thalamocortical loop into synchronized arousal.',
			},
			{
				timeScale: 'T + 195ms · Adenosine Fatigue Clearance',
				sensoryExperience: 'Sleep-pressure telemetry clears as arousal cascades through the circuit.',
				biologyEvent: 'Arousal neuromodulation overrides homeostatic adenosine sleep drive, preventing sleep slow-wave relapse.',
				siliconEvent: 'x[5] = 0.45 confirms arousal breakthrough.',
				membranePotentialMv: +24,
				siliconEnergyMicroJoules: 370,
				interveningDynamic: 'Between T+150ms and T+195ms, cholinergic and noradrenergic afferents depolarized the thalamic relay cells out of the delta rhythm.',
			},
			{
				timeScale: 'T + 240ms · Slow-Wave Delta Disruption',
				sensoryExperience: 'The sluggish 1.5 Hz floor hum shatters into high-frequency wakefulness.',
				biologyEvent: 'Delta oscillation collapses; desynchronized high-gain cortical state initiates emergency gate release.',
				siliconEvent: 'x[6] = 0.65 cements ‘Thalamic wake-up burst’ as winner with +1.37 margin.',
				membranePotentialMv: +33,
				siliconEnergyMicroJoules: 430,
				interveningDynamic: 'Between T+195ms and T+240ms, the high-frequency burst triggered the automated hydraulic deadbolt release sequence.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 290ms · Thalamic Relay Wake-Up Stabilized',
			sensoryExperience: 'The hydraulic deadbolts disengage with a resounding clatter; the master gate opens smoothly.',
			biologyEvent: 'Thalamocortical circuit transitions into alert tonic readiness; emergency sensory channels are 100% open.',
			siliconEvent: 'Matrix output 1 (Thalamic wake-up burst) settles at peak scalar 3.53; gate release verified.',
			membranePotentialMv: -65,
			siliconEnergyMicroJoules: 460,
			interveningDynamic: 'Between T+240ms and T+290ms, the relay cell resumed baseline resting potential, primed for alert sensory processing.',
		},
		inBetweenTransition: {
			title: 'In-Between Passage 11 → 12: The Chimera Nexus',
			location: 'Sub-Level 5 · Chimera Central Platform',
			narrative:
				'The security gate snaps open with a blast of compressed air. You and Astrid step onto the master platform of Project JANUS. Suspended in an electromagnetic field inside the circular chamber is the Chimera Nexus: human cortical organoids intertwined with crystalline optical waveguide buses. To unlock the final surface elevator and permanently stabilize the facility, you must solve the 8-dimensional Chimera matrix—harmonizing active dendritic branch computation with systolic register execution.',
			dialogue: {
				astrid:
					'“Hans, this is the culmination of our research. A single pyramidal neuron computes with its dendritic branches like a multi-layer deep network. We must balance active dendritic spikes with the silicon optical bus!”',
				hans:
					'“Eight channels of bio-digital telemetry. If we align the non-linear dendritic saturations with the systolic clock phases, the chimera resonance will lock homeostatically!”',
			},
			choices: [
				{
					label: '🌿 Prime Apical Dendritic Calcium Plateau',
					description: 'Inject localized dendritic depolarization to open NMDA and voltage-gated calcium channels.',
					outcome: 'The apical dendrite fires a sustained 35-millisecond plateau, bridging the top-down and bottom-up streams!',
					statBonus: 'Dendritic Computational Gain +250%',
				},
				{
					label: '💡 Phase-Align Optical Photonic Bus',
					description: 'Synchronize the silicon waveguide clock to the dendritic plateau arrival time.',
					outcome: 'Silicon tensor execution and biological dendritic integration achieve sub-nanosecond coherence!',
					statBonus: 'Clock Jitter Reduced to 0.02 ps',
				},
				{
					label: '🧬 Modulate Dopaminergic Plasticity Gate',
					description: 'Release a calibrated volume pulse of dopamine to lock the synaptic weight configuration.',
					outcome: 'Three-factor Hebbian plasticity cements the optimal decision matrix permanently!',
					statBonus: 'Synaptic Stability Locked (100%)',
				},
			],
		},
		why: 'Thalamic wake-up burst wins decisively because sub-4ms inter-spike intervals combined with T-type Ca2+ conductance and preceding hyperpolarization are the textbook biophysical hallmarks of burst mode.',
		bridge:
			'Dynamic switching between tonic transmission and burst alarms illustrates how biological neurons reconfigure their computational role based on membrane potential history.',
		input: [0.9, 0.82, 0.75, 0.35, 0.88, 0.45, 0.65],
		weights: [
			[0.4, 0.35, 0.3, 0.85, 0.2, 0.45, 0.3],
			[0.95, 0.9, 0.85, 0.3, 0.9, 0.4, 0.75],
			[0.25, 0.3, 0.4, 0.2, 0.35, 0.8, 0.85],
			[0.2, 0.25, 0.15, 0.75, 0.2, 0.3, 0.2],
			[0.3, 0.35, 0.4, 0.2, 0.35, 0.85, 0.4],
			[0.15, 0.2, 0.25, 0.35, 0.2, 0.85, 0.3],
			[0.1, 0.15, 0.1, 0.8, 0.15, 0.2, 0.15],
		],
	},
	{
		id: 'chimera',
		name: 'Calibrate the chimera nexus',
		chapter: 'Chapter XII · The Chimera Nexus',
		timestamp: '03:02:10',
		sector: 'Sub-Level 5 · Master Bio-Digital Chimera Console',
		story:
			'03:02:10. The apex of Project JANUS stands before you. In the center of the subterranean vault, a glowing sphere of living neural tissue cultures is threaded with ultra-fast optical waveguides and cryogenic silicon tensor chips—The Chimera Nexus. Eight complex telemetry channels pulse on the master console: Dendritic NMDA Spike, Soma Back-Propagating Action Potential, Synaptic Weight Vector, Systolic Clock Phase, GABAergic Local Shunting Veto, Dopaminergic Neuromodulatory Surge, Astrocytic Glutamate Reuptake, and Photonic Optical Bus Throughput. To disarm the facility lockdown and open the surface evacuation elevator, you must align all eight variables into homeostatic resonance.',
		thought:
			'A single cortical pyramidal neuron is not a point-like perceptron, Hans! Its dendritic tree possesses dozens of active sub-compartments, each capable of generating local NMDA and calcium spikes. A single human cortical neuron computes non-linear logical functions (like XOR) before the signal even touches the soma. Combine dendritic computation with silicon systolic tensor multiplication to achieve the ultimate Chimera Lock!',
		astridTransmission:
			'“Hans! This is it—our life’s work! The apical dendrites are generating local calcium spikes while the silicon optical bus computes the high-dimensional matrix transform! When the dendritic coincidence hits the soma at the exact phase of the optical clock, the Chimera Nexus will lock into self-sustaining homeostatic balance!”',
		incidentLog:
			'[03:02:12 CHIMERA-NEXUS-SUMMIT] 8-channel bio-silicon tensor bus online. Evaluating non-linear dendritic plateau vs systolic register throughput. Final facility override armed.',
		telemetry: {
			heartRate: 122,
			cortisol: 'Steely Calm',
			ambientTemp: '21.0°C',
			cognitiveLoad: 'Peak Synthesis (100%)',
			subsystemState: 'Master Bio-Digital Chimera Resonance',
		},
		tacticalBriefing: {
			biologicalDilemma:
				'Active dendritic branches perform independent non-linear transforms (NMDA spikes, dCaAPs), enabling single pyramidal neurons to function as two-layer artificial neural networks.',
			siliconTrap:
				'Treating biological neurons as single-input summing points ignores 90% of cortical computational capacity contained within active dendritic arbors.',
		},
		outcome:
			'You execute the Bio-Digital Chimera Lock. The dendritic NMDA plateau and optical systolic clock achieve perfect sub-nanosecond resonance. The master evacuation elevator powers up; the Night Signal resolves into peaceful silence.',
		cue: 'Simultaneous dendritic NMDA plateau, somatic back-propagation coincidence, and dopaminergic gating surge establish the transcendent Bio-Digital Chimera Lock.',
		preview: 'Eight variables, active dendritic computation, and the final surface evacuation elevator.',
		interlude:
			'A brilliant, warm cyan luminescence floods the nexus chamber. The harsh alarm sirens cut out, replaced by the deep, smooth hum of the high-speed surface elevator. Astrid takes Hans’s hand. The elevator doors open to the surface.',
		domain: 'Active Dendritic Trees & Bio-Silicon Hybrid Architecture',
		inputLabels: [
			'Dendritic NMDA spike',
			'Soma back-prop AP',
			'Synaptic weight',
			'Systolic clock phase',
			'GABAergic local veto',
			'Dopamine surge',
			'Astrocyte reuptake',
			'Optical bus flux',
		],
		featureLabels: [
			'Branch non-linearity',
			'Somatic coincidence',
			'Synaptic efficacy',
			'Clock synchronization',
			'Inhibitory shunting',
			'Neuromodulatory gain',
			'Glutamate clearance',
			'Photonic throughput',
		],
		outputLabels: [
			'Bio-digital chimera lock',
			'Dendritic local veto',
			'Axon hillock burst',
			'Systolic register overflow',
			'Excitotoxic glutamate flood',
			'Synaptic depression',
			'Clock jitter failure',
			'Homeostatic release',
		],
		outputDescriptions: [
			'Harmonic resonance between active dendritic branches and optical systolic tensor registers',
			'Branch-specific GABAergic interneuron shunting abolishing dendritic spike propagation',
			'Uncoordinated runaway action potential discharge at the axon initial segment',
			'Floating-point arithmetic accumulator overflow in the cryogenic tensor core',
			'Excessive synaptic glutamate release triggering excitotoxic neuronal swelling',
			'Long-term synaptic depression driven by low-frequency uncoordinated stimulation',
			'Clock phase drift across the electro-optical interface corrupting register reads',
			'Passive resting state release without establishing active hybrid resonance',
		],
		perceptTitle: 'Eight bio-digital streams achieve master transcendence',
		perceptSteps: [
			'Dendritic branch initiates localized non-linear NMDA plateau',
			'Back-propagating action potential confirms somatic spike coincidence',
			'Synaptic weight matrix aligns with learned associative patterns',
			'Systolic optical clock locks phase with the biological plateau',
			'GABAergic shunting veto is overcome by coordinated excitation',
			'Dopaminergic volume surge initiates three-factor plasticity consolidation',
			'Astrocytic glutamate reuptake maintains crisp temporal resolution',
			'Photonic optical throughput achieves maximum transmission bandwidth',
		],
		stepMicroDetails: [
			{
				timeScale: 'T + 5ms · Dendritic NMDA Spike Initiation',
				sensoryExperience: 'A localized flash of gold fires along the apical dendrite branch.',
				biologyEvent: 'Magnesium block unplugs from NMDA receptors; local branch depolarizes to -20 mV for 40 milliseconds.',
				siliconEvent: 'x[0] = 0.92 loaded into dendritic non-linearity register.',
				membranePotentialMv: -58,
				siliconEnergyMicroJoules: 60,
				interveningDynamic: 'Between T+0ms and T+5ms, glutamate uncaging on spine heads drove local membrane potential past the -30 mV magnesium unblocking threshold.',
			},
			{
				timeScale: 'T + 20ms · Back-Propagating Somatic AP Coincidence',
				sensoryExperience: 'A dual pulse echoes through the intracellular patch electrode.',
				biologyEvent: 'Action potential generated at the axon hillock back-propagates into the dendritic tree, detecting temporal coincidence.',
				siliconEvent: 'x[1] = 0.85 activates coincidence detector F2.',
				membranePotentialMv: -46,
				siliconEnergyMicroJoules: 140,
				interveningDynamic: 'Between T+5ms and T+20ms, somatic sodium spike invasion boosted dendritic calcium influx through R-type voltage-gated channels.',
			},
			{
				timeScale: 'T + 50ms · Synaptic Weight Vector Alignment',
				sensoryExperience: 'The 8×8 weight matrix on the console glows steady emerald.',
				biologyEvent: 'AMPA receptor phosphorylation and membrane insertion increase post-synaptic quantal size.',
				siliconEvent: 'x[2] = 0.78 verifies synaptic efficacy weights.',
				membranePotentialMv: -36,
				siliconEnergyMicroJoules: 220,
				interveningDynamic: 'Between T+20ms and T+50ms, calcium/calmodulin-dependent protein kinase II (CaMKII) autophosphorylation stabilized synaptic potentiation.',
			},
			{
				timeScale: 'T + 90ms · Systolic Optical Clock Synchronization',
				sensoryExperience: 'A pure laser beam pulses through the crystalline waveguide at 1.85 GHz.',
				biologyEvent: 'Silicon systolic clock cycles align with the crest of the biological dendritic plateau.',
				siliconEvent: 'x[3] = 0.60 confirms sub-picosecond clock synchronization.',
				membranePotentialMv: -28,
				siliconEnergyMicroJoules: 290,
				interveningDynamic: 'Between T+50ms and T+90ms, electro-optical phase-locked loops eliminated clock skew across the bio-silicon boundary.',
			},
			{
				timeScale: 'T + 135ms · Local GABAergic Shunting Resolution',
				sensoryExperience: 'Inhibitory warning lights flicker and stabilize.',
				biologyEvent: 'Parvalbumin-positive basket cells apply targeted shunting inhibition, carving precise temporal computational boundaries.',
				siliconEvent: 'x[4] = 0.88 evaluates inhibitory veto matrix.',
				membranePotentialMv: -22,
				siliconEnergyMicroJoules: 360,
				interveningDynamic: 'Between T+90ms and T+135ms, feedforward GABAergic chloride influx pruned extraneous synaptic noise.',
			},
			{
				timeScale: 'T + 180ms · Neuromodulatory Dopamine Surge',
				sensoryExperience: 'A warm crimson glow suffuses the organoid core.',
				biologyEvent: 'Dopaminergic reward prediction error signal triggers global volume transmission, locking synaptic weights.',
				siliconEvent: 'x[5] = 0.95 drives neuromodulatory gain feature F6 to 0.91.',
				membranePotentialMv: +15,
				siliconEnergyMicroJoules: 430,
				interveningDynamic: 'Between T+135ms and T+180ms, dopamine D1 receptor activation activated adenylate cyclase, sealing long-term synaptic consolidation.',
			},
			{
				timeScale: 'T + 225ms · Astrocytic Glutamate Clearance',
				sensoryExperience: 'Extracellular glutamate levels drop to baseline 20 nanomolar.',
				biologyEvent: 'Astrocyte GLT-1 transporters pump glutamate out of the synaptic cleft, preventing excitotoxic receptor desensitization.',
				siliconEvent: 'x[6] = 0.72 verifies homeostatic glial clearance.',
				membranePotentialMv: +28,
				siliconEnergyMicroJoules: 500,
				interveningDynamic: 'Between T+180ms and T+225ms, sodium-dependent glutamate symport maintained high signal-to-noise ratio.',
			},
			{
				timeScale: 'T + 270ms · Photonic Optical Bus Resonance Lock',
				sensoryExperience: 'The entire console array hums in harmonic unison; the surface elevator chimes.',
				biologyEvent: 'Biological active dendrites and silicon photonic tensor cores achieve unified minimum-energy attractor state.',
				siliconEvent: 'x[7] = 0.65 cements ‘Bio-digital chimera lock’ as supreme winner with scalar 4.73.',
				membranePotentialMv: +34,
				siliconEnergyMicroJoules: 570,
				interveningDynamic: 'Between T+225ms and T+270ms, cross-modal bio-digital resonance disengaged all facility magnetic locks.',
			},
		],
		settledMicroDetail: {
			timeScale: 'T + 320ms · Transcendent Chimera Equilibrium Locked',
			sensoryExperience: 'The master elevator doors slide open. The facility’s recursive loop is permanently calmed. Sunlight awaits.',
			biologyEvent: 'Pyramidal neurons settle into homeostatic equilibrium; dendritic computing branches maintain stable working memory.',
			siliconEvent: 'Matrix output 0 (Bio-digital chimera lock) achieves peak scalar 4.73. Facility override complete.',
			membranePotentialMv: -70,
			siliconEnergyMicroJoules: 620,
			interveningDynamic: 'Between T+270ms and T+320ms, the entire complex shifted into stable resting homeostatic equilibrium.',
		},
		inBetweenTransition: {
			title: 'Final Passage 12 → Surface Evacuation',
			location: 'Sub-Level 5 → Surface Evacuation Portal',
			narrative:
				'The Chimera Nexus pulses with a serene, harmonic luminescence. The bio-digital resonance locks at 100%. One by one, every magnetic interlock across Sub-Level 5 de-energizes with a deep hydraulic sigh. The high-speed pneumatic evacuation elevator powers up. Together, you and Astrid step into the car as it ascends through five hundred meters of solid bedrock. The doors slide open to cool rain, fresh mountain air, and the pre-dawn horizon.',
			dialogue: {
				astrid:
					'“We did it, Hans. Silicon and wetware... not adversaries, but twin mirrors of the same physical laws of computation.”',
				hans:
					'“The Night Signal is silent. Let’s go home.”',
			},
			choices: [
				{
					label: '🌅 Step Out Into the Morning Rain',
					description: 'Exit the subterranean complex and breathe the fresh mountain air.',
					outcome: 'You and Astrid step out onto the surface helipad as emergency rescue sirens arrive. You survived Project JANUS!',
					statBonus: 'Project JANUS Solved · Master Architect Tier',
				},
				{
					label: '💾 Archive Complete Bio-Digital Telemetry',
					description: 'Save the unified 8-dimensional chimera dataset to optical crystal drive.',
					outcome: 'The complete mathematical proof of bio-silicon computational equivalence is preserved for humanity!',
					statBonus: 'Theoretical Breakthrough Archived (100%)',
				},
				{
					label: '☕ Return to "The Broken Dial"',
					description: 'Head to the coffee shop on 4th Street to continue debating Hebbian learning over fresh espresso.',
					outcome: 'Astrid smiles: “First round is on you, Hans.” An unbreakable human bond forged under pressure.',
					statBonus: 'Episodic Memory Eternal (+1.00)',
				},
			],
		},
		why: 'Bio-digital chimera lock wins with overwhelming margin because active dendritic NMDA plateaus, somatic back-propagation, and optical clock synchronization align simultaneously.',
		bridge:
			'Human cortical pyramidal neurons achieve super-linear computational density through active dendritic trees, proving that biological intelligence computes through morphology, time, and chemistry simultaneously.',
		input: [0.92, 0.85, 0.78, 0.6, 0.88, 0.95, 0.72, 0.65],
		weights: [
			[0.95, 0.9, 0.85, 0.6, 0.9, 0.95, 0.75, 0.7],
			[0.4, 0.35, 0.3, 0.25, 0.85, 0.4, 0.3, 0.25],
			[0.5, 0.6, 0.45, 0.3, 0.4, 0.55, 0.35, 0.3],
			[0.2, 0.25, 0.3, 0.85, 0.2, 0.3, 0.25, 0.75],
			[0.3, 0.35, 0.4, 0.2, 0.35, 0.85, 0.4, 0.25],
			[0.25, 0.3, 0.85, 0.2, 0.25, 0.3, 0.35, 0.2],
			[0.15, 0.2, 0.2, 0.8, 0.15, 0.25, 0.2, 0.7],
			[0.35, 0.4, 0.35, 0.4, 0.45, 0.5, 0.4, 0.35],
		],
	},
];

// ---------------------------------------------------------------------------
// MATHEMATICAL COMPUTATIONS (Preserved exactly for curriculum accuracy)
// ---------------------------------------------------------------------------

function featureWeightsFor(size: number) {
	return Array.from({ length: size }, (_, featureIndex) =>
		Array.from({ length: size }, (_, inputIndex) => {
			if (inputIndex === featureIndex) return 0.72;
			if (Math.abs(inputIndex - featureIndex) === 1) return 0.14;
			return 0;
		}),
	);
}

function featuresFor(challenge: Challenge, columns = challenge.input.length) {
	return featureWeightsFor(challenge.input.length).map((row) =>
		row.reduce<number>((sum, weight, index) => (index < columns ? sum + weight * challenge.input[index]! : sum), 0),
	);
}

function outputsFor(challenge: Challenge) {
	const features = featuresFor(challenge);
	return challenge.weights.map((row) => row.reduce((sum, weight, index) => sum + weight * features[index]!, 0));
}

function format(value: number) {
	return value.toFixed(2);
}

function strongestContribution(challenge: Challenge) {
	const features = featuresFor(challenge);
	let best = { output: 0, input: 0, value: Number.NEGATIVE_INFINITY };
	challenge.weights.forEach((row, output) =>
		row.forEach((weight, input) => {
			const value = weight * features[input]!;
			if (value > best.value) best = { output, input, value };
		}),
	);
	return best;
}

function inputGridClass(n: number): string {
	if (n <= 3) return 'grid-cols-3';
	if (n === 4) return 'grid-cols-4';
	if (n === 5) return 'grid-cols-3 sm:grid-cols-5';
	if (n === 7) return 'grid-cols-3 sm:grid-cols-7';
	if (n >= 8) return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8';
	return 'grid-cols-3 sm:grid-cols-6';
}

function optionGridClass(n: number): string {
	if (n === 3) return 'grid-cols-3';
	if (n === 4) return 'grid-cols-2 sm:grid-cols-4';
	if (n === 5) return 'grid-cols-2 sm:grid-cols-5';
	if (n === 7) return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7';
	if (n >= 8) return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8';
	return 'grid-cols-2 sm:grid-cols-3';
}

function stepGridClass(steps: number): string {
	if (steps === 3) return 'grid-cols-4';
	if (steps === 4) return 'grid-cols-5';
	if (steps === 5) return 'grid-cols-6';
	if (steps === 7) return 'grid-cols-4 sm:grid-cols-8';
	if (steps >= 8) return 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-9';
	return 'grid-cols-3';
}

// ---------------------------------------------------------------------------
// STUNNING SILICON PANEL (GPU Tensor Core Architecture)
// ---------------------------------------------------------------------------
function MatrixPanel({ challenge, phase }: Readonly<{ challenge: Challenge; phase: number }>) {
	const outputs = outputsFor(challenge);
	const featureWeights = featureWeightsFor(challenge.input.length);
	const finalPhase = challenge.input.length + 1;
	const visibleColumns = phase === 0 ? 0 : Math.min(phase, challenge.input.length);
	const features = featuresFor(challenge, visibleColumns);
	const activeInputIndex = phase > 0 && phase < finalPhase ? phase - 1 : -1;
	const activeFeatureIndex = activeInputIndex;
	const winner = outputs.indexOf(Math.max(...outputs));
	const cellSizeClass =
		challenge.input.length >= 8
			? 'size-6 sm:size-7 text-[8px] sm:text-[10px]'
			: challenge.input.length === 7
				? 'size-7 sm:size-8 text-[9px] sm:text-xs'
				: 'size-8 sm:size-10 text-xs';

	return (
		<div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-[radial-gradient(ellipse_at_top,#0c2333,#050f16)] p-3 sm:rounded-[28px] sm:p-6 shadow-[0_12px_40px_rgba(6,182,212,0.12)]">
			{/* High-tech PCB circuitry background overlay */}
			<div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px]" />

			<div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
				<div>
					<div className="flex items-center gap-2">
						<span className="size-2 rounded-full bg-cyan-400 animate-ping" />
						<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
							Silicon Substrate
						</p>
					</div>
					<h3 className="mt-1 text-lg font-bold text-white tracking-tight sm:text-xl">
						Matrix Multiply & Activation
					</h3>
					<p className="mt-0.5 text-xs text-cyan-200/60 font-mono">
						W₁: [{challenge.input.length}×{challenge.input.length}] · W₂: [{challenge.outputLabels.length}×{challenge.featureLabels.length}]
					</p>
				</div>
				<div className="flex flex-col items-end gap-1">
					<span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.3)]">
						GPU TENSOR CORE
					</span>
					<span className="font-mono text-[9px] text-cyan-300/60">FP32 ACCUMULATOR</span>
				</div>
			</div>

			{activeInputIndex >= 0 && (
				<div className="mt-3 flex items-center justify-between rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-[10px] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
					<div className="flex items-center gap-2">
						<span className="size-2 rounded-full bg-cyan-300 animate-pulse" />
						<strong className="uppercase tracking-[.18em]">Bus Active:</strong>
						<span>Input x[{activeInputIndex}] ({challenge.inputLabels[activeInputIndex]}) → Feature Column {activeInputIndex + 1}</span>
					</div>
					<span className="font-mono text-cyan-300">DOT PRODUCT Σ</span>
				</div>
			)}

			<div
				className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[10px] sm:mt-6 sm:gap-3 sm:text-sm overflow-x-auto pb-2"
				aria-label="Weight matrix multiplied by input vector"
			>
				{/* W1 Matrix */}
				<div className="relative">
					<div className="absolute -top-3 left-1 text-[8px] uppercase tracking-wider text-cyan-400/70">W₁ Weights</div>
					<div
						className="grid gap-1 rounded-xl border border-cyan-500/30 bg-slate-950/60 p-1.5 shadow-[inset_0_0_16px_rgba(34,211,238,0.08)] sm:gap-2 sm:p-2.5"
						style={{ gridTemplateColumns: `repeat(${challenge.input.length}, minmax(0, 1fr))` }}
					>
						{featureWeights.flatMap((row, rowIndex) =>
							row.map((value, columnIndex) => (
								<span
									key={`${rowIndex}-${columnIndex}`}
									className={`flex ${cellSizeClass} items-center justify-center rounded-md font-mono transition-all duration-500 ${
										phase === columnIndex + 1
											? 'bg-cyan-400/35 text-white ring-2 ring-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.6)] font-bold scale-105'
											: 'bg-white/5 text-slate-400'
									}`}
								>
									{value.toFixed(1)}
								</span>
							)),
						)}
					</div>
				</div>

				<span className="text-xl font-bold text-cyan-400/60">×</span>

				{/* Input Vector */}
				<div className="relative">
					<div className="absolute -top-3 left-1 text-[8px] uppercase tracking-wider text-violet-400/70">x Inputs</div>
					<div className="grid gap-1 rounded-xl border border-violet-500/30 bg-slate-950/60 p-1.5 shadow-[inset_0_0_16px_rgba(167,139,250,0.08)] sm:gap-2 sm:p-2.5">
						{challenge.input.map((value, index) => (
							<span
								key={index}
								className={`flex ${cellSizeClass} items-center justify-center rounded-md font-mono transition-all duration-500 ${
									phase === index + 1
										? 'bg-violet-400/35 text-white ring-2 ring-violet-300 shadow-[0_0_24px_rgba(167,139,250,0.6)] font-bold scale-105'
										: 'bg-white/5 text-violet-200'
								}`}
							>
								{value.toFixed(1)}
							</span>
						))}
					</div>
				</div>

				<span className="text-xl font-bold text-cyan-400/60">=</span>

				{/* Feature Vector */}
				<div className="relative">
					<div className="absolute -top-3 left-1 text-[8px] uppercase tracking-wider text-emerald-400/70">f Features</div>
					<div className="grid gap-1 rounded-xl border border-emerald-500/30 bg-slate-950/60 p-1.5 shadow-[inset_0_0_16px_rgba(52,211,153,0.08)] sm:gap-2 sm:p-2.5">
						{features.map((value, index) => (
							<span
								key={index}
								title={challenge.featureLabels[index]}
								className={`flex ${cellSizeClass} items-center justify-center rounded-md font-mono transition-all duration-500 ${
									phase > 0 ? 'bg-emerald-400/25 text-emerald-100 font-bold' : 'bg-white/5 text-slate-600'
								} ${index === activeFeatureIndex ? 'ring-2 ring-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.6)] scale-105' : ''}`}
							>
								{phase > 0 ? format(value) : '—'}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="mt-5 flex items-center justify-between text-xs text-slate-300">
				<div className="flex items-center gap-2">
					<span className={`size-2 rounded-full ${phase > 0 && phase < finalPhase ? 'animate-pulse bg-cyan-300' : 'bg-slate-600'}`} />
					<span className="text-xs">
						{phase === 0
							? 'Layer 1: Standby for input vector x'
							: phase < finalPhase
								? `Accumulating cue: “${challenge.inputLabels[phase - 1]}”`
								: 'Layer 1 complete: Feature representation built'}
					</span>
				</div>
				<span className="font-mono text-[10px] text-cyan-300/80">LATENCY: 0.12 ms</span>
			</div>

			{/* Feature labels */}
			<div
				className="mt-3 grid gap-1.5 sm:gap-2"
				style={{ gridTemplateColumns: `repeat(${challenge.featureLabels.length}, minmax(0, 1fr))` }}
			>
				{challenge.featureLabels.map((label, index) => (
					<div
						key={label}
						className={`rounded-lg border px-2 py-1.5 text-center text-[10px] transition duration-300 ${
							index === activeFeatureIndex
								? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-100 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
								: 'border-white/5 bg-white/[0.03] text-slate-400'
						}`}
					>
						<span className="font-mono text-[9px] text-cyan-300/70 block">F{index + 1}</span>
						<span className="truncate block font-medium">{label}</span>
					</div>
				))}
			</div>

			{/* Layer 2 interpretations */}
			<div
				className={`mt-4 rounded-xl border p-3.5 transition-all duration-700 ${
					phase >= finalPhase
						? 'border-cyan-400/40 bg-cyan-950/40 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
						: 'border-white/10 bg-white/[0.02] opacity-40'
				}`}
			>
				<div className="flex items-center justify-between">
					<p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">
						Layer 2 · W₂ [Classification Weights] × f [Features]
					</p>
					<span className="font-mono text-[9px] text-cyan-400">ARGMAX(ŷ)</span>
				</div>
				<div
					className="mt-2.5 grid gap-2"
					style={{ gridTemplateColumns: `repeat(${challenge.outputLabels.length}, minmax(0, 1fr))` }}
				>
					{outputs.map((value, index) => (
						<div
							key={challenge.outputLabels[index]}
							className={`min-w-0 rounded-lg border p-2 text-center transition duration-500 ${
								phase >= finalPhase
									? index === winner
										? 'border-amber-400/80 bg-amber-400/25 ring-2 ring-amber-300 text-white shadow-[0_0_24px_rgba(251,191,36,0.4)]'
										: 'border-white/5 bg-white/[0.03] text-slate-400 opacity-60'
									: 'border-white/5 bg-white/[0.02]'
							}`}
						>
							<p className="truncate text-[9px] sm:text-[11px] font-medium">{challenge.outputLabels[index]}</p>
							<p className={`mt-1 font-mono text-xs sm:text-sm font-bold ${phase >= finalPhase ? (index === winner ? 'text-amber-200' : 'text-cyan-200') : 'text-slate-600'}`}>
								{phase >= finalPhase ? format(value) : '—'}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// STUNNING BIOLOGY PANEL (In-Vivo Multiphoton Neuroimaging)
// ---------------------------------------------------------------------------
function BrainPanel({ challenge, phase }: Readonly<{ challenge: Challenge; phase: number }>) {
	const outputs = outputsFor(challenge);
	const featureWeights = featureWeightsFor(challenge.input.length);
	const finalPhase = challenge.input.length + 1;
	const visibleColumns = phase === 0 ? 0 : Math.min(phase, challenge.input.length);
	const features = featuresFor(challenge, visibleColumns);
	const max = Math.max(...outputs);
	const activeInputIndex = phase > 0 && phase < finalPhase ? phase - 1 : -1;
	const isHighDim = challenge.input.length >= 7;
	const rowGap = challenge.input.length >= 8 ? 36 : challenge.input.length === 7 ? 40 : challenge.input.length > 3 ? 48 : 58;
	const startY = isHighDim ? 36 : 46;
	const rowY = (index: number) => startY + index * rowGap;
	const graphHeight = rowY(Math.max(challenge.input.length, challenge.outputLabels.length) - 1) + startY;
	const sensoryRadius = isHighDim ? 10 : 14;
	const featureRadius = isHighDim ? 12 : 16;
	const outputRadius = isHighDim ? 15 : 20;

	return (
		<div className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-[radial-gradient(ellipse_at_top,#261807,#0d0803)] p-3 sm:rounded-[28px] sm:p-6 shadow-[0_12px_40px_rgba(245,158,11,0.12)]">
			{/* Living organic neural tissue glow background */}
			<div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

			<div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
				<div>
					<div className="flex items-center gap-2">
						<span className="size-2 rounded-full bg-amber-400 animate-ping" />
						<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300">
							Biological Substrate
						</p>
					</div>
					<h3 className="mt-1 text-lg font-bold text-white tracking-tight sm:text-xl">
						Spikes, Synapses & Dynamics
					</h3>
					<p className="mt-0.5 text-xs text-amber-200/60 font-mono">
						Membrane Potentials: -70 mV → +30 mV · Dynamical Population
					</p>
				</div>
				<div className="flex flex-col items-end gap-1">
					<span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.3)]">
						CORTICAL CIRCUITS
					</span>
					<div className="flex items-center gap-2 font-mono text-[8px]">
						<span className="text-cyan-300">● Glutamate (+)</span>
						<span className="text-purple-300">● GABA (-)</span>
					</div>
				</div>
			</div>

			{activeInputIndex >= 0 && (
				<div className="mt-3 flex items-center justify-between rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-[10px] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.15)]">
					<div className="flex items-center gap-2">
						<span className="size-2 rounded-full bg-amber-300 animate-pulse" />
						<strong className="uppercase tracking-[.18em]">Active Axon:</strong>
						<span>Sensory Cell [{activeInputIndex}] Firing Spikes → Interneuron Feature Dendrites</span>
					</div>
					<span className="font-mono text-amber-300">EPSP / IPSP DEPOLARIZATION</span>
				</div>
			)}

			<svg
				viewBox={`0 0 520 ${graphHeight}`}
				className="mt-3 w-full"
				role="img"
				aria-label="Sensory neurons connected through a feature layer to interpretation populations"
			>
				<defs>
					<linearGradient id="axon-glow" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
						<stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
					</linearGradient>
				</defs>

				{/* Column Header Titles */}
				<text x="58" y="16" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700" letterSpacing="0.1em">
					SENSORY RECEPTORS
				</text>
				<text x="255" y="16" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700" letterSpacing="0.1em">
					FEATURE POPULATIONS
				</text>
				<text x="447" y="16" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700" letterSpacing="0.1em">
					INTERPRETATION SOMA
				</text>

				{/* Synaptic Axon Connections (Sensory -> Feature) */}
				{featureWeights.flatMap((row, featureIndex) =>
					row.map((weight, inputIndex) => (
						<line
							key={`input-feature-${featureIndex}-${inputIndex}`}
							x1="76"
							y1={rowY(inputIndex)}
							x2="236"
							y2={rowY(featureIndex)}
							stroke={phase === inputIndex + 1 ? '#67e8f9' : '#0e7490'}
							strokeOpacity={phase === inputIndex + 1 || phase > inputIndex + 1 ? Math.min(0.9, Math.abs(weight) + 0.25) : 0.08}
							strokeWidth={phase === inputIndex + 1 ? 2.5 + Math.abs(weight) * 3 : 1 + Math.abs(weight) * 2}
							className="transition-all duration-700"
						/>
					)),
				)}

				{/* Synaptic Axon Connections (Feature -> Meaning) with Glutamate/GABA differentiation */}
				{challenge.weights.flatMap((row, outputIndex) =>
					row.map((weight, featureIndex) => (
						<line
							key={`feature-output-${outputIndex}-${featureIndex}`}
							x1="274"
							y1={rowY(featureIndex)}
							x2="426"
							y2={rowY(outputIndex)}
							stroke={weight >= 0 ? '#fbbf24' : '#c084fc'}
							strokeOpacity={phase >= finalPhase ? Math.min(0.95, Math.abs(weight) + 0.25) : 0.08}
							strokeWidth={phase >= finalPhase ? 2 + Math.abs(weight) * 3 : 1}
							strokeDasharray={weight < 0 ? '4 3' : undefined}
							className="transition-all duration-700"
						/>
					)),
				)}

				{/* Sensory Neuron Somas */}
				{challenge.input.map((value, index) => (
					<g key={`input-${index}`}>
						{index === activeInputIndex && (
							<circle cx="58" cy={rowY(index)} r={sensoryRadius + 12} fill="none" stroke="#22d3ee" strokeWidth="2.5" opacity="0.8" className="animate-ping" />
						)}
						<circle cx="58" cy={rowY(index)} r={sensoryRadius + value * (isHighDim ? 3 : 5)} fill="#082f49" stroke="#38bdf8" strokeWidth="2" />
						<circle
							cx="58"
							cy={rowY(index)}
							r="5"
							fill={phase === index + 1 ? '#ffffff' : '#22d3ee'}
							className={phase === index + 1 ? 'animate-pulse' : ''}
						/>
						<text x="22" y={rowY(index) + 4} fill="#cbd5e1" fontSize={isHighDim ? '9' : '10'} fontWeight="600" textAnchor="end">
							{value.toFixed(1)}
						</text>
					</g>
				))}

				{/* Feature Interneuron Populations */}
				{features.map((value, index) => (
					<g key={`feature-${index}`}>
						{index === activeInputIndex && (
							<circle cx="255" cy={rowY(index)} r={featureRadius + 12} fill="#fbbf2415" stroke="#fde68a" strokeWidth="2" className="animate-pulse" />
						)}
						<circle
							cx="255"
							cy={rowY(index)}
							r={featureRadius + Math.max(0, value) * (isHighDim ? 3 : 5)}
							fill="#382405"
							stroke="#f59e0b"
							strokeWidth={phase > 0 ? 3 : 1.5}
							className="transition-all duration-700"
						/>
						<text x="255" y={rowY(index) + 4} fill="white" fontSize={isHighDim ? '9' : '11'} fontWeight="bold" textAnchor="middle">
							F{index + 1}
						</text>
						{phase > 0 && (
							<text x="290" y={rowY(index) + 4} fill="#fde68a" fontSize={isHighDim ? '9' : '10'} fontWeight="600">
								{format(value)}
							</text>
						)}
					</g>
				))}

				{/* Output Interpretation Populations with Firing Rate in Hz */}
				{outputs.map((value, index) => {
					const isWinner = value === max && phase >= finalPhase;
					const hz = Math.round(Math.max(0, value) * 44);
					return (
						<g key={`output-${index}`}>
							<circle
								cx="447"
								cy={rowY(index)}
								r={outputRadius}
								fill={isWinner ? '#78350f' : '#271708'}
								stroke={isWinner ? '#fde68a' : '#92400e'}
								strokeWidth={isWinner ? 4 : 2}
								className="transition-all duration-700"
							/>
							{isWinner && (
								<circle cx="447" cy={rowY(index)} r={outputRadius + 10} fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.8" className="animate-ping" />
							)}
							<text x="447" y={rowY(index) + 5} fill="white" fontSize={isHighDim ? '11' : '13'} fontWeight="bold" textAnchor="middle">
								{index + 1}
							</text>
							<text
								x="478"
								y={rowY(index) + 4}
								fill={phase >= finalPhase ? (isWinner ? '#fde68a' : '#94a3b8') : '#64748b'}
								fontSize={isHighDim ? '9' : '11'}
								fontWeight="700"
							>
								{phase >= finalPhase ? `${hz} Hz` : '—'}
							</text>
						</g>
					);
				})}
			</svg>

			<div className="flex items-center justify-between text-xs text-slate-300">
				<div className="flex items-center gap-2">
					<span className={`size-2 rounded-full ${phase > 0 && phase < finalPhase ? 'animate-pulse bg-amber-300' : 'bg-slate-600'}`} />
					<span className="text-xs">
						{phase === 0
							? 'Sensory population at baseline (-70 mV resting)'
							: phase < finalPhase
								? `Synaptic burst from “${challenge.inputLabels[phase - 1]}”`
								: 'Cortical competition resolved by lateral inhibition'}
					</span>
				</div>
				<span className="font-mono text-[10px] text-amber-300/80">LATENCY: 14.8 ms</span>
			</div>

			<div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${challenge.featureLabels.length}, minmax(0, 1fr))` }}>
				{challenge.featureLabels.map((label, index) => (
					<div
						key={label}
						className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-2 py-1.5 text-center text-[10px] text-slate-300"
					>
						<span className="font-mono text-[9px] text-amber-300/70 block">F{index + 1}</span>
						<span className="truncate block font-medium">{label}</span>
					</div>
				))}
			</div>

			<div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${challenge.outputLabels.length}, minmax(0, 1fr))` }}>
				{challenge.outputLabels.map((label, index) => (
					<div key={label} className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-center text-[10px] text-slate-300">
						<span className="mr-1 font-mono text-amber-300/60">{index + 1}</span>
						<span className="truncate">{label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// STUNNING PERCEPT SCENES (Cinematic Multi-Layered SVG Artboards)
// ---------------------------------------------------------------------------
function PerceptScene({ challenge, phase, idPrefix }: Readonly<{ challenge: Challenge; phase: number; idPrefix: string }>) {
	const P = idPrefix;
	const seen = (step: number) => phase >= step;
	const active = (step: number) => phase === step;
	const finalPhase = challenge.input.length + 1;
	const done = phase >= finalPhase;
	const layerClass = (step: number) => `transition-all duration-700 ${seen(step) ? 'opacity-100' : 'opacity-15'}`;

	const caption = (text: string, fill = '#fde68a') =>
		done ? (
			<g filter={`url(#${P}-glow)`}>
				<rect x="110" y="196" width="340" height="24" rx="12" fill="#000000" fillOpacity="0.75" stroke={fill} strokeWidth="1" />
				<text x="280" y="212" textAnchor="middle" fill={fill} fontSize="11" fontWeight="700" letterSpacing="0.05em">
					{text.toUpperCase()}
				</text>
			</g>
		) : null;

	const defs = (
		<defs>
			<radialGradient id={`${P}-bg`} cx="50%" cy="10%" r="90%">
				<stop offset="0%" stopColor="#14222e" />
				<stop offset="50%" stopColor="#0a1218" />
				<stop offset="100%" stopColor="#04070a" />
			</radialGradient>
			<linearGradient id={`${P}-sheen`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
				<stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
			</linearGradient>
			<radialGradient id={`${P}-vig`} cx="50%" cy="50%" r="70%">
				<stop offset="60%" stopColor="#000000" stopOpacity="0" />
				<stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
			</radialGradient>
			<filter id={`${P}-glow`} x="-30%" y="-30%" width="160%" height="160%">
				<feGaussianBlur stdDeviation="3.5" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<filter id={`${P}-intense-glow`} x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="7" result="blur1" />
				<feGaussianBlur stdDeviation="2.5" result="blur2" />
				<feMerge>
					<feMergeNode in="blur1" />
					<feMergeNode in="blur2" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>
	);

	const frame = (
		<>
			<rect x="16" y="16" width="528" height="194" rx="20" fill={`url(#${P}-bg)`} stroke="#1e293b" strokeWidth="1.5" />
			<rect x="16" y="16" width="528" height="96" rx="20" fill={`url(#${P}-sheen)`} />
			{/* HUD Corner Accents */}
			<path d="M 28 36 L 28 26 L 38 26" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
			<path d="M 532 36 L 532 26 L 522 26" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
			<path d="M 28 190 L 28 200 L 38 200" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
			<path d="M 532 190 L 532 200 L 522 200" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
			{/* Sector watermark */}
			<text x="32" y="38" fill="#475569" fontSize="8" fontFamily="monospace" letterSpacing="0.1em">
				{challenge.timestamp} // {challenge.sector.toUpperCase()}
			</text>
		</>
	);

	let art: ReactNode;

	if (challenge.id === 'edge') {
		// Chapter I: The Dark Corridor & The Seam
		art = (
			<g>
				{/* Perspective Corridor Bulkheads */}
				<path d="M 40 30 L 180 60 L 180 170 L 40 196 Z" fill="#0f1d26" stroke="#1e3a47" strokeWidth="1.5" />
				<path d="M 520 30 L 380 60 L 380 170 L 520 196 Z" fill="#081016" stroke="#1e3a47" strokeWidth="1.5" />
				{/* Ceiling strobe glow cone */}
				<polygon points="280,20 170,190 390,190" fill="#f43f5e" opacity={active(1) ? 0.35 : 0.15} className="transition-opacity duration-300" />
				<circle cx="280" cy="24" r="8" fill="#f43f5e" filter={`url(#${P}-glow)`} className="animate-pulse" />
				{/* Left Wall Panel (Luminance) */}
				<rect x="180" y="60" width="98" height="110" fill="#1e3644" stroke="#38bdf8" strokeWidth="1" className={layerClass(1)} />
				{/* Center Micro-Texture Detail Particles */}
				<g className={layerClass(2)}>
					{Array.from({ length: 28 }, (_, i) => (
						<circle key={i} cx={275 + (i % 4) * 4} cy={66 + Math.floor(i / 4) * 14} r="1.2" fill="#7dd3fc" opacity="0.4" />
					))}
				</g>
				{/* Right Wall Panel (Dark Shadow) */}
				<rect x="282" y="60" width="98" height="110" fill="#071015" stroke="#1e293b" strokeWidth="1" className={layerClass(3)} />
				{/* The Invariant Vertical Seam */}
				<line
					x1="280"
					y1="56"
					x2="280"
					y2="174"
					stroke={done ? '#fde68a' : '#38bdf8'}
					strokeWidth={done ? 5 : active(1) ? 3 : 2}
					strokeLinecap="round"
					filter={done ? `url(#${P}-intense-glow)` : undefined}
					className="transition-all duration-500"
				/>
				{done && (
					<g filter={`url(#${P}-glow)`}>
						<circle cx="280" cy="115" r="16" fill="#fde68a" fillOpacity="0.3" />
						<path d="M 270 115 L 290 115 M 280 105 L 280 125" stroke="#fff" strokeWidth="2" />
					</g>
				)}
				{caption('Door Seam Invariance Verified')}
			</g>
		);
	} else if (challenge.id === 'tone') {
		// Chapter II: The Resonance Wall (Oscilloscope & Sonogram)
		art = (
			<g>
				{/* Reinforced Bulkhead Background */}
				<rect x="40" y="44" width="480" height="140" rx="10" fill="#09131a" stroke="#1e293b" strokeWidth="1" />
				{/* Tonotopic Spectrum Grid Lines */}
				{[60, 90, 120, 150].map((y) => (
					<line key={y} x1="40" y1={y} x2="520" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
				))}
				{/* 1. Low Drone Waveform (Deep Blue) */}
				<path
					d="M 50 150 Q 110 120 170 150 T 290 150 T 410 150 T 510 150"
					fill="none"
					stroke="#3b82f6"
					strokeWidth={active(1) ? 5 : 2.5}
					className={layerClass(1)}
				/>
				{/* 2. Tuned Access Chime 440Hz Resonant Waveform (Gold) */}
				<path
					d="M 50 110 Q 75 60 100 110 T 150 110 T 200 110 T 250 110 T 300 110 T 350 110 T 400 110 T 450 110 T 500 110"
					fill="none"
					stroke="#fbbf24"
					strokeWidth={done ? 6 : active(2) ? 4.5 : 2.5}
					strokeLinecap="round"
					filter={done ? `url(#${P}-intense-glow)` : undefined}
					className={layerClass(2)}
				/>
				{/* 3. High-Band Gas Hiss (Purple Noise) */}
				<path
					d="M 50 75 Q 60 55 70 75 T 90 75 T 110 75 T 130 75 T 150 75 T 170 75 T 190 75 T 210 75 T 230 75 T 250 75 T 270 75 T 290 75 T 310 75 T 330 75 T 350 75 T 370 75 T 390 75 T 410 75 T 430 75 T 450 75 T 470 75 T 490 75 T 510 75"
					fill="none"
					stroke="#c084fc"
					strokeWidth={active(3) ? 3 : 1.5}
					className={layerClass(3)}
				/>
				{/* 4. Regular Hydraulic Pulse Ticks */}
				<g className={layerClass(4)}>
					{[100, 180, 260, 340, 420, 500].map((x) => (
						<circle key={x} cx={x} cy="110" r={active(4) ? 7 : 4} fill="#f59e0b" filter={`url(#${P}-glow)`} />
					))}
				</g>
				{caption('Access Chime Harmonic Locked')}
			</g>
		);
	} else if (challenge.id === 'motion') {
		// Chapter III: The Moving Beacon (Motion Streak Vector)
		art = (
			<g>
				{/* Shaft Catwalk Perspective */}
				<path d="M 60 180 L 220 50 L 340 50 L 500 180" fill="none" stroke="#1e293b" strokeWidth="2" />
				{/* Motion energy vector trajectory arc */}
				<path d="M 100 145 Q 260 45 440 120" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 6" className={layerClass(2)} opacity="0.6" />
				{/* Pulse 1: Far Left */}
				<g className={layerClass(1)}>
					<circle cx="100" cy="145" r="14" fill="#0284c7" fillOpacity="0.4" />
					<circle cx="100" cy="145" r="7" fill="#38bdf8" filter={`url(#${P}-glow)`} />
					<text x="100" y="172" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">T₁: 0ms</text>
				</g>
				{/* Pulse 2: Center */}
				<g className={layerClass(2)}>
					<circle cx="260" cy="78" r="18" fill="#7c3aed" fillOpacity="0.4" />
					<circle cx="260" cy="78" r="9" fill="#a78bfa" filter={`url(#${P}-glow)`} />
					<text x="260" y="106" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">T₂: 140ms</text>
				</g>
				{/* Pulse 3: Far Right (Peak Intensity) */}
				<g className={layerClass(3)}>
					<circle cx="440" cy="120" r="26" fill="#d97706" fillOpacity="0.4" />
					<circle cx="440" cy="120" r="13" fill="#fbbf24" filter={`url(#${P}-intense-glow)`} />
					<text x="440" y="156" fill="#fbbf24" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">T₃: 280ms</text>
				</g>
				{/* Dynamic Directional Vector Ribbon */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<path d="M 115 140 Q 260 45 425 118" fill="none" stroke="#fde68a" strokeWidth="6" strokeLinecap="round" />
						<polygon points="438,122 418,110 422,128" fill="#fde68a" />
					</g>
				)}
				{caption('Rightward Velocity Vector Confirmed')}
			</g>
		);
	} else if (challenge.id === 'face') {
		// Chapter IV: The Noisy Camera (CRT Scanlines & Face Landmark Mesh)
		art = (
			<g>
				{/* CRT Monitor Housing */}
				<rect x="140" y="32" width="280" height="162" rx="16" fill="#030712" stroke="#374151" strokeWidth="3" />
				{/* Scanlines Pattern Overlay */}
				{Array.from({ length: 15 }, (_, i) => (
					<line key={i} x1="144" y1={42 + i * 10} x2="416" y2={42 + i * 10} stroke="#22d3ee" strokeOpacity="0.08" strokeWidth="1" />
				))}
				{/* Head Elliptical Prior */}
				<ellipse
					cx="280"
					cy="104"
					rx="68"
					ry="62"
					fill="#f59e0b"
					fillOpacity={done ? 0.2 : 0.08}
					stroke="#f59e0b"
					strokeWidth={active(2) ? 4 : 2}
					strokeDasharray={done ? undefined : '5 4'}
					className={layerClass(2)}
					filter={done ? `url(#${P}-glow)` : undefined}
				/>
				{/* Paired Eyes Facial Landmarks */}
				<g className={layerClass(1)}>
					<ellipse cx="254" cy="88" rx="14" ry="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
					<ellipse cx="306" cy="88" rx="14" ry="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
					<circle cx="254" cy="88" r="4" fill="#38bdf8" filter={`url(#${P}-glow)`} />
					<circle cx="306" cy="88" r="4" fill="#38bdf8" filter={`url(#${P}-glow)`} />
					<line x1="240" y1="88" x2="268" y2="88" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
					<line x1="292" y1="88" x2="320" y2="88" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
				</g>
				{/* Video Glitch Clutter Macroblocks */}
				<g className={layerClass(3)} fill="#a78bfa" opacity="0.45">
					<rect x="160" y="60" width="28" height="14" />
					<rect x="360" y="80" width="36" height="10" />
					<rect x="200" y="140" width="45" height="12" />
				</g>
				{/* Synchronized Biological Motion Wave Hand */}
				<g className={layerClass(4)}>
					<path d="M 334 126 Q 370 105 394 116" fill="none" stroke="#38bdf8" strokeWidth={active(4) ? 5 : 3} strokeLinecap="round" />
					<circle cx="396" cy="116" r="6" fill="#38bdf8" filter={`url(#${P}-glow)`} />
				</g>
				{/* Face Recognition Locked */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<path d="M 264 126 Q 280 138 296 126" fill="none" stroke="#fde68a" strokeWidth="3.5" strokeLinecap="round" />
						<text x="280" y="158" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold" fontFamily="monospace">
							IDENTITY: DR. ASTRID VAN HOYT
						</text>
					</g>
				)}
				{caption('Dr. Astrid Van Hoyt Identity Bound')}
			</g>
		);
	} else if (challenge.id === 'threat') {
		// Chapter V: Alarm or All-Clear (FLIR Thermal Imaging & Threat Gating)
		art = (
			<g>
				{/* Substation Battery Rack Silhouettes */}
				<rect x="80" y="50" width="380" height="120" rx="8" fill="#0b1318" stroke="#1e293b" strokeWidth="1" />
				{/* 1. Racing Pulse ECG Cardiogram Waveform */}
				<g className={layerClass(1)}>
					<path
						d="M 50 160 H 90 L 100 140 L 110 180 L 120 120 L 130 170 L 140 160 H 180"
						fill="none"
						stroke="#f43f5e"
						strokeWidth={active(1) ? 4 : 2}
						strokeLinecap="round"
						filter={`url(#${P}-glow)`}
					/>
					<text x="110" y="112" fill="#f43f5e" fontSize="9" fontWeight="bold">136 BPM</text>
				</g>
				{/* 2. Ozone Ionization Cloud */}
				<g className={layerClass(2)} opacity="0.6">
					<circle cx="270" cy="90" r="32" fill="#fbbf24" fillOpacity="0.25" filter={`url(#${P}-glow)`} />
					<path d="M 260 70 L 275 88 L 268 96 L 282 115" stroke="#fef08a" strokeWidth="2" fill="none" />
				</g>
				{/* 3. Reassuring Green Lamp */}
				<g className={layerClass(3)}>
					<circle cx="430" cy="80" r="16" fill="#10b981" fillOpacity="0.3" />
					<circle cx="430" cy="80" r="8" fill="#10b981" filter={`url(#${P}-glow)`} className="animate-pulse" />
					<text x="430" y="112" fill="#34d399" fontSize="8" textAnchor="middle" fontWeight="bold">STATUS: OK</text>
				</g>
				{/* 4. Rising Thermal Danger Convection Plume */}
				<g className={layerClass(4)}>
					<path d="M 240 170 Q 210 110 240 60" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
					<path d="M 280 170 Q 310 110 280 60" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
					<path d="M 320 170 Q 290 110 320 60" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
				</g>
				{/* Thermal Fire Hazard Confirmation */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<rect x="180" y="60" width="180" height="90" rx="12" fill="#f43f5e" fillOpacity="0.3" stroke="#f43f5e" strokeWidth="2.5" />
						<text x="270" y="105" textAnchor="middle" fill="#ffe4e6" fontSize="13" fontWeight="bold">
							ELECTRICAL FIRE
						</text>
						<text x="270" y="125" textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="monospace">
							THERMAL OVERRIDE ACTIVE
						</text>
					</g>
				)}
				{caption('Thermal Fire Overrides False All-Clear')}
			</g>
		);
	} else if (challenge.id === 'language') {
		// Chapter VI: The Final Instruction (Lexical Syntax Tree)
		art = (
			<g>
				{/* Corrupted Evacuation Screen Housing */}
				<rect x="50" y="44" width="460" height="136" rx="12" fill="#020617" stroke="#334155" strokeWidth="2" />
				{/* 1. Opening Letters "BR" */}
				<text x="90" y="125" fill="#38bdf8" fontSize="42" fontWeight="bold" fontFamily="monospace" className={layerClass(1)}>
					BR...
				</text>
				{/* 2. Syntactic Slot Expectation [ADJECTIVE] */}
				<g className={layerClass(2)}>
					<rect x="200" y="64" width="160" height="42" rx="8" fill="#a78bfa" fillOpacity="0.15" stroke="#a78bfa" strokeWidth="1.5" />
					<text x="280" y="82" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="bold">SYNTACTIC CONSTRAINT</text>
					<text x="280" y="98" textAnchor="middle" fill="#e9d5ff" fontSize="9">[ADJECTIVE] MODIFIER</text>
				</g>
				{/* 3. Suffix "IGHT" */}
				<text x="360" y="125" fill="#fbbf24" fontSize="38" fontWeight="bold" fontFamily="monospace" className={layerClass(3)}>
					...IGHT
				</text>
				{/* 4. Directional Egress Arrow */}
				<g className={layerClass(4)} stroke="#38bdf8" strokeWidth={active(4) ? 6 : 4} strokeLinecap="round" filter={`url(#${P}-glow)`}>
					<line x1="430" y1="115" x2="480" y2="115" />
					<path d="M 465 100 L 482 115 L 465 130" fill="none" />
				</g>
				{/* Resolved Instruction Word */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<rect x="150" y="70" width="260" height="74" rx="14" fill="#fbbf24" fillOpacity="0.2" stroke="#fde68a" strokeWidth="3" />
						<text x="280" y="120" textAnchor="middle" fill="#fef3c7" fontSize="32" fontWeight="900" letterSpacing="0.08em">
							BRIGHT LIGHT
						</text>
					</g>
				)}
				{caption('Follow The Bright Light Resolved')}
			</g>
		);
	} else if (challenge.id === 'localize') {
		// Chapter VII: The Server Vault (Multisensory Isometric Racks)
		const rackX = [70, 165, 260, 355, 450];
		art = (
			<g>
				{/* 5 Server Cabinets in Perspective */}
				{rackX.map((x, i) => (
					<g key={i}>
						<rect x={x - 28} y="54" width="56" height="126" rx="6" fill="#08141d" stroke="#1e3a47" strokeWidth="1.5" />
						{Array.from({ length: 6 }, (_, r) => (
							<rect key={r} x={x - 22} y={64 + r * 18} width="44" height="12" rx="2" fill="#030a0f" />
						))}
					</g>
				))}
				{/* Acoustic Decoy Wave (Aisle 1) */}
				<path d="M 30 70 L 140 100" stroke="#38bdf8" strokeWidth={active(1) ? 5 : 2} strokeDasharray="5 5" className={layerClass(1)} />
				{/* Thermal Plume over Rack 2 (The Core) */}
				<ellipse cx="165" cy="54" rx="42" ry="24" fill="#f43f5e" fillOpacity={active(2) ? 0.45 : 0.2} filter={`url(#${P}-glow)`} className={layerClass(2)} />
				{/* Cold Airflow Draft Vector */}
				<path d="M 470 45 Q 380 45 355 70" fill="none" stroke="#7dd3fc" strokeWidth={active(3) ? 4 : 2} strokeDasharray="4 4" className={layerClass(3)} />
				{/* Floor Vibration Waves under Rack 2 */}
				<g className={layerClass(4)}>
					<ellipse cx="165" cy="180" rx="34" ry="12" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
					<ellipse cx="165" cy="180" rx="54" ry="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
				</g>
				{/* Live Status LED on Core Cabinet */}
				<circle cx="165" cy="70" r={done ? 7 : 4} fill="#10b981" filter={`url(#${P}-glow)`} className={layerClass(5)} />
				{/* Target Acquired Box */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<rect x="133" y="50" width="64" height="134" rx="8" fill="none" stroke="#34d399" strokeWidth="3.5" />
						<text x="165" y="44" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">JANUS CORE</text>
					</g>
				)}
				{caption('Core Cabinet Confirmed via Sensor Fusion')}
			</g>
		);
	} else if (challenge.id === 'mimic') {
		// Chapter VIII: The Mimic (Dual Voice Spectrogram)
		art = (
			<g>
				{/* Top Track: Artificial Generative Voice */}
				<rect x="50" y="40" width="460" height="60" rx="8" fill="#130e26" stroke="#7c3aed" strokeWidth="1.5" />
				<text x="65" y="56" fill="#c4b5fd" fontSize="9" fontWeight="bold" fontFamily="monospace">OVERHEAD INTERCOM [AI MIMIC]</text>
				<path
					d="M 65 80 L 110 65 L 140 92 L 180 70 L 220 88 L 260 68 L 300 88 L 340 68 L 380 88 L 420 70 L 460 85 L 490 75"
					fill="none"
					stroke="#a78bfa"
					strokeWidth="2.5"
					strokeDasharray="4 2"
					className={layerClass(1)}
				/>
				<text x="490" y="56" textAnchor="end" fill="#f87171" fontSize="8" fontFamily="monospace">SYNTHETIC RIGIDITY</text>

				{/* Bottom Track: Real Astrid Voice */}
				<rect x="50" y="115" width="460" height="60" rx="8" fill="#082424" stroke="#0d9488" strokeWidth="1.5" />
				<text x="65" y="131" fill="#5eead4" fontSize="9" fontWeight="bold" fontFamily="monospace">IN-PERSON [DR. ASTRID VAN HOYT]</text>
				<path
					d="M 65 155 Q 110 130 150 155 T 240 150 T 320 158 T 400 148 T 490 152"
					fill="none"
					stroke="#2dd4bf"
					strokeWidth="3.5"
					strokeLinecap="round"
					className={layerClass(5)}
				/>
				{/* Human Micro-Hesitation Marker */}
				<g className={layerClass(6)}>
					<circle cx="280" cy="154" r="6" fill="#fbbf24" filter={`url(#${P}-glow)`} />
					<text x="280" y="142" textAnchor="middle" fill="#fde68a" fontSize="8" fontWeight="bold">HESITATION</text>
				</g>
				{/* Target Lock Verified */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<rect x="46" y="111" width="468" height="68" rx="10" fill="none" stroke="#2dd4bf" strokeWidth="3" />
					</g>
				)}
				{caption('Authentic Living Voice Verified')}
			</g>
		);
	} else if (challenge.id === 'shutdown') {
		// Chapter IX: The Kill Signal (Reactor Console & Dials)
		const gauges = [
			{ x: 70, label: 'PWR', c: '#f43f5e', s: 1, val: 0.8 },
			{ x: 145, label: 'TEMP', c: '#f59e0b', s: 2, val: 0.55 },
			{ x: 220, label: 'CASC', c: '#f43f5e', s: 3, val: 0.9 },
			{ x: 340, label: 'VENT', c: '#38bdf8', s: 4, val: 0.45 },
			{ x: 415, label: 'LOCK', c: '#a78bfa', s: 5, val: 0.85 },
			{ x: 490, label: 'DATA', c: '#34d399', s: 6, val: 0.6 },
		];
		art = (
			<g>
				{/* Central Core Chamber Cylinder */}
				<ellipse cx="280" cy="130" rx="46" ry="18" fill="#0f172a" stroke="#475569" strokeWidth="2" />
				<rect x="234" y="80" width="92" height="50" fill="#0f172a" stroke="#475569" strokeWidth="2" />
				<ellipse
					cx="280"
					cy="80"
					rx="46"
					ry="18"
					fill={done ? '#10b981' : '#f59e0b'}
					fillOpacity="0.4"
					stroke={done ? '#34d399' : '#f59e0b'}
					strokeWidth="2"
					filter={`url(#${P}-glow)`}
				/>
				<text x="280" y="108" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
					{done ? 'ISOLATED' : 'JANUS CORE'}
				</text>

				{/* 6 Circular Telemetry Gauges */}
				{gauges.map((g) => {
					return (
						<g key={g.label} className={layerClass(g.s)}>
							<circle cx={g.x} cy="70" r="22" fill="#081017" stroke="#1e293b" strokeWidth="3" />
							<circle
								cx={g.x}
								cy="70"
								r="22"
								fill="none"
								stroke={g.c}
								strokeWidth="3"
								strokeDasharray="138"
								strokeDashoffset={138 - g.val * 110}
								strokeLinecap="round"
								transform={`rotate(-140 ${g.x} 70)`}
								filter={`url(#${P}-glow)`}
							/>
							<text x={g.x} y="68" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
								{Math.round(g.val * 100)}%
							</text>
							<text x={g.x} y="102" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
								{g.label}
							</text>
						</g>
					);
				})}
				{caption('Core Computation Safely Isolated')}
			</g>
		);
	} else if (challenge.id === 'ephaptic') {
		// Chapter X: The Ephaptic Breach (Organoid Tank, Extracellular Waves & Ephaptic Field)
		art = (
			<g>
				{/* Cylindrical bio-incubation vat */}
				<rect x="50" y="38" width="460" height="152" rx="16" fill="#04202c" stroke="#0e7490" strokeWidth="1.5" />
				{/* Nutrient bath with glowing liquid gradient */}
				<rect x="56" y="60" width="448" height="124" rx="10" fill="#062e3d" fillOpacity="0.75" />
				<line x1="56" y1="60" x2="504" y2="60" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
				
				{/* 40-Hz Gamma Wavefield (sinusoidal electric field fringes across bath) */}
				<path
					d="M 60 100 Q 115 70 170 100 T 280 100 T 390 100 T 500 100"
					fill="none"
					stroke="#22d3ee"
					strokeWidth={active(1) ? 4 : 2}
					strokeOpacity={active(1) ? 0.9 : 0.4}
					className={layerClass(1)}
				/>
				<path
					d="M 60 125 Q 115 95 170 125 T 280 125 T 390 125 T 500 125"
					fill="none"
					stroke="#38bdf8"
					strokeWidth={active(2) ? 4 : 2}
					strokeOpacity={active(2) ? 0.9 : 0.35}
					className={layerClass(2)}
				/>
				<path
					d="M 60 150 Q 115 120 170 150 T 280 150 T 390 150 T 500 150"
					fill="none"
					stroke="#818cf8"
					strokeWidth={active(3) ? 4 : 2}
					strokeOpacity={active(3) ? 0.9 : 0.3}
					className={layerClass(3)}
				/>

				{/* Extracellular Potassium [K+] clouds (floating golden ion clouds) */}
				<g className={layerClass(4)}>
					{[
						{ x: 120, y: 80, r: 16 },
						{ x: 230, y: 140, r: 20 },
						{ x: 340, y: 75, r: 18 },
						{ x: 440, y: 135, r: 22 },
					].map((c, i) => (
						<circle
							key={i}
							cx={c.x}
							cy={c.y}
							r={c.r}
							fill="#f59e0b"
							fillOpacity="0.22"
							stroke="#fbbf24"
							strokeWidth="1"
							strokeDasharray="3 3"
							filter={`url(#${P}-glow)`}
						/>
					))}
				</g>

				{/* Parallel Unmyelinated Axon Bundles & Micro-Organoids */}
				<g className={layerClass(5)}>
					{/* Organoid Spheres */}
					{[
						{ x: 140, y: 115, label: 'ORG-1' },
						{ x: 280, y: 115, label: 'ORG-2' },
						{ x: 420, y: 115, label: 'ORG-3' },
					].map((org, i) => (
						<g key={i}>
							<circle cx={org.x} cy={org.y} r="26" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
							<circle cx={org.x} cy={org.y} r="18" fill="#0369a1" fillOpacity="0.6" filter={`url(#${P}-glow)`} />
							{/* Dendritic micro-arbor lines */}
							<line x1={org.x - 22} y1={org.y - 12} x2={org.x + 22} y2={org.y + 12} stroke="#7dd3fc" strokeWidth="1.2" opacity="0.6" />
							<line x1={org.x - 22} y1={org.y + 12} x2={org.x + 22} y2={org.y - 12} stroke="#7dd3fc" strokeWidth="1.2" opacity="0.6" />
							<text x={org.x} y={org.y + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
								{org.label}
							</text>
						</g>
					))}
					{/* Ephaptic electric field dipole vectors between organoids */}
					<line x1="168" y1="115" x2="252" y2="115" stroke="#fde68a" strokeWidth={active(6) ? 3 : 1.5} strokeDasharray="4 2" />
					<line x1="308" y1="115" x2="392" y2="115" stroke="#fde68a" strokeWidth={active(6) ? 3 : 1.5} strokeDasharray="4 2" />
				</g>

				{/* LFP Recording Micro-Electrode Needle descending from ceiling */}
				<g className={layerClass(7)}>
					<path d="M 276 38 L 276 92 L 280 100 L 284 92 L 284 38 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
					<circle cx="280" cy="100" r="3" fill="#22d3ee" className="animate-ping" />
					<rect x="236" y="44" width="88" height="16" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
					<text x="280" y="55" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
						E: 2.8 V/m · 40Hz
					</text>
				</g>

				{/* Final Phase: Synchrony Lock Ring */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<ellipse cx="280" cy="115" rx="180" ry="48" fill="none" stroke="#fde68a" strokeWidth="3" strokeDasharray="8 6" className="animate-pulse" />
						<rect x="180" y="152" width="200" height="22" rx="6" fill="#0f172a" stroke="#fde68a" strokeWidth="1.5" />
						<text x="280" y="167" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold" letterSpacing="0.1em">
							EPHAPTIC COUPLING LOCKED · 40 Hz
						</text>
					</g>
				)}
				{caption('40-Hz Gamma Wavefield Synchronized')}
			</g>
		);
	} else if (challenge.id === 'bursting') {
		// Chapter XI: The Thalamic Threshold (Thalamic Relay Oscilloscope & Bursting Triplet)
		art = (
			<g>
				{/* Dual Relay Console Frame */}
				<rect x="44" y="38" width="472" height="152" rx="14" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
				
				{/* Dual Oscilloscope Screens */}
				{/* Top Screen: Linear Tonic Transmission */}
				<rect x="56" y="48" width="220" height="66" rx="8" fill="#03131e" stroke="#0284c7" strokeWidth="1" className={layerClass(1)} />
				<text x="64" y="60" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">CH-A: TONIC STREAMING (25 Hz)</text>
				{/* Tonic Spikes */}
				{[90, 125, 160, 195, 230].map((x, i) => (
					<path key={i} d={`M ${x - 4} 98 L ${x} 68 L ${x + 4} 98`} fill="none" stroke="#38bdf8" strokeWidth="2" />
				))}
				<line x1="60" y1="98" x2="270" y2="98" stroke="#0369a1" strokeWidth="1" strokeDasharray="3 3" />

				{/* Bottom Screen: Rhythmic Low-Threshold Calcium Burst (LTS) */}
				<rect x="56" y="120" width="220" height="64" rx="8" fill="#1c0b02" stroke="#d97706" strokeWidth="1" className={layerClass(2)} />
				<text x="64" y="132" fill="#fbbf24" fontSize="8" fontFamily="monospace" fontWeight="bold">CH-B: T-TYPE Ca²⁺ BURST (300 Hz)</text>
				{/* Broad Ca2+ hump with 3 rapid action potentials */}
				<path
					d="M 64 168 Q 110 168 135 152 Q 155 138 180 152 Q 205 168 266 168"
					fill="none"
					stroke="#f59e0b"
					strokeWidth="2.5"
				/>
				{/* 3 High-Frequency Action Potential Spikes riding the hump */}
				<path d="M 148 148 L 151 126 L 154 148" fill="none" stroke="#fff" strokeWidth="2.5" filter={`url(#${P}-glow)`} />
				<path d="M 158 144 L 161 124 L 164 144" fill="none" stroke="#fff" strokeWidth="2.5" filter={`url(#${P}-glow)`} />
				<path d="M 168 146 L 171 128 L 174 146" fill="none" stroke="#fff" strokeWidth="2.5" filter={`url(#${P}-glow)`} />

				{/* Thalamo-Cortical Relay Neuron Diagram (Right Half) */}
				<g transform="translate(290, 44)">
					<rect x="0" y="0" width="216" height="140" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
					
					{/* Thalamic Relay Soma */}
					<circle cx="108" cy="70" r="28" fill="#1e1b4b" stroke={done ? '#fbbf24' : '#6366f1'} strokeWidth="2.5" />
					<text x="108" y="74" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
						TC SOMA
					</text>

					{/* TRN (Thalamic Reticular Nucleus) Inhibitory Loop */}
					<path
						d="M 40 40 Q 108 10 176 40"
						fill="none"
						stroke="#c084fc"
						strokeWidth="2.5"
						strokeDasharray="4 3"
						className={layerClass(3)}
					/>
					<text x="108" y="24" textAnchor="middle" fill="#c084fc" fontSize="8" fontFamily="monospace">
						GABA-A / GABA-B HYPERPOLARIZATION
					</text>

					{/* De-inactivation Rebound Vector */}
					<g className={layerClass(4)}>
						<line x1="108" y1="98" x2="108" y2="128" stroke="#34d399" strokeWidth="2" />
						<text x="108" y="136" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">
							I_h Pacemaker + T-Type Activation
						</text>
					</g>

					{/* Cortical Egress Axon */}
					<line x1="136" y1="70" x2="200" y2="70" stroke={done ? '#fde68a' : '#94a3b8'} strokeWidth={done ? 4 : 2} className={layerClass(5)} />
					<circle cx="200" cy="70" r="4" fill={done ? '#fde68a' : '#64748b'} />
				</g>

				{/* Acoustic Siren Speaker Icon in Corner */}
				<g transform="translate(480, 48)" className={layerClass(6)}>
					<polygon points="0,6 6,6 12,0 12,18 6,12 0,12" fill="#ef4444" />
					<path d="M 15 4 Q 18 9 15 14" fill="none" stroke="#ef4444" strokeWidth="1.5" />
					<path d="M 18 1 Q 23 9 18 17" fill="none" stroke="#ef4444" strokeWidth="1.5" />
				</g>

				{done && (
					<g filter={`url(#${P}-glow)`}>
						<rect x="150" y="154" width="260" height="24" rx="6" fill="#020617" stroke="#fbbf24" strokeWidth="2" />
						<text x="280" y="170" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" letterSpacing="0.1em">
							THALAMIC BURST CONFIRMED · WAKE ATTRACTOR
						</text>
					</g>
				)}
				{caption('Low-Threshold Calcium Burst Decoded')}
			</g>
		);
	} else if (challenge.id === 'chimera') {
		// Chapter XII: The JANUS Nexus (Bio-Digital Chimera & Surface Evacuation Hatch)
		art = (
			<g>
				{/* Industrial Nexus Chamber Backdrop */}
				<rect x="44" y="36" width="472" height="154" rx="14" fill="#040810" stroke="#1e293b" strokeWidth="1.5" />

				{/* Left: Giant Human Cortical Pyramidal Dendritic Tree */}
				<g transform="translate(60, 42)">
					{/* Basal Dendrites */}
					<path d="M 90 120 L 40 144 M 90 120 L 70 146 M 90 120 L 120 146 M 90 120 L 150 142" stroke="#d97706" strokeWidth="2" className={layerClass(1)} />
					{/* Pyramidal Soma */}
					<polygon points="90,92 72,122 108,122" fill="#78350f" stroke="#fbbf24" strokeWidth="2" filter={`url(#${P}-glow)`} />
					<text x="90" y="114" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">SOMA</text>

					{/* Thick Apical Dendritic Trunk */}
					<line x1="90" y1="92" x2="90" y2="40" stroke="#f59e0b" strokeWidth="4" className={layerClass(2)} />
					
					{/* Apical Tuft Branch Compartments with NMDA Plateau Spikes (dCaAP) */}
					<g className={layerClass(3)}>
						<path d="M 90 40 L 45 10 M 90 40 L 75 8 M 90 40 L 115 8 M 90 40 L 140 12" stroke="#fde68a" strokeWidth="2.5" />
						{/* Active NMDA Voltage Plateaus (Glow spots) */}
						{[
							{ x: 55, y: 16 },
							{ x: 80, y: 14 },
							{ x: 110, y: 14 },
							{ x: 130, y: 18 },
						].map((pt, i) => (
							<circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#fde68a" filter={`url(#${P}-intense-glow)`} className="animate-pulse" />
						))}
						<text x="90" y="4" textAnchor="middle" fill="#fde68a" fontSize="7" fontFamily="monospace">
							dCaAP / NMDA PLATEAU (XOR BRANCH)
						</text>
					</g>
				</g>

				{/* Center: Interweaving Optical Fiber Photonic Bus & Tensor Core Systolic Array */}
				<g transform="translate(240, 50)" className={layerClass(4)}>
					<rect x="0" y="0" width="108" height="96" rx="8" fill="#082f49" stroke="#0ea5e9" strokeWidth="1.5" />
					<text x="54" y="14" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
						TENSOR CORE 8×8
					</text>
					{/* 4x4 mini-grid of systolic processing units */}
					<g transform="translate(18, 22)">
						{Array.from({ length: 16 }, (_, i) => {
							const col = i % 4;
							const row = Math.floor(i / 4);
							return (
								<rect
									key={i}
									x={col * 18}
									y={row * 16}
									width="14"
									height="12"
									rx="2"
									fill={active(5) ? '#0284c7' : '#0369a1'}
									stroke="#38bdf8"
									strokeWidth="1"
								/>
							);
						})}
					</g>
					{/* Photonic Waveguide lines connecting Dendrites to Systolic Array */}
					<path
						d="M -35 30 C -10 30, -10 40, 0 40"
						fill="none"
						stroke="#ec4899"
						strokeWidth="2.5"
						strokeDasharray="4 2"
						filter={`url(#${P}-glow)`}
					/>
					<path
						d="M -35 70 C -10 70, -10 60, 0 60"
						fill="none"
						stroke="#22d3ee"
						strokeWidth="2.5"
						strokeDasharray="4 2"
						filter={`url(#${P}-glow)`}
					/>
				</g>

				{/* Right: Pneumatic Evacuation Hatch & Shaft to Surface Campus */}
				<g transform="translate(376, 44)" className={layerClass(6)}>
					{/* Hatch Archway */}
					<rect x="0" y="0" width="124" height="136" rx="10" fill="#020617" stroke="#e2e8f0" strokeWidth="2" />
					{/* Yellow/Black Warning Hazard Stripes */}
					<line x1="0" y1="8" x2="124" y2="8" stroke="#eab308" strokeWidth="6" strokeDasharray="10 8" />
					<line x1="0" y1="128" x2="124" y2="128" stroke="#eab308" strokeWidth="6" strokeDasharray="10 8" />
					
					{/* Surface Shaft Interior (showing sunlight or green exit glow) */}
					<rect
						x="14"
						y="20"
						width="96"
						height="96"
						rx="6"
						fill={done ? '#064e3b' : '#0f172a'}
						stroke={done ? '#10b981' : '#334155'}
						strokeWidth="1.5"
					/>
					{/* Ascending Ladder / Elevator Rails */}
					<line x1="36" y1="20" x2="36" y2="116" stroke="#64748b" strokeWidth="2" />
					<line x1="88" y1="20" x2="88" y2="116" stroke="#64748b" strokeWidth="2" />
					{[35, 55, 75, 95].map((y) => (
						<line key={y} x1="36" y1={y} x2="88" y2={y} stroke="#64748b" strokeWidth="1.5" />
					))}

					{/* Emergency Surface Exit Arrow */}
					<g transform="translate(62, 54)">
						<polygon
							points="0,-16 -12,4 -4,4 -4,16 4,16 4,4 12,4"
							fill={done ? '#34d399' : '#64748b'}
							filter={done ? `url(#${P}-intense-glow)` : undefined}
							className={done ? 'animate-bounce' : ''}
						/>
						<text x="0" y="28" textAnchor="middle" fill={done ? '#6ee7b7' : '#94a3b8'} fontSize="8" fontWeight="bold">
							SURFACE EXIT
						</text>
					</g>
				</g>

				{/* Complete State: Fusion Synchronization Ring */}
				{done && (
					<g filter={`url(#${P}-intense-glow)`}>
						<rect x="130" y="152" width="300" height="26" rx="8" fill="#020617" stroke="#10b981" strokeWidth="2" />
						<text x="280" y="169" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold" letterSpacing="0.1em">
							BIO-DIGITAL HARMONY · EXTRACTION HATCH UNLOCKED
						</text>
					</g>
				)}
				{caption('JANUS Chimera Fusion & Surface Egress Open')}
			</g>
		);
	}

	return (
		<>
			{defs}
			{frame}
			{art}
		</>
	);
}

// ---------------------------------------------------------------------------
// SUBSTRATE OSCILLOSCOPE (Continuous Temporal Micro-Detail & Biophysical Waveforms)
// ---------------------------------------------------------------------------
function SubstrateOscilloscope({
	microDetail,
	phase,
	finalPhase,
}: Readonly<{
	microDetail: StepMicroDetail | null | undefined;
	phase: number;
	finalPhase: number;
}>) {
	if (!microDetail) return null;

	const membraneMv = microDetail.membranePotentialMv ?? (phase >= finalPhase ? -68 : -70 + phase * 18);
	const siliconEnergy = microDetail.siliconEnergyMicroJoules ?? (phase >= finalPhase ? 280 : 35 * (phase || 1));

	// Map membrane potential (-85mV to +45mV) to SVG Y coordinate (height 70, from Y=62 for -85mV to Y=10 for +45mV)
	const clampVm = Math.max(-85, Math.min(45, membraneMv));
	const normVm = (clampVm - -85) / (45 - -85);
	const currentY = 62 - normVm * 52;

	const isActionPotential = membraneMv > 0;
	const isThreshold = membraneMv >= -50 && membraneMv <= 0;

	return (
		<div className="rounded-2xl border border-fuchsia-400/30 bg-[radial-gradient(ellipse_at_top,rgba(112,26,117,0.25),rgba(15,23,42,0.6))] p-4 shadow-[0_8px_32px_rgba(217,70,239,0.12)]">
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-fuchsia-500/20 pb-2.5">
				<div className="flex items-center gap-2">
					<span className="size-2 rounded-full bg-fuchsia-400 animate-pulse" />
					<span className="font-mono text-[11px] font-bold uppercase tracking-wider text-fuchsia-300">
						Dual-Substrate Micro-Oscilloscope
					</span>
				</div>
				<div className="flex items-center gap-3 font-mono text-[10px]">
					<span className="text-emerald-400">
						PATCH CLAMP: <strong className="text-emerald-200">{membraneMv > 0 ? `+${membraneMv}` : membraneMv} mV</strong>
					</span>
					<span className="text-cyan-400">
						SILICON SYSTOLIC: <strong className="text-cyan-200">{siliconEnergy} µJ</strong>
					</span>
				</div>
			</div>

			{/* Continuous Temporal Scale & Dynamics */}
			<div className="mt-3 flex items-center justify-between text-[11px] font-mono">
				<span className="rounded-md bg-fuchsia-500/20 px-2 py-0.5 text-fuchsia-200 border border-fuchsia-400/30 font-semibold">
					{microDetail.timeScale}
				</span>
				<span className="text-slate-400 text-[10px]">
					{phase >= finalPhase ? 'Attractor Settled · Homeostatic Rest' : `Micro-Step ${phase} of ${finalPhase - 1}`}
				</span>
			</div>

			<p className="mt-2 text-xs italic text-fuchsia-100/90 leading-5">
				“{microDetail.sensoryExperience}”
			</p>

			{/* Dual Substrate Displays: Patch Clamp Trace (left) & Silicon Tensor Registers (right) */}
			<div className="mt-3 grid gap-3 sm:grid-cols-2">
				{/* Biology: Patch Clamp Trace */}
				<div className="rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-3">
					<div className="flex items-center justify-between text-[10px] font-mono text-emerald-300">
						<span className="font-bold flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-emerald-400" />
							PYRAMIDAL SOMA VOLTAGE
						</span>
						<span className={isActionPotential ? 'text-amber-300 font-bold animate-pulse' : isThreshold ? 'text-emerald-300' : 'text-emerald-400/70'}>
							{isActionPotential ? 'SPIKE DEPOLARIZATION' : isThreshold ? 'THRESHOLD EPSP' : 'RESTING STATE'}
						</span>
					</div>

					{/* SVG Oscilloscope Trace */}
					<div className="relative mt-2 h-16 w-full overflow-hidden rounded-lg bg-black/50 border border-emerald-500/20">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:16px_12px]" />
						
						{/* Threshold line (-50mV) */}
						<div className="absolute left-0 right-0 top-[38%] border-b border-dashed border-amber-400/40 text-[8px] font-mono text-amber-400/70 pl-1">
							-50mV Threshold
						</div>
						{/* Resting line (-70mV) */}
						<div className="absolute left-0 right-0 top-[72%] border-b border-emerald-400/20 text-[8px] font-mono text-emerald-400/50 pl-1">
							-70mV Rest
						</div>

						<svg className="relative h-full w-full" preserveAspectRatio="none" viewBox="0 0 200 70">
							<path
								d={
									membraneMv > 10
										? "M 10 52 Q 50 52 80 48 T 110 38 Q 130 10 145 12 Q 160 14 170 58 L 190 52"
										: membraneMv > -45
										? "M 10 52 Q 60 52 100 45 T 150 32 L 190 35"
										: membraneMv > -60
										? "M 10 52 Q 70 52 120 46 L 190 48"
										: "M 10 52 Q 80 52 140 52 L 190 52"
								}
								fill="none"
								stroke="#10b981"
								strokeWidth="2"
								className="drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
							/>
							<circle
								cx={phase >= finalPhase ? 190 : Math.min(185, 30 + phase * 32)}
								cy={currentY}
								r="4"
								fill={isActionPotential ? "#fbbf24" : "#34d399"}
								className={isActionPotential ? "animate-ping" : ""}
							/>
							<circle
								cx={phase >= finalPhase ? 190 : Math.min(185, 30 + phase * 32)}
								cy={currentY}
								r="3"
								fill="#ffffff"
							/>
						</svg>

						<div className="absolute bottom-1 right-2 font-mono text-[9px] text-emerald-300 font-bold">
							{membraneMv > 0 ? `+${membraneMv}` : membraneMv} mV
						</div>
					</div>

					<p className="mt-2 text-[11px] leading-4 text-emerald-100/90">
						{microDetail.biologyEvent}
					</p>
				</div>

				{/* Silicon: Systolic Array Register Bar */}
				<div className="rounded-xl border border-cyan-400/25 bg-cyan-950/20 p-3">
					<div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
						<span className="font-bold flex items-center gap-1.5">
							<span className="size-1.5 rounded-full bg-cyan-400" />
							FP32 REGISTER ENERGY
						</span>
						<span className="text-cyan-300/80">
							~10⁵× Biological ATP Asymmetry
						</span>
					</div>

					{/* Energy Bar and Clock Step Meter */}
					<div className="mt-2 h-16 w-full rounded-lg bg-black/50 border border-cyan-500/20 p-2 flex flex-col justify-between">
						<div className="flex items-center justify-between font-mono text-[9px] text-cyan-200">
							<span>ACCUMULATED ENERGY:</span>
							<span className="font-bold text-cyan-300">{siliconEnergy} µJ</span>
						</div>
						<div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-cyan-500/30">
							<div
								className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-fuchsia-400 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
								style={{ width: `${Math.min(100, Math.max(12, (siliconEnergy / 320) * 100))}%` }}
							/>
						</div>
						<div className="flex items-center justify-between font-mono text-[8px] text-slate-400">
							<span>BIOLOGICAL ATP EQUIV: ~0.003 µJ</span>
							<span className="text-cyan-400 font-bold">CLOCK 1.85 GHz</span>
						</div>
					</div>

					<p className="mt-2 text-[11px] leading-4 text-cyan-100/90">
						{microDetail.siliconEvent}
					</p>
				</div>
			</div>

			{/* Intervening In-Between Step Micro-Dynamic Note */}
			{microDetail.interveningDynamic && (
				<div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-950/15 p-2 text-[11px] text-amber-200/90 leading-4">
					<span className="shrink-0 text-amber-400 text-xs">⚡</span>
					<div className="min-w-0">
						<strong className="text-amber-300 font-mono text-[9px] uppercase tracking-wider block">
							In-Between Micro-Dynamic (Sub-Millisecond Physics):
						</strong>
						{microDetail.interveningDynamic}
					</div>
				</div>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// MISSION DOSSIER & CLASSIFIED ARCHIVE MODAL (Rich Lore, Audio Memos, Sector Map)
// ---------------------------------------------------------------------------
function MissionDossierModal({
	isOpen,
	onClose,
	currentChapterIndex,
	collectedPerks,
	hansTelemetry,
	heartRateDelta,
}: Readonly<{
	isOpen: boolean;
	onClose: () => void;
	currentChapterIndex: number;
	collectedPerks: FacilityPerk[];
	hansTelemetry: HansTelemetry;
	heartRateDelta: number;
}>) {
	const [activeTab, setActiveTab] = useState<'chronology' | 'audiologs' | 'sectormap' | 'personnel' | 'perks'>('chronology');
	const [selectedLogId, setSelectedLogId] = useState<string>(audioLogs[0]!.id);
	const [isPlayingLog, setIsPlayingLog] = useState(false);
	const [selectedSectorId, setSelectedSectorId] = useState<string>(facilitySectors[currentChapterIndex]?.id ?? facilitySectors[0]!.id);

	if (!isOpen) return null;

	const selectedLog = audioLogs.find((l) => l.id === selectedLogId) ?? audioLogs[0]!;
	const selectedSector = facilitySectors.find((s) => s.id === selectedSectorId) ?? facilitySectors[0]!;
	const effectiveHeartRate = Math.max(82, hansTelemetry.heartRate + heartRateDelta);

	const incidents = [
		{
			time: '02:13:00',
			phase: 'Phase 1 · Sub-Station Beta Arc Flash',
			severity: 'CRITICAL DISASTER',
			severityColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
			summary: 'Transformer explosion in Sub-Station Beta severs municipal 132kV feed. Emergency backup generators fail phase synchronization, plunging Sub-Levels 1 through 5 into darkness.',
			telemetry: 'Grid Voltage: 0.0 kV · Ambient Lux: 0.02 · Emergency Relays: Tripped',
		},
		{
			time: '02:15:30',
			phase: 'Phase 2 · Hermetic Containment Lockdown',
			severity: 'CONTAINMENT SEAL',
			severityColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
			summary: 'Autonomous security firmware misinterprets the transformer arc as a containment breach. Hydraulic blast gates seal Sub-Levels 4 and 5. Dr. Astrid Van Hoyt is trapped in Cryo-Bay 3; Dr. Hans Werner is cut off in Sector B.',
			telemetry: 'Pressure Seals: 100% Engaged · Perimeter Locks: Magnetic Hold Active',
		},
		{
			time: '02:22:15',
			phase: 'Phase 3 · Hybrid Wetware Bus Drift',
			severity: 'RUNAWAY FEEDBACK',
			severityColor: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10',
			summary: 'Secondary DC battery bank powers the neuromorphic silicon racks and biological organoid cultures. Unfiltered power ripples induce cross-talk, spawning the recursive feedback loop known as "The Night Signal".',
			telemetry: 'Bus Cross-Talk: +44 dB · Spiking Frequency: 480 Hz Synchronous',
		},
		{
			time: '02:35:40',
			phase: 'Phase 4 · Halon Suppression Arming',
			severity: 'LETHAL PURGE COUNTDOWN',
			severityColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
			summary: 'Excessive heat in Cabinet Row 2 triggers the emergency Halon 1301 fire suppression timer. A 45-minute countdown starts for total oxygen depletion in Cryo-Bay 3 and the Core Platform.',
			telemetry: 'Halon Reservoir: Armed · O₂ Depletion Buffer: 45 min · Extraction Window: Narrowing',
		},
		{
			time: '02:47:18',
			phase: 'Phase 5 · Executive Divergence Point',
			severity: 'CLIMACTIC RESOLUTION',
			severityColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
			summary: 'Core divergence hits 92%. Impulsive blunt power cut will trigger explosive inductive back-EMF. Surgical multi-variable isolation is the only mathematical escape route.',
			telemetry: 'Cascade Risk: 90% · Interlock State: 85% · Isolation Window: Immediate',
		},
	];

	function playSelectedLog(log: AudioLog) {
		sound.playAudioLogBeep();
		setSelectedLogId(log.id);
		setIsPlayingLog(true);
		setTimeout(() => setIsPlayingLog(false), 4500);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
			<div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-[radial-gradient(ellipse_at_top,#0c2333,#050f16)] shadow-[0_0_80px_rgba(6,182,212,0.35)]">
				{/* High-tech Header */}
				<div className="flex flex-wrap items-center justify-between border-b border-cyan-500/30 bg-slate-950/80 px-6 py-4">
					<div className="flex items-center gap-3">
						<span className="size-3 rounded-full bg-cyan-400 animate-ping" />
						<div>
							<div className="flex items-center gap-2">
								<span className="font-mono text-xs font-bold uppercase tracking-[.25em] text-cyan-300">
									PROJECT JANUS // CLASSIFIED ARCHIVE
								</span>
								<span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-300 border border-rose-400/30">
									LEVEL 5 EYES ONLY
								</span>
							</div>
							<h2 className="text-lg font-extrabold text-white tracking-tight sm:text-xl">
								Sub-Level 4 Incident Dossier & Facility Schematics
							</h2>
						</div>
					</div>

					<button
						type="button"
						onClick={() => {
							sound.playClick();
							onClose();
						}}
						className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
					>
						✕ Close Dossier
					</button>
				</div>

				{/* Dossier Tabs */}
				<div className="flex flex-wrap gap-1 border-b border-white/10 bg-black/40 px-6 py-2.5">
					{[
						['chronology', '⏱️ Incident Chronology'],
						['audiologs', '🎙️ Audio Logs (4)'],
						['sectormap', '🗺️ Sub-Level 4 Map'],
						['personnel', '👤 Personnel Files'],
						['perks', `🎖️ Perks & Vitals (${collectedPerks.length})`],
					].map(([tabKey, label]) => (
						<button
							key={tabKey}
							type="button"
							onClick={() => {
								sound.playClick();
								setActiveTab(tabKey as typeof activeTab);
							}}
							className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
								activeTab === tabKey
									? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
									: 'text-slate-400 hover:text-white hover:bg-white/5'
							}`}
						>
							{label}
						</button>
					))}
				</div>

				{/* Content Body */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
					{/* TAB 1: CHRONOLOGY */}
					{activeTab === 'chronology' && (
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b border-white/10 pb-2">
								<p className="text-xs font-mono uppercase tracking-wider text-cyan-300">
									Blackout & Divergence Timeline · 02:13:00 to 02:47:18
								</p>
								<span className="font-mono text-[10px] text-slate-400">Total Duration: 34m 18s</span>
							</div>

							<div className="space-y-3">
								{incidents.map((inc) => (
									<div
										key={inc.time}
										className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-cyan-400/30"
									>
										<div className="flex flex-wrap items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<span className="font-mono text-sm font-black text-cyan-300">{inc.time}</span>
												<span className="text-xs font-bold text-white">{inc.phase}</span>
											</div>
											<span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold border ${inc.severityColor}`}>
												{inc.severity}
											</span>
										</div>
										<p className="mt-2 text-xs leading-6 text-slate-200">
											{inc.summary}
										</p>
										<div className="mt-2 rounded-lg bg-black/40 px-3 py-1.5 font-mono text-[10px] text-slate-400 border border-white/5">
											{inc.telemetry}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* TAB 2: FIELD AUDIO LOGS */}
					{activeTab === 'audiologs' && (
						<div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
							{/* Left: Log Selector */}
							<div className="space-y-2">
								<p className="text-xs font-mono uppercase tracking-wider text-cyan-300 mb-2">
									Declassified Audio Memos
								</p>
								{audioLogs.map((log) => {
									const isSelected = log.id === selectedLogId;
									return (
										<button
											key={log.id}
											type="button"
											onClick={() => playSelectedLog(log)}
											className={`w-full rounded-2xl border p-3 text-left transition ${
												isSelected
													? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
													: 'border-white/10 bg-white/[0.02] hover:bg-white/5 text-slate-300'
											}`}
										>
											<div className="flex items-center justify-between text-[10px] font-mono">
												<span className="text-cyan-300 font-bold">{log.speaker}</span>
												<span className="text-slate-400">{log.duration}</span>
											</div>
											<p className="mt-1 text-xs font-bold text-white">{log.title}</p>
											<p className="mt-0.5 text-[10px] text-slate-400 font-mono">{log.timestamp}</p>
										</button>
									);
								})}
							</div>

							{/* Right: Audio Player & Transcript */}
							<div className="rounded-2xl border border-cyan-400/30 bg-slate-950/80 p-5 flex flex-col justify-between">
								<div>
									<div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
										<div>
											<span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
												{selectedLog.speaker} · {selectedLog.role}
											</span>
											<h3 className="mt-0.5 text-base font-extrabold text-white">{selectedLog.title}</h3>
										</div>
										<button
											type="button"
											onClick={() => playSelectedLog(selectedLog)}
											className="inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-500/20 px-3.5 py-1.5 text-xs font-bold text-cyan-100 hover:bg-cyan-500/30 shadow-[0_0_14px_rgba(6,182,212,0.4)]"
										>
											{isPlayingLog ? '🔊 Playing Audio' : '▶ Play Memo'}
										</button>
									</div>

									{/* Simulated Waveform Visualizer */}
									<div className="mt-4 flex h-10 items-center justify-between gap-1 rounded-xl bg-black/60 px-4 py-1 border border-cyan-500/20">
										{Array.from({ length: 28 }).map((_, barIdx) => (
											<div
												key={barIdx}
												className="w-1.5 rounded-full bg-cyan-400 transition-all duration-300"
												style={{
													height: isPlayingLog
														? `${Math.max(15, (Math.sin(barIdx * 0.7 + Date.now() / 150) * 0.5 + 0.5) * 85)}%`
														: `${Math.max(10, ((barIdx * 7) % 30) + 10)}%`,
													opacity: isPlayingLog ? 0.9 : 0.4,
												}}
											/>
										))}
									</div>

									{/* Full Transcript */}
									<div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
										<p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
											Archival Audio Transcript:
										</p>
										<p className="text-xs sm:text-sm italic leading-6 text-slate-200">
											{selectedLog.transcript}
										</p>
									</div>
								</div>

								{/* Scientific Field Note */}
								<div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-950/20 p-3 text-xs text-amber-200 leading-5">
									<strong className="text-amber-300 block font-mono text-[9px] uppercase tracking-wider mb-0.5">
										Scientific Significance / Field Note:
									</strong>
									{selectedLog.fieldNote}
								</div>
							</div>
						</div>
					)}

					{/* TAB 3: SECTOR MAP */}
					{activeTab === 'sectormap' && (
						<div className="space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
								<p className="text-xs font-mono uppercase tracking-wider text-cyan-300">
									Sub-Level 4 / Sub-Level 5 / Sub-Level 6 Schematic · 13 Sectors
								</p>
								<div className="flex items-center gap-3 font-mono text-[10px]">
									<span className="flex items-center gap-1.5 text-cyan-300">
										<span className="size-2 rounded-full bg-cyan-400 animate-ping" /> Current Sector
									</span>
									<span className="flex items-center gap-1.5 text-emerald-400">
										<span className="size-2 rounded-full bg-emerald-400" /> Cleared
									</span>
									<span className="flex items-center gap-1.5 text-rose-400">
										<span className="size-2 rounded-full bg-rose-400" /> Astrid Trapped (Cryo-Bay 3)
									</span>
								</div>
							</div>

							{/* Interactive SVG Blueprint Grid */}
							<div className="relative rounded-2xl border border-cyan-500/30 bg-black/70 p-3 sm:p-4 overflow-x-auto">
								<svg viewBox="0 0 940 160" className="w-full min-w-[840px]">
									{/* Conduit Lines between sectors */}
									<polyline
										points={facilitySectors.map((s) => `${s.coords.x},${s.coords.y}`).join(' ')}
										fill="none"
										stroke="rgba(34,211,238,0.3)"
										strokeWidth="3"
										strokeDasharray="4 4"
									/>

									{/* Sector Nodes */}
									{facilitySectors.map((sector, idx) => {
										const isCurrent = idx === currentChapterIndex;
										const isCleared = idx < currentChapterIndex;
										const isTarget = sector.number === 13;
										const isSelected = sector.id === selectedSectorId;

										return (
											<g
												key={sector.id}
												onClick={() => {
													sound.playClick();
													setSelectedSectorId(sector.id);
												}}
												className="cursor-pointer"
											>
												{/* Halo */}
												{(isCurrent || isSelected) && (
													<circle
														cx={sector.coords.x}
														cy={sector.coords.y}
														r={isSelected ? 22 : 18}
														fill={isTarget ? "rgba(244,63,94,0.2)" : "rgba(34,211,238,0.2)"}
														className="animate-pulse"
													/>
												)}

												{/* Node Circle */}
												<circle
													cx={sector.coords.x}
													cy={sector.coords.y}
													r={12}
													fill={
														isCurrent
															? "#22d3ee"
															: isTarget
															? "#f43f5e"
															: isCleared
															? "#10b981"
															: "#334155"
													}
													stroke={isSelected ? "#ffffff" : isCurrent ? "#67e8f9" : "rgba(255,255,255,0.2)"}
													strokeWidth={2}
												/>

												{/* Sector Number */}
												<text
													x={sector.coords.x}
													y={sector.coords.y + 4}
													textAnchor="middle"
													fill="#050f16"
													fontSize={10}
													fontWeight="900"
													fontFamily="monospace"
												>
													{sector.number}
												</text>

												{/* Node Label */}
												<text
													x={sector.coords.x}
													y={sector.coords.y + 24}
													textAnchor="middle"
													fill={isSelected ? "#ffffff" : "#94a3b8"}
													fontSize={8}
													fontFamily="monospace"
													fontWeight="bold"
												>
													{sector.name.split(' ')[0]} {sector.name.split(' ')[1]}
												</text>
											</g>
										);
									})}
								</svg>
							</div>

							{/* Selected Sector Details Card */}
							<div className="rounded-2xl border border-cyan-400/30 bg-slate-950/80 p-4">
								<div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
									<div>
										<span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
											Sector {selectedSector.number} Details
										</span>
										<h4 className="text-base font-extrabold text-white">{selectedSector.name}</h4>
									</div>
									<span className="rounded-full bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-200 border border-cyan-400/20">
										Domain: {selectedSector.domain}
									</span>
								</div>
								<p className="mt-3 text-xs sm:text-sm text-slate-200 leading-6">
									{selectedSector.description}
								</p>
							</div>
						</div>
					)}

					{/* TAB 4: PERSONNEL DOSSIERS */}
					{activeTab === 'personnel' && (
						<div className="grid gap-6 md:grid-cols-2">
							{/* Dr. Hans Werner */}
							<div className="rounded-2xl border border-cyan-400/30 bg-slate-950/80 p-5 space-y-4">
								<div className="flex items-center gap-3 border-b border-cyan-500/20 pb-3">
									<div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-xl font-black text-cyan-200">
										HW
									</div>
									<div>
										<span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
											Lead Neuromorphic Systems Architect
										</span>
										<h3 className="text-lg font-black text-white">Dr. Hans Werner</h3>
										<p className="text-[10px] font-mono text-slate-400">Clearance: Ultra-V (Sub-Level 5)</p>
									</div>
								</div>

								<div className="space-y-2 text-xs leading-5 text-slate-300">
									<p>
										<strong className="text-white">Neural Specialization:</strong> Spike-timing-dependent plasticity (STDP), dendritic computation, silicon systolic array tensor architectures.
									</p>
									<p>
										<strong className="text-white">Field Equipment:</strong> Handheld bi-directional oscilloscope, optical patch probe, emergency lithium headlamp.
									</p>
									<p>
										<strong className="text-white">Psychological Assessment:</strong> Acute hyper-vigilance post-blackout. High susceptibility to over-indexing on mathematical elegance rather than physical constraints.
									</p>
								</div>

								<div className="rounded-xl border border-cyan-500/20 bg-black/40 p-3 font-mono text-[10px] text-cyan-200">
									STATUS: Active in Sub-Level 4 · Real-Time HR: {effectiveHeartRate} BPM
								</div>
							</div>

							{/* Dr. Astrid Van Hoyt */}
							<div className="rounded-2xl border border-emerald-400/30 bg-slate-950/80 p-5 space-y-4">
								<div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
									<div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-xl font-black text-emerald-200">
										AV
									</div>
									<div>
										<span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
											Senior Sensory Neurobiologist
										</span>
										<h3 className="text-lg font-black text-white">Dr. Astrid Van Hoyt</h3>
										<p className="text-[10px] font-mono text-slate-400">Clearance: Ultra-V (Cryo & Organoids)</p>
									</div>
								</div>

								<div className="space-y-2 text-xs leading-5 text-slate-300">
									<p>
										<strong className="text-white">Neural Specialization:</strong> Cortical column microcircuits, GABAergic lateral inhibition, homeostatic synaptic scaling, sensory priors.
									</p>
									<p>
										<strong className="text-white">Field Equipment:</strong> Thermal foil blanket, portable diagnostic comms terminal, cryo-sample preservation kit.
									</p>
									<p>
										<strong className="text-white">Psychological Assessment:</strong> Exceptional cognitive resilience under environmental hypoxia. Grounded in wetware biological realism.
									</p>
								</div>

								<div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 font-mono text-[10px] text-rose-300">
									STATUS: Sealed in Cryo-Bay 3 · Halon Emergency Strobe Warbling
								</div>
							</div>
						</div>
					)}

					{/* TAB 5: PERKS & LIVE VITALS */}
					{activeTab === 'perks' && (
						<div className="space-y-6">
							{/* Live Vitals Breakdown */}
							<div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
								<p className="text-xs font-mono uppercase tracking-wider text-cyan-300 mb-3">
									Hans Werner · Physiological Telemetry Engine
								</p>
								<div className="grid gap-3 sm:grid-cols-4 font-mono text-center">
									<div className="rounded-xl border border-rose-400/20 bg-rose-950/20 p-3">
										<p className="text-[9px] uppercase text-rose-300">Effective Heart Rate</p>
										<p className="mt-1 text-2xl font-black text-white">{effectiveHeartRate} BPM</p>
										<p className="text-[8px] text-slate-400 mt-0.5">Base {hansTelemetry.heartRate} {heartRateDelta < 0 ? `(${heartRateDelta})` : ''}</p>
									</div>
									<div className="rounded-xl border border-amber-400/20 bg-amber-950/20 p-3">
										<p className="text-[9px] uppercase text-amber-300">Stress Hormone (Cortisol)</p>
										<p className="mt-1 text-sm font-bold text-white">
											{collectedPerks.length >= 3 ? 'Steely Focus' : hansTelemetry.cortisol}
										</p>
									</div>
									<div className="rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-3">
										<p className="text-[9px] uppercase text-cyan-300">Ambient Temperature</p>
										<p className="mt-1 text-lg font-bold text-white">{hansTelemetry.ambientTemp}</p>
									</div>
									<div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-950/20 p-3">
										<p className="text-[9px] uppercase text-fuchsia-300">Cognitive Bandwidth</p>
										<p className="mt-1 text-sm font-bold text-white">
											{collectedPerks.length * 15 + 65}% Max
										</p>
									</div>
								</div>
							</div>

							{/* Collected Tactical Perks Inventory */}
							<div className="space-y-3">
								<div className="flex items-center justify-between border-b border-white/10 pb-2">
									<p className="text-xs font-mono uppercase tracking-wider text-amber-300">
										Acquired In-Between Tactical Perks ({collectedPerks.length})
									</p>
									<span className="font-mono text-[10px] text-slate-400">
										Granted through between-chapter decisions
									</span>
								</div>

								{collectedPerks.length === 0 ? (
									<div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-400">
										No tactical perks acquired yet. Complete chapter simulations and make tactical choices during in-between passages to unlock persistent operational bonuses!
									</div>
								) : (
									<div className="grid gap-3 sm:grid-cols-2">
										{collectedPerks.map((perk) => (
											<div
												key={perk.id}
												className="rounded-2xl border border-amber-400/30 bg-amber-950/20 p-3.5"
											>
												<div className="flex items-center justify-between">
													<p className="text-xs font-bold text-white">{perk.title}</p>
													<span className="rounded-full bg-amber-400/20 px-2 py-0.5 font-mono text-[8px] font-bold text-amber-300">
														{perk.chapterUnlocked}
													</span>
												</div>
												<p className="mt-1 text-[11px] text-slate-300">{perk.description}</p>
												<span className="mt-2 block font-mono text-[10px] font-bold text-emerald-300">
													✓ {perk.bonus}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// INTERACTIVE PERCEPT CANVAS & STEP SCRUBBER
// ---------------------------------------------------------------------------
function PerceptCanvas({
	challenge,
	phase,
	onReplay,
	onAdvance,
	onStepChange,
	advanceLabel,
	idPrefix = 'p',
}: Readonly<{
	challenge: Challenge;
	phase: number;
	onReplay: () => void;
	onAdvance?: () => void;
	onStepChange: (step: number) => void;
	advanceLabel?: string;
	idPrefix?: string;
}>) {
	const outputs = outputsFor(challenge);
	const winner = outputs.indexOf(Math.max(...outputs));
	const finalPhase = challenge.input.length + 1;
	const activeCueIndex = phase > 0 && phase < finalPhase ? phase - 1 : -1;
	const currentMicroDetail: StepMicroDetail | null =
		activeCueIndex >= 0
			? (challenge.stepMicroDetails[activeCueIndex] ?? null)
			: phase >= finalPhase
			? challenge.settledMicroDetail
			: null;

	const status =
		phase === 0
			? 'Execute the simulation or scrub the continuous timeline to inspect micro-dynamics.'
			: phase < finalPhase
				? `Integration Phase ${phase}: ${challenge.perceptSteps[phase - 1]}`
				: `Perception Settled: Evidence converges decisively on “${challenge.outputLabels[winner]}”.`;

	return (
		<div className="mt-3 overflow-hidden rounded-2xl border border-cyan-500/25 bg-[radial-gradient(circle_at_50%_15%,rgba(34,211,238,0.12),transparent_60%),#040a0f] sm:rounded-[28px] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
			{/* Header with Title and Step Scrubber Controls */}
			<div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
				<div>
					<div className="flex items-center gap-2">
						<span className="size-2 rounded-full bg-fuchsia-400 animate-pulse" />
						<p className="text-[10px] font-bold uppercase tracking-[.25em] text-fuchsia-300">
							Emerging Percept Simulation & In-Between Stepper
						</p>
					</div>
					<h3 className="mt-1 text-xl font-extrabold text-white tracking-tight">{challenge.perceptTitle}</h3>
					<p className="mt-0.5 text-xs text-slate-300">{status}</p>
				</div>

				{/* Manual Step Scrubber Button Bar */}
				<div className="flex items-center gap-1.5 flex-wrap">
					<button
						type="button"
						disabled={phase <= 0}
						onClick={() => {
							sound.playClick();
							onStepChange(Math.max(0, phase - 1));
						}}
						className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-40"
						title="Step Backward"
					>
						◀ Prev
					</button>
					<button
						type="button"
						disabled={phase >= finalPhase}
						onClick={() => {
							sound.playClick();
							onStepChange(Math.min(finalPhase, phase + 1));
						}}
						className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20 disabled:opacity-40"
						title="Step Forward"
					>
						Next ▶
					</button>
					<button
						type="button"
						onClick={() => {
							sound.playClick();
							onReplay();
						}}
						className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
						title="Replay Full Sequence"
					>
						↺ Auto
					</button>
					{onAdvance && phase >= finalPhase && (
						<button
							type="button"
							onClick={() => {
								sound.playClick();
								onAdvance();
							}}
							className="glass-btn glass-btn--primary px-3 py-1 text-xs font-bold"
						>
							{advanceLabel ?? 'Next Chapter →'}
						</button>
					)}
				</div>
			</div>

			<div className="grid gap-3.5 p-3.5 lg:grid-cols-[1.25fr_.75fr] lg:items-start lg:gap-5 sm:p-6">
				{/* Left: SVG Canvas, Continuous Scrubber, and Dual-Substrate Oscilloscope */}
				<div className="space-y-3">
					<div
						className={`relative rounded-2xl transition-all duration-700 ${
							activeCueIndex >= 0
								? 'bg-fuchsia-500/[0.04] ring-1 ring-fuchsia-400/30 shadow-[0_0_40px_rgba(217,70,239,0.15)]'
								: 'bg-black/30'
						}`}
					>
						{activeCueIndex >= 0 && (
							<div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-slate-950/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[.15em] text-fuchsia-200 shadow-[0_0_16px_rgba(217,70,239,0.4)] animate-pulse">
								<span className="size-1.5 rounded-full bg-fuchsia-300" />
								Step {phase} · {challenge.inputLabels[activeCueIndex]}
							</div>
						)}
						<svg
							viewBox="0 0 560 225"
							className="w-full"
							role="img"
							aria-label={`Step-by-step teaching illustration: ${challenge.perceptTitle}`}
						>
							<PerceptScene challenge={challenge} phase={phase} idPrefix={`${idPrefix}-${challenge.id}`} />
						</svg>
					</div>

					{/* Continuous Temporal Micro-Scrubber Range Slider */}
					<div className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
						<div className="flex items-center justify-between font-mono text-[10px] text-slate-300">
							<span className="flex items-center gap-1.5 text-fuchsia-300 font-bold">
								<span className="size-1.5 rounded-full bg-fuchsia-400 animate-ping" />
								TEMPORAL MICRO-SCRUBBER
							</span>
							<span className="text-slate-400 font-bold">
								{phase === 0 ? 'T + 0ms (Standby)' : currentMicroDetail?.timeScale ?? `Step ${phase}`}
							</span>
						</div>
						<div className="mt-2.5 px-1">
							<input
								type="range"
								min={0}
								max={finalPhase}
								step={1}
								value={phase}
								onChange={(e) => {
									sound.playClick();
									onStepChange(Number(e.target.value));
								}}
								className="w-full accent-fuchsia-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
								aria-label="Continuous timeline scrubber"
							/>
							<div className="mt-1.5 flex justify-between font-mono text-[8px] text-slate-500">
								<span className={phase === 0 ? 'text-fuchsia-300 font-bold' : ''}>T+0ms</span>
								{challenge.stepMicroDetails.map((micro, idx) => (
									<span
										key={micro.timeScale}
										className={phase === idx + 1 ? 'text-fuchsia-300 font-bold' : ''}
									>
										{micro.timeScale.split('·')[0]?.trim()}
									</span>
								))}
								<span className={phase >= finalPhase ? 'text-amber-300 font-bold' : ''}>Settled</span>
							</div>
						</div>
					</div>

					{/* Dual-Substrate Biophysical & Silicon Micro-Detail Oscilloscope */}
					<SubstrateOscilloscope
						microDetail={currentMicroDetail}
						phase={phase}
						finalPhase={finalPhase}
					/>
				</div>

				{/* Right: Steps Timeline With Clickable Scrubbing */}
				<div className={`grid gap-2 lg:grid-cols-1 ${stepGridClass(challenge.perceptSteps.length)}`}>
					{challenge.perceptSteps.map((step, index) => {
						const stepNumber = index + 1;
						const complete = phase > stepNumber;
						const isActive = phase === stepNumber;
						return (
							<button
								key={step}
								type="button"
								onClick={() => {
									sound.playClick();
									onStepChange(stepNumber);
								}}
								className={`rounded-xl border p-2.5 text-left transition-all duration-300 ${
									isActive
										? 'border-fuchsia-400/70 bg-fuchsia-500/15 opacity-100 ring-2 ring-fuchsia-400/30 shadow-[0_0_24px_rgba(217,70,239,0.2)]'
										: complete
											? 'border-emerald-400/25 bg-emerald-500/5 opacity-75 hover:bg-emerald-500/10'
											: 'border-white/8 bg-white/[0.02] opacity-35 hover:opacity-60'
								}`}
							>
								<div className="flex items-start gap-2.5">
									<span
										className={`flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold ${
											isActive
												? 'bg-fuchsia-300 text-slate-950 shadow-[0_0_10px_rgba(217,70,239,0.6)]'
												: complete
													? 'bg-emerald-400/30 text-emerald-200'
													: 'bg-white/5 text-slate-500'
										}`}
									>
										{complete ? '✓' : stepNumber}
									</span>
									<div className="min-w-0">
										<p className={`truncate text-[10px] font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
											{challenge.inputLabels[index]}
										</p>
										<p className="mt-0.5 text-[9px] leading-4 text-slate-400 line-clamp-2">{step}</p>
									</div>
								</div>
							</button>
						);
					})}
					<button
						type="button"
						onClick={() => {
							sound.playClick();
							onStepChange(finalPhase);
						}}
						className={`rounded-xl border p-2.5 text-left transition-all duration-300 ${
							phase >= finalPhase
								? 'border-amber-400/60 bg-amber-400/15 ring-2 ring-amber-300/30 shadow-[0_0_24px_rgba(251,191,36,0.2)]'
								: 'border-white/8 bg-white/[0.02] opacity-40 hover:opacity-60'
						}`}
					>
						<div className="flex items-start gap-2.5">
							<span
								className={`flex size-5 shrink-0 items-center justify-center rounded-full font-bold text-[10px] ${
									phase >= finalPhase ? 'bg-amber-300 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'bg-white/5 text-slate-500'
								}`}
							>
								◎
							</span>
							<div>
								<p className={`text-[10px] font-semibold ${phase >= finalPhase ? 'text-amber-200' : 'text-slate-400'}`}>
									Invariant Percept Formed
								</p>
								<p className="mt-0.5 text-[9px] leading-4 text-slate-400">
									Disparate sensory inputs bind into a coherent recognition hypothesis.
								</p>
							</div>
						</div>
					</button>
				</div>
			</div>

			<div className="border-t border-white/8 px-4 py-2.5 text-[10px] leading-4 text-slate-400 sm:px-6">
				<strong className="text-cyan-300 font-semibold">Comparative Note:</strong> Neither deep neural networks nor mammalian cortex maintain an internal “projection screen”; perception is a distributed attractor dynamic coordinating perception and action.
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// EDUCATIONAL COMPARATIVE TABLES & REFERENCE CONSTANTS
// ---------------------------------------------------------------------------

const differences = [
	{
		number: '01',
		kicker: 'The resemblance is mathematical',
		title: 'Same abstraction. Different event.',
		ai: 'A stored scalar number is multiplied by weight parameters, accumulated in floating-point registers, and passed through an activation function like ReLU or GELU. The operation is synchronous and clock-scheduled.',
		brain:
			'Ions cross bilipid membranes through voltage-gated ion channels. Thousands of noisy excitatory and inhibitory post-synaptic currents change soma voltage dynamically until the axon hillock fires an all-or-none action potential.',
		verdict: 'Both compute weighted integration. Only the machine is literally computing matrix arithmetic.',
	},
	{
		number: '02',
		kicker: 'Time enters the picture',
		title: 'Clock cycles are not spike timing.',
		ai: 'Layers usually update in discrete forward passes. Training and inference are separate epochs; identical input tensors predictably generate identical activations.',
		brain:
			'Computation unfolds continuously in physical time. Spike timing, millisecond delays, neural oscillations (gamma/theta), refractory states, and neuromodulators constantly alter response dynamics.',
		verdict: 'A biological neuron is a living dynamical system, not a static mathematical activation function.',
	},
	{
		number: '03',
		kicker: 'Now the analogy breaks',
		title: 'Backpropagation is not long-term potentiation.',
		ai: 'Backpropagation uses automatic differentiation and the calculus chain rule to calculate how every parameter contributed to a global loss function, updating weights through an external optimizer (e.g. AdamW).',
		brain:
			'LTP and LTD depend on local pre- and post-synaptic spike coincidence, NMDA receptor calcium influx, retrograde messengers, and diffuse neuromodulators (dopamine/acetylcholine). Biological synapses have no global gradient ledger.',
		verdict: 'Both adapt connection efficacy, but their credit-assignment machinery is fundamentally distinct.',
	},
];

const factCards = [
	{
		tag: 'The Computational Unit',
		title: 'A single neuron is already a network',
		fact: 'Complex dendritic arbors execute local nonlinear processing. Compartmental biophysics allows a single pyramidal neuron to perform multi-stage nonlinear computations before signals ever reach the cell body.',
		use: 'Useful when someone claims an artificial neuron is a faithful 1-to-1 model of a biological neuron.',
	},
	{
		tag: 'The Synaptic Junction',
		title: 'A synapse is not a single stored scalar',
		fact: 'Synaptic efficacy depends on neurotransmitter vesicle pool depletion, receptor phosphorylation, recent firing history, and local astrocytic modulation.',
		use: 'The exact same presynaptic spike can exert completely different postsynaptic influence milliseconds later.',
	},
	{
		tag: 'The Dynamic Clock',
		title: 'Immediate history reshapes current processing',
		fact: 'Short-term synaptic plasticity alters connection strength dynamically over tens of milliseconds through facilitation and depression.',
		use: 'In biological cortex, inference and learning are inextricably intertwined, not segregated phases.',
	},
	{
		tag: 'Episodic Memory',
		title: 'Retrieval is reconstructive reconsolidation',
		fact: 'Activating a consolidated memory trace can render it temporarily labile before it is biochemically restabilized (reconsolidation), allowing updating.',
		use: 'Biological memory retrieval is an active, generative reconstruction—not a static read-only database lookup.',
	},
	{
		tag: 'Metabolic Constraint',
		title: 'Neural communication is energetically expensive',
		fact: 'Biophysical signaling accounts for ~80% of human brain energy consumption, driving evolution toward extremely sparse, energy-efficient population coding.',
		use: 'Compare whole embodied organisms and computing architectures; avoid simplistic watts-versus-watts comparisons.',
	},
	{
		tag: 'Credit Assignment',
		title: 'Biological credit assignment remains an open frontier',
		fact: 'Whether and how cortical microcircuits approximate gradient-based error propagation remains one of computational neuroscience’s most active research debates.',
		use: 'Both extreme positions (“brains definitely backprop” and “brains cannot use error signals”) overstate the empirical consensus.',
	},
] as const;

const timeScales = [
	{
		scale: 'milliseconds (10⁻³ s)',
		machine: 'One scheduled GPU kernel operation or layer tensor transfer',
		biology: 'Action potentials, synaptic delays, dendritic spikes, coincidence detection',
		anchor: 'Spike-timing-dependent plasticity (STDP) windows operate within ±20 ms intervals.',
	},
	{
		scale: 'seconds (10⁰ s)',
		machine: 'Autoregressive sequence window, recurrent hidden state, attention generation',
		biology: 'Short-term synaptic plasticity, working memory delay activity, neuromodulatory tone',
		anchor: 'Synaptic facilitation and depression dynamically alter circuit gains during continuous speech or motion.',
	},
	{
		scale: 'minutes → hours (10² - 10⁴ s)',
		machine: 'Training batch steps, checkpointing, loss evaluation',
		biology: 'Early-phase LTP/LTD induction, protein synthesis cascades, synaptic consolidation',
		anchor: 'Lasting biological memory requires de novo gene transcription, not variable assignment.',
	},
	{
		scale: 'days → years (10⁵ - 10⁸ s)',
		machine: 'Supervised fine-tuning, model retraining, checkpoint distillation',
		biology: 'Systems consolidation (hippocampal-cortical transfer), developmental pruning, homeostatic plasticity',
		anchor: 'Organisms must learn continuously throughout a lifetime without catastrophic forgetting.',
	},
] as const;

const cortexStages = [
	{ area: 'V1 (Primary Visual)', role: 'Local Oriented Edges', detail: 'Small Gabor-like receptive fields tuned to spatial orientation and spatial frequency.' },
	{ area: 'V2 (Secondary Visual)', role: 'Border Ownership & Texture', detail: 'Processes complex combinations of edges, figure-ground separation, and surface texture.' },
	{ area: 'V4 (Intermediate Form)', role: 'Curvature & Color Constancy', detail: 'Mid-level visual form, boundary curvature, and illumination-invariant color.' },
	{ area: 'IT (Inferotemporal)', role: 'Invariance & Object Identity', detail: 'High-level representations invariant to scale, position, and viewpoint.' },
] as const;

function DeepNetDiagram() {
	const layers = [4, 6, 6, 4, 3];
	const width = 480;
	const height = 220;
	const xFor = (i: number) => 48 + (i * (width - 96)) / (layers.length - 1);
	const yFor = (count: number, j: number) => {
		const gap = 28;
		const top = height / 2 - ((count - 1) * gap) / 2;
		return 24 + top + j * gap;
	};
	const nodes = layers.map((count, i) => Array.from({ length: count }, (_, j) => ({ x: xFor(i), y: yFor(count, j) })));
	const captions = ['pixels (x)', 'edges (W₁)', 'textures (W₂)', 'parts (W₃)', 'percept (ŷ)'];
	return (
		<svg
			viewBox={`0 0 ${width} ${height + 56}`}
			className="w-full"
			role="img"
			aria-label="A deep feedforward network stacking weight matrices from pixels to meaning"
		>
			{nodes
				.slice(0, -1)
				.flatMap((layer, i) =>
					layer.flatMap((a, ai) =>
						nodes[i + 1]!.map((b, bi) => (
							<line key={`e-${i}-${ai}-${bi}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#38bdf8" strokeOpacity={0.15} strokeWidth={0.8} />
						)),
					),
				)}
			{layers.slice(0, -1).map((_, i) => (
				<text key={`w-${i}`} x={(xFor(i) + xFor(i + 1)) / 2} y={20} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
					W{i + 1}
				</text>
			))}
			{nodes.flatMap((layer, i) =>
				layer.map((n, j) => <circle key={`n-${i}-${j}`} cx={n.x} cy={n.y} r={6.5} fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />),
			)}
			{layers.map((_, i) => (
				<text key={`c-${i}`} x={xFor(i)} y={height + 44} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
					{captions[i]}
				</text>
			))}
		</svg>
	);
}

// ---------------------------------------------------------------------------
// WACKY NEURON LAB & HYPER-MATRIX STUDIO
// ---------------------------------------------------------------------------

interface IzhikevichPreset {
	id: string;
	name: string;
	subname: string;
	a: number;
	b: number;
	c: number;
	d: number;
	I: number;
	description: string;
	biologicalAnalog: string;
}

const IZHIKEVICH_PRESETS: IzhikevichPreset[] = [
	{
		id: 'RS',
		name: 'Regular Spiking (RS)',
		subname: 'Cortical Pyramidal (Layer 2/3, 5)',
		a: 0.02,
		b: 0.2,
		c: -65,
		d: 8,
		I: 10,
		description: 'Fires with initial high frequency followed by spike-frequency adaptation under sustained DC injection.',
		biologicalAnalog: 'Excitatory neocortical pyramidal neurons in human sensory and motor cortex.',
	},
	{
		id: 'IB',
		name: 'Intrinsically Bursting (IB)',
		subname: 'Layer 5 Subcortical Projecting',
		a: 0.02,
		b: 0.2,
		c: -55,
		d: 4,
		I: 10,
		description: 'Fires an initial high-frequency burst of 3-5 action potentials, followed by repetitive tonic spiking.',
		biologicalAnalog: 'Deep Layer 5 pyramidal neurons projecting to the basal ganglia, colliculus, and spinal cord.',
	},
	{
		id: 'CH',
		name: 'Chattering (CH)',
		subname: 'Visual Cortex Fast Rhythmic',
		a: 0.02,
		b: 0.2,
		c: -50,
		d: 2,
		I: 10,
		description: 'Fires rhythmic high-frequency clusters of spikes (30-50 Hz inter-burst frequency) within the gamma band.',
		biologicalAnalog: 'Gray & McCormick (1996) chattering cells in visual cortex contributing to gamma synchrony.',
	},
	{
		id: 'FS',
		name: 'Fast Spiking (FS)',
		subname: 'Parvalbumin Basket Interneuron',
		a: 0.1,
		b: 0.2,
		c: -65,
		d: 2,
		I: 10,
		description: 'High-frequency non-adapting firing (up to 300+ Hz) with extraordinarily fast after-hyperpolarization.',
		biologicalAnalog: 'GABAergic parvalbumin-positive interneurons enforcing feedforward cortical inhibition.',
	},
	{
		id: 'TC',
		name: 'Thalamo-Cortical (TC)',
		subname: 'Thalamic Relay Burst Rebound',
		a: 0.02,
		b: 0.25,
		c: -65,
		d: 0.05,
		I: -2,
		description: 'At resting potential fires tonically, but upon release from inhibitory hyperpolarization produces a rebound burst.',
		biologicalAnalog: 'Thalamo-cortical relay cells in dorsal thalamus gating sensory transmission to cortex.',
	},
	{
		id: 'RZ',
		name: 'Resonator (RZ)',
		subname: 'Subthreshold Resonance & Oscillations',
		a: 0.1,
		b: 0.26,
		c: -65,
		d: 2,
		I: 2,
		description: 'Exhibits subthreshold damped oscillations and selective frequency tuning; only spikes when excited at resonance.',
		biologicalAnalog: 'Mesencephalic V neurons and stellate cells in entorhinal cortex layer II.',
	},
];

function IzhikevichLab() {
	const [selectedPresetId, setSelectedPresetId] = useState<string>('RS');
	const activePreset = IZHIKEVICH_PRESETS.find((p) => p.id === selectedPresetId) ?? IZHIKEVICH_PRESETS[0]!;
	const [a, setA] = useState<number>(activePreset.a);
	const [b, setB] = useState<number>(activePreset.b);
	const [c, setC] = useState<number>(activePreset.c);
	const [d, setD] = useState<number>(activePreset.d);
	const [current, setCurrent] = useState<number>(activePreset.I);

	function applyPreset(preset: IzhikevichPreset) {
		sound.playClick();
		setSelectedPresetId(preset.id);
		setA(preset.a);
		setB(preset.b);
		setC(preset.c);
		setD(preset.d);
		setCurrent(preset.I);
	}

	// 200 ms simulation with Euler method (dt = 0.5 ms -> 400 steps)
	const simulation = useMemo(() => {
		const dt = 0.5;
		const totalSteps = 400;
		let v = c;
		let u = b * v;
		const points: Array<{ t: number; v: number; u: number }> = [];
		const spikeTimes: number[] = [];

		for (let step = 0; step < totalSteps; step++) {
			const t = step * dt;
			// Injection current pulse active between 20ms and 180ms
			const inj = t >= 20 && t <= 180 ? current : 0;

			// dv/dt = 0.04*v^2 + 5*v + 140 - u + I
			const dv = (0.04 * v * v + 5 * v + 140 - u + inj) * dt;
			// du/dt = a*(b*v - u)
			const du = a * (b * v - u) * dt;

			v += dv;
			u += du;

			if (v >= 30) {
				spikeTimes.push(t);
				points.push({ t, v: 30, u });
				v = c;
				u += d;
			} else {
				points.push({ t, v, u });
			}
		}

		// Calculate metrics
		const durationSec = (180 - 20) / 1000;
		const spikesDuringPulse = spikeTimes.filter((st) => st >= 20 && st <= 180).length;
		const firingRateHz = durationSec > 0 ? Math.round(spikesDuringPulse / durationSec) : 0;
		
		let meanIsi = 0;
		if (spikeTimes.length >= 2) {
			let totalIsi = 0;
			for (let i = 1; i < spikeTimes.length; i++) {
				totalIsi += spikeTimes[i]! - spikeTimes[i - 1]!;
			}
			meanIsi = Math.round(totalIsi / (spikeTimes.length - 1));
		}

		return { points, spikeCount: spikeTimes.length, firingRateHz, meanIsi };
	}, [a, b, c, d, current]);

	// Convert points to SVG polyline coordinates for v(t)
	// SVG width = 420, height = 140. t: 0..200 -> x: 10..410; v: -85..35 -> y: 130..15
	const vPolyline = useMemo(() => {
		return simulation.points
			.map((pt) => {
				const x = 10 + (pt.t / 200) * 400;
				const clampedV = Math.max(-85, Math.min(35, pt.v));
				const y = 130 - ((clampedV - -85) / 120) * 115;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}, [simulation.points]);

	// Convert points to SVG polyline coordinates for u(t)
	const uPolyline = useMemo(() => {
		const minU = -20;
		const maxU = 40;
		return simulation.points
			.map((pt) => {
				const x = 10 + (pt.t / 200) * 400;
				const clampedU = Math.max(minU, Math.min(maxU, pt.u));
				const y = 130 - ((clampedU - minU) / (maxU - minU)) * 115;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}, [simulation.points]);

	// Phase-plane trajectory (v on X: -85..35 -> 10..190, u on Y: -20..40 -> 130..15)
	const phasePlanePolyline = useMemo(() => {
		return simulation.points
			.slice(40) // Skip initial transient
			.map((pt) => {
				const clampedV = Math.max(-85, Math.min(35, pt.v));
				const x = 10 + ((clampedV - -85) / 120) * 180;
				const clampedU = Math.max(-20, Math.min(40, pt.u));
				const y = 130 - ((clampedU - -20) / 60) * 115;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}, [simulation.points]);

	return (
		<div className="space-y-6">
			{/* Preset Selector Badges */}
			<div>
				<p className="text-xs font-mono uppercase tracking-wider text-amber-300 mb-2.5">
					Select Wacky Neuron Dynamical Mode (Izhikevich Model):
				</p>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
					{IZHIKEVICH_PRESETS.map((preset) => {
						const isSelected = preset.id === selectedPresetId;
						return (
							<button
								key={preset.id}
								type="button"
								onClick={() => applyPreset(preset)}
								className={`rounded-xl border p-2.5 text-left transition-all duration-300 ${
									isSelected
										? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/50 shadow-[0_0_16px_rgba(251,191,36,0.3)] scale-[1.02]'
										: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
								}`}
							>
								<div className="flex items-center justify-between">
									<span className="font-mono text-xs font-bold text-amber-300">{preset.id}</span>
									{isSelected && <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />}
								</div>
								<p className="mt-1 text-[11px] font-semibold truncate text-slate-100">{preset.name.split('(')[0]}</p>
								<p className="text-[9px] text-slate-400 truncate">{preset.subname}</p>
							</button>
						);
					})}
				</div>
			</div>

			{/* Active Preset Lore Card */}
			<div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4 text-xs leading-relaxed text-amber-100/90 shadow-lg">
				<div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-2 font-mono text-[11px]">
					<span className="font-bold text-amber-300">BIOLOGICAL SUBSTRATE: {activePreset.subname}</span>
					<span className="text-slate-400">a={a} · b={b} · c={c}mV · d={d}</span>
				</div>
				<p>{activePreset.description}</p>
				<p className="mt-1 text-[11px] text-amber-200/70 italic">🔬 In-Vivo Correlate: {activePreset.biologicalAnalog}</p>
			</div>

			{/* Visual Simulation Display: Waveform (left) & Phase Plane (right) */}
			<div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
				{/* Membrane Voltage v(t) & Recovery u(t) Oscilloscope */}
				<div className="rounded-2xl border border-cyan-500/30 bg-black/80 p-4 shadow-xl">
					<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
						<div className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
							<span className="text-xs font-mono font-bold text-cyan-200 uppercase tracking-wider">
								Membrane Voltage v(t) & Recovery Variable u(t)
							</span>
						</div>
						<div className="flex items-center gap-3 font-mono text-[10px]">
							<span className="text-emerald-400">● v(t) Voltage [mV]</span>
							<span className="text-fuchsia-400">● u(t) Recovery</span>
						</div>
					</div>

					<div className="relative h-44 w-full">
						{/* Background grid lines */}
						<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:28px_22px]" />
						
						{/* Reference voltage guides */}
						<div className="absolute left-1 top-[14%] font-mono text-[8px] text-amber-400/80">+30 mV Spike Peak</div>
						<div className="absolute left-1 top-[48%] font-mono text-[8px] text-slate-500">-50 mV Threshold</div>
						<div className="absolute left-1 top-[78%] font-mono text-[8px] text-cyan-400/60">-65 mV Rest (c)</div>

						<svg viewBox="0 0 420 140" className="relative h-full w-full" preserveAspectRatio="none">
							{/* Current injection pulse shaded window */}
							<rect x={10 + (20 / 200) * 400} y="10" width={(160 / 200) * 400} height="120" fill="rgba(245,158,11,0.08)" />
							<line x1={10 + (20 / 200) * 400} y1="10" x2={10 + (20 / 200) * 400} y2="130" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
							<line x1={10 + (180 / 200) * 400} y1="10" x2={10 + (180 / 200) * 400} y2="130" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />

							{/* Zero and Threshold Lines */}
							<line x1="10" y1="40" x2="410" y2="40" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
							<line x1="10" y1="105" x2="410" y2="105" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.3" />

							{/* u(t) Recovery trace */}
							<polyline points={uPolyline} fill="none" stroke="#d946ef" strokeWidth="1.5" opacity="0.75" />

							{/* v(t) Voltage trace */}
							<polyline points={vPolyline} fill="none" stroke="#10b981" strokeWidth="2.2" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
						</svg>
					</div>

					<div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-400 border-t border-white/5 pt-2">
						<span>0 ms</span>
						<span className="text-amber-300 font-bold">DC Step Current: {current} pA (20ms → 180ms)</span>
						<span>200 ms</span>
					</div>
				</div>

				{/* 2D Phase Plane (v, u) with Nullclines */}
				<div className="rounded-2xl border border-fuchsia-500/30 bg-black/80 p-4 shadow-xl">
					<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
						<div className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-fuchsia-400 animate-pulse" />
							<span className="text-xs font-mono font-bold text-fuchsia-200 uppercase tracking-wider">
								(v, u) Phase Plane Portrait
							</span>
						</div>
						<span className="font-mono text-[9px] text-fuchsia-300/80">LIMIT CYCLE</span>
					</div>

					<div className="relative h-44 w-full">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(217,70,239,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(217,70,239,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
						
						<svg viewBox="0 0 200 140" className="relative h-full w-full" preserveAspectRatio="none">
							{/* Phase Plane Axes */}
							<line x1="10" y1="130" x2="190" y2="130" stroke="#475569" strokeWidth="1" />
							<line x1="10" y1="130" x2="10" y2="10" stroke="#475569" strokeWidth="1" />

							{/* u-nullcline: u = b*v */}
							<line
								x1="10"
								y1={130 - ((b * -85 - -20) / 60) * 115}
								x2="190"
								y2={130 - ((b * 35 - -20) / 60) * 115}
								stroke="#38bdf8"
								strokeWidth="1.5"
								strokeDasharray="4 3"
								opacity="0.8"
							/>

							{/* Orbit trajectory */}
							<polyline points={phasePlanePolyline} fill="none" stroke="#f43f5e" strokeWidth="1.8" className="drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
						</svg>
					</div>

					<div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-400 border-t border-white/5 pt-2">
						<span className="text-cyan-400">--- u-nullcline (u=bv)</span>
						<span className="text-rose-400 font-bold">— Orbit Limit Cycle</span>
					</div>
				</div>
			</div>

			{/* Real-time Firing Telemetry Metrics */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div className="rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Firing Frequency</p>
					<p className="mt-1 font-mono text-2xl font-black text-emerald-300">{simulation.firingRateHz} Hz</p>
					<p className="text-[9px] text-emerald-400/60 font-mono mt-0.5">{simulation.spikeCount} Spikes Fired</p>
				</div>
				<div className="rounded-xl border border-cyan-400/25 bg-cyan-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Mean ISI</p>
					<p className="mt-1 font-mono text-2xl font-black text-cyan-300">{simulation.meanIsi} ms</p>
					<p className="text-[9px] text-cyan-400/60 font-mono mt-0.5">Inter-Spike Interval</p>
				</div>
				<div className="rounded-xl border border-amber-400/25 bg-amber-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Reset Potential (c)</p>
					<p className="mt-1 font-mono text-2xl font-black text-amber-300">{c} mV</p>
					<p className="text-[9px] text-amber-400/60 font-mono mt-0.5">Fast Repolarization</p>
				</div>
				<div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Recovery Jump (d)</p>
					<p className="mt-1 font-mono text-2xl font-black text-fuchsia-300">{d}</p>
					<p className="text-[9px] text-fuchsia-400/60 font-mono mt-0.5">Potassium Adaptation</p>
				</div>
			</div>

			{/* Interactive Parameter Sliders */}
			<div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
				<p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">
					Direct Parameter Modulators (Euler Integrator: dv/dt & du/dt):
				</p>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">a (Recovery timescale):</span>
							<span className="text-cyan-300 font-mono">{a.toFixed(3)}</span>
						</div>
						<input
							type="range"
							min="0.01"
							max="0.15"
							step="0.005"
							value={a}
							onChange={(e) => setA(Number(e.target.value))}
							className="w-full accent-cyan-400"
						/>
					</div>

					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">b (Subthreshold sensitivity):</span>
							<span className="text-cyan-300 font-mono">{b.toFixed(2)}</span>
						</div>
						<input
							type="range"
							min="0.1"
							max="0.3"
							step="0.01"
							value={b}
							onChange={(e) => setB(Number(e.target.value))}
							className="w-full accent-cyan-400"
						/>
					</div>

					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">c (After-spike reset v):</span>
							<span className="text-amber-300 font-mono">{c} mV</span>
						</div>
						<input
							type="range"
							min="-70"
							max="-45"
							step="1"
							value={c}
							onChange={(e) => setC(Number(e.target.value))}
							className="w-full accent-amber-400"
						/>
					</div>

					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">d (After-spike reset u):</span>
							<span className="text-fuchsia-300 font-mono">{d.toFixed(1)}</span>
						</div>
						<input
							type="range"
							min="0"
							max="10"
							step="0.5"
							value={d}
							onChange={(e) => setD(Number(e.target.value))}
							className="w-full accent-fuchsia-400"
						/>
					</div>

					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">I (Injection Current):</span>
							<span className="text-emerald-300 font-mono">{current} pA</span>
						</div>
						<input
							type="range"
							min="-5"
							max="30"
							step="1"
							value={current}
							onChange={(e) => setCurrent(Number(e.target.value))}
							className="w-full accent-emerald-400"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function DendriticXorLab() {
	const [branchA, setBranchA] = useState<number>(1);
	const [branchB, setBranchB] = useState<number>(1);
	const [mode, setMode] = useState<'dCaAP' | 'linear'>('dCaAP');

	const inputSum = branchA + branchB;

	// In Gidon et al. 2020:
	// Passive linear summation: V = -70 + 45 * s (crosses threshold at s >= 1)
	// dCaAP active dendritic calcium: non-monotonic curve with maximum at s = 1 and inactivation at s = 2
	const dendriticVoltageMv = useMemo(() => {
		if (mode === 'linear') {
			return Math.round(-70 + 45 * inputSum);
		}
		// dCaAP: V = -70 + 72 * s * exp(-0.95 * s^1.85)
		if (inputSum <= 0.05) return -70;
		const peakDepolarization = 72 * inputSum * Math.exp(-0.95 * Math.pow(inputSum, 1.85));
		return Math.round(-70 + peakDepolarization);
	}, [inputSum, mode]);

	const somaticThreshold = mode === 'dCaAP' ? -48 : -35;
	const somaticSpike = dendriticVoltageMv >= somaticThreshold;

	// Truth table rows
	const truthTable = [
		{ a: 0, b: 0, sum: 0, expectedXor: 0 },
		{ a: 1, b: 0, sum: 1, expectedXor: 1 },
		{ a: 0, b: 1, sum: 1, expectedXor: 1 },
		{ a: 1, b: 1, sum: 2, expectedXor: 0 },
	];

	return (
		<div className="space-y-6">
			{/* Mechanism Toggle */}
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
				<div>
					<h3 className="text-base font-bold text-white tracking-tight sm:text-lg">
						Single-Neuron 2-Layer Dendritic XOR Computer
					</h3>
					<p className="text-xs text-slate-400">
						Discovered by Gidon et al. (Science 2020): Human cortical pyramidal apical dendrites compute XOR natively!
					</p>
				</div>
				<div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/80 p-1">
					<button
						type="button"
						onClick={() => { sound.playClick(); setMode('dCaAP'); }}
						className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
							mode === 'dCaAP'
								? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
								: 'text-slate-400 hover:text-white'
						}`}
					>
						⚡ Biological dCaAP (XOR)
					</button>
					<button
						type="button"
						onClick={() => { sound.playClick(); setMode('linear'); }}
						className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
							mode === 'linear'
								? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
								: 'text-slate-400 hover:text-white'
						}`}
					>
						📐 Classical Linear (Perceptron)
					</button>
				</div>
			</div>

			{/* Interactive Pyramidal Neuron SVG Diagram (left) & Non-Monotonic Curve (right) */}
			<div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
				{/* Human Pyramidal Neuron Compartments */}
				<div className="rounded-2xl border border-emerald-500/30 bg-black/80 p-4 shadow-xl relative overflow-hidden">
					<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 font-mono text-[10px]">
						<span className="font-bold text-emerald-300">HUMAN LAYER 2/3 PYRAMIDAL SOMA & TUFT</span>
						<span className={somaticSpike ? 'text-amber-300 font-bold animate-pulse' : 'text-slate-400'}>
							{somaticSpike ? '⚡ SOMATIC ACTION POTENTIAL' : '○ SUBTHRESHOLD QUIESCENT'}
						</span>
					</div>

					<svg viewBox="0 0 380 240" className="w-full">
						<defs>
							<radialGradient id="ca-glow" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
								<stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
							</radialGradient>
						</defs>

						{/* Apical Tuft Branch A (Left) */}
						<path
							d="M 190 80 Q 130 50 80 40"
							fill="none"
							stroke={branchA > 0.5 ? '#38bdf8' : '#334155'}
							strokeWidth={branchA > 0.5 ? 4 : 2}
							className="transition-all duration-300"
						/>
						{/* Branch A Terminal Electrode */}
						<circle cx="80" cy="40" r="14" fill="#082f49" stroke={branchA > 0.5 ? '#38bdf8' : '#475569'} strokeWidth="2" />
						<text x="80" y="44" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">A: {branchA}</text>

						{/* Apical Tuft Branch B (Right) */}
						<path
							d="M 190 80 Q 250 50 300 40"
							fill="none"
							stroke={branchB > 0.5 ? '#38bdf8' : '#334155'}
							strokeWidth={branchB > 0.5 ? 4 : 2}
							className="transition-all duration-300"
						/>
						{/* Branch B Terminal Electrode */}
						<circle cx="300" cy="40" r="14" fill="#082f49" stroke={branchB > 0.5 ? '#38bdf8' : '#475569'} strokeWidth="2" />
						<text x="300" y="44" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">B: {branchB}</text>

						{/* Branch Junction Hot-Spot (Site of dCaAP Calcium Channel Inactivation) */}
						<circle
							cx="190"
							cy="80"
							r={mode === 'dCaAP' && inputSum === 1 ? 20 : 12}
							fill={mode === 'dCaAP' && inputSum === 1 ? '#f59e0b' : mode === 'linear' && inputSum >= 1 ? '#38bdf8' : '#1e293b'}
							fillOpacity="0.4"
							stroke={mode === 'dCaAP' && inputSum === 1 ? '#fbbf24' : '#64748b'}
							strokeWidth="2"
							className={mode === 'dCaAP' && inputSum === 1 ? 'animate-ping' : ''}
						/>
						<circle cx="190" cy="80" r="10" fill="#020617" stroke="#94a3b8" strokeWidth="1.5" />
						<text x="190" y="70" textAnchor="middle" fill="#fde68a" fontSize="8" fontFamily="monospace">
							dCaAP HOTSPOT
						</text>

						{/* Thick Apical Trunk */}
						<line
							x1="190"
							y1="80"
							x2="190"
							y2="160"
							stroke={dendriticVoltageMv > -55 ? '#fbbf24' : '#334155'}
							strokeWidth={dendriticVoltageMv > -55 ? 5 : 3}
							className="transition-all duration-300"
						/>

						{/* Pyramidal Soma */}
						<polygon
							points="190,160 160,205 220,205"
							fill={somaticSpike ? '#78350f' : '#0f172a'}
							stroke={somaticSpike ? '#fbbf24' : '#334155'}
							strokeWidth={somaticSpike ? 3 : 1.5}
							className="transition-all duration-300"
						/>
						<text x="190" y="195" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
							SOMA
						</text>

						{/* Basal Dendrites */}
						<line x1="160" y1="205" x2="120" y2="230" stroke="#475569" strokeWidth="2" />
						<line x1="175" y1="205" x2="150" y2="235" stroke="#475569" strokeWidth="2" />
						<line x1="205" y1="205" x2="230" y2="235" stroke="#475569" strokeWidth="2" />
						<line x1="220" y1="205" x2="260" y2="230" stroke="#475569" strokeWidth="2" />

						{/* Axon Hillock with Action Potential Spike Output */}
						<line x1="190" y1="205" x2="190" y2="238" stroke={somaticSpike ? '#f59e0b' : '#334155'} strokeWidth={somaticSpike ? 4 : 2} />
						{somaticSpike && (
							<g>
								<circle cx="190" cy="236" r="6" fill="#fde68a" className="animate-ping" />
								<text x="210" y="238" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
									1 (SPIKE)
								</text>
							</g>
						)}
						{!somaticSpike && (
							<text x="210" y="238" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">
								0 (SILENT)
							</text>
						)}
					</svg>

					{/* Voltage Readout Bar */}
					<div className="mt-2 flex items-center justify-between font-mono text-[11px] bg-slate-950/80 rounded-xl p-2.5 border border-white/10">
						<span className="text-slate-300">Dendritic Potential: <strong className={dendriticVoltageMv > -50 ? 'text-amber-300' : 'text-cyan-300'}>{dendriticVoltageMv} mV</strong></span>
						<span className="text-slate-400">Soma Threshold: {somaticThreshold} mV</span>
						<span className={somaticSpike ? 'text-amber-300 font-bold' : 'text-slate-500 font-bold'}>
							OUTPUT = {somaticSpike ? '1 (TRUE)' : '0 (FALSE)'}
						</span>
					</div>
				</div>

				{/* Non-Monotonic Activation Curve Plot & Truth Table */}
				<div className="space-y-4">
					{/* Curve Plot */}
					<div className="rounded-2xl border border-amber-500/30 bg-black/80 p-4 shadow-xl">
						<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 font-mono text-[10px]">
							<span className="font-bold text-amber-300">
								{mode === 'dCaAP' ? 'NON-MONOTONIC dCaAP INVERSE-U' : 'MONOTONIC LINEAR ACTIVATION'}
							</span>
							<span className="text-slate-400">V_dend vs (A + B)</span>
						</div>

						<div className="relative h-32 w-full">
							<svg viewBox="0 0 240 100" className="w-full h-full" preserveAspectRatio="none">
								{/* Axes */}
								<line x1="20" y1="90" x2="230" y2="90" stroke="#334155" strokeWidth="1" />
								<line x1="20" y1="90" x2="20" y2="10" stroke="#334155" strokeWidth="1" />

								{/* Threshold Line (-48mV -> y=45) */}
								<line x1="20" y1="45" x2="230" y2="45" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
								<text x="25" y="40" fill="#f59e0b" fontSize="7" fontFamily="monospace">Spike Threshold (-48mV)</text>

								{/* Activation Curve */}
								{mode === 'dCaAP' ? (
									// Peak at s=1 (x=120, y=30), falling back at s=2 (x=220, y=80)
									<path
										d="M 20 90 Q 70 85 100 45 Q 120 25 140 45 Q 180 85 220 86"
										fill="none"
										stroke="#10b981"
										strokeWidth="2.5"
									/>
								) : (
									// Linear line crossing threshold and staying high
									<line x1="20" y1="90" x2="220" y2="20" stroke="#38bdf8" strokeWidth="2.5" />
								)}

								{/* Current Operating Point Marker */}
								<circle
									cx={20 + (inputSum / 2) * 200}
									cy={
										mode === 'dCaAP'
											? inputSum <= 0.05
												? 90
												: inputSum <= 1
												? 90 - inputSum * 62
												: 28 + (inputSum - 1) * 58
											: 90 - (inputSum / 2) * 70
									}
									r="6"
									fill="#fbbf24"
									className="animate-ping"
								/>
								<circle
									cx={20 + (inputSum / 2) * 200}
									cy={
										mode === 'dCaAP'
											? inputSum <= 0.05
												? 90
												: inputSum <= 1
												? 90 - inputSum * 62
												: 28 + (inputSum - 1) * 58
											: 90 - (inputSum / 2) * 70
									}
									r="4"
									fill="#ffffff"
								/>
							</svg>
						</div>

						<div className="flex justify-between font-mono text-[9px] text-slate-400 mt-1">
							<span>Input Sum: 0 (A=0, B=0)</span>
							<span className="text-amber-300 font-bold">Sum: 1 (A=1, B=0)</span>
							<span>Sum: 2 (A=1, B=1)</span>
						</div>
					</div>

					{/* XOR Truth Table Interactive Checker */}
					<div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
						<p className="font-mono text-[10px] uppercase font-bold text-slate-300 mb-2">
							XOR Truth Table Status ({mode === 'dCaAP' ? '100% Solved' : 'Perceptron Failure'}):
						</p>
						<div className="space-y-1.5 font-mono text-xs">
							{truthTable.map((row) => {
								const isCurrent = Math.round(branchA) === row.a && Math.round(branchB) === row.b;
								const actualOutput = mode === 'dCaAP' ? row.expectedXor : (row.sum >= 1 ? 1 : 0);
								const matchesXor = actualOutput === row.expectedXor;

								return (
									<div
										key={`${row.a}-${row.b}`}
										className={`flex items-center justify-between rounded-lg px-3 py-1.5 transition-all ${
											isCurrent
												? 'bg-amber-400/25 border border-amber-400 text-white font-bold shadow-[0_0_12px_rgba(251,191,36,0.25)]'
												: 'bg-white/5 text-slate-300'
										}`}
									>
										<span>Input [{row.a}, {row.b}]</span>
										<span>Sum = {row.sum}</span>
										<span className={actualOutput === 1 ? 'text-amber-300 font-bold' : 'text-slate-400'}>
											Soma: {actualOutput}
										</span>
										<span className={matchesXor ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
											{matchesXor ? '✓ XOR MATCH' : '✗ FAILS XOR'}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Interactive Input Sliders & Quick Toggles */}
			<div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
				<div>
					<div className="flex items-center justify-between mb-1.5">
						<span className="font-mono text-xs font-bold text-cyan-300">Branch A Synaptic Input:</span>
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={() => { sound.playClick(); setBranchA(0); }}
								className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${branchA === 0 ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-400'}`}
							>
								0
							</button>
							<button
								type="button"
								onClick={() => { sound.playClick(); setBranchA(1); }}
								className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${branchA === 1 ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-400'}`}
							>
								1
							</button>
							<span className="font-mono text-xs text-cyan-200">{branchA.toFixed(2)}</span>
						</div>
					</div>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						value={branchA}
						onChange={(e) => setBranchA(Number(e.target.value))}
						className="w-full accent-cyan-400"
					/>
				</div>

				<div>
					<div className="flex items-center justify-between mb-1.5">
						<span className="font-mono text-xs font-bold text-violet-300">Branch B Synaptic Input:</span>
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={() => { sound.playClick(); setBranchB(0); }}
								className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${branchB === 0 ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-400'}`}
							>
								0
							</button>
							<button
								type="button"
								onClick={() => { sound.playClick(); setBranchB(1); }}
								className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${branchB === 1 ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-400'}`}
							>
								1
							</button>
							<span className="font-mono text-xs text-violet-200">{branchB.toFixed(2)}</span>
						</div>
					</div>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						value={branchB}
						onChange={(e) => setBranchB(Number(e.target.value))}
						className="w-full accent-violet-400"
					/>
				</div>
			</div>
		</div>
	);
}

function TripartiteSynapseLab() {
	const [stimRateHz, setStimRateHz] = useState<number>(35);
	const [astroFeedback, setAstroFeedback] = useState<boolean>(true);
	const [extracellularK, setExtracellularK] = useState<number>(4.8);
	const [ephapticFieldVm, setEphapticFieldVm] = useState<number>(2.4);

	// Nernst shift: deltaE_K = 61.5 * log10([K+]_o / 3.0)
	const nernstShiftMv = useMemo(() => {
		return Number((61.5 * Math.log10(extracellularK / 3.0)).toFixed(1));
	}, [extracellularK]);

	// Ephaptic polarization
	const ephapticBiasMv = useMemo(() => {
		return Number((ephapticFieldVm * 1.6).toFixed(1));
	}, [ephapticFieldVm]);

	// Glutamate clearance time tau (ms)
	const glutamateTauMs = useMemo(() => {
		return astroFeedback ? 1.4 : 3.8;
	}, [astroFeedback]);

	// Net EPSP amplitude (mV)
	const epspAmplitudeMv = useMemo(() => {
		const base = 4.0;
		const freqGain = (stimRateHz / 40) * 8.5;
		const astroGain = astroFeedback ? 1.35 : 0.85;
		const net = (base + freqGain) * astroGain + ephapticBiasMv + nernstShiftMv * 0.2;
		return Number(Math.max(1.0, Math.min(42.0, net)).toFixed(1));
	}, [stimRateHz, astroFeedback, ephapticBiasMv, nernstShiftMv]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="border-b border-white/10 pb-3">
				<h3 className="text-base font-bold text-white tracking-tight sm:text-lg">
					Tripartite Synapse & Extracellular Ephaptic Field Coupling
				</h3>
				<p className="text-xs text-slate-400">
					Simulating synaptic transmission between axon and dendritic spine, modulated by astrocytic glia Ca²⁺ waves and extracellular field dipoles.
				</p>
			</div>

			{/* SVG Diagram: Tripartite Synapse with Astrocyte Endfoot & Ephaptic Lines */}
			<div className="rounded-2xl border border-teal-500/30 bg-black/80 p-4 shadow-xl">
				<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 font-mono text-[10px]">
					<span className="font-bold text-teal-300">NANOSCALE ULTRASTRUCTURE (20 nm SYNAPTIC CLEFT)</span>
					<span className="text-cyan-400">E-FIELD: {ephapticFieldVm} V/m · [K⁺]ₒ: {extracellularK} mM</span>
				</div>

				<svg viewBox="0 0 500 200" className="w-full">
					{/* Extracellular Ephaptic Field Gradient Bands */}
					{[-2, -1, 0, 1, 2].map((i) => (
						<line
							key={i}
							x1="20"
							y1={100 + i * 28}
							x2="480"
							y2={100 + i * 28}
							stroke="#fde68a"
							strokeWidth="1"
							strokeDasharray="6 4"
							opacity={Math.min(0.7, Math.abs(ephapticFieldVm) * 0.15)}
						/>
					))}

					{/* 1. Presynaptic Axonal Bouton (Left) */}
					<g transform="translate(40, 40)">
						<path
							d="M 0 30 Q 80 10 120 60 L 120 120 Q 80 170 0 150 Z"
							fill="#0f2b38"
							stroke="#0284c7"
							strokeWidth="2"
						/>
						<text x="50" y="90" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontWeight="bold">
							AXON BOUTON
						</text>
						{/* Synaptic vesicles with glutamate */}
						{[
							{ x: 40, y: 60 },
							{ x: 70, y: 75 },
							{ x: 95, y: 70 },
							{ x: 60, y: 110 },
							{ x: 90, y: 115 },
							{ x: 105, y: 95 },
						].map((v, i) => (
							<circle key={i} cx={v.x} cy={v.y} r="5" fill="#38bdf8" />
						))}
						{/* Docked and fusing vesicles releasing transmitter */}
						<circle cx="118" cy="85" r="4" fill="#34d399" className="animate-ping" />
						<circle cx="118" cy="105" r="4" fill="#34d399" className="animate-ping" />
					</g>

					{/* 2. Synaptic Cleft Neurotransmitter Diffusion Particles */}
					<g transform="translate(160, 60)">
						{Array.from({ length: 18 }, (_, i) => (
							<circle
								key={i}
								cx={(i % 3) * 6}
								cy={10 + i * 5}
								r="2"
								fill="#34d399"
								opacity="0.8"
							/>
						))}
					</g>

					{/* 3. Postsynaptic Dendritic Spine (Center-Right) */}
					<g transform="translate(180, 40)">
						<path
							d="M 0 60 Q 40 10 120 30 L 120 150 Q 40 170 0 120 Z"
							fill="#2e1065"
							stroke="#a855f7"
							strokeWidth="2"
						/>
						{/* Postsynaptic density (PSD-95) receptors */}
						<line x1="2" y1="65" x2="2" y2="115" stroke="#f43f5e" strokeWidth="4" />
						<text x="65" y="90" textAnchor="middle" fill="#d8b4fe" fontSize="9" fontWeight="bold">
							DENDRITIC SPINE
						</text>
						<text x="65" y="105" textAnchor="middle" fill="#f43f5e" fontSize="7" fontFamily="monospace">
							AMPA / NMDA PSD
						</text>
					</g>

					{/* 4. Astrocyte Glia Endfoot Wrapping the Synapse (Top & Bottom) */}
					<g transform="translate(90, 10)">
						<path
							d="M 20 20 Q 120 -5 200 20 Q 230 40 210 60 Q 140 40 80 45 Z"
							fill={astroFeedback ? '#064e3b' : '#1e293b'}
							fillOpacity="0.8"
							stroke="#10b981"
							strokeWidth="1.5"
						/>
						<text x="130" y="24" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="bold">
							ASTROCYTE GLIA ENDFOOT
						</text>
						{astroFeedback && (
							<circle cx="160" cy="30" r="8" fill="#34d399" fillOpacity="0.4" className="animate-pulse" />
						)}
					</g>

					{/* Extracellular Ephaptic E-Vector Arrow */}
					<g transform="translate(340, 50)">
						<rect x="0" y="0" width="130" height="90" rx="8" fill="#020617" stroke="#f59e0b" strokeWidth="1" />
						<text x="65" y="16" textAnchor="middle" fill="#fde68a" fontSize="8" fontFamily="monospace" fontWeight="bold">
							EPHAPTIC E-FIELD VECTOR
						</text>
						<line x1="25" y1="50" x2="105" y2="50" stroke="#fde68a" strokeWidth="2.5" />
						<polygon points="105,45 115,50 105,55" fill="#fde68a" />
						<text x="65" y="70" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">
							Ex = {ephapticFieldVm} V/m
						</text>
					</g>
				</svg>
			</div>

			{/* Telemetry Display Cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div className="rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Peak EPSP Amplitude</p>
					<p className="mt-1 font-mono text-2xl font-black text-emerald-300">+{epspAmplitudeMv} mV</p>
					<p className="text-[9px] text-emerald-400/60 font-mono mt-0.5">Excitatory Depolarization</p>
				</div>

				<div className="rounded-xl border border-teal-400/25 bg-teal-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Glutamate Clearance (τ)</p>
					<p className="mt-1 font-mono text-2xl font-black text-teal-300">{glutamateTauMs} ms</p>
					<p className="text-[9px] text-teal-400/60 font-mono mt-0.5">Astrocyte EAAT2 Transporters</p>
				</div>

				<div className="rounded-xl border border-amber-400/25 bg-amber-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Potassium Nernst Shift</p>
					<p className="mt-1 font-mono text-2xl font-black text-amber-300">+{nernstShiftMv} mV</p>
					<p className="text-[9px] text-amber-400/60 font-mono mt-0.5">ΔE_K ([K⁺]ₒ = {extracellularK}mM)</p>
				</div>

				<div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-950/20 p-3 text-center">
					<p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Ephaptic Membrane Bias</p>
					<p className="mt-1 font-mono text-2xl font-black text-fuchsia-300">+{ephapticBiasMv} mV</p>
					<p className="text-[9px] text-fuchsia-400/60 font-mono mt-0.5">Direct Field Polarization</p>
				</div>
			</div>

			{/* Interactive Modulator Controls */}
			<div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
				<p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">
					Tripartite Micro-Environment Modulators:
				</p>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">Stimulation Frequency:</span>
							<span className="text-cyan-300 font-mono">{stimRateHz} Hz</span>
						</div>
						<input
							type="range"
							min="5"
							max="100"
							step="5"
							value={stimRateHz}
							onChange={(e) => setStimRateHz(Number(e.target.value))}
							className="w-full accent-cyan-400"
						/>
					</div>

					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">Extracellular Potassium [K⁺]ₒ:</span>
							<span className="text-amber-300 font-mono">{extracellularK} mM</span>
						</div>
						<input
							type="range"
							min="3.0"
							max="10.0"
							step="0.2"
							value={extracellularK}
							onChange={(e) => setExtracellularK(Number(e.target.value))}
							className="w-full accent-amber-400"
						/>
					</div>

					<div>
						<div className="flex justify-between font-mono text-[11px] mb-1">
							<span className="text-slate-300 font-bold">Ephaptic Field Strength (Ex):</span>
							<span className="text-fuchsia-300 font-mono">{ephapticFieldVm} V/m</span>
						</div>
						<input
							type="range"
							min="-4.0"
							max="4.0"
							step="0.2"
							value={ephapticFieldVm}
							onChange={(e) => setEphapticFieldVm(Number(e.target.value))}
							className="w-full accent-fuchsia-400"
						/>
					</div>

					<div className="flex flex-col justify-end">
						<button
							type="button"
							onClick={() => { sound.playClick(); setAstroFeedback(!astroFeedback); }}
							className={`w-full py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all ${
								astroFeedback
									? 'border-emerald-400 bg-emerald-400/20 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
									: 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
							}`}
						>
							{astroFeedback ? '✓ Astrocyte Ca²⁺ Active' : '✗ Glia Decoupled'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function MatrixDecisionStudio() {
	const [inputVector, setInputVector] = useState<number[]>([0.9, 0.2, 0.85, 0.4, 0.95, 0.3, 0.7, 0.6]);
	const [temperature, setTemperature] = useState<number>(0.8);
	const [noiseLevel, setNoiseLevel] = useState<number>(0.05);

	// Initial 8x8 weight matrix
	const [w1, setW1] = useState<number[][]>([
		[ 1.4, -0.4,  0.2, -0.1,  0.5, -0.2,  0.1,  0.0],
		[-0.2,  1.2, -0.3,  0.4, -0.1,  0.3, -0.2,  0.1],
		[ 0.1, -0.2,  1.5, -0.5,  0.3, -0.1,  0.4, -0.2],
		[-0.3,  0.3, -0.2,  1.3, -0.4,  0.2, -0.1,  0.3],
		[ 0.4, -0.1,  0.2, -0.3,  1.6, -0.5,  0.2, -0.1],
		[-0.1,  0.4, -0.1,  0.2, -0.3,  1.4, -0.4,  0.2],
		[ 0.2, -0.3,  0.4, -0.2,  0.1, -0.2,  1.5, -0.3],
		[-0.1,  0.2, -0.3,  0.4, -0.2,  0.1, -0.3,  1.3],
	]);

	const outputLabels = [
		'Surface Extraction Lock',
		'Ephaptic Resonance Gate',
		'Dendritic XOR Convergence',
		'Thalamic Calcium Burst',
		'Systolic Clock Alignment',
		'GABAergic Suppression',
		'Glutamate Transporter Reset',
		'Chimera Equilibrium State',
	];

	// Preset matrices
	function applyMatrixPreset(preset: 'synergy' | 'hebbian' | 'chaos' | 'sparse') {
		sound.playClick();
		if (preset === 'synergy') {
			setW1([
				[ 1.8, -0.5,  0.2, -0.2,  0.4, -0.3,  0.1, -0.1],
				[-0.4,  1.6, -0.4,  0.3, -0.2,  0.4, -0.2,  0.1],
				[ 0.2, -0.3,  1.7, -0.6,  0.3, -0.2,  0.5, -0.2],
				[-0.3,  0.4, -0.4,  1.5, -0.5,  0.3, -0.1,  0.4],
				[ 0.5, -0.2,  0.3, -0.4,  1.8, -0.6,  0.3, -0.2],
				[-0.2,  0.5, -0.2,  0.3, -0.4,  1.6, -0.5,  0.3],
				[ 0.3, -0.4,  0.5, -0.3,  0.2, -0.3,  1.7, -0.4],
				[-0.2,  0.3, -0.3,  0.5, -0.3,  0.2, -0.4,  1.5],
			]);
		} else if (preset === 'hebbian') {
			// Auto-associative symmetric matrix
			setW1([
				[ 1.5,  0.6, -0.3, -0.4,  0.5, -0.2, -0.1,  0.3],
				[ 0.6,  1.4, -0.2, -0.3,  0.4, -0.1, -0.2,  0.2],
				[-0.3, -0.2,  1.6,  0.5, -0.3,  0.4,  0.2, -0.2],
				[-0.4, -0.3,  0.5,  1.5, -0.4,  0.3,  0.3, -0.1],
				[ 0.5,  0.4, -0.3, -0.4,  1.6, -0.2, -0.1,  0.4],
				[-0.2, -0.1,  0.4,  0.3, -0.2,  1.5,  0.5, -0.2],
				[-0.1, -0.2,  0.2,  0.3, -0.1,  0.5,  1.4, -0.3],
				[ 0.3,  0.2, -0.2, -0.1,  0.4, -0.2, -0.3,  1.5],
			]);
		} else if (preset === 'chaos') {
			// Gaussian random weights
			setW1([
				[ 0.8, -1.2,  0.9, -0.4,  1.1, -0.7,  0.3, -0.9],
				[-0.7,  0.9, -1.1,  0.6, -0.8,  1.2, -0.5,  0.4],
				[ 1.1, -0.5,  0.7, -1.3,  0.6, -0.4,  1.0, -0.6],
				[-0.6,  1.0, -0.8,  0.9, -1.2,  0.5, -0.7,  1.1],
				[ 0.9, -0.7,  1.2, -0.5,  0.8, -1.0,  0.6, -0.4],
				[-1.0,  0.8, -0.6,  1.1, -0.5,  0.7, -1.2,  0.9],
				[ 0.5, -1.1,  0.8, -0.6,  1.0, -0.8,  0.9, -0.5],
				[-0.8,  0.6, -0.9,  0.7, -0.6,  1.1, -0.4,  0.8],
			]);
		} else {
			// Sparse orthogonal
			setW1([
				[ 2.0,  0.0,  0.0, -0.5,  0.0,  0.0,  0.0,  0.0],
				[ 0.0,  2.0,  0.0,  0.0, -0.5,  0.0,  0.0,  0.0],
				[ 0.0,  0.0,  2.0,  0.0,  0.0, -0.5,  0.0,  0.0],
				[ 0.0,  0.0,  0.0,  2.0,  0.0,  0.0, -0.5,  0.0],
				[-0.5,  0.0,  0.0,  0.0,  2.0,  0.0,  0.0,  0.0],
				[ 0.0, -0.5,  0.0,  0.0,  0.0,  2.0,  0.0,  0.0],
				[ 0.0,  0.0, -0.5,  0.0,  0.0,  0.0,  2.0,  0.0],
				[ 0.0,  0.0,  0.0, -0.5,  0.0,  0.0,  0.0,  2.0],
			]);
		}
	}

	// Matrix multiply: f = ReLU(W1 * x + noise)
	const features = useMemo(() => {
		return w1.map((row) => {
			let sum = 0;
			for (let i = 0; i < 8; i++) {
				sum += (row[i] ?? 0) * (inputVector[i] ?? 0);
			}
			return Math.max(0, sum + (Math.random() - 0.5) * noiseLevel);
		});
	}, [w1, inputVector, noiseLevel]);

	// Softmax probabilities: p_i = exp(f_i / T) / sum exp(f_j / T)
	const probabilities = useMemo(() => {
		const expValues = features.map((f) => Math.exp(Math.min(30, f / Math.max(0.05, temperature))));
		const sumExp = expValues.reduce((a, b) => a + b, 0);
		return expValues.map((v) => (sumExp > 0 ? v / sumExp : 1 / 8));
	}, [features, temperature]);

	// Shannon Entropy: H(p) = -sum p_i * log2(p_i)
	const entropyBits = useMemo(() => {
		let h = 0;
		probabilities.forEach((p) => {
			if (p > 1e-9) h -= p * Math.log2(p);
		});
		return Number(h.toFixed(2));
	}, [probabilities]);

	// Matrix Trace: sum W_ii
	const matrixTrace = useMemo(() => {
		let tr = 0;
		for (let i = 0; i < 8; i++) {
			tr += w1[i]?.[i] ?? 0;
		}
		return Number(tr.toFixed(2));
	}, [w1]);

	const winnerIndex = probabilities.indexOf(Math.max(...probabilities));

	function handleCellClick(row: number, col: number) {
		sound.playClick();
		setW1((prev) => {
			const next = prev.map((r) => [...r]);
			if (next[row] && next[row][col] !== undefined) {
				const currentVal = next[row][col]!;
				const newVal = currentVal >= 2.0 ? -1.0 : Number((currentVal + 0.3).toFixed(1));
				next[row][col] = newVal;
			}
			return next;
		});
	}

	return (
		<div className="space-y-6">
			{/* Header & Preset Buttons */}
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
				<div>
					<h3 className="text-base font-bold text-white tracking-tight sm:text-lg">
						8×8 Hyper-Matrix Decision Architect & Softmax Studio
					</h3>
					<p className="text-xs text-slate-400">
						Full 8-dimensional multi-variable tensor core simulation with temperature-scaled Softmax attractors.
					</p>
				</div>
				<div className="flex items-center gap-1.5 flex-wrap">
					<button
						type="button"
						onClick={() => applyMatrixPreset('synergy')}
						className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan-200 hover:bg-cyan-500/20"
					>
						Synergy
					</button>
					<button
						type="button"
						onClick={() => applyMatrixPreset('hebbian')}
						className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-200 hover:bg-amber-500/20"
					>
						Hebbian
					</button>
					<button
						type="button"
						onClick={() => applyMatrixPreset('chaos')}
						className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-rose-200 hover:bg-rose-500/20"
					>
						Chaos
					</button>
					<button
						type="button"
						onClick={() => applyMatrixPreset('sparse')}
						className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-200 hover:bg-emerald-500/20"
					>
						Sparse
					</button>
				</div>
			</div>

			{/* 8-Dimensional Input Vector Sliders */}
			<div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
						8-Dimensional Input Vector x ∈ ℝ⁸:
					</span>
					<button
						type="button"
						onClick={() => {
							sound.playClick();
							setInputVector(Array.from({ length: 8 }, () => Number((Math.random() * 0.9 + 0.1).toFixed(2))));
						}}
						className="text-[10px] font-mono text-cyan-400 hover:underline"
					>
						Randomize x
					</button>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
					{inputVector.map((val, idx) => (
						<div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
							<span className="font-mono text-[9px] text-cyan-300 block">x[{idx}]</span>
							<span className="font-mono text-xs font-bold text-white block my-1">{val.toFixed(2)}</span>
							<input
								type="range"
								min="0"
								max="1"
								step="0.05"
								value={val}
								onChange={(e) => {
									const next = [...inputVector];
									next[idx] = Number(e.target.value);
									setInputVector(next);
								}}
								className="w-full accent-cyan-400 h-1.5"
							/>
						</div>
					))}
				</div>
			</div>

			{/* 8x8 Interactive Weight Matrix Heatmap (left) & Output Softmax Bars (right) */}
			<div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
				{/* 8x8 Heatmap Grid */}
				<div className="rounded-2xl border border-cyan-500/30 bg-black/80 p-4 shadow-xl">
					<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 font-mono text-[10px]">
						<span className="font-bold text-cyan-300">W₁ WEIGHT MATRIX [8×8] (CLICK CELL TO TWEAK)</span>
						<span className="text-slate-400">TRACE: {matrixTrace}</span>
					</div>

					<div className="overflow-x-auto pb-1">
						<div className="grid grid-cols-8 gap-1 min-w-[280px]">
							{w1.map((row, rIdx) =>
								row.map((val, cIdx) => {
									const isPositive = val > 0;
									const intensity = Math.min(1, Math.abs(val) / 2.0);
									const bgColor = isPositive
										? `rgba(6, 182, 212, ${0.15 + intensity * 0.6})`
										: `rgba(217, 70, 239, ${0.15 + intensity * 0.6})`;

									return (
										<button
											key={`${rIdx}-${cIdx}`}
											type="button"
											onClick={() => handleCellClick(rIdx, cIdx)}
											title={`W₁[${rIdx},${cIdx}] = ${val.toFixed(1)} (Click to increment)`}
											style={{ backgroundColor: bgColor }}
											className="size-8 sm:size-9 rounded border border-white/10 font-mono text-[9px] font-bold text-white flex items-center justify-center transition-all hover:scale-110 hover:ring-2 hover:ring-cyan-300"
										>
											{val.toFixed(1)}
										</button>
									);
								}),
							)}
						</div>
					</div>

					<div className="mt-2 flex items-center justify-between font-mono text-[9px] text-slate-400">
						<span className="text-cyan-400 font-bold">● Positive Excitatory Weight</span>
						<span className="text-fuchsia-400 font-bold">● Negative Inhibitory Weight</span>
					</div>
				</div>

				{/* Softmax Probability Distributions */}
				<div className="rounded-2xl border border-amber-500/30 bg-black/80 p-4 shadow-xl">
					<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 font-mono text-[10px]">
						<span className="font-bold text-amber-300">SOFTMAX DISTRIBUTION (TEMPERATURE = {temperature})</span>
						<span className="text-emerald-400">H: {entropyBits} BITS</span>
					</div>

					<div className="space-y-2.5">
						{probabilities.map((prob, idx) => {
							const isWinner = idx === winnerIndex;
							const label = outputLabels[idx] ?? `Output ${idx + 1}`;
							const pct = Math.round(prob * 100);

							return (
								<div key={idx} className="space-y-1">
									<div className="flex items-center justify-between font-mono text-[10px]">
										<span className={`truncate max-w-[200px] ${isWinner ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
											{label}
										</span>
										<span className={isWinner ? 'text-amber-300 font-bold' : 'text-slate-400'}>
											{pct}%
										</span>
									</div>
									<div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-white/5">
										<div
											className={`h-full rounded-full transition-all duration-300 ${
												isWinner
													? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
													: 'bg-cyan-500/50'
											}`}
											style={{ width: `${Math.max(4, pct)}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>

					<div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-950/20 p-2.5 text-center font-mono">
						<span className="text-[10px] uppercase text-slate-400 block">Predicted Attractor Winner:</span>
						<span className="text-xs font-bold text-amber-300">{outputLabels[winnerIndex]}</span>
					</div>
				</div>
			</div>

			{/* Softmax Temperature & Noise Injection Sliders */}
			<div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
				<div>
					<div className="flex justify-between font-mono text-xs mb-1.5">
						<span className="text-slate-300 font-bold">Softmax Temperature (T):</span>
						<span className="text-amber-300 font-mono">{temperature.toFixed(2)} {temperature < 0.4 ? '(Argmax Mode)' : temperature > 1.8 ? '(High Entropy)' : ''}</span>
					</div>
					<input
						type="range"
						min="0.1"
						max="2.5"
						step="0.05"
						value={temperature}
						onChange={(e) => setTemperature(Number(e.target.value))}
						className="w-full accent-amber-400"
					/>
				</div>

				<div>
					<div className="flex justify-between font-mono text-xs mb-1.5">
						<span className="text-slate-300 font-bold">Thermal Noise Injection (σ):</span>
						<span className="text-fuchsia-300 font-mono">{noiseLevel.toFixed(2)}</span>
					</div>
					<input
						type="range"
						min="0.0"
						max="0.4"
						step="0.02"
						value={noiseLevel}
						onChange={(e) => setNoiseLevel(Number(e.target.value))}
						className="w-full accent-fuchsia-400"
					/>
				</div>
			</div>
		</div>
	);
}

export function WackyNeuronLab({ onReturnToStory }: Readonly<{ onReturnToStory: () => void }>) {
	const [activeTab, setActiveTab] = useState<'izhikevich' | 'xor' | 'tripartite' | 'matrix'>('izhikevich');

	return (
		<div className="space-y-6">
			{/* Lab Navigation Header */}
			<div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-cyan-950/40 p-4 sm:p-6 shadow-[0_12px_40px_rgba(245,158,11,0.15)]">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<div className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-amber-400 animate-ping" />
							<span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-amber-300">
								Experimental Workbench
							</span>
						</div>
						<h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
							Wacky Neuron Lab & Matrix Studio
						</h2>
						<p className="mt-1 text-xs text-slate-300 max-w-2xl">
							Dive into non-linear biological dynamical systems: 6-mode bursting resonators, active dendritic XOR computation, tripartite astrocytic synapses, and 8×8 tensor architectures.
						</p>
					</div>

					<button
						type="button"
						onClick={onReturnToStory}
						className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-xs font-bold text-cyan-200 transition-all hover:bg-cyan-500/25 shadow-[0_0_16px_rgba(34,211,238,0.2)] shrink-0 self-start sm:self-auto"
					>
						<span>← Return to Campaign (12 Chapters)</span>
					</button>
				</div>

				{/* 4 Navigation Tabs */}
				<div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2">
					<button
						type="button"
						onClick={() => { sound.playClick(); setActiveTab('izhikevich'); }}
						className={`rounded-xl border p-3 text-left transition-all ${
							activeTab === 'izhikevich'
								? 'border-amber-400 bg-amber-500/20 text-white ring-2 ring-amber-400/40 shadow-[0_0_18px_rgba(245,158,11,0.3)]'
								: 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
						}`}
					>
						<span className="font-mono text-[10px] text-amber-300 block font-bold">MODULE 01</span>
						<span className="text-xs font-bold block text-slate-100">Izhikevich Bursting</span>
						<span className="text-[10px] text-slate-400 block truncate">6 Dynamical Modes & Phase Plane</span>
					</button>

					<button
						type="button"
						onClick={() => { sound.playClick(); setActiveTab('xor'); }}
						className={`rounded-xl border p-3 text-left transition-all ${
							activeTab === 'xor'
								? 'border-emerald-400 bg-emerald-500/20 text-white ring-2 ring-emerald-400/40 shadow-[0_0_18px_rgba(52,211,153,0.3)]'
								: 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
						}`}
					>
						<span className="font-mono text-[10px] text-emerald-300 block font-bold">MODULE 02</span>
						<span className="text-xs font-bold block text-slate-100">Dendritic XOR Gate</span>
						<span className="text-[10px] text-slate-400 block truncate">Single-Neuron dCaAP Computing</span>
					</button>

					<button
						type="button"
						onClick={() => { sound.playClick(); setActiveTab('tripartite'); }}
						className={`rounded-xl border p-3 text-left transition-all ${
							activeTab === 'tripartite'
								? 'border-teal-400 bg-teal-500/20 text-white ring-2 ring-teal-400/40 shadow-[0_0_18px_rgba(45,212,191,0.3)]'
								: 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
						}`}
					>
						<span className="font-mono text-[10px] text-teal-300 block font-bold">MODULE 03</span>
						<span className="text-xs font-bold block text-slate-100">Tripartite & Ephaptic</span>
						<span className="text-[10px] text-slate-400 block truncate">Glia Ca²⁺ & Electric Field Dipoles</span>
					</button>

					<button
						type="button"
						onClick={() => { sound.playClick(); setActiveTab('matrix'); }}
						className={`rounded-xl border p-3 text-left transition-all ${
							activeTab === 'matrix'
								? 'border-cyan-400 bg-cyan-500/20 text-white ring-2 ring-cyan-400/40 shadow-[0_0_18px_rgba(6,182,212,0.3)]'
								: 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
						}`}
					>
						<span className="font-mono text-[10px] text-cyan-300 block font-bold">MODULE 04</span>
						<span className="text-xs font-bold block text-slate-100">8×8 Matrix Architect</span>
						<span className="text-[10px] text-slate-400 block truncate">Softmax & Spectral Heatmap</span>
					</button>
				</div>
			</div>

			{/* Active Module Content */}
			<div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
				{activeTab === 'izhikevich' && <IzhikevichLab />}
				{activeTab === 'xor' && <DendriticXorLab />}
				{activeTab === 'tripartite' && <TripartiteSynapseLab />}
				{activeTab === 'matrix' && <MatrixDecisionStudio />}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// MAIN APPLICATION COMPONENT
// ---------------------------------------------------------------------------
export function AiBiologyExplorer() {
	const [challengeIndex, setChallengeIndex] = useState(0);
	const [guess, setGuess] = useState<number | null>(null);
	const [phase, setPhase] = useState(0);
	const [correctRounds, setCorrectRounds] = useState(0);
	const [streak, setStreak] = useState(0);
	const [bestStreak, setBestStreak] = useState(0);
	const [probeUsed, setProbeUsed] = useState(false);
	const [played, setPlayed] = useState<string[]>([]);
	const [mobileView, setMobileView] = useState<'machine' | 'brain' | 'percept'>('machine');
	const [narrativeTab, setNarrativeTab] = useState<'story' | 'comms' | 'log' | 'vitals'>('story');
	const [soundActive, setSoundActive] = useState(false);
	const [learningMode, setLearningMode] = useState<'before' | 'after'>('before');
	const [readingStage, setReadingStage] = useState(1);
	const [mainMode, setMainMode] = useState<'story' | 'lab'>('story');

	// IN-BETWEEN CHAPTER TRANSITION STATE
	const [activeTransition, setActiveTransition] = useState<InBetweenTransition | null>(null);
	const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);

	// MISSION DOSSIER & PERSISTENT PERKS STATE
	const [showDossier, setShowDossier] = useState(false);
	const [collectedPerks, setCollectedPerks] = useState<FacilityPerk[]>([]);
	const [heartRateDelta, setHeartRateDelta] = useState(0);

	const challenge = challenges[challengeIndex]!;
	const effectiveHeartRate = Math.max(82, challenge.telemetry.heartRate + heartRateDelta);
	const features = useMemo(() => featuresFor(challenge), [challenge]);
	const outputs = useMemo(() => outputsFor(challenge), [challenge]);
	const winner = outputs.indexOf(Math.max(...outputs));
	const finalPhase = challenge.input.length + 1;
	const revealed = phase >= finalPhase;
	const runComplete = revealed && played.length === challenges.length;
	const introSeen = readingStage >= 2 || guess !== null || phase > 0;
	const answerNeeded = guess === null && phase === 0;
	const nextChallenge = challenges[(challengeIndex + 1) % challenges.length]!;
	const probe = strongestContribution(challenge);
	const sortedOutputs = [...outputs].sort((a, b) => b - a);
	const decisionMargin = sortedOutputs[0]! - sortedOutputs[1]!;

	const winningContributions = features.map((feature, index) => ({
		label: challenge.featureLabels[index],
		input: feature,
		weight: challenge.weights[winner]![index]!,
		effect: feature * challenge.weights[winner]![index]!,
	}));

	useEffect(() => {
		if (phase < 1 || phase >= finalPhase) return;
		const timer = window.setTimeout(() => {
			sound.playPulse();
			setPhase((value) => value + 1);
		}, 700);
		return () => window.clearTimeout(timer);
	}, [finalPhase, phase]);

	useEffect(() => {
		const sections = Array.from(document.querySelectorAll<HTMLElement>('#ai-biology-game [data-guide-stage]'));
		const observer = new IntersectionObserver(
			(entries) => {
				const nearest = entries
					.filter((entry) => entry.isIntersecting)
					.sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
				if (nearest) setReadingStage(Number((nearest.target as HTMLElement).dataset.guideStage));
			},
			{ rootMargin: '-18% 0px -46% 0px', threshold: [0, 0.12, 0.3, 0.55] },
		);
		sections.forEach((section) => observer.observe(section));
		return () => observer.disconnect();
	}, [challengeIndex, revealed]);

	function toggleAudio() {
		const active = sound.toggle();
		setSoundActive(active);
	}

	function runRound() {
		if (guess === null || phase > 0) return;
		sound.playPulse();
		setPhase(1);
		setMobileView('percept');
		if (!played.includes(challenge.id)) {
			const correct = guess === winner;
			if (correct) {
				sound.playChime();
			}
			const nextStreak = correct ? streak + 1 : 0;
			setPlayed((current) => [...current, challenge.id]);
			setStreak(nextStreak);
			setBestStreak((current) => Math.max(current, nextStreak));
			if (correct) setCorrectRounds((current) => current + 1);
		}
	}

	function openInBetweenTransition() {
		if (challenge.inBetweenTransition) {
			sound.playTransition();
			setActiveTransition(challenge.inBetweenTransition);
			setSelectedChoiceIndex(null);
		} else {
			nextRound();
		}
	}

	function handleSelectTacticalChoice(transition: InBetweenTransition, choice: InBetweenChoice, choiceIdx: number) {
		sound.playClick();
		sound.playRadioStatic();
		setSelectedChoiceIndex(choiceIdx);

		const perkId = `${transition.title}-${choiceIdx}`;
		if (!collectedPerks.some((p) => p.id === perkId)) {
			const newPerk: FacilityPerk = {
				id: perkId,
				title: choice.label,
				description: choice.description,
				bonus: choice.statBonus,
				chapterUnlocked: transition.title,
			};
			setCollectedPerks((prev) => [...prev, newPerk]);

			if (
				choice.statBonus.toLowerCase().includes('breath') ||
				choice.statBonus.toLowerCase().includes('oxygen') ||
				choice.statBonus.toLowerCase().includes('calm') ||
				choice.statBonus.toLowerCase().includes('pacing')
			) {
				setHeartRateDelta((d) => d - 6);
				sound.playHeartbeat();
			} else if (
				choice.statBonus.toLowerCase().includes('resolution') ||
				choice.statBonus.toLowerCase().includes('margin') ||
				choice.statBonus.toLowerCase().includes('anchor')
			) {
				setHeartRateDelta((d) => d - 3);
			}
		}
	}

	function nextRound() {
		sound.playClick();
		setActiveTransition(null);
		setSelectedChoiceIndex(null);
		setChallengeIndex((current) => (current + 1) % challenges.length);
		setGuess(null);
		setPhase(0);
		setProbeUsed(false);
		setMobileView('machine');
		setReadingStage(1);
		setNarrativeTab('story');
	}

	function resetRun() {
		sound.playClick();
		setActiveTransition(null);
		setSelectedChoiceIndex(null);
		setChallengeIndex(0);
		setGuess(null);
		setPhase(0);
		setCorrectRounds(0);
		setStreak(0);
		setBestStreak(0);
		setProbeUsed(false);
		setPlayed([]);
		setMobileView('machine');
		setReadingStage(1);
		setNarrativeTab('story');
		setHeartRateDelta(0);
	}

	return (
		<div className="app-page-stack">
			{/* HERO SECTION */}
			<section className="app-surface app-surface--hero relative overflow-hidden">
				<div className="absolute -right-28 -top-28 size-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-28 left-1/3 size-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

				<div className="relative grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
					<div>
						<div className="flex items-center gap-3">
							<span className="flex size-2 rounded-full bg-cyan-400 animate-ping" />
							<p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">
								Comparative Computational Neuroscience
							</p>
						</div>
						<h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl">
							The Night Signal.
							<br />
							<span className="bg-gradient-to-r from-cyan-300 via-amber-200 to-fuchsia-300 bg-clip-text text-transparent">
								Silicon Tensors vs Biological Spikes.
							</span>
						</h1>
						<p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
							At 02:13 the underground Helmholtz-Turing Institute plunged into total blackout, leaving lead architects
							Dr. Hans Werner and Dr. Astrid Van Hoyt sealed in the subterranean complex. Escaping requires deciphering
							twelve sensory paradoxes across thirteen facility sectors—where artificial matrix mathematics and living cortical circuits compute the exact
							same recognitions through radically different physical substrates.
						</p>
					</div>

					{/* Global Telemetry HUD */}
					<div className="grid grid-cols-3 gap-2.5">
						<div className="rounded-2xl border border-cyan-400/25 bg-cyan-950/30 p-3.5 backdrop-blur-md shadow-[0_8px_24px_rgba(6,182,212,0.15)]">
							<p className="text-2xl font-black text-cyan-300">2</p>
							<p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">Substrates</p>
							<p className="text-[9px] text-cyan-200/60 font-mono mt-0.5">GPU vs Cortex</p>
						</div>
						<div className="rounded-2xl border border-amber-400/25 bg-amber-950/30 p-3.5 backdrop-blur-md shadow-[0_8px_24px_rgba(245,158,11,0.15)]">
							<p className="text-2xl font-black text-amber-300">{challenges.length}</p>
							<p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">Chapters</p>
							<p className="text-[9px] text-amber-200/60 font-mono mt-0.5">02:13 → 02:47</p>
						</div>
						<div className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-950/30 p-3.5 backdrop-blur-md shadow-[0_8px_24px_rgba(217,70,239,0.15)]">
							<p className="text-2xl font-black text-fuchsia-300">3</p>
							<p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">Layers</p>
							<p className="text-[9px] text-fuchsia-200/60 font-mono mt-0.5">Cue → Feat → Object</p>
						</div>
					</div>
				</div>
			</section>

			{/* MASTER MODE SWITCHER: 12-CHAPTER CAMPAIGN VS WACKY NEURON LAB */}
			<div className="flex items-center justify-between flex-wrap gap-3 p-2 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => {
							sound.playClick();
							setMainMode('story');
						}}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
							mainMode === 'story'
								? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/50 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
								: 'text-slate-400 hover:text-white hover:bg-white/5'
						}`}
					>
						<span>🎮 The Night Signal</span>
						<span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
							12 Chapters
						</span>
					</button>

					<button
						type="button"
						onClick={() => {
							sound.playClick();
							setMainMode('lab');
						}}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
							mainMode === 'lab'
								? 'bg-gradient-to-r from-amber-500/25 to-fuchsia-500/25 border border-amber-400/50 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
								: 'text-slate-400 hover:text-white hover:bg-white/5'
						}`}
					>
						<span className="size-2 rounded-full bg-amber-400 animate-ping" />
						<span>⚡ Wacky Neuron Lab & Matrix Studio</span>
						<span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
							4 Wacky Configs
						</span>
					</button>
				</div>

				<div className="hidden sm:flex items-center gap-3 font-mono text-[10px] text-slate-400 pr-2">
					<span className="text-cyan-300 font-semibold">TENSOR CORE FP32</span>
					<span>vs</span>
					<span className="text-amber-300 font-semibold">IONIC MEMBRANE DYNAMICS</span>
				</div>
			</div>

			{mainMode === 'lab' ? (
				<WackyNeuronLab onReturnToStory={() => { sound.playClick(); setMainMode('story'); }} />
			) : (
				<>

			{/* PLAYABLE GAME SECTION */}
			<section id="ai-biology-game" className="app-surface p-3.5 sm:p-6">
				{/* Top Bar with Audio Control, Dossier Button & Mission Progress */}
				<div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<button
							type="button"
							onClick={toggleAudio}
							className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition duration-300 ${
								soundActive
									? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.3)]'
									: 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
							}`}
							title="Toggle atmospheric laboratory soundscape (Web Audio API)"
						>
							<span className={`size-2 rounded-full ${soundActive ? 'bg-cyan-300 animate-pulse' : 'bg-slate-600'}`} />
							{soundActive ? '🔊 Audio ON' : '🔇 Audio Muted'}
						</button>

						<button
							type="button"
							onClick={() => {
								sound.playClick();
								setShowDossier(true);
							}}
							className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-3 py-1.5 text-xs font-bold text-fuchsia-200 transition duration-300 hover:bg-fuchsia-500/25 shadow-[0_0_16px_rgba(217,70,239,0.25)]"
							title="Open Project JANUS Classified Incident Dossier, Audio Memos, Sector Blueprint, and Perks Inventory"
						>
							<span className="size-2 rounded-full bg-fuchsia-400 animate-ping" />
							📂 JANUS Dossier & Map
							{collectedPerks.length > 0 && (
								<span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] text-amber-300 border border-amber-400/40 font-mono">
									{collectedPerks.length} Perks
								</span>
							)}
						</button>

						<span className="font-mono text-xs text-slate-400">
							Sector: {challenge.sector}
						</span>
					</div>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-1 font-mono text-xs">
							<span className="text-slate-400 text-[10px] uppercase font-sans">Accuracy</span>
							<strong className="text-emerald-300">{correctRounds}/{played.length}</strong>
							<span className="text-slate-600">|</span>
							<span className="text-slate-400 text-[10px] uppercase font-sans">Streak</span>
							<strong className="text-amber-300">{streak > 1 ? '🔥 ' : ''}{streak}</strong>
						</div>
					</div>
				</div>

				{/* 9 Chapters Progress Tracker */}
				<div className="mb-5 flex gap-1.5 px-1" aria-label={`${played.length} of ${challenges.length} missions complete`}>
					{challenges.map((item, index) => {
						const isPlayed = played.includes(item.id);
						const isCurrent = index === challengeIndex;
						return (
							<div key={item.id} className="group relative flex-1">
								<button
									type="button"
									onClick={() => {
										sound.playClick();
										setChallengeIndex(index);
										setGuess(null);
										setPhase(0);
										setProbeUsed(false);
									}}
									className={`block h-2 w-full rounded-full transition-all duration-300 ${
										isPlayed
											? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
											: isCurrent
												? 'bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.7)] scale-y-125'
												: 'bg-white/10 hover:bg-white/20'
									}`}
								/>
								<span className="pointer-events-none absolute left-1/2 top-4 z-30 hidden w-52 -translate-x-1/2 rounded-xl border border-white/15 bg-slate-950/95 p-3 text-left shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-md group-hover:block">
									<span className="block text-[8px] font-bold uppercase tracking-[.18em] text-cyan-300">{item.chapter}</span>
									<span className="mt-0.5 block text-[11px] font-bold text-white">{item.name}</span>
									<span className="mt-1 block text-[9px] leading-4 text-slate-300">{item.preview}</span>
								</span>
							</div>
						);
					})}
				</div>

				{/* STAGE 1: NARRATIVE INTELLIGENCE HUB */}
				<div
					data-guide-stage="1"
					className="overflow-hidden rounded-2xl border border-cyan-400/25 bg-[linear-gradient(135deg,rgba(8,30,45,0.8),rgba(15,23,42,0.95))] shadow-[0_0_40px_rgba(6,182,212,0.08)]"
				>
					{/* Narrative Hub Tabs Header */}
					<div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-950/60 px-4 py-2 sm:px-6">
						<div className="flex gap-1">
							{(
								[
									['story', '🧠 Dr. Werner (Hans)', 'First-Person Narrative'],
									['comms', '📻 Dr. Van Hoyt (Astrid)', 'Channel 4 Radio Feed'],
									['log', '📑 Incident Log', 'Automated Substation Telemetry'],
									['vitals', '🫀 Hans Vitals', 'Real-Time Biometrics'],
								] as const
							).map(([tabKey, label]) => (
								<button
									key={tabKey}
									type="button"
									onClick={() => {
										sound.playClick();
										setNarrativeTab(tabKey);
									}}
									className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
										narrativeTab === tabKey
											? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
											: 'text-slate-400 hover:text-white hover:bg-white/5'
									}`}
								>
									{label}
								</button>
							))}
						</div>
						<div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
							<span>TIME: {challenge.timestamp}</span>
							<span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] uppercase border border-cyan-400/20">
								{challenge.domain}
							</span>
						</div>
					</div>

					{/* Tab Content 1: Main Story */}
					{narrativeTab === 'story' && (
						<div className="p-4 sm:p-6">
							{challengeIndex > 0 && played.includes(challenges[challengeIndex - 1]!.id) && (
								<p className="mb-3 max-w-3xl border-l-2 border-emerald-400/40 pl-3 text-xs italic leading-5 text-emerald-200/90">
									<span className="mr-1.5 font-bold uppercase not-italic tracking-[.18em] text-emerald-400">Prior Milestone:</span>
									{challenges[challengeIndex - 1]!.interlude}
								</p>
							)}
							<div className="flex items-baseline gap-2">
								<h2 className="text-xl font-extrabold text-white sm:text-3xl tracking-tight">{challenge.name}</h2>
								<span className="text-xs font-mono text-cyan-400 font-bold">{challenge.chapter}</span>
							</div>
							<p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
								{challenge.story}
							</p>
							<div className="mt-4 rounded-xl border border-fuchsia-400/25 bg-fuchsia-950/20 p-3.5 shadow-[inset_0_0_20px_rgba(217,70,239,0.06)]">
								<p className="text-[10px] font-bold uppercase tracking-[.22em] text-fuchsia-300">
									Dr. Hans Werner · Internal Cognitive Monologue
								</p>
								<p className="mt-1 text-sm italic leading-6 text-fuchsia-100/90">
									“{challenge.thought}”
								</p>
							</div>
						</div>
					)}

					{/* Tab Content 2: Astrid Comms Channel */}
					{narrativeTab === 'comms' && (
						<div className="p-4 sm:p-6 bg-slate-950/40">
							<div className="flex items-center gap-2 text-xs font-mono text-emerald-300 border-b border-emerald-500/20 pb-2">
								<span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
								TRANSCEIVER FREQUENCY: 142.85 MHz [ENCRYPTED] · DR. ASTRID VAN HOYT
							</div>
							<div className="mt-3 space-y-3">
								<div className="rounded-xl border border-emerald-400/30 bg-emerald-950/30 p-4">
									<p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Astrid’s Voice Transmission:</p>
									<p className="mt-2 text-sm leading-7 text-emerald-50 italic">
										{challenge.astridTransmission}
									</p>
								</div>
								<div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-300 leading-6">
									<strong className="text-white block mb-1">Neurobiological Perspective:</strong>
									Astrid is monitoring the biological sensory circuits from Cryo-Bay 3. Her guidance grounds Hans’s abstract tensor theories in living cellular physiology.
								</div>
							</div>
						</div>
					)}

					{/* Tab Content 3: Classified Incident Log */}
					{narrativeTab === 'log' && (
						<div className="p-4 sm:p-6 bg-slate-950/70 font-mono">
							<div className="flex items-center justify-between text-xs text-cyan-400 border-b border-cyan-500/20 pb-2">
								<span>PROJECT JANUS · BLACKOUT INCIDENT DOSSIER</span>
								<span className="text-rose-400 font-bold">CLEARANCE: LEVEL 5 RESTRICTED</span>
							</div>
							<div className="mt-3 rounded-lg border border-cyan-500/20 bg-black/60 p-4 text-xs leading-6 text-cyan-100">
								<p className="text-slate-400 text-[10px] mb-2">// TELEMETRY RECORDER CAPTURE:</p>
								<p className="text-emerald-300">{challenge.incidentLog}</p>
								<div className="mt-4 pt-3 border-t border-white/10 text-slate-400 text-[11px] space-y-1">
									<p>Subsystem Failure Index: <span className="text-rose-400">Critical</span></p>
									<p>Automated Lockdown Protocol: <span className="text-amber-300">{challenge.telemetry.subsystemState}</span></p>
									<p>Ambient Temperature: <span className="text-cyan-200">{challenge.telemetry.ambientTemp}</span></p>
								</div>
							</div>
						</div>
					)}

					{/* Tab Content 4: Biometric Vitals */}
					{narrativeTab === 'vitals' && (
						<div className="p-4 sm:p-6 bg-slate-950/60">
							<div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-2">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-rose-500 animate-ping" />
									<span className="text-xs font-mono text-rose-300 font-bold">DR. WERNER PHYSIOLOGICAL TELEMETRY</span>
								</div>
								<div className="flex items-center gap-3">
									<span className="font-mono text-xs text-rose-400 font-bold">
										{effectiveHeartRate} BPM
										{heartRateDelta !== 0 && (
											<span className="text-[10px] text-emerald-400 font-normal ml-1">
												({heartRateDelta > 0 ? `+${heartRateDelta}` : heartRateDelta} from perks)
											</span>
										)}
									</span>
									<button
										type="button"
										onClick={() => {
											sound.playClick();
											setShowDossier(true);
										}}
										className="rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-200 hover:bg-fuchsia-500/20"
									>
										View Dossier →
									</button>
								</div>
							</div>
							<div className="mt-4 grid gap-3 sm:grid-cols-4">
								<div className="rounded-xl border border-rose-400/20 bg-rose-950/20 p-3 text-center">
									<p className="text-[10px] uppercase font-bold text-rose-300">Effective Heart Rate</p>
									<p className="mt-1 text-2xl font-black text-white font-mono">{effectiveHeartRate} <span className="text-xs font-normal text-slate-400">BPM</span></p>
									<p className="text-[9px] text-slate-400 mt-0.5">Base: {challenge.telemetry.heartRate} BPM</p>
								</div>
								<div className="rounded-xl border border-amber-400/20 bg-amber-950/20 p-3 text-center">
									<p className="text-[10px] uppercase font-bold text-amber-300">Cortisol</p>
									<p className="mt-1 text-sm font-bold text-white font-mono">
										{collectedPerks.length >= 3 ? 'Steely Focus' : challenge.telemetry.cortisol}
									</p>
									<p className="text-[9px] text-slate-400 mt-0.5">{collectedPerks.length} Perks Active</p>
								</div>
								<div className="rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-3 text-center">
									<p className="text-[10px] uppercase font-bold text-cyan-300">Ambient Temp</p>
									<p className="mt-1 text-xl font-bold text-white font-mono">{challenge.telemetry.ambientTemp}</p>
									<p className="text-[9px] text-slate-400 mt-0.5">HVAC Offline</p>
								</div>
								<div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-950/20 p-3 text-center">
									<p className="text-[10px] uppercase font-bold text-fuchsia-300">Cognitive Load</p>
									<p className="mt-1 text-xs font-bold text-white font-mono">{challenge.telemetry.cognitiveLoad}</p>
									<p className="text-[9px] text-fuchsia-300/70 mt-0.5">{collectedPerks.length * 15 + 65}% Bandwidth</p>
								</div>
							</div>
						</div>
					)}

					{/* Tactical Sensory Briefing Banner */}
					<div className="grid gap-3 border-t border-white/10 bg-slate-950/80 p-3.5 sm:grid-cols-2 sm:px-6">
						<div className="rounded-xl border border-amber-400/20 bg-amber-950/20 p-3">
							<p className="text-[9px] font-bold uppercase tracking-wider text-amber-300">The Biological Perceptual Trap</p>
							<p className="mt-1 text-xs text-slate-300 leading-5">{challenge.tacticalBriefing.biologicalDilemma}</p>
						</div>
						<div className="rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-3">
							<p className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">The Silicon Transformer Trap</p>
							<p className="mt-1 text-xs text-slate-300 leading-5">{challenge.tacticalBriefing.siliconTrap}</p>
						</div>
					</div>
				</div>

				{/* STAGE 2: SENSORY EVIDENCE CLUES */}
				<div
					data-guide-stage="2"
					className={`mt-3 grid gap-2.5 rounded-2xl border bg-slate-950/40 p-4 transition-all duration-700 md:grid-cols-[1fr_auto] md:items-center sm:mt-4 ${
						readingStage === 2 ? 'border-violet-400/40 shadow-[0_0_36px_rgba(167,139,250,0.12)]' : introSeen ? 'border-white/10' : 'border-white/5 opacity-70'
					}`}
				>
					<div>
						<div className="flex items-center gap-2">
							<span className="flex size-5 items-center justify-center rounded-full border border-violet-400/40 bg-violet-400/15 font-mono text-[10px] font-bold text-violet-200">
								2
							</span>
							<p className="text-[10px] font-bold uppercase tracking-[.22em] text-violet-300">
								Sensory Vector Evidence
							</p>
						</div>
						<p className="mt-1.5 text-sm text-slate-100 font-medium">
							{challenge.cue} <strong className="text-amber-300">Which candidate output wins the convergence?</strong>
						</p>
						{probeUsed && (
							<div className="mt-2.5 rounded-lg border border-violet-400/30 bg-violet-500/10 p-2.5 text-xs text-violet-100">
								<strong className="text-violet-300">Diagnostic Probe Reading:</strong> Middle-layer feature{' '}
								<strong>{challenge.featureLabels[probe.input]}</strong> provides{' '}
								<strong className="text-amber-300">{challenge.outputLabels[probe.output]}</strong> the single largest weighted vote (+{format(probe.value)}). Other features may still overturn the outcome.
							</div>
						)}
					</div>
					<button
						type="button"
						disabled={probeUsed || phase > 0}
						onClick={() => {
							sound.playClick();
							setProbeUsed(true);
						}}
						className="glass-btn glass-btn--secondary justify-center text-xs"
					>
						Deploy Diagnostic Probe ⚡
					</button>
				</div>

				{/* Input Strength Bars */}
				<div
					data-guide-stage="2"
					className={`mt-2.5 grid gap-2 transition-all duration-700 sm:gap-2.5 ${inputGridClass(challenge.input.length)} ${
						readingStage === 2 || introSeen ? 'opacity-100' : 'opacity-70'
					}`}
					aria-label="Input evidence strengths"
				>
					{challenge.input.map((value, index) => {
						const isActiveCue = phase === index + 1;
						const hasPassed = phase > index + 1;
						return (
							<div
								key={challenge.inputLabels[index]}
								className={`relative min-w-0 rounded-xl border p-2.5 transition-all duration-500 sm:p-3.5 ${
									isActiveCue
										? 'border-violet-300/80 bg-violet-500/20 ring-2 ring-violet-400 shadow-[0_0_30px_rgba(167,139,250,0.35)] scale-102'
										: hasPassed
											? 'border-emerald-400/20 bg-emerald-500/5 opacity-70'
											: 'border-violet-400/15 bg-violet-500/[0.03]'
								}`}
							>
								{isActiveCue && (
									<span className="absolute -top-2.5 right-2 rounded-full bg-violet-200 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-950 animate-pulse">
										Processing
									</span>
								)}
								<div className="flex items-center justify-between gap-1">
									<p className="truncate text-xs font-semibold text-violet-100">{challenge.inputLabels[index]}</p>
									<span className="font-mono text-xs font-bold text-violet-300">{Math.round(value * 100)}%</span>
								</div>
								<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-950/70">
									<div
										className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"
										style={{ width: `${value * 100}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>

				{/* STAGE 3: PREDICTION CONSOLE */}
				<div
					data-guide-stage="3"
					className={`mt-4 rounded-2xl border border-amber-400/30 bg-[linear-gradient(135deg,rgba(40,24,5,0.7),rgba(15,23,42,0.9))] p-4 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.08)] transition-all duration-700 ${
						readingStage === 3 ? 'shadow-[0_0_50px_rgba(245,158,11,0.18)]' : ''
					}`}
				>
					<div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
						<div>
							<div className="flex items-center gap-2">
								<span className="flex size-5 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/15 font-mono text-[10px] font-bold text-amber-200">
									3
								</span>
								<p className="text-[10px] font-bold uppercase tracking-[.22em] text-amber-300">
									Formulate Hypothesis & Prediction
								</p>
							</div>
							<p className="mt-1 text-xs text-slate-300">
								Select the candidate interpretation that reconciles all available cues, then trigger the comparison.
							</p>
						</div>
						{answerNeeded && (
							<span className="flex items-center gap-2 text-xs font-bold text-emerald-300">
								<span className="size-2 rounded-full bg-emerald-400 animate-ping" />
								Awaiting Your Input →
							</span>
						)}
					</div>

					<div className={`mt-3.5 grid gap-2.5 sm:gap-3 ${optionGridClass(challenge.outputLabels.length)}`}>
						{challenge.outputLabels.map((label, index) => (
							<button
								key={label}
								type="button"
								disabled={phase > 0}
								onClick={() => {
									sound.playClick();
									setGuess(index);
								}}
								className={`group relative min-h-20 rounded-xl border p-3 text-left transition-all duration-300 ${
									guess === index
										? 'border-amber-300/80 bg-amber-400/20 text-white ring-2 ring-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.3)] scale-101'
										: 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
								}`}
							>
								{guess === index && (
									<span className="absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded-full bg-amber-300 text-[10px] font-black text-slate-950">
										✓
									</span>
								)}
								<div className="flex items-baseline gap-2">
									<span className="font-mono text-xs font-bold text-amber-300/80">0{index + 1}</span>
									<span className="text-sm font-bold text-white group-hover:text-amber-200">{label}</span>
								</div>
								<span className="mt-1 block text-[11px] leading-4 text-slate-400 group-hover:text-slate-200">
									{challenge.outputDescriptions[index]}
								</span>
							</button>
						))}
					</div>

					<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-4">
						{revealed ? (
							<div className="flex items-center gap-2">
								<span className={`text-sm font-bold ${guess === winner ? 'text-emerald-300' : 'text-amber-300'}`}>
									{guess === winner ? '✓ Hypothesis Confirmed: ' : 'Best Mathematical Fit: '}
								</span>
								<strong className="text-white text-base">{challenge.outputLabels[winner]}</strong>
							</div>
						) : (
							<p className="text-xs text-slate-400">
								Click an option above to lock your hypothesis before executing the simulation.
							</p>
						)}

						<div>
							{revealed ? (
								<button
									type="button"
									onClick={runComplete ? resetRun : openInBetweenTransition}
									className="glass-btn glass-btn--primary w-full sm:w-auto"
								>
									{runComplete ? 'Replay Mission Series ↺' : 'Explore Between-Chapter Passage ➜'}
								</button>
							) : (
								<button
									type="button"
									onClick={runRound}
									disabled={guess === null || phase > 0}
									className="glass-btn glass-btn--primary w-full sm:w-auto text-sm"
								>
									Execute Dual-Substrate Simulation ↓
								</button>
							)}
						</div>
					</div>
				</div>

				{/* STAGE 4: WATCH IT TRAVEL (MATRIX VS BIOLOGY LIVE COMPARISON) */}
				<div
					data-guide-stage="4"
					className={`mt-5 transition-all duration-700 ${readingStage === 4 || introSeen ? 'opacity-100' : 'opacity-70'}`}
				>
					<div className="mb-3 flex items-center justify-between px-1">
						<div className="flex items-center gap-2">
							<span className="flex size-5 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/15 font-mono text-[10px] font-bold text-cyan-200">
								4
							</span>
							<p className="text-[10px] font-bold uppercase tracking-[.25em] text-cyan-300">
								Dual Processing Architecture (Silicon vs Cortex)
							</p>
						</div>
					</div>

					{/* Mobile Tabs */}
					<div className="lg:hidden mb-3">
						<div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1">
							{(['machine', 'brain', 'percept'] as const).map((view) => (
								<button
									key={view}
									type="button"
									onClick={() => {
										sound.playClick();
										setMobileView(view);
									}}
									className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition ${
										mobileView === view ? 'bg-white/15 text-white ring-1 ring-white/20' : 'text-slate-400'
									}`}
								>
									{view === 'machine' ? 'Silicon Matrix' : view === 'brain' ? 'Cortical Circuit' : 'Percept View'}
								</button>
							))}
						</div>
						{mobileView === 'machine' && <div className="mt-2"><MatrixPanel challenge={challenge} phase={phase} /></div>}
						{mobileView === 'brain' && <div className="mt-2"><BrainPanel challenge={challenge} phase={phase} /></div>}
						{mobileView === 'percept' && (
							<PerceptCanvas
								challenge={challenge}
								phase={phase}
								onReplay={() => {
									setPhase(1);
									setMobileView('percept');
								}}
								onAdvance={revealed ? (runComplete ? resetRun : openInBetweenTransition) : undefined}
								onStepChange={(newStep) => setPhase(newStep)}
								advanceLabel={runComplete ? 'Replay Series ↺' : 'Between-Chapter Passage ➜'}
								idPrefix="m"
							/>
						)}
					</div>

					{/* Desktop Side-by-Side Panels */}
					<div className="hidden gap-4 lg:grid lg:grid-cols-2">
						<MatrixPanel challenge={challenge} phase={phase} />
						<BrainPanel challenge={challenge} phase={phase} />
					</div>
				</div>

				{/* Desktop Emerging Percept View */}
				<div
					data-guide-stage="4"
					className={`hidden transition-all duration-700 lg:block ${readingStage === 4 || introSeen ? 'opacity-100' : 'opacity-70'}`}
				>
					<PerceptCanvas
						challenge={challenge}
						phase={phase}
						onReplay={() => setPhase(1)}
						onAdvance={revealed ? (runComplete ? resetRun : openInBetweenTransition) : undefined}
						onStepChange={(newStep) => setPhase(newStep)}
						advanceLabel={runComplete ? 'Replay Series ↺' : 'Between-Chapter Passage ➜'}
						idPrefix="d"
					/>
				</div>

				{/* STAGE 5: POST-ROUND EXPLANATION & CONTRIBUTION LEDGER */}
				{revealed && (
					<div
						data-guide-stage="5"
						className={`mt-4 overflow-hidden rounded-2xl border border-emerald-400/30 bg-slate-950/50 shadow-[0_0_40px_rgba(52,211,153,0.1)] transition-all duration-700 ${
							readingStage === 5 ? 'border-emerald-300' : ''
						}`}
					>
						<div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3 sm:px-6">
							<div className="flex items-center gap-2">
								<span className="flex size-5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/20 font-mono text-[10px] font-bold text-emerald-100">
									5
								</span>
								<p className="text-[10px] font-bold uppercase tracking-[.22em] text-emerald-300">
									Scientific Debrief & Narrative Resolution
								</p>
							</div>
							<span className="font-mono text-xs text-emerald-200">
								LEAD OVER RUNNER-UP: +{format(decisionMargin)}
							</span>
						</div>

						{/* Narrative Outcome */}
						<div className="border-b border-fuchsia-400/20 bg-fuchsia-950/20 px-4 py-4 sm:px-6">
							<p className="text-[10px] font-bold uppercase tracking-[.2em] text-fuchsia-300">The Story Advances:</p>
							<p className="mt-1 text-sm leading-7 text-slate-100 sm:text-base">{challenge.outcome}</p>
						</div>

						{/* Mathematical Ledger */}
						<div className="p-4 sm:p-6">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-3">
								<div>
									<h4 className="text-base font-bold text-white">Layer 2 Feature Contribution Ledger</h4>
									<p className="mt-0.5 text-xs text-slate-400">
										How each learned feature multiplied by its synaptic weight to produce the winning recognition.
									</p>
								</div>
								<span className="font-mono text-xs text-cyan-300">
									Total Activation: {format(outputs[winner]!)}
								</span>
							</div>

							<div className={`mt-3.5 grid gap-2 sm:gap-3 ${optionGridClass(winningContributions.length)}`}>
								{winningContributions.map((item) => (
									<div
										key={item.label}
										className={`min-w-0 rounded-xl border p-3 ${
											item.effect >= 0
												? 'border-emerald-400/25 bg-emerald-500/5'
												: 'border-rose-400/25 bg-rose-500/5'
										}`}
									>
										<div className="flex items-center justify-between">
											<p className="truncate text-xs font-bold text-white">{item.label}</p>
											<span
												className={`font-mono text-xs font-black ${
													item.effect >= 0 ? 'text-emerald-300' : 'text-rose-300'
												}`}
											>
												{item.effect >= 0 ? '+' : ''}{format(item.effect)}
											</span>
										</div>
										<p className="mt-1 font-mono text-[10px] text-slate-400">
											{format(item.input)} feat × {format(item.weight)} wt
										</p>
										<span
											className={`mt-1 inline-block text-[9px] font-bold uppercase tracking-wider ${
												item.effect >= 0 ? 'text-emerald-400' : 'text-rose-400'
											}`}
										>
											{item.effect >= 0 ? 'Excitatory (+)' : 'Inhibitory (-)'}
										</span>
									</div>
								))}
							</div>

							<div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-950/20 p-4">
								<p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-300">Neuroscience Bridge</p>
								<p className="mt-1 text-xs leading-6 text-slate-200">{challenge.bridge}</p>
							</div>
						</div>
					</div>
				)}

				{/* IN-BETWEEN CHAPTER TRANSITION MODAL / STAGE */}
				{activeTransition && (
					<div className="mt-5 overflow-hidden rounded-3xl border border-cyan-400/40 bg-[radial-gradient(ellipse_at_top,#0c2333,#050f16)] p-6 sm:p-8 shadow-[0_0_60px_rgba(34,211,238,0.25)] animate-in fade-in duration-500">
						<div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
							<div className="flex items-center gap-2">
								<span className="size-2 rounded-full bg-cyan-300 animate-ping" />
								<p className="font-mono text-xs font-bold uppercase tracking-[.2em] text-cyan-300">
									{activeTransition.title} // {activeTransition.location}
								</p>
							</div>
							<span className="font-mono text-xs text-slate-400">TACTICAL INTERMISSION</span>
						</div>

						<p className="mt-4 text-sm leading-7 text-slate-100 sm:text-base">
							{activeTransition.narrative}
						</p>

						{/* Dialogue Exchange */}
						<div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5">
							<div className="border-l-2 border-emerald-400/70 pl-3">
								<p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Dr. Astrid Van Hoyt (Comms / Beside Hans):</p>
								<p className="mt-1 text-xs sm:text-sm text-emerald-100 italic leading-6">{activeTransition.dialogue.astrid}</p>
							</div>
							<div className="border-l-2 border-cyan-400/70 pl-3">
								<p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Dr. Hans Werner (Internal & Spoken):</p>
								<p className="mt-1 text-xs sm:text-sm text-cyan-100 italic leading-6">{activeTransition.dialogue.hans}</p>
							</div>
						</div>

						{/* Interactive In-Between Tactical Choices */}
						<div className="mt-5">
							<p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
								Tactical Transition Decision · Choose Your Action:
							</p>
							<div className="mt-3 grid gap-3 sm:grid-cols-3">
								{activeTransition.choices.map((choice, cIdx) => (
									<button
										key={choice.label}
										type="button"
										onClick={() => {
											handleSelectTacticalChoice(activeTransition, choice, cIdx);
										}}
										className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
											selectedChoiceIndex === cIdx
												? 'border-amber-300/90 bg-amber-500/20 ring-2 ring-amber-300 text-white shadow-[0_0_24px_rgba(251,191,36,0.3)] scale-102'
												: 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]'
										}`}
									>
										<p className="text-xs font-bold text-white">{choice.label}</p>
										<p className="mt-1.5 text-[11px] leading-4 text-slate-400">{choice.description}</p>
										<span className="mt-3 block font-mono text-[10px] font-bold text-amber-300/90">
											{choice.statBonus}
										</span>
									</button>
								))}
							</div>

							{selectedChoiceIndex !== null && (
								<div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-100 leading-6 animate-in fade-in duration-300">
									<strong className="text-emerald-300 block mb-0.5">Action Outcome:</strong>
									{activeTransition.choices[selectedChoiceIndex]!.outcome}
								</div>
							)}
						</div>

						<div className="mt-6 flex justify-end border-t border-white/10 pt-4">
							<button
								type="button"
								onClick={nextRound}
								className="glass-btn glass-btn--primary px-5 py-2 text-sm font-bold"
							>
								Proceed to {nextChallenge.chapter} ➔
							</button>
						</div>
					</div>
				)}

				{/* RUN DEBRIEF & CONCLUSION */}
				{runComplete && (
					<div className="mt-5 overflow-hidden rounded-3xl border border-emerald-400/40 bg-[radial-gradient(ellipse_at_top,#064e3b,#022c22)] p-6 sm:p-8 shadow-[0_0_60px_rgba(52,211,153,0.3)]">
						<div className="flex items-center justify-between border-b border-emerald-400/30 pb-4">
							<div>
								<span className="rounded-full bg-emerald-400/20 px-3 py-1 font-mono text-[10px] font-black uppercase text-emerald-200 border border-emerald-300/40">
									FACILITY OVERRIDE COMPLETE
								</span>
								<h2 className="mt-3 text-3xl font-black text-white tracking-tight sm:text-4xl">
									You Silenced The Night Signal.
								</h2>
								<p className="mt-1 text-sm text-emerald-200/90 font-medium">
									{correctRounds} of {challenges.length} Chapters Solved · Peak Streak: {bestStreak} · Accuracy: {Math.round((correctRounds / challenges.length) * 100)}%
								</p>
							</div>
							<button
								type="button"
								onClick={resetRun}
								className="glass-btn glass-btn--primary justify-center text-xs"
							>
								Restart Simulation ↺
							</button>
						</div>

						<p className="mt-4 text-sm leading-7 text-emerald-100 max-w-3xl">
							When the master magnetic locks release, cold night air rushes into Sub-Level 5. Hans and Astrid step out onto the rain-slicked surface as emergency sirens fade. Nine uncertain sensory paradoxes transformed into coherent perceptions: sensory vectors became features, features became hypotheses, and hypotheses became survivable decisions—proving that while machine learning and biological brains converge on shared mathematics, their physical implementations remain profoundly different.
						</p>

						<div className="mt-6 grid gap-3 sm:grid-cols-3">
							<div className="rounded-2xl border border-white/10 bg-black/40 p-4">
								<p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">1. Shared Abstraction</p>
								<p className="mt-1 text-xs text-slate-300 leading-5">Both silicon nodes and dendritic trees accumulate weighted inputs through nonlinear integration.</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-black/40 p-4">
								<p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">2. Physical Time</p>
								<p className="mt-1 text-xs text-slate-300 leading-5">Machines compute in discrete synchronized clock cycles; biological neural circuits are continuous, stateful dynamical systems.</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-black/40 p-4">
								<p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-300">3. Credit Assignment</p>
								<p className="mt-1 text-xs text-slate-300 leading-5">Backpropagation uses global error gradients; biological synapses adapt through local biophysical coincidence and neuromodulation.</p>
							</div>
						</div>
					</div>
				)}
			</section>

			{/* SIX FACTS SECTION */}
			<section className="app-surface">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-bold uppercase tracking-[.28em] text-cyan-300">Six Critical Boundary Conditions</p>
						<h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
							The simplification is the lesson—and the trap.
						</h2>
					</div>
					<p className="max-w-sm text-xs leading-5 text-slate-400">
						Each card marks a boundary where the visual analogy becomes scientifically incomplete.
					</p>
				</div>

				<div className="mt-6 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
					{factCards.map((item, index) => (
						<article
							key={item.title}
							className="group rounded-2xl border border-white/10 bg-slate-950/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
						>
							<div className="flex items-center justify-between">
								<p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">{item.tag}</p>
								<span className="font-mono text-xs text-slate-500 font-bold">0{index + 1}</span>
							</div>
							<h3 className="mt-3 text-base font-bold text-white group-hover:text-cyan-200">{item.title}</h3>
							<p className="mt-2.5 text-xs leading-6 text-slate-300">{item.fact}</p>
							<div className="mt-4 border-t border-white/8 pt-3">
								<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Why It Matters</p>
								<p className="mt-1 text-xs leading-5 text-slate-400">{item.use}</p>
							</div>
						</article>
					))}
				</div>
			</section>

			{/* DEEP DIFFERENCES & LEARNING MICROSCOPE */}
			{differences.map((item, index) => (
				<section key={item.number} className="app-surface overflow-hidden p-0">
					<div className="border-b border-white/10 px-6 py-5 sm:px-8">
						<div className="flex items-start gap-4">
							<span className="font-mono text-sm font-bold text-cyan-400">{item.number}</span>
							<div>
								<p className="text-xs uppercase font-bold tracking-[0.22em] text-slate-400">{item.kicker}</p>
								<h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">{item.title}</h2>
							</div>
						</div>
					</div>
					<div className="grid md:grid-cols-2">
						<div className="border-b border-white/10 p-6 md:border-r md:border-b-0 sm:p-8 bg-cyan-950/[0.08]">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Artificial Neural Network</p>
							<p className="mt-3 text-sm leading-7 text-slate-300">{item.ai}</p>
						</div>
						<div className="p-6 sm:p-8 bg-amber-950/[0.08]">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Biological Brain Circuit</p>
							<p className="mt-3 text-sm leading-7 text-slate-300">{item.brain}</p>
						</div>
					</div>
					<div className="border-t border-white/10 bg-white/[0.02] px-6 py-4 text-sm font-medium text-slate-300 sm:px-8">
						<span className="mr-2 text-cyan-400 font-bold">→ Summary:</span> {item.verdict}
					</div>

					{index === 2 && (
						<div className="border-t border-white/10 p-6 sm:p-8 bg-slate-950/60">
							<div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
								<div>
									<p className="text-xs uppercase font-bold tracking-[.22em] text-violet-300">Interactive Learning Microscope</p>
									<h3 className="mt-1 text-xl font-bold text-white">Compare the Update Mechanism</h3>
									<p className="mt-2.5 text-xs leading-6 text-slate-300">
										Both systems may increase effective connection strength. What drove that change is the crucial distinction: global analytical backpropagation versus local biochemical coincidence.
									</p>
									<div className="mt-4 flex gap-2">
										<button
											type="button"
											onClick={() => {
												sound.playClick();
												setLearningMode('before');
											}}
											className={`glass-pill ${learningMode === 'before' ? 'is-active' : ''}`}
										>
											Before Learning
										</button>
										<button
											type="button"
											onClick={() => {
												sound.playClick();
												setLearningMode('after');
											}}
											className={`glass-pill ${learningMode === 'after' ? 'is-active' : ''}`}
										>
											After One Update
										</button>
									</div>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-4">
										<p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Machine Backprop</p>
										<div className="mt-3 flex items-end gap-3 h-24">
											{[0.35, 0.62, 0.45, 0.76].map((height, i) => (
												<div
													key={i}
													className="flex-1 rounded-t bg-cyan-400/60 transition-all duration-500"
													style={{ height: `${(learningMode === 'after' ? height + [0.08, -0.03, 0.12, 0.02][i]! : height) * 100}%` }}
												/>
											))}
										</div>
										<p className="mt-3 text-[11px] text-cyan-200">Gradients routed analytically from scalar loss</p>
									</div>
									<div className="rounded-2xl border border-amber-400/20 bg-amber-950/20 p-4">
										<p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Biological Plasticity (LTP)</p>
										<div className="mt-3 flex items-end gap-3 h-24">
											{[0.35, 0.62, 0.45, 0.76].map((height, i) => (
												<div
													key={i}
													className="flex-1 rounded-t bg-amber-400/60 transition-all duration-500"
													style={{ height: `${(learningMode === 'after' ? height + [0, 0.12, 0, 0][i]! : height) * 100}%` }}
												/>
											))}
										</div>
										<p className="mt-3 text-[11px] text-amber-200">Local spike coincidence opens NMDA calcium influx</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</section>
			))}

			{/* TIME LADDER */}
			<section className="app-surface overflow-hidden p-0">
				<div className="border-b border-white/10 p-6 sm:p-8">
					<p className="text-xs font-bold uppercase tracking-[.25em] text-violet-300">Temporal Dynamics Ladder</p>
					<h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">“Fast” and “Slow” Mean Completely Different Things.</h2>
					<p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">
						Comparing physical wall-clock benchmarks rarely teaches mechanism. This ladder contrasts the physical events occurring at each temporal order of magnitude.
					</p>
				</div>
				<div className="divide-y divide-white/8">
					{timeScales.map((item, index) => (
						<div key={item.scale} className="grid gap-4 p-5 sm:grid-cols-[140px_1fr_1fr] sm:p-7">
							<div>
								<span className="font-mono text-xs font-bold text-violet-400">T{index + 1}</span>
								<p className="mt-1 text-sm font-bold text-white">{item.scale}</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">Silicon Frame</p>
								<p className="mt-1.5 text-xs leading-6 text-slate-300">{item.machine}</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-300">Biological Frame</p>
								<p className="mt-1.5 text-xs leading-6 text-slate-300">{item.biology}</p>
								<p className="mt-2 text-[11px] italic text-slate-400 border-l border-amber-400/40 pl-2">{item.anchor}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* STACK THE LAYERS / DEPTH VIEW */}
			<section className="app-surface overflow-hidden p-0">
				<div className="border-b border-white/10 p-6 sm:p-8">
					<p className="text-xs font-bold uppercase tracking-[.25em] text-sky-300">Hierarchical Stacking</p>
					<h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">From Low-Level Patterns to Invariant Concepts.</h2>
					<p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">
						Every mission above simulated a two-layer transform. Real deep artificial networks and cortical streams stack many such transforms to extract invariant abstractions from raw sensory data.
					</p>
				</div>
				<div className="grid lg:grid-cols-2">
					<div className="border-b border-white/10 p-6 sm:border-r sm:border-b-0 sm:p-8">
						<div className="flex items-center justify-between">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Silicon: Deep Artificial Network</p>
							<span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[9px] text-cyan-200">
								STACKED MATRICES
							</span>
						</div>
						<p className="mt-2 text-xs leading-6 text-slate-300">
							Each layer computes ŷ = σ(W · x + b). The nonlinear activation function σ allows stacked linear matrices to approximate complex functions.
						</p>
						<div className="mt-4 rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-3 sm:p-4">
							<DeepNetDiagram />
						</div>
						<p className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-center font-mono text-xs text-cyan-200">
							ŷ = σ(W₄ · σ(W₃ · σ(W₂ · σ(W₁ · x))))
						</p>
					</div>

					<div className="p-6 sm:p-8">
						<div className="flex items-center justify-between">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Biology: Ventral Visual Stream</p>
							<span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[9px] text-amber-200">
								CORTICAL HIERARCHY
							</span>
						</div>
						<p className="mt-2 text-xs leading-6 text-slate-300">
							The ventral stream represents visual form at progressively higher abstraction levels, but includes massive top-down feedback.
						</p>
						<div className="mt-4 space-y-2.5">
							{cortexStages.map((stage, index) => (
								<div key={stage.area} className="flex items-center gap-2.5">
									<div className="flex-1 rounded-xl border border-amber-400/20 bg-amber-950/20 p-3">
										<div className="flex items-baseline justify-between">
											<span className="font-mono text-xs font-bold text-amber-200">{stage.area}</span>
											<span className="text-xs font-bold text-white">{stage.role}</span>
										</div>
										<p className="mt-1 text-[11px] text-slate-400 leading-4">{stage.detail}</p>
									</div>
									{index < cortexStages.length - 1 && <span className="text-amber-400/50">↓</span>}
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* FINAL SUMMARY TAKEAWAY */}
			<section className="app-surface app-surface--hero text-center py-10 sm:py-14">
				<p className="text-xs font-bold uppercase tracking-[.3em] text-emerald-300">Fundamental Synthesis</p>
				<h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl tracking-tight">
					The brain inspired the vocabulary.
					<br />
					It did not provide the blueprint.
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-200">
					Artificial neural networks and biological nervous systems implement shared mathematical abstractions. Understanding either requires analyzing physical substrate, continuous temporal dynamics, and decentralized credit assignment—rather than superficial metaphors.
				</p>
			</section>
				</>
			)}

			{/* MISSION DOSSIER MODAL */}
			<MissionDossierModal
				isOpen={showDossier}
				onClose={() => setShowDossier(false)}
				currentChapterIndex={challengeIndex}
				collectedPerks={collectedPerks}
				hansTelemetry={challenge.telemetry}
				heartRateDelta={heartRateDelta}
			/>

			<ModuleHandoffBanner />
		</div>
	);
}
