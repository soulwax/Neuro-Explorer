'use client';

import { useEffect, useMemo, useState } from 'react';
import { ModuleHandoffBanner } from '~/components/module-handoff-banner';

type Challenge = {
	id: string;
	name: string;
	chapter: string;
	story: string;
	thought: string;
	outcome: string;
	cue: string;
	preview: string;
	interlude: string;
	domain: string;
	inputLabels: string[];
	featureLabels: string[];
	outputLabels: string[];
	outputDescriptions: string[];
	perceptTitle: string;
	perceptSteps: string[];
	why: string;
	bridge: string;
	input: number[];
	weights: number[][];
};

const challenges: Challenge[] = [
	{
		id: 'edge',
		name: 'Find the edge',
		chapter: '01 · The dark corridor',
		story:
			'02:13. The research wing drops into darkness and the magnetic locks fire like gunshots down the hall. You are Dr. Hans Werner, and you wake on the corridor floor with your pulse in your ears and no memory of how you fell. The emergency lamp stutters overhead, throwing the walls into a red strobe — and in all that lurching shadow, one thing refuses to flinch: a single pale vertical line, holding its shape while everything around it shakes.',
		thought:
			'Breathe, Hans. In a strobe, panic paints a trap onto every moving shadow. Trust the thing that stays the same when the light changes — not the thing that screams the loudest.',
		outcome:
			'The line keeps its geometry no matter how the light lurches. It isn’t paint and it isn’t shadow — it is the seam of a door. You find the emergency release by feel, wrench it open, and slip into the service corridor beyond.',
		cue: 'The brightness on either side of the line keeps shifting, yet the line itself stays thin, sharp, and almost textureless — and it never moves when the lamp flickers.',
		preview: 'A dead service lift, and four sounds bleeding through the wall — one of them is a way down.',
		interlude:
			'You feel your way down the service corridor, the red strobe fading behind you. Somewhere ahead, past a dead end of cold pipes, the ventilation roar swallows a set of sounds you can’t yet name.',
		domain: 'Visual cortex',
		inputLabels: ['Left contrast', 'Center detail', 'Right contrast'],
		featureLabels: ['Broad contrast', 'Fine detail', 'Rightward gradient'],
		outputLabels: ['Door seam', 'Painted stripe', 'Cast shadow'],
		outputDescriptions: [
			'A stable, narrow contrast boundary that ignores the light',
			'A crisp line too — but paint should carry faint surface grain',
			'Also a dark band — yet a shadow would drift as the lamp flickers',
		],
		perceptTitle: 'A contour emerges',
		perceptSteps: ['Left contrast establishes one side', 'Center detail tests texture', 'Right contrast closes the border'],
		why: 'Door seam wins because a strong, stable contrast boundary converges on a narrow, texture-free edge that survives the changing light. Paint would carry surface grain; a shadow would slide with the lamp.',
		bridge:
			'Real edge-selective responses emerge across retinal and cortical circuits with spatial receptive fields. This three-number version captures selectivity, not the anatomy.',
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
		chapter: '02 · Behind the wall',
		story:
			'The corridor dies at a sealed service lift. Behind the ventilation roar, four sounds bleed through the wall: a low mechanical drone, one clear ringing tone, a thin electric hiss, and a strangely patient, even pulse. One of them is the lift’s access chime — your way down into the building. The others might mean the fire-suppression system has already armed itself around you.',
		thought:
			'You want the lift to work so badly you can taste it. Wanting is a guess wearing the clothes of a fact, Hans. Take the sound apart — pitch in one hand, rhythm in the other — before you believe any of it.',
		outcome:
			'The clear middle pitch and the patient beat lock together into the two-part access chime you half-remember from a hundred ordinary mornings. Something behind the wall releases, and the lift doors shudder apart.',
		cue: 'There is almost no low rumble; the middle carries a strong, tuned pitch; a high hiss sits on top; and underneath everything runs a steady, repeating beat.',
		preview: 'The lift stalls between floors, and a maintenance beacon starts flashing through a grate.',
		interlude:
			'The lift carries you two floors down and then simply stops, suspended in the shaft. In the stalled dark, a maintenance beacon begins to pulse through a grated panel — left, then centre, then right.',
		domain: 'Auditory cortex',
		inputLabels: ['Low rumble', 'Clear middle tone', 'High hiss', 'Even pulse'],
		featureLabels: ['Low-band drone', 'Tuned pitch', 'High-band edge', 'Regular rhythm'],
		outputLabels: ['Access chime', 'Ventilation fan', 'Fire alarm', 'Phone vibration'],
		outputDescriptions: [
			'A clear pitch riding on a steady, learned rhythm',
			'Mostly low, continuous energy — but the middle is louder than a fan',
			'High energy with an urgent beat — the hiss and pulse almost fit',
			'A rhythm with no real pitch — close, if you ignore the tone',
		],
		perceptTitle: 'A pitch profile takes shape',
		perceptSteps: [
			'Low rumble establishes the background',
			'A clear pitch separates from the drone',
			'High hiss adds uncertainty',
			'Regular timing reveals a learned chime',
		],
		why: 'Access chime wins because a strong tuned pitch and a regular rhythm arrive together. The low drone explains only the background; the high hiss explains only the noise; neither one accounts for both features at once.',
		bridge:
			'Auditory pathways preserve frequency maps called tonotopy, but real sound coding also depends on timing, intensity, harmonics, and context.',
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
		chapter: '03 · The moving beacon',
		story:
			'The lift jerks to a halt between floors. Through a grated maintenance panel, a beacon begins to flash — first at the left edge, then the centre, then further right — each flash a little brighter than the last. Your peripheral vision stitches the separate sparks into something that feels, unmistakably, like movement heading somewhere.',
		thought:
			'Your eyes keep lunging at the brightest flash. Brightness is a decoy, Hans. Direction doesn’t live in how bright a flash is — it lives in the order they arrive.',
		outcome:
			'The three glimpses fuse into a single clean vector — motion to the right. You take the east passage a heartbeat before the lift gives out entirely and the shaft goes silent.',
		cue: 'Three separate flashes in sequence; the last one lands furthest right and burns brightest — but it is the order of the flashes, not their brightness, that carries the direction.',
		preview: 'A security monitor wakes in a blizzard of static — is that a face, or something waiting?',
		interlude:
			'The east passage spits you into a records room walled with dead monitors. One of them, impossibly, is still drawing power — and something is moving inside its snow of static.',
		domain: 'Motion pathway',
		inputLabels: ['Early position', 'Middle position', 'Late position'],
		featureLabels: ['Early trace', 'Sequence continuity', 'Late trace'],
		outputLabels: ['Moves left', 'Stays still', 'Moves right'],
		outputDescriptions: [
			'Would need an early-weighted sequence — but the early flash is weakest',
			'Pools the middle and late flashes without ever choosing a direction',
			'Reads the ordered sequence as travel toward the strong late flash',
		],
		perceptTitle: 'Positions become a trajectory',
		perceptSteps: ['The object appears early', 'A second sample suggests direction', 'The late sample completes rightward motion'],
		why: 'Moves right wins because the population tuned to rightward motion listens most strongly to the late-position sample, and that sample is the strongest. “Stays still” is tempting — it pools the middle and late flashes — but it never commits to a direction.',
		bridge:
			'Biological motion selectivity depends on ordered activity across space and time. A static vector here stands in for that temporal sequence.',
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
		chapter: '04 · The noisy camera',
		story:
			'A dead security monitor flickers awake. Through a blizzard of compression static you catch fragments — a pair of eyes, the curve of a head, drifting digital blocks, and, half a second behind, a movement that answers the raised hand on the screen. You need to know, right now, whether the figure on that monitor is coming to help you or waiting for you to walk into it.',
		thought:
			'Please let it be Astrid. But hope can finish a face that was never there, Hans. Demand one thing a reflection, a mannequin, or a stranger cannot fake — living motion that answers you, not one that merely mirrors.',
		outcome:
			'The face turns as the hand rises — synchronised, not mirrored, not mechanical. It is Astrid, thank God, alive, signalling to you from the control room two floors down. You are not alone in the dark after all.',
		cue: 'Paired eyes and a bounded head are strong; the static is weak; and the face turns in time with the moving hand rather than mirroring your own movement.',
		preview: 'The control room reeks of hot plastic and ozone, and a single green safety lamp is still lit.',
		interlude:
			'Imani’s signal points you toward the control room. You cross to it with your heart still hammering, and the instant you reach the glass the air itself changes: hot plastic, ozone, and the first thin edge of something burning.',
		domain: 'Ventral stream',
		inputLabels: ['Paired eyes', 'Head outline', 'Video noise', 'Synchronized motion'],
		featureLabels: ['Paired features', 'Bounded shape', 'Scene clutter', 'Biological movement'],
		outputLabels: ['Dr. Astrid Van Hoyt', 'Your reflection', 'A mannequin', 'An intruder'],
		outputDescriptions: [
			'Real face structure plus motion that answers the signal',
			'Would mirror your own movement — and this does not',
			'A face-shaped outline, but nothing alive is moving it',
			'A genuine face too — the question is whether that motion belongs to it',
		],
		perceptTitle: 'Features settle into a face',
		perceptSteps: [
			'Paired eyes activate a face hypothesis',
			'The outline binds them into a head',
			'Compression blocks test false completion',
			'Synchronized movement identifies a living person',
		],
		why: 'Dr. Astrid Van Hoyt wins because real face structure and synchronised, living motion converge while the static is discounted. “An intruder” is the trap — a plausible face — but its motion never locks to the signal the way a familiar, responsive person’s does.',
		bridge:
			'Face perception is distributed across recurrent visual networks. No single biological ‘face neuron’ is taking this neat, fixed ballot.',
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
		chapter: '05 · Alarm or all-clear',
		story:
			"Astrid's voice reaches you through a cracked intercom, and then you are at the control-room glass. Your heart is slamming; the air is sharp with hot plastic and ozone; a single green safety lamp glows steady and reassuring on the panel; and above a bank of battery cabinets the air has begun to shimmer with heat. The lockdown display offers four explanations — and each one wants you to do something different, right now.",
		thought:
			'Your racing heart is telling you about you, not about the room. And that calm green lamp badly wants to be believed. Separate the panic and the reassurance from the heat and the smell before you touch anything.',
		outcome:
			'The green lamp pushes hard toward “all clear” — but it cannot cancel the heat and the ozone stacking up behind it. You trigger fire isolation on the battery bank seconds before the first cell splits and vents.',
		cue: 'High arousal, a strong electrical/ozone context, one reassuring green safety cue, and genuinely rising heat — and they do not all point the same way.',
		preview: 'Smoke reaches the last terminal, and its evacuation message is dying, missing letters.',
		interlude:
			'Fire isolation seals the battery bay behind a bulkhead, but the smoke is already finding the gaps. Imani pulls you toward the last working evacuation terminal, its screen stuttering through a broken instruction.',
		domain: 'Salience network',
		inputLabels: ['Racing pulse', 'Ozone context', 'Green safety lamp', 'Rising heat'],
		featureLabels: ['Arousal pattern', 'Electrical context', 'Safety evidence', 'Thermal danger'],
		outputLabels: ['False alarm', 'Electrical fire', 'Security breach', 'Sensor fault'],
		outputDescriptions: [
			'Panic plus a reassuring green lamp — the most comforting read, and nearly the strongest',
			'Heat and ozone converge despite the safety lamp',
			'Threat in the air, but no heat signature to back it',
			'Could explain the mixed panel — if the heat were not real',
		],
		perceptTitle: 'A scene gains emotional meaning',
		perceptSteps: [
			'The body contributes urgent arousal',
			'Ozone makes the threat electrical',
			'The green lamp applies inhibition',
			'Heat provides independent physical evidence',
		],
		why: 'Electrical fire wins because thermal danger and electrical context converge on it. The green lamp genuinely lowers that estimate — “false alarm” comes dangerously close — but inhibition here is one weighted vote against the fire, not an automatic veto over it.',
		bridge:
			'Salience and threat involve interacting cortical, amygdala, hippocampal, autonomic, and neuromodulatory systems—not one alarm unit.',
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
		chapter: '06 · The final instruction',
		story:
			'Smoke curls under the control-room door. The evacuation terminal is dying, its message breaking into fragments: “FOLLOW THE BR… …IGHT LIGHT →”. Under this much pressure your mind keeps snatching at the first word that fits. But the sentence frame, the missing ending, and that small blinking arrow all have to agree before you move — because you only get to be wrong about this once.',
		thought:
			'Urgency is shoving the first plausible word into your mouth, Hans. Let the sentence finish. Meaning is not the loudest fragment — it is the one reading that survives once every clue has spoken.',
		outcome:
			'“BR” + the sentence frame + “IGHT” + the arrow settle, all at once, into FOLLOW THE BRIGHT LIGHT. You and Astrid reach the decontamination exit as the fire doors seal the corridor behind you.',
		cue: 'The opening “BR” is ambiguous on its own; the grammar wants a describing word; the ending is “IGHT”; and the arrow points right — read together, they allow only one instruction.',
		preview: 'Cold night air, an open door — and six signals that were never quite what they first seemed.',
		interlude:
			'The bright light was an exit sign all along. You and Imani push through the decontamination lock into cold night air, the building’s red glow shrinking behind you — six uncertain signals, survived one careful step at a time.',
		domain: 'Language network',
		inputLabels: ['Word start BR', 'Sentence frame', 'Ending IGHT', 'Rightward arrow'],
		featureLabels: ['Opening pattern', 'Grammar fit', 'Suffix pattern', 'Action direction'],
		outputLabels: ['Follow bright light', 'Fight the light', 'Report a fault', 'Wait by terminal'],
		outputDescriptions: [
			'Letters, grammar, suffix, and arrow all agree',
			'Steals BR, IGHT, and even the arrow — but breaks the sentence’s grammar',
			'Fits a laboratory’s habits, not these fragments',
			'Obeys the arrow, ignores the sentence',
		],
		perceptTitle: 'Fragments become a word',
		perceptSteps: [
			'BR activates several word candidates',
			'The sentence demands a describing word',
			'IGHT resolves BRIGHT',
			'The arrow turns recognition into an action',
		],
		why: 'Follow bright light wins because orthography, grammar, suffix, and direction all agree. “Fight the light” is the real trap — it borrows the BR, the IGHT, and even the arrow — but it violates the grammar the sentence frame demands.',
		bridge:
			'Language interpretation is recurrent and context-sensitive across distributed networks. These candidates illustrate evidence accumulation, not a literal grammar circuit.',
		input: [0.3, 0.65, 0.95, 0.85],
		weights: [
			[0.1, 0.55, 0.8, 0.75],
			[0.55, 0.15, 0.85, 0.55],
			[0.1, 0.6, 0.2, 0.1],
			[0.2, 0.3, -0.1, 0.45],
		],
	},
];

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

function MatrixPanel({ challenge, phase }: Readonly<{ challenge: Challenge; phase: number }>) {
	const outputs = outputsFor(challenge);
	const featureWeights = featureWeightsFor(challenge.input.length);
	const finalPhase = challenge.input.length + 1;
	const visibleColumns = phase === 0 ? 0 : Math.min(phase, challenge.input.length);
	const features = featuresFor(challenge, visibleColumns);
	const activeInputIndex = phase > 0 && phase < finalPhase ? phase - 1 : -1;
	const activeFeatureIndex = activeInputIndex;
	const winner = outputs.indexOf(Math.max(...outputs));
	return (
		<div className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#07131b]/85 p-3 sm:rounded-[28px] sm:p-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Silicon side</p>
					<h3 className="mt-2 text-lg font-semibold text-white">Transform, then interpret</h3>
					<p className="mt-1 text-xs text-slate-500">Layer 1 builds features · Layer 2 scores meanings</p>
				</div>
				<span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] text-cyan-100">
					GPU / ANN
				</span>
			</div>
			{activeInputIndex >= 0 && (
				<div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-200/25 bg-cyan-200/8 px-3 py-2 text-[10px] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,.08)]">
					<span className="size-2 shrink-0 rounded-full bg-cyan-200 motion-safe:animate-pulse" />
					<strong className="uppercase tracking-[.16em]">Follow this cue</strong>
					<span className="text-cyan-100/70">Violet input → cyan column → green feature</span>
				</div>
			)}

			<div
				className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[10px] sm:mt-8 sm:gap-4 sm:text-sm"
				aria-label="Weight matrix multiplied by input vector"
			>
				<div
					className="grid gap-1 border-x border-cyan-300/35 px-2 py-2 sm:gap-2 sm:px-3"
					style={{ gridTemplateColumns: `repeat(${challenge.input.length}, minmax(0, 1fr))` }}
				>
					{featureWeights.flatMap((row, rowIndex) =>
						row.map((value, columnIndex) => (
							<span
								key={`${rowIndex}-${columnIndex}`}
								className={`flex size-8 items-center justify-center rounded-md transition duration-[900ms] sm:size-10 ${phase === columnIndex + 1 ? 'bg-cyan-200/35 text-white ring-1 ring-inset ring-cyan-100/70 shadow-[0_0_24px_rgba(34,211,238,.42)] motion-safe:animate-pulse' : 'bg-white/5 text-slate-400'}`}
							>
								{value.toFixed(1)}
							</span>
						)),
					)}
				</div>
				<span className="text-slate-500">×</span>
				<div className="grid gap-1 border-x border-violet-300/35 px-2 py-2 sm:gap-2">
					{challenge.input.map((value, index) => (
						<span
							key={index}
							className={`flex size-8 items-center justify-center rounded-md transition sm:size-10 ${phase === index + 1 ? 'bg-violet-200/35 text-white ring-2 ring-violet-100/70 shadow-[0_0_22px_rgba(196,181,253,.4)] motion-safe:animate-pulse' : 'bg-white/5 text-violet-200'}`}
						>
							{value.toFixed(1)}
						</span>
					))}
				</div>
				<span className="text-slate-500">=</span>
				<div className="grid gap-1 border-x border-emerald-300/35 px-2 py-2 sm:gap-2">
					{features.map((value, index) => (
						<span
							key={index}
							title={challenge.featureLabels[index]}
							className={`flex size-8 items-center justify-center rounded-md transition sm:size-10 ${phase > 0 ? 'bg-emerald-300/20 text-emerald-100' : 'bg-white/5 text-slate-600'} ${index === activeFeatureIndex ? 'ring-2 ring-emerald-100/70 shadow-[0_0_22px_rgba(110,231,183,.38)]' : ''}`}
						>
							{phase > 0 ? format(value) : '—'}
						</span>
					))}
				</div>
			</div>
			<div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
				<span className={`size-2 rounded-full ${phase > 0 && phase < finalPhase ? 'animate-pulse bg-cyan-300' : 'bg-slate-700'}`} />
				{phase === 0
					? 'Layer 1 is waiting for sensory evidence'
					: phase < finalPhase
						? `Adding “${challenge.inputLabels[phase - 1]}” to each feature`
						: 'Layer 1 complete; Layer 2 selects an interpretation'}
			</div>
			<div
				className="mt-4 grid gap-1.5 sm:gap-2"
				style={{ gridTemplateColumns: `repeat(${challenge.featureLabels.length}, minmax(0, 1fr))` }}
			>
				{challenge.featureLabels.map((label, index) => (
					<div
						key={label}
						className={`rounded-lg px-2 py-2 text-center text-[10px] transition ${index === activeFeatureIndex ? 'bg-emerald-300/15 text-emerald-100 ring-1 ring-emerald-200/35' : 'bg-white/[.035] text-slate-400'}`}
					>
						<span className="mr-1 font-mono text-slate-600">F{index + 1}</span>
						{label}
					</div>
				))}
			</div>
			<div
				className={`mt-3 rounded-xl border p-3 transition ${phase >= finalPhase ? 'border-cyan-300/20 bg-cyan-300/8' : 'border-white/8 bg-white/[.02] opacity-45'}`}
			>
				<p className="text-[9px] uppercase tracking-[.18em] text-slate-500">Layer 2 · feature vector × interpretation weights</p>
				<div
					className="mt-2 grid gap-1.5 sm:gap-2"
					style={{ gridTemplateColumns: `repeat(${challenge.outputLabels.length}, minmax(0, 1fr))` }}
				>
					{outputs.map((value, index) => (
						<div
							key={challenge.outputLabels[index]}
							className={`min-w-0 rounded-lg px-1 py-2 text-center transition sm:px-2 ${phase >= finalPhase ? (index === winner ? 'bg-amber-200/20 ring-2 ring-amber-100/60 shadow-[0_0_24px_rgba(251,191,36,.25)]' : 'bg-cyan-300/10 opacity-55') : 'bg-white/[.025]'}`}
						>
							<p className="truncate text-[8px] text-slate-400 sm:text-[10px]">{challenge.outputLabels[index]}</p>
							<p className={`mt-1 font-mono text-[10px] sm:text-xs ${phase >= finalPhase ? 'text-cyan-100' : 'text-slate-600'}`}>
								{phase >= finalPhase ? format(value) : '—'}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function BrainPanel({ challenge, phase }: Readonly<{ challenge: Challenge; phase: number }>) {
	const outputs = outputsFor(challenge);
	const featureWeights = featureWeightsFor(challenge.input.length);
	const finalPhase = challenge.input.length + 1;
	const visibleColumns = phase === 0 ? 0 : Math.min(phase, challenge.input.length);
	const features = featuresFor(challenge, visibleColumns);
	const max = Math.max(...outputs);
	const activeInputIndex = phase > 0 && phase < finalPhase ? phase - 1 : -1;
	const rowGap = challenge.input.length > 3 ? 48 : 60;
	const rowY = (index: number) => 42 + index * rowGap;
	const graphHeight = rowY(challenge.input.length - 1) + 42;
	return (
		<div className="relative overflow-hidden rounded-2xl border border-amber-300/15 bg-[#171008]/85 p-3 sm:rounded-[28px] sm:p-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300">Biology side</p>
					<h3 className="mt-2 text-lg font-semibold text-white">A feature layer intervenes</h3>
					<p className="mt-1 text-xs text-slate-500">Sensory cells → feature populations → meanings</p>
				</div>
				<span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 font-mono text-[10px] text-amber-100">
					Cortex / spikes
				</span>
			</div>
			{activeInputIndex >= 0 && (
				<div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200/25 bg-amber-200/8 px-3 py-2 text-[10px] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,.08)]">
					<span className="size-2 shrink-0 rounded-full bg-amber-200 motion-safe:animate-pulse" />
					<strong className="uppercase tracking-[.16em]">Same cue</strong>
					<span className="text-amber-100/70">Sensory neuron → feature population</span>
				</div>
			)}
			<svg
				viewBox={`0 0 520 ${graphHeight}`}
				className="mt-3 w-full"
				role="img"
				aria-label="Sensory neurons connected through a feature layer to interpretation populations"
			>
				<text x="55" y="14" textAnchor="middle" fill="#64748b" fontSize="9">
					SENSORY
				</text>
				<text x="255" y="14" textAnchor="middle" fill="#64748b" fontSize="9">
					FEATURES
				</text>
				<text x="447" y="14" textAnchor="middle" fill="#64748b" fontSize="9">
					MEANING
				</text>
				{featureWeights.flatMap((row, featureIndex) =>
					row.map((weight, inputIndex) => (
						<line
							key={`input-feature-${featureIndex}-${inputIndex}`}
							x1="74"
							y1={rowY(inputIndex)}
							x2="235"
							y2={rowY(featureIndex)}
							stroke="#67e8f9"
							strokeOpacity={phase === inputIndex + 1 || phase > inputIndex + 1 ? Math.min(0.8, Math.abs(weight) + 0.12) : 0.08}
							strokeWidth={1 + Math.abs(weight) * 3}
							className="transition-all duration-[900ms]"
						/>
					)),
				)}
				{challenge.weights.flatMap((row, outputIndex) =>
					row.map((weight, featureIndex) => (
						<line
							key={`feature-output-${outputIndex}-${featureIndex}`}
							x1="275"
							y1={rowY(featureIndex)}
							x2="425"
							y2={rowY(outputIndex)}
							stroke={weight >= 0 ? '#fbbf24' : '#a78bfa'}
							strokeOpacity={phase >= finalPhase ? Math.min(0.8, Math.abs(weight) + 0.15) : 0.08}
							strokeWidth={1 + Math.abs(weight) * 3}
							className="transition-all duration-[900ms]"
						/>
					)),
				)}
				{challenge.input.map((value, index) => (
					<g key={`input-${index}`}>
						{index === activeInputIndex && (
							<circle
								cx="58"
								cy={rowY(index)}
								r="29"
								fill="none"
								stroke="#fef3c7"
								strokeWidth="3"
								opacity=".72"
								className="motion-safe:animate-ping"
							/>
						)}
						<circle cx="58" cy={rowY(index)} r={13 + value * 4} fill="#0c2730" stroke="#67e8f9" strokeWidth="2" />
						<circle
							cx="58"
							cy={rowY(index)}
							r="5"
							fill={phase === index + 1 ? '#ecfeff' : '#22d3ee'}
							className={phase === index + 1 ? 'animate-pulse' : ''}
						/>
						<text x="20" y={rowY(index) + 4} fill="#94a3b8" fontSize="10">
							{value.toFixed(1)}
						</text>
					</g>
				))}
				{features.map((value, index) => (
					<g key={`feature-${index}`}>
						{index === activeInputIndex && <circle cx="255" cy={rowY(index)} r="29" fill="#fbbf2418" stroke="#fde68a" strokeWidth="2" />}
						<circle
							cx="255"
							cy={rowY(index)}
							r={16 + Math.max(0, value) * 5}
							fill="#241b08"
							stroke="#fbbf24"
							strokeWidth={phase > 0 ? 3 : 2}
							className="transition-all duration-[900ms]"
						/>
						<text x="248" y={rowY(index) + 4} fill="white" fontSize="11" fontWeight="700">
							F{index + 1}
						</text>
						{phase > 0 && (
							<text x="278" y={rowY(index) + 4} fill="#fde68a" fontSize="9">
								{format(value)}
							</text>
						)}
					</g>
				))}
				{outputs.map((value, index) => {
					const winner = value === max && phase >= finalPhase;
					return (
						<g key={`output-${index}`}>
							<circle
								cx="447"
								cy={rowY(index)}
								r="20"
								fill={winner ? '#78350f' : '#20150a'}
								stroke={winner ? '#fde68a' : '#b45309'}
								strokeWidth={winner ? 4 : 2}
								className="transition-all duration-[900ms]"
							/>
							{winner && <circle cx="447" cy={rowY(index)} r="28" fill="none" stroke="#fbbf24" opacity=".65" className="animate-ping" />}
							<text x="443" y={rowY(index) + 5} fill="white" fontSize="13" fontWeight="700">
								{index + 1}
							</text>
							<text x="475" y={rowY(index) + 4} fill={phase >= finalPhase ? '#fde68a' : '#64748b'} fontSize="10">
								{phase >= finalPhase ? `${Math.round(Math.max(0, value) * 38)} Hz` : '—'}
							</text>
						</g>
					);
				})}
			</svg>
			<div className="flex items-center gap-3 text-xs text-slate-400">
				<span className={`size-2 rounded-full ${phase > 0 && phase < finalPhase ? 'animate-pulse bg-amber-300' : 'bg-slate-700'}`} />
				{phase === 0
					? 'Sensory populations are waiting'
					: phase < finalPhase
						? `“${challenge.inputLabels[phase - 1]}” reshapes the feature layer`
						: 'Feature populations drive competing interpretations'}
			</div>
			<div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${challenge.featureLabels.length}, minmax(0, 1fr))` }}>
				{challenge.featureLabels.map((label, index) => (
					<div
						key={label}
						className="rounded-lg border border-amber-300/8 bg-amber-300/[.035] px-2 py-2 text-center text-[10px] text-slate-400"
					>
						<span className="mr-1 font-mono text-amber-200/40">F{index + 1}</span>
						{label}
					</div>
				))}
			</div>
			<div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${challenge.outputLabels.length}, minmax(0, 1fr))` }}>
				{challenge.outputLabels.map((label, index) => (
					<div key={label} className="rounded-lg bg-white/[.035] px-2 py-2 text-center text-[10px] text-slate-400">
						<span className="mr-1 font-mono text-slate-600">{index + 1}</span>
						{label}
					</div>
				))}
			</div>
		</div>
	);
}

function PerceptScene({ challenge, phase }: Readonly<{ challenge: Challenge; phase: number }>) {
	const seen = (step: number) => phase >= step;
	const active = (step: number) => phase === step;
	const finalPhase = challenge.input.length + 1;
	const layerClass = (step: number) => `transition-all duration-[900ms] ${seen(step) ? 'opacity-100' : 'opacity-10'}`;

	if (challenge.id === 'edge') {
		return (
			<>
				<rect x="24" y="24" width="512" height="172" rx="18" fill="#0b1820" />
				<rect x="44" y="44" width="218" height="132" rx="12" fill="#d8f5f0" className={layerClass(1)} />
				<g fill="#67e8f9" className={layerClass(2)}>
					{Array.from({ length: 18 }, (_, index) => (
						<circle key={index} cx={285 + (index % 6) * 20} cy={62 + Math.floor(index / 6) * 36} r="3" opacity=".55" />
					))}
				</g>
				<rect x="298" y="44" width="218" height="132" rx="12" fill="#17313b" className={layerClass(3)} />
				<line x1="280" y1="38" x2="280" y2="182" stroke="#fef08a" strokeWidth={phase >= finalPhase ? 7 : 2} className={layerClass(3)} />
				{phase >= finalPhase && (
					<text x="280" y="214" textAnchor="middle" fill="#fef3c7" fontSize="12">
						the door seam holds steady in the dark
					</text>
				)}
			</>
		);
	}

	if (challenge.id === 'tone') {
		return (
			<>
				<rect x="24" y="24" width="512" height="172" rx="18" fill="#0b1820" />
				<path
					d="M45 150 C95 120 125 180 175 150 S255 120 305 150 S385 180 435 150 S485 120 520 150"
					fill="none"
					stroke="#60a5fa"
					strokeWidth={active(1) ? 7 : 4}
					className={layerClass(1)}
				/>
				<path
					d="M45 110 C70 55 95 165 120 110 S170 55 195 110 S245 165 270 110 S320 55 345 110 S395 165 420 110 S470 55 520 110"
					fill="none"
					stroke="#fbbf24"
					strokeWidth={phase >= finalPhase ? 8 : active(2) ? 7 : 4}
					className={layerClass(2)}
				/>
				<path
					d="M45 70 C55 35 65 105 75 70 S95 35 105 70 S125 105 135 70 S155 35 165 70 S185 105 195 70 S215 35 225 70 S245 105 255 70 S275 35 285 70 S305 105 315 70 S335 35 345 70 S365 105 375 70 S395 35 405 70 S425 105 435 70 S455 35 465 70 S485 105 520 70"
					fill="none"
					stroke="#c084fc"
					strokeWidth={active(3) ? 7 : 3}
					className={layerClass(3)}
				/>
				<g className={layerClass(4)} fill="#fef3c7">
					{[112, 224, 336, 448].map((x) => (
						<circle key={x} cx={x} cy="39" r={active(4) ? 7 : 4} />
					))}
				</g>
				{phase >= finalPhase && (
					<text x="280" y="214" textAnchor="middle" fill="#fde68a" fontSize="12">
						pitch and pulse become the access chime
					</text>
				)}
			</>
		);
	}

	if (challenge.id === 'motion') {
		return (
			<>
				<rect x="24" y="24" width="512" height="172" rx="18" fill="#0b1820" />
				<path d="M100 145 Q255 25 440 120" fill="none" stroke="#475569" strokeWidth="3" strokeDasharray="8 8" className={layerClass(2)} />
				<circle cx="100" cy="145" r="20" fill="#67e8f9" className={layerClass(1)} />
				<circle cx="255" cy="72" r="23" fill="#a78bfa" className={layerClass(2)} />
				<circle cx="440" cy="120" r="29" fill="#fbbf24" className={layerClass(3)} />
				{phase >= finalPhase && (
					<>
						<path d="M355 78 L458 112" stroke="#fef3c7" strokeWidth="7" strokeLinecap="round" />
						<path d="M458 112 L431 92 M458 112 L426 125" stroke="#fef3c7" strokeWidth="7" strokeLinecap="round" />
						<text x="280" y="214" textAnchor="middle" fill="#fef3c7" fontSize="12">
							three glimpses become one rightward escape
						</text>
					</>
				)}
			</>
		);
	}

	if (challenge.id === 'face') {
		return (
			<>
				<rect x="24" y="24" width="512" height="172" rx="18" fill="#0b1820" />
				<g className={layerClass(2)}>
					<ellipse cx="280" cy="108" rx="82" ry="78" fill="#fbbf2420" stroke="#fbbf24" strokeWidth={active(2) ? 6 : 3} />
				</g>
				<g className={layerClass(1)} fill="#67e8f9">
					<ellipse cx="247" cy="88" rx="17" ry="10" />
					<ellipse cx="313" cy="88" rx="17" ry="10" />
					<circle cx="247" cy="88" r="4" fill="#07131b" />
					<circle cx="313" cy="88" r="4" fill="#07131b" />
				</g>
				<g className={layerClass(3)} fill="#a78bfa">
					{[
						[120, 65],
						[455, 70],
						[105, 150],
						[470, 145],
						[165, 105],
					].map(([x, y], index) => (
						<path key={index} d={`M${x! - 8} ${y} l16 0 M${x} ${y! - 8} l0 16`} stroke="#a78bfa" strokeWidth="3" />
					))}
				</g>
				<g className={layerClass(4)}>
					<path d="M338 130 Q374 113 401 128" fill="none" stroke="#67e8f9" strokeWidth={active(4) ? 7 : 4} strokeLinecap="round" />
					<path d="M390 117 l13 11 -16 6" fill="none" stroke="#67e8f9" strokeWidth="4" />
				</g>
				{phase >= finalPhase && (
					<>
						<path d="M258 137 Q280 151 302 137" fill="none" stroke="#fef3c7" strokeWidth="5" strokeLinecap="round" />
						<text x="280" y="214" textAnchor="middle" fill="#fef3c7" fontSize="12">
							the familiar motion resolves into Dr. Astrid Van Hoyt
						</text>
					</>
				)}
			</>
		);
	}

	if (challenge.id === 'threat') {
		return (
			<>
				<rect x="24" y="24" width="512" height="172" rx="18" fill="#0b1820" />
				<g className={layerClass(1)}>
					<circle cx="128" cy="110" r={active(1) ? 42 : 32} fill="#fb718525" stroke="#fb7185" strokeWidth="4" />
					<path d="M98 110 h16 l9 -18 14 38 11 -20 h18" fill="none" stroke="#fda4af" strokeWidth="4" />
				</g>
				<g className={layerClass(2)}>
					<path d="M220 166 V58 L310 34 L400 58 V166" fill="#fbbf2415" stroke="#fbbf24" strokeWidth="3" />
					<circle cx="350" cy="88" r="13" fill="#fbbf24" />
				</g>
				<g className={layerClass(3)}>
					<path
						d="M438 70 L475 84 V117 C475 143 457 158 438 167 C419 158 401 143 401 117 V84 Z"
						fill="#67e8f925"
						stroke="#67e8f9"
						strokeWidth={active(3) ? 6 : 3}
					/>
					<path d="M420 116 l12 12 25 -29" fill="none" stroke="#a5f3fc" strokeWidth="5" />
				</g>
				<g className={layerClass(4)} fill="none" stroke="#fb7185" strokeWidth={active(4) ? 6 : 3}>
					<path d="M255 175 q-18 -26 0 -50 q18 -24 0 -48" />
					<path d="M293 175 q-18 -26 0 -50 q18 -24 0 -48" />
				</g>
				{phase >= finalPhase && (
					<>
						<circle cx="338" cy="106" r="58" fill="none" stroke="#fb7185" strokeWidth="6" opacity=".65" />
						<text x="338" y="111" textAnchor="middle" fill="#fecdd3" fontSize="15" fontWeight="700">
							FIRE
						</text>
						<text x="280" y="214" textAnchor="middle" fill="#fef3c7" fontSize="12">
							heat and ozone overpower the green reassurance
						</text>
					</>
				)}
			</>
		);
	}

	return (
		<>
			<rect x="24" y="24" width="512" height="172" rx="18" fill="#0b1820" />
			<text x="84" y="118" fill="#67e8f9" fontSize="44" fontWeight="700" className={layerClass(1)}>
				BR…
			</text>
			<g className={layerClass(2)}>
				<rect x="205" y="54" width="278" height="82" rx="12" fill="#a78bfa18" stroke="#a78bfa" />
				<text x="224" y="86" fill="#c4b5fd" fontSize="13">
					The ___ light filled the room.
				</text>
				<text x="224" y="114" fill="#8b5cf6" fontSize="11">
					context expects a describing word
				</text>
			</g>
			<text x="378" y="177" fill="#fbbf24" fontSize="32" fontWeight="700" className={layerClass(3)}>
				…IGHT
			</text>
			<g className={layerClass(4)}>
				<path d="M405 32 H492" stroke="#67e8f9" strokeWidth={active(4) ? 7 : 4} strokeLinecap="round" />
				<path d="M492 32 l-18 -12 M492 32 l-18 12" stroke="#67e8f9" strokeWidth="4" />
			</g>
			{phase >= finalPhase && (
				<>
					<rect x="171" y="73" width="218" height="70" rx="14" fill="#fbbf2422" stroke="#fde68a" strokeWidth="4" />
					<text x="280" y="119" textAnchor="middle" fill="#fef3c7" fontSize="34" fontWeight="700">
						BRIGHT
					</text>
					<text x="280" y="214" textAnchor="middle" fill="#fef3c7" fontSize="12">
						the fragments resolve into a direction: follow the light
					</text>
				</>
			)}
		</>
	);
}

function PerceptCanvas({
	challenge,
	phase,
	onReplay,
	onAdvance,
	advanceLabel,
}: Readonly<{ challenge: Challenge; phase: number; onReplay: () => void; onAdvance?: () => void; advanceLabel?: string }>) {
	const outputs = outputsFor(challenge);
	const winner = outputs.indexOf(Math.max(...outputs));
	const finalPhase = challenge.input.length + 1;
	const activeCueIndex = phase > 0 && phase < finalPhase ? phase - 1 : -1;
	const status =
		phase === 0
			? 'Start the comparison to build the percept cue by cue.'
			: phase < finalPhase
				? `Step ${phase}: ${challenge.perceptSteps[phase - 1]}`
				: `Result: the evidence settles on “${challenge.outputLabels[winner]}”.`;

	return (
		<div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_10%,rgba(103,232,249,.08),transparent_40%),#071017] sm:mt-3 sm:rounded-[28px]">
			<div className="flex flex-col gap-2 border-b border-white/8 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[.22em] text-fuchsia-200">Emerging percept</p>
					<h3 className="mt-1 text-lg font-semibold text-white">{challenge.perceptTitle}</h3>
					<p className="mt-1 text-xs text-slate-400">{status}</p>
				</div>
				{phase >= finalPhase && (
					<div className="flex flex-wrap gap-2">
						<button type="button" onClick={onReplay} className="glass-btn glass-btn--secondary justify-center">
							Replay each step
						</button>
						{onAdvance && (
							<button type="button" onClick={onAdvance} className="glass-btn glass-btn--primary justify-center">
								{advanceLabel ?? 'Next mission →'}
							</button>
						)}
					</div>
				)}
			</div>
			<div className="grid gap-2 p-3 lg:grid-cols-[1.35fr_.65fr] lg:items-center lg:gap-4 sm:p-5">
				<div
					className={`relative rounded-xl transition-all duration-[900ms] ${activeCueIndex >= 0 ? 'bg-fuchsia-200/[.035] ring-1 ring-fuchsia-200/20 shadow-[0_0_32px_rgba(232,121,249,.1)]' : ''}`}
				>
					{activeCueIndex >= 0 && (
						<span className="absolute left-2 top-2 z-10 rounded-full border border-fuchsia-100/35 bg-slate-950/80 px-2 py-1 text-[8px] font-semibold uppercase tracking-[.14em] text-fuchsia-100 motion-safe:animate-pulse">
							Now appearing · {challenge.inputLabels[activeCueIndex]}
						</span>
					)}
					<svg
						viewBox="0 0 560 225"
						className="w-full"
						role="img"
						aria-label={`Step-by-step teaching illustration: ${challenge.perceptTitle}`}
					>
						<PerceptScene challenge={challenge} phase={phase} />
					</svg>
				</div>
				<div className={`grid gap-1.5 lg:grid-cols-1 lg:gap-2 ${challenge.perceptSteps.length === 4 ? 'grid-cols-5' : 'grid-cols-4'}`}>
					{challenge.perceptSteps.map((step, index) => {
						const stepNumber = index + 1;
						const complete = phase > stepNumber;
						const isActive = phase === stepNumber;
						return (
							<div
								key={step}
								className={`rounded-lg border p-2 transition-all duration-[900ms] lg:rounded-xl lg:p-3 ${isActive ? 'border-fuchsia-100/65 bg-fuchsia-300/18 opacity-100 ring-2 ring-fuchsia-200/25 shadow-[0_0_24px_rgba(232,121,249,.18)]' : complete ? 'border-emerald-300/15 bg-emerald-300/5 opacity-55' : 'border-white/8 bg-white/[.025] opacity-35'}`}
							>
								<div className="flex flex-col items-center gap-1.5 text-center lg:flex-row lg:items-start lg:gap-3 lg:text-left">
									<span
										className={`flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] lg:size-6 lg:text-[10px] ${isActive ? 'bg-fuchsia-200 text-slate-950' : complete ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/5 text-slate-600'}`}
									>
										{complete ? '✓' : stepNumber}
									</span>
									<div className="min-w-0">
										<p className={`truncate text-[9px] font-medium lg:text-xs ${isActive ? 'text-white' : 'text-slate-400'}`}>
											{challenge.inputLabels[index]}
										</p>
										<p className="mt-1 hidden text-[10px] leading-4 text-slate-500 lg:block">{step}</p>
									</div>
								</div>
							</div>
						);
					})}
					<div
						className={`rounded-lg border p-2 transition lg:rounded-xl lg:p-3 ${phase >= finalPhase ? 'border-amber-300/30 bg-amber-300/10' : 'border-white/8 bg-white/[.025]'}`}
					>
						<div className="flex flex-col items-center gap-1.5 text-center lg:flex-row lg:items-start lg:gap-3 lg:text-left">
							<span
								className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] lg:size-6 lg:text-[10px] ${phase >= finalPhase ? 'bg-amber-200 text-slate-950' : 'bg-white/5 text-slate-600'}`}
							>
								◎
							</span>
							<div>
								<p className={`text-[9px] font-medium lg:text-xs ${phase >= finalPhase ? 'text-white' : 'text-slate-400'}`}>Result</p>
								<p className="mt-1 hidden text-[10px] leading-4 text-slate-500 lg:block">
									The strongest interpretation binds the cues into a usable percept.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<p className="border-t border-white/8 px-3 py-2 text-[9px] leading-4 text-slate-500 sm:px-5 sm:py-3 sm:text-[10px]">
				<strong className="text-slate-400">Important:</strong> this is an explanatory visualization. Brains do not assemble a picture on an
				inner screen; perception is distributed activity that supports recognition and action.
			</p>
		</div>
	);
}

const differences = [
	{
		number: '01',
		kicker: 'The resemblance is mathematical',
		title: 'Same abstraction. Different event.',
		ai: 'A stored number is multiplied, accumulated, then passed through an activation function. The operation is scheduled and numerically precise.',
		brain:
			'Ions cross membranes. Thousands of noisy excitatory and inhibitory inputs change voltage until a cell may emit an all-or-none spike.',
		verdict: 'Both can be described as weighted integration. Only one is literally doing matrix arithmetic.',
	},
	{
		number: '02',
		kicker: 'Time enters the picture',
		title: 'Clock cycles are not spike timing.',
		ai: 'Layers usually update in discrete steps. Training and inference are often separate phases; identical inputs normally produce identical activations.',
		brain:
			'Computation unfolds continuously. Milliseconds, oscillations, refractory periods, neuromodulators, and recent history all alter the response.',
		verdict: 'A biological neuron is a living dynamical system, not a static activation function.',
	},
	{
		number: '03',
		kicker: 'Now the analogy breaks',
		title: 'Backpropagation is not long-term potentiation.',
		ai: 'Backprop computes how much each parameter contributed to a global error, then an optimizer updates weights using that gradient.',
		brain:
			'LTP and LTD depend on local activity, calcium, receptor trafficking, spike timing, cell state, and modulatory signals. Synapses have no known global gradient ledger.',
		verdict: 'Both change connection strength, but their credit-assignment machinery is fundamentally different.',
	},
];

const factCards = [
	{
		tag: 'The unit',
		title: 'A neuron is already a network',
		fact: 'Dendritic branches can combine inputs linearly or nonlinearly, so treating one cell as a single weighted sum discards computation happening before the soma.',
		use: 'Useful when someone says an artificial node is a faithful model of a biological neuron.',
	},
	{
		tag: 'The connection',
		title: 'A synapse is not one stored number',
		fact: 'Its effective strength depends on transmitter release, receptor state, recent spikes, location on the dendrite, and the receiving cell’s current state.',
		use: 'The same presynaptic spike can have a different effect a moment later.',
	},
	{
		tag: 'The clock',
		title: 'Recent history changes the present',
		fact: 'Short-term synaptic plasticity can alter effective connection strength over milliseconds to seconds through processes such as facilitation and vesicle depletion.',
		use: 'Biological inference and biological learning are not cleanly separated phases.',
	},
	{
		tag: 'The memory',
		title: 'Recall can become an update',
		fact: 'Under the right conditions, reactivation can make a consolidated memory temporarily labile before it is restabilized—a process called reconsolidation.',
		use: 'Retrieval is not always a read-only database query, but reactivation alone is not always sufficient.',
	},
	{
		tag: 'The budget',
		title: 'Communication is expensive',
		fact: 'Biophysical energy budgets attribute much of gray-matter signaling cost to action potentials and postsynaptic currents, favoring sparse and efficient codes.',
		use: 'Compare whole systems and workloads; never turn this into a simplistic brain-watts versus GPU-watts claim.',
	},
	{
		tag: 'The unknown',
		title: 'Brain credit assignment is open',
		fact: 'Backpropagation solves credit assignment in artificial networks. Whether cortical circuits approximate parts of it—and by what mechanisms—remains an active research question.',
		use: '“The brain definitely backprops” and “the brain could never use error signals” are both stronger than the evidence.',
	},
] as const;

const timeScales = [
	{
		scale: 'milliseconds',
		machine: 'One scheduled operation or layer transition',
		biology: 'Spikes, synaptic delay, coincidence, refractoriness',
		anchor: 'Classic cultured-neuron STDP changed sign around pre/post order within roughly ±20 ms.',
	},
	{
		scale: 'seconds',
		machine: 'A sequence window, recurrent state, or generated token stream',
		biology: 'Short-term facilitation/depression, working state, neuromodulation',
		anchor: 'A biological connection’s effective gain can drift during the computation itself.',
	},
	{
		scale: 'minutes → hours',
		machine: 'Training steps, checkpointing, evaluation',
		biology: 'Plasticity induction, consolidation cascades, protein-dependent changes',
		anchor: 'A lasting change is a biochemical process, not merely assignment to a variable.',
	},
	{
		scale: 'days → years',
		machine: 'Further training, fine-tuning, model replacement',
		biology: 'Systems consolidation, skill learning, development, homeostatic adaptation',
		anchor: 'Brains must learn while keeping an organism functioning and older knowledge usable.',
	},
] as const;

const glossary = [
	['Activation', 'The numerical output of an artificial unit after its weighted input is transformed.'],
	[
		'Action potential',
		'A regenerative electrical spike that travels along a neuron’s axon; its timing often carries more information than its size.',
	],
	['Weight', 'A trainable parameter that scales a signal in an artificial network.'],
	[
		'Synaptic efficacy',
		'The context-dependent influence one biological neuron has on another—not a literal scalar stored at the junction.',
	],
	['Gradient', 'A collection of derivatives indicating how parameter changes would alter an objective or loss.'],
	['Credit assignment', 'The problem of deciding which internal changes deserve credit or blame for an outcome.'],
	['LTP / LTD', 'Families of processes that produce persistent increases or decreases in synaptic efficacy.'],
	['Neuromodulator', 'A chemical signal, such as dopamine or acetylcholine, that can change excitability, plasticity, and circuit state.'],
] as const;

const commonQuestions = [
	{
		question: 'Is a negative artificial weight the same as an inhibitory synapse?',
		answer:
			'No. A negative weight is a mathematical sign. Biological inhibition is produced by particular cells, transmitters, receptors, locations, and timing. Inhibition can subtract, divide gain, sharpen selectivity, synchronize activity, or veto a response depending on the circuit.',
	},
	{
		question: 'Does an AI system learn while it answers?',
		answer:
			'Usually, deployed model parameters stay fixed during inference. Its temporary context or recurrent state can still change without changing its learned weights. Brains do not observe such a clean boundary: activity, short-term plasticity, neuromodulation, and longer-term learning can overlap.',
	},
	{
		question: 'Are biological spikes just binary zeroes and ones?',
		answer:
			'A single action potential is approximately all-or-none, but neural codes can use firing rate, precise timing, synchrony, silence, and bursts. Dendrites and synapses also use graded, analog processes before a spike is produced.',
	},
	{
		question: 'Does the brain minimize one loss function?',
		answer:
			'There is no established single global objective for the brain. Reward, prediction error, homeostasis, novelty, attention, bodily needs, and many local plasticity processes can interact. Optimization language may be useful, but the chosen objective is a scientific hypothesis—not an observed master variable.',
	},
	{
		question: 'If an AI activation matches brain activity, is the mechanism solved?',
		answer:
			'No. Similar representations or behavior can make a model useful, but multiple mechanisms can produce similar outputs. Strong comparisons test new predictions across stimuli, development, perturbations, errors, and learning—not correlation alone.',
	},
] as const;

const references = [
	{ label: 'Rumelhart, Hinton & Williams (1986)', detail: 'Back-propagating errors', href: 'https://www.nature.com/articles/323533a0' },
	{ label: 'Bliss & Lømo (1973)', detail: 'Long-lasting hippocampal potentiation', href: 'https://pubmed.ncbi.nlm.nih.gov/4727084/' },
	{ label: 'Bi & Poo (1998)', detail: 'Spike timing and synaptic modification', href: 'https://pubmed.ncbi.nlm.nih.gov/9852584/' },
	{ label: 'London & Häusser (2005)', detail: 'Dendritic computation', href: 'https://pubmed.ncbi.nlm.nih.gov/16033324/' },
	{ label: 'Attwell & Laughlin (2001)', detail: 'Gray-matter signaling energy budget', href: 'https://pubmed.ncbi.nlm.nih.gov/11598490/' },
	{ label: 'Lillicrap et al. (2020)', detail: 'Backpropagation and the brain', href: 'https://www.nature.com/articles/s41583-020-0277-3' },
	{
		label: 'Sevenster, Beckers & Kindt (2012)',
		detail: 'Boundary conditions for reconsolidation',
		href: 'https://pubmed.ncbi.nlm.nih.gov/22406658/',
	},
	{
		label: 'Ghanbari et al. (2017)',
		detail: 'Short-term synaptic plasticity time scales',
		href: 'https://pubmed.ncbi.nlm.nih.gov/28873406/',
	},
	{
		label: 'Shapley & Xing (2013)',
		detail: 'Inhibition, gain control, and selectivity',
		href: 'https://pubmed.ncbi.nlm.nih.gov/23036513/',
	},
	{
		label: 'Saxe, Nelli & Summerfield (2021)',
		detail: 'How to compare deep networks and brains',
		href: 'https://www.nature.com/articles/s41583-020-00395-8',
	},
] as const;

const cortexStages = [
	{ area: 'V1', role: 'Oriented edges', detail: 'Small receptive fields tuned to local orientation and contrast.' },
	{ area: 'V2', role: 'Contours & textures', detail: 'Combinations of edges: corners, borders, simple texture.' },
	{ area: 'V4', role: 'Shapes & colour', detail: 'Curvature and mid-level form over a wider slice of the scene.' },
	{ area: 'IT', role: 'Objects & faces', detail: 'Large, invariant responses to whole objects and identities.' },
] as const;

// A static, higher-level view: several weight matrices stacked into a deep
// feedforward network. Early layers hold local patterns; later layers compose
// them into abstract features — the depth the two-layer game only hinted at.
function DeepNetDiagram() {
	const layers = [4, 6, 6, 4, 3];
	const width = 480;
	const height = 232;
	const xFor = (i: number) => 48 + (i * (width - 96)) / (layers.length - 1);
	const yFor = (count: number, j: number) => {
		const gap = 30;
		const top = height / 2 - ((count - 1) * gap) / 2;
		return 30 + top + j * gap;
	};
	const nodes = layers.map((count, i) => Array.from({ length: count }, (_, j) => ({ x: xFor(i), y: yFor(count, j) })));
	const captions = ['pixels', 'edges', 'textures', 'parts', 'meaning'];
	return (
		<svg
			viewBox={`0 0 ${width} ${height + 62}`}
			className="w-full"
			role="img"
			aria-label="A deep feedforward network stacking several weight matrices from pixels to meaning"
		>
			{nodes
				.slice(0, -1)
				.flatMap((layer, i) =>
					layer.flatMap((a, ai) =>
						nodes[i + 1]!.map((b, bi) => (
							<line key={`e-${i}-${ai}-${bi}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#67e8f9" strokeOpacity={0.1} strokeWidth={0.8} />
						)),
					),
				)}
			{layers.slice(0, -1).map((_, i) => (
				<text key={`w-${i}`} x={(xFor(i) + xFor(i + 1)) / 2} y={24} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
					W{i + 1}
				</text>
			))}
			{nodes.flatMap((layer, i) =>
				layer.map((n, j) => <circle key={`n-${i}-${j}`} cx={n.x} cy={n.y} r={7} fill="#0c2730" stroke="#67e8f9" strokeWidth={1.5} />),
			)}
			{layers.map((_, i) => (
				<text key={`c-${i}`} x={xFor(i)} y={height + 48} textAnchor="middle" fill="#64748b" fontSize="9">
					{captions[i]}
				</text>
			))}
		</svg>
	);
}

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
	const [learningMode, setLearningMode] = useState<'before' | 'after'>('before');
	const [readingStage, setReadingStage] = useState(1);
	const challenge = challenges[challengeIndex]!;
	const features = useMemo(() => featuresFor(challenge), [challenge]);
	const outputs = useMemo(() => outputsFor(challenge), [challenge]);
	const winner = outputs.indexOf(Math.max(...outputs));
	const finalPhase = challenge.input.length + 1;
	const revealed = phase >= finalPhase;
	const runComplete = revealed && played.length === challenges.length;
	// Once the opening scene has been read (the reader has scrolled on, or
	// engaged at all), stop spotlighting one step and simply light everything up.
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
		const timer = window.setTimeout(() => setPhase((value) => value + 1), 550);
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

	function runRound() {
		if (guess === null || phase > 0) return;
		setPhase(1);
		setMobileView('percept');
		if (!played.includes(challenge.id)) {
			const correct = guess === winner;
			const nextStreak = correct ? streak + 1 : 0;
			setPlayed((current) => [...current, challenge.id]);
			setStreak(nextStreak);
			setBestStreak((current) => Math.max(current, nextStreak));
			if (correct) setCorrectRounds((current) => current + 1);
		}
	}

	function nextRound() {
		setChallengeIndex((current) => (current + 1) % challenges.length);
		setGuess(null);
		setPhase(0);
		setProbeUsed(false);
		setMobileView('machine');
		setReadingStage(1);
	}

	function resetRun() {
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
	}

	return (
		<div className="app-page-stack">
			<section className="app-surface app-surface--hero relative overflow-hidden">
				<div className="absolute -right-24 -top-24 size-72 rounded-full bg-cyan-300/8 blur-3xl" />
				<div className="absolute -bottom-24 left-1/2 size-64 rounded-full bg-amber-300/8 blur-3xl" />
				<div className="relative grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Machines × minds</p>
						<h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
							The Night Signal.
							<br />
							<span className="text-slate-400">Two ways to perceive.</span>
						</h1>
						<p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
							At 02:13 the research wing goes dark and the sealed laboratory begins supplying answers before you have finished asking
							questions. Follow six uncertain signals while silicon and neural tissue build the same interpretations through very different
							machinery.
						</p>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-3">
							<p className="text-2xl font-semibold text-white">2</p>
							<p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">substrates</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-3">
							<p className="text-2xl font-semibold text-white">6</p>
							<p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">chapters</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-3">
							<p className="text-2xl font-semibold text-white">3</p>
							<p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">neural layers</p>
						</div>
					</div>
				</div>
			</section>

			<section id="ai-biology-game" className="app-surface p-3 sm:p-5">
				<div className="mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:mb-5 lg:grid-cols-5">
					{[
						['1', 'Enter the scene', 'Read what Hans sees, hears, and fears.'],
						['2', 'Notice the clues', 'Compare the labeled sensory evidence.'],
						['3', 'Make a prediction', 'Choose the meaning that best explains all clues.'],
						['4', 'Watch it travel', 'Follow one cue through silicon and biology.'],
						['5', 'Interpret the result', 'See the percept form, then open the explanation.'],
					].map(([step, title, detail]) => (
						<div key={step} className="bg-[#0b151d] p-2.5 sm:p-4">
							<div className="flex items-center gap-2 sm:gap-3">
								<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/8 font-mono text-[10px] text-white sm:size-7 sm:text-xs">
									{step}
								</span>
								<p className="text-[11px] font-semibold text-white sm:text-sm">{title}</p>
							</div>
							<p className="mt-2 hidden pl-10 text-xs leading-5 text-slate-400 sm:block">{detail}</p>
						</div>
					))}
				</div>
				<div className="mb-4 flex gap-1.5 px-2" aria-label={`${played.length} of ${challenges.length} missions complete`}>
					{challenges.map((item, index) => {
						const known = index <= challengeIndex + 1 || played.includes(item.id);
						return (
							<div key={item.id} className="group relative flex-1">
								<span
									className={`block h-1.5 w-full rounded-full transition-all duration-500 ${played.includes(item.id) ? 'bg-emerald-300' : index === challengeIndex ? 'bg-white/40' : 'bg-white/10'}`}
								/>
								<span className="pointer-events-none absolute left-1/2 top-4 z-30 hidden w-48 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950/95 px-2.5 py-2 text-left shadow-[0_10px_30px_rgba(0,0,0,.5)] group-hover:block">
									<span className="block text-[8px] font-semibold uppercase tracking-[.16em] text-emerald-300">{item.chapter}</span>
									<span className="mt-0.5 block text-[10px] font-semibold text-white">{known ? item.name : 'Signal locked'}</span>
									<span className="mt-1 block text-[9px] leading-4 text-slate-400">
										{known ? item.preview : 'You have not reached this signal yet.'}
									</span>
								</span>
							</div>
						);
					})}
				</div>
				<div
					data-guide-stage="1"
					className="flex flex-col gap-3 rounded-2xl border border-cyan-200/20 bg-[linear-gradient(120deg,rgba(103,232,249,.065),rgba(15,23,42,.12))] px-3 py-3 opacity-100 shadow-[0_0_30px_rgba(34,211,238,.07)] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4"
				>
					<div>
						<p className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-cyan-200/70">
							<span className="flex size-5 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-200/10 font-mono text-cyan-100">
								1
							</span>
							Enter the scene · read here first
						</p>
						<div className="flex flex-wrap items-center gap-2">
							<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">{challenge.chapter}</p>
							<span className="rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wider text-slate-400">
								{challenge.domain}
							</span>
						</div>
						<h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">{challenge.name}</h2>
						<p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-300 sm:mt-2 sm:text-sm sm:leading-6">{challenge.story}</p>
						<div className="mt-2 max-w-3xl border-l border-fuchsia-200/30 pl-3">
							<p className="text-[9px] font-semibold uppercase tracking-[.18em] text-fuchsia-200/60">Hans, to himself</p>
							<p className="mt-1 text-xs italic leading-5 text-fuchsia-50/80">“{challenge.thought}”</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-2 text-center">
							<p className="text-[9px] uppercase tracking-wider text-slate-500">Correct</p>
							<p className="mt-1 font-mono text-sm font-semibold text-emerald-200">
								{correctRounds} / {played.length}
							</p>
						</div>
						<div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-2 text-center">
							<p className="text-[9px] uppercase tracking-wider text-slate-500">Streak</p>
							<p className="mt-1 font-mono text-sm font-semibold text-amber-200">
								{streak > 1 ? '🔥 ' : ''}
								{streak}
							</p>
						</div>
					</div>
				</div>

				<div
					data-guide-stage="2"
					className={`mt-2 grid gap-2 rounded-xl border bg-slate-950/30 p-3 transition-all duration-[1200ms] md:grid-cols-[1fr_auto] md:items-center sm:mt-3 sm:rounded-2xl sm:p-4 ${readingStage === 2 ? 'border-violet-200/30 opacity-100 shadow-[0_0_30px_rgba(167,139,250,.08)]' : introSeen ? 'border-white/10 opacity-100' : 'border-white/8 opacity-45'}`}
				>
					<div>
						<p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-violet-200/80">
							<span className="flex size-5 items-center justify-center rounded-full border border-violet-200/30 bg-violet-200/10 font-mono text-violet-100">
								2
							</span>
							Notice the clues · sensory evidence lives here
						</p>
						<p className="mt-1 text-sm text-slate-200">
							{challenge.cue} <strong className="text-white">Which output wins?</strong>
						</p>
						{probeUsed && (
							<p className="mt-2 text-xs text-violet-200">
								Clue: the middle-layer feature <strong>{challenge.featureLabels[probe.input]}</strong> gives{' '}
								<strong>{challenge.outputLabels[probe.output]}</strong> the strongest single push. Other features can still change the
								winner.
							</p>
						)}
					</div>
					<button
						type="button"
						disabled={probeUsed || phase > 0}
						onClick={() => setProbeUsed(true)}
						className="glass-btn glass-btn--secondary justify-center"
					>
						Show one clue
					</button>
				</div>

				<div
					data-guide-stage="2"
					className={`mt-2 grid gap-1.5 transition-all duration-[1200ms] sm:mt-3 sm:gap-2 ${challenge.input.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} ${readingStage === 2 || introSeen ? 'opacity-100' : 'opacity-45'}`}
					aria-label="Input evidence strengths"
				>
					{challenge.input.map((value, index) => {
						const isActiveCue = phase === index + 1;
						const hasPassed = phase > index + 1;
						return (
							<div
								key={challenge.inputLabels[index]}
								className={`relative min-w-0 rounded-lg border p-2 transition-all duration-[900ms] sm:rounded-xl sm:p-3 ${isActiveCue ? 'border-violet-100/70 bg-violet-200/18 opacity-100 ring-2 ring-violet-200/35 shadow-[0_0_26px_rgba(167,139,250,.28)]' : hasPassed ? 'border-emerald-200/15 bg-emerald-200/5 opacity-65' : 'border-violet-300/10 bg-violet-300/5'}`}
							>
								{isActiveCue && (
									<span className="absolute -top-2 right-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-slate-950 motion-safe:animate-pulse">
										Look
									</span>
								)}
								<div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
									<p className="truncate text-[9px] font-medium text-violet-100 sm:text-xs">{challenge.inputLabels[index]}</p>
									<span className="font-mono text-[9px] text-violet-200 sm:text-[10px]">{Math.round(value * 100)}%</span>
								</div>
								<div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-950/60 sm:mt-2 sm:h-1.5">
									<div className="h-full rounded-full bg-violet-300/70" style={{ width: `${value * 100}%` }} />
								</div>
							</div>
						);
					})}
				</div>

				<div
					data-guide-stage="3"
					className={`mt-3 rounded-xl border bg-slate-950/25 p-3 transition-all duration-[1200ms] sm:rounded-2xl sm:p-4 ${readingStage === 3 ? 'border-amber-200/30 opacity-100 shadow-[0_0_30px_rgba(251,191,36,.08)]' : introSeen ? 'border-white/10 opacity-100' : 'border-white/8 opacity-45'}`}
				>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-amber-200/80">
								<span className="flex size-5 items-center justify-center rounded-full border border-amber-200/30 bg-amber-200/10 font-mono text-amber-100">
									3
								</span>
								Make a prediction · answer here
							</p>
							<p className="mt-1.5 text-xs text-slate-400">
								Choose the interpretation that explains the whole pattern, then run the comparison.
							</p>
						</div>
						{answerNeeded && (
							<span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-200/85">
								<span className="relative flex size-2" aria-hidden>
									<span className="absolute inline-flex size-full rounded-full bg-emerald-300/70 opacity-70 motion-safe:animate-ping" />
									<span className="relative inline-flex size-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.85)]" />
								</span>
								Your answer →
							</span>
						)}
					</div>
					<div
						className={`mt-2 grid gap-1.5 sm:mt-3 sm:gap-2 ${challenge.outputLabels.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}
					>
						{challenge.outputLabels.map((label, index) => (
							<button
								key={label}
								type="button"
								disabled={phase > 0}
								onClick={() => setGuess(index)}
								className={`relative min-h-16 rounded-lg border px-2 py-2 text-center transition sm:min-h-20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-left ${guess === index ? 'border-amber-100/65 bg-amber-100/12 text-white ring-2 ring-amber-200/30 shadow-[0_0_22px_rgba(251,191,36,.16)]' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
							>
								{guess === index && (
									<span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-amber-200 text-[9px] font-bold text-slate-950">
										✓
									</span>
								)}
								<span className="hidden font-mono text-[10px] text-slate-500 sm:inline">{index + 1}</span>
								<span className="text-[10px] font-semibold sm:ml-2 sm:text-sm">{label}</span>
								<span className="mt-1 block text-[8px] leading-3 text-slate-500 sm:mt-1.5 sm:text-[10px] sm:leading-4">
									{challenge.outputDescriptions[index]}
								</span>
							</button>
						))}
					</div>
					<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
						{revealed && (
							<p className={`text-sm font-medium ${guess === winner ? 'text-emerald-300' : 'text-amber-200'}`}>
								{guess === winner ? 'Correct — ' : 'Best match: '}
								<strong>{challenge.outputLabels[winner]}</strong>
							</p>
						)}
						{revealed ? (
							<button type="button" onClick={runComplete ? resetRun : nextRound} className="glass-btn glass-btn--primary">
								{runComplete ? 'Play again ↻' : 'Next mission →'}
							</button>
						) : (
							<button type="button" onClick={runRound} disabled={guess === null || phase > 0} className="glass-btn glass-btn--primary">
								Run comparison ↓
							</button>
						)}
					</div>
					{revealed && !runComplete && (
						<div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-white/8 bg-white/[.02] px-3 py-2">
							<span className="text-[8px] font-semibold uppercase tracking-[.18em] text-emerald-300/70">Up next</span>
							<span className="text-[10px] font-medium text-slate-200">{nextChallenge.chapter}</span>
							<span className="text-[10px] italic leading-4 text-slate-400">{nextChallenge.preview}</span>
						</div>
					)}
				</div>

				<div
					data-guide-stage="4"
					className={`mt-4 transition-all duration-[1200ms] ${readingStage === 4 || introSeen ? 'opacity-100' : 'opacity-45'}`}
				>
					<div className="mb-2 flex items-center gap-2 px-1 text-[9px] font-semibold uppercase tracking-[.2em] text-cyan-200/80">
						<span className="flex size-5 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-200/10 font-mono text-cyan-100">
							4
						</span>
						<span className="hidden lg:inline">Watch it travel · matrices on the left, neurons on the right</span>
						<span className="lg:hidden">Watch it travel · switch views with the tabs</span>
					</div>

					<div className="mt-2 lg:hidden">
						<div className="grid grid-cols-3 gap-1 rounded-lg border border-white/8 bg-slate-950/35 p-1">
							{(['machine', 'brain', 'percept'] as const).map((view) => (
								<button
									key={view}
									type="button"
									onClick={() => setMobileView(view)}
									className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${mobileView === view ? 'bg-white/12 text-white ring-1 ring-white/15' : 'text-slate-500'}`}
								>
									{mobileView === view && phase > 0 && <span className="size-1.5 rounded-full bg-fuchsia-200 motion-safe:animate-pulse" />}
									{view === 'machine' ? 'AI matrix' : view === 'brain' ? 'Brain' : 'Percept'}
								</button>
							))}
						</div>
						{mobileView === 'machine' && (
							<div className="mt-1.5">
								<MatrixPanel challenge={challenge} phase={phase} />
							</div>
						)}
						{mobileView === 'brain' && (
							<div className="mt-1.5">
								<BrainPanel challenge={challenge} phase={phase} />
							</div>
						)}
						{mobileView === 'percept' && (
							<PerceptCanvas
								challenge={challenge}
								phase={phase}
								onReplay={() => {
									setPhase(1);
									setMobileView('percept');
								}}
								onAdvance={revealed ? (runComplete ? resetRun : nextRound) : undefined}
								advanceLabel={runComplete ? 'Play again ↻' : 'Next mission →'}
							/>
						)}
					</div>

					<div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-2">
						<MatrixPanel challenge={challenge} phase={phase} />
						<BrainPanel challenge={challenge} phase={phase} />
					</div>
				</div>
				<div
					data-guide-stage="4"
					className={`hidden transition-all duration-[1200ms] lg:block ${readingStage === 4 || introSeen ? 'opacity-100' : 'opacity-45'}`}
				>
					<PerceptCanvas
						challenge={challenge}
						phase={phase}
						onReplay={() => setPhase(1)}
						onAdvance={revealed ? (runComplete ? resetRun : nextRound) : undefined}
						advanceLabel={runComplete ? 'Play again ↻' : 'Next mission →'}
					/>
				</div>
				{revealed && (
					<div
						data-guide-stage="5"
						className={`mt-2 overflow-hidden rounded-xl border bg-slate-950/30 transition-all duration-[1200ms] sm:mt-3 sm:rounded-2xl ${readingStage === 5 ? 'border-emerald-200/30 opacity-100 shadow-[0_0_32px_rgba(110,231,183,.08)]' : introSeen ? 'border-white/10 opacity-100' : 'border-white/10 opacity-45'}`}
					>
						<div className="flex items-center gap-2 border-b border-emerald-200/10 bg-emerald-200/[.035] px-4 py-2 text-[9px] font-semibold uppercase tracking-[.2em] text-emerald-200/80">
							<span className="flex size-5 items-center justify-center rounded-full border border-emerald-200/30 bg-emerald-200/10 font-mono text-emerald-100">
								5
							</span>
							Interpret the result · explanation and story continue here
						</div>
						<div className="border-b border-fuchsia-300/12 bg-fuchsia-300/6 px-4 py-3">
							<p className="text-[9px] font-semibold uppercase tracking-[.18em] text-fuchsia-200/70">The story moves</p>
							<p className="mt-1 text-sm leading-6 text-slate-200">{challenge.outcome}</p>
						</div>
						<div className="grid grid-cols-2 gap-2 border-b border-white/8 p-3 sm:grid-cols-[1fr_1fr_1.5fr] sm:gap-3 sm:p-4">
							<div>
								<p className="text-[9px] uppercase tracking-wider text-slate-500">Winning interpretation</p>
								<p className="mt-1 text-base font-semibold text-white">{challenge.outputLabels[winner]}</p>
								<p className="mt-1 font-mono text-xs text-slate-500">total {format(outputs[winner]!)}</p>
							</div>
							<div>
								<p className="text-[9px] uppercase tracking-wider text-slate-500">Lead over runner-up</p>
								<p className="mt-1 font-mono text-lg text-white">+{format(decisionMargin)}</p>
								<p className="mt-1 text-[10px] text-slate-500">A smaller lead means a closer call.</p>
							</div>
							<div className="col-span-2 rounded-lg border border-emerald-300/12 bg-emerald-300/5 p-2.5 sm:col-span-1 sm:rounded-xl sm:p-3">
								<p className="text-[9px] uppercase tracking-wider text-emerald-200/70">Why it won</p>
								<p className="mt-1 text-[11px] leading-5 text-slate-300 sm:text-xs">{challenge.why}</p>
							</div>
						</div>
						<div className="p-3 sm:p-4">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Open the second layer</p>
									<p className="mt-1 text-xs text-slate-400">
										Each learned feature is multiplied by its connection to the interpretation. Positive effects support it; negative
										effects suppress it.
									</p>
								</div>
								<p className="font-mono text-xs text-slate-500">feature effects add to {format(outputs[winner]!)}</p>
							</div>
							<div
								className={`mt-3 grid gap-1.5 sm:mt-4 sm:gap-2 ${winningContributions.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}
							>
								{winningContributions.map((item) => (
									<div
										key={item.label}
										className={`min-w-0 rounded-lg border p-2 sm:rounded-xl sm:p-3 ${item.effect >= 0 ? 'border-emerald-300/12 bg-emerald-300/5' : 'border-violet-300/12 bg-violet-300/5'}`}
									>
										<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
											<p className="truncate text-[9px] font-medium text-white sm:text-xs">{item.label}</p>
											<span
												className={`font-mono text-xs font-semibold sm:text-sm ${item.effect >= 0 ? 'text-emerald-200' : 'text-violet-200'}`}
											>
												{item.effect >= 0 ? '+' : ''}
												{format(item.effect)}
											</span>
										</div>
										<p className="mt-1 hidden font-mono text-[10px] text-slate-500 sm:mt-2 sm:block">
											{format(item.input)} feature × {format(item.weight)} connection
										</p>
										<p className="mt-1 text-[9px] text-slate-400 sm:text-[10px]">{item.effect >= 0 ? 'supports' : 'suppresses'}</p>
									</div>
								))}
							</div>
							<div className="mt-4 rounded-xl border border-amber-300/12 bg-amber-300/5 p-3">
								<p className="text-[9px] font-semibold uppercase tracking-[.18em] text-amber-200/70">Biology bridge</p>
								<p className="mt-1 text-xs leading-5 text-slate-300">{challenge.bridge}</p>
							</div>
						</div>
					</div>
				)}
				{runComplete && (
					<div className="mt-3 overflow-hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-5">
						<p className="text-[10px] font-semibold uppercase tracking-[.22em] text-emerald-300">Run debrief</p>
						<div className="mt-3 flex flex-wrap items-end justify-between gap-4">
							<div>
								<p className="text-3xl font-semibold text-white">You reached the exit.</p>
								<p className="mt-1 text-sm text-slate-300">
									{correctRounds} of {challenges.length} correct · Best streak: {bestStreak} · Accuracy:{' '}
									{Math.round((correctRounds / challenges.length) * 100)}%
								</p>
							</div>
							<p className="max-w-md text-xs leading-5 text-slate-400">
								At 02:19, cold air reaches Hans before the night sky does. Six uncertain signals became useful perceptions: evidence became
								features, features became interpretations, and interpretations became the next survivable step—without making the model a
								brain.
							</p>
						</div>
					</div>
				)}
				<p className="mt-4 px-2 text-xs leading-5 text-slate-500">
					Teaching simplification: firing rate stands in for a biological population response. Real neural circuits are recurrent,
					time-varying, and vastly more complex.
				</p>
			</section>

			<section className="app-surface">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-200">Six facts the game hides</p>
						<h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
							The simplification is the lesson—and the trap.
						</h2>
					</div>
					<p className="max-w-sm text-xs leading-5 text-slate-400">
						Each card names a place where the visual analogy becomes scientifically incomplete.
					</p>
				</div>
				<div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{factCards.map((item, index) => (
						<article
							key={item.title}
							className="group rounded-2xl border border-white/10 bg-slate-950/35 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.045]"
						>
							<div className="flex items-center justify-between">
								<p className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">{item.tag}</p>
								<span className="font-mono text-[10px] text-slate-600">0{index + 1}</span>
							</div>
							<h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
							<p className="mt-3 text-sm leading-6 text-slate-300">{item.fact}</p>
							<div className="mt-4 border-t border-white/8 pt-3">
								<p className="text-[10px] uppercase tracking-wider text-slate-500">Why it matters</p>
								<p className="mt-1 text-xs leading-5 text-slate-400">{item.use}</p>
							</div>
						</article>
					))}
				</div>
			</section>

			<section className="py-12 sm:py-20">
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Scroll past the metaphor</p>
					<h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
						Similarity at the surface.
						<br />
						Difference all the way down.
					</h2>
				</div>
			</section>

			{differences.map((item, index) => (
				<section key={item.number} className="app-surface overflow-hidden p-0">
					<div className="border-b border-white/8 px-5 py-5 sm:px-8">
						<div className="flex items-start gap-5">
							<span className="font-mono text-xs text-slate-600">{item.number}</span>
							<div>
								<p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.kicker}</p>
								<h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{item.title}</h2>
							</div>
						</div>
					</div>
					<div className="grid md:grid-cols-2">
						<div className="border-b border-white/8 p-6 md:border-r md:border-b-0 sm:p-8">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Artificial network</p>
							<p className="mt-4 text-sm leading-7 text-slate-300">{item.ai}</p>
						</div>
						<div className="p-6 sm:p-8">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Biological network</p>
							<p className="mt-4 text-sm leading-7 text-slate-300">{item.brain}</p>
						</div>
					</div>
					<div className="border-t border-white/8 bg-white/[.025] px-6 py-4 text-sm text-slate-400">
						<span className="mr-3 text-white">→</span>
						{item.verdict}
					</div>
					{index === 2 && (
						<div className="border-t border-white/8 p-5 sm:p-8">
							<div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
								<div>
									<p className="text-xs uppercase tracking-[.22em] text-violet-300">Learning microscope</p>
									<h3 className="mt-2 text-xl font-semibold text-white">Watch the update, not just the weight.</h3>
									<p className="mt-3 text-sm leading-6 text-slate-400">
										The bars may both grow. What caused the growth is the important distinction.
									</p>
									<div className="mt-5 flex gap-2">
										<button
											type="button"
											onClick={() => setLearningMode('before')}
											className={`glass-pill ${learningMode === 'before' ? 'is-active' : ''}`}
										>
											Before
										</button>
										<button
											type="button"
											onClick={() => setLearningMode('after')}
											className={`glass-pill ${learningMode === 'after' ? 'is-active' : ''}`}
										>
											After one update
										</button>
									</div>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl border border-cyan-300/12 bg-cyan-300/5 p-4">
										<div className="flex items-end gap-3 h-28">
											{[0.35, 0.62, 0.45, 0.76].map((height, i) => (
												<div
													key={i}
													className="flex-1 rounded-t bg-cyan-300/55 transition-all duration-500"
													style={{ height: `${(learningMode === 'after' ? height + [0.08, -0.03, 0.12, 0.02][i]! : height) * 100}%` }}
												/>
											))}
										</div>
										<p className="mt-3 text-xs font-medium text-cyan-100">Gradient routed from a global loss</p>
									</div>
									<div className="rounded-2xl border border-amber-300/12 bg-amber-300/5 p-4">
										<div className="flex items-end gap-3 h-28">
											{[0.35, 0.62, 0.45, 0.76].map((height, i) => (
												<div
													key={i}
													className="flex-1 rounded-t bg-amber-300/55 transition-all duration-500"
													style={{ height: `${(learningMode === 'after' ? height + [0, 0.08, 0, 0][i]! : height) * 100}%` }}
												/>
											))}
										</div>
										<p className="mt-3 text-xs font-medium text-amber-100">Local coincidence opens a plasticity window</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</section>
			))}

			<section className="app-surface overflow-hidden p-0">
				<div className="border-b border-white/8 p-6 sm:p-8">
					<p className="text-xs font-semibold uppercase tracking-[.25em] text-violet-200">A map of time</p>
					<h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">“Fast” and “slow” mean different things.</h2>
					<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
						Wall-clock benchmarks rarely teach mechanism. This ladder compares the kinds of events that occupy each scale, not which system
						“wins.”
					</p>
				</div>
				<div className="divide-y divide-white/8">
					{timeScales.map((item, index) => (
						<div key={item.scale} className="grid gap-4 p-5 sm:grid-cols-[110px_1fr_1fr] sm:p-7">
							<div>
								<span className="font-mono text-[10px] text-slate-600">T{index + 1}</span>
								<p className="mt-1 text-sm font-semibold text-white">{item.scale}</p>
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300">Machine frame</p>
								<p className="mt-2 text-sm leading-6 text-slate-300">{item.machine}</p>
							</div>
							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[.18em] text-amber-300">Biological frame</p>
								<p className="mt-2 text-sm leading-6 text-slate-300">{item.biology}</p>
								<p className="mt-2 text-xs leading-5 text-slate-500">{item.anchor}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="app-surface">
				<p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">Metal vs brain — the field guide</p>
				<div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
					{[
						['Substrate', 'Transistors', 'Cells, glia, chemistry'],
						['Signal', 'Numbers / voltage states', 'Spikes + graded potentials'],
						['Timing', 'Clocked or batched', 'Continuous and stateful'],
						['Learning', 'Explicit objective', 'Many local plasticity rules'],
						['Memory', 'Addressable storage', 'Distributed, reconstructive'],
						['Precision', 'High numerical precision', 'Noisy but adaptive'],
						['Repair', 'Replace a component', 'Plastic reorganization'],
						['Embodiment', 'Optional input/output', 'Metabolism and body inseparable'],
					].map(([label, machine, biology]) => (
						<div key={label} className="bg-[#0d151d] p-4">
							<p className="text-[10px] uppercase tracking-[.18em] text-slate-500">{label}</p>
							<p className="mt-3 text-sm text-cyan-100">{machine}</p>
							<p className="mt-1 text-sm text-amber-100">{biology}</p>
						</div>
					))}
				</div>
				<p className="mt-4 text-xs leading-5 text-slate-500">
					Energy comparisons depend heavily on system boundaries, hardware, workload, and whether training, cooling, and embodiment are
					counted; simple “watts versus watts” claims are usually misleading.
				</p>
			</section>

			<section className="grid gap-4 lg:grid-cols-2">
				<div className="app-surface">
					<p className="text-xs font-semibold uppercase tracking-[.22em] text-emerald-200">Use the analogy when…</p>
					<div className="mt-5 grid gap-3">
						{[
							'Explaining how many weak inputs can combine into a strong response.',
							'Showing how excitation, inhibition, and competition shape an output.',
							'Introducing distributed representations: a pattern can live across many units.',
							'Asking how changing connections changes future behavior.',
						].map((item) => (
							<div key={item} className="flex gap-3 rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-3">
								<span className="text-emerald-300">✓</span>
								<p className="text-sm leading-6 text-slate-300">{item}</p>
							</div>
						))}
					</div>
				</div>
				<div className="app-surface">
					<p className="text-xs font-semibold uppercase tracking-[.22em] text-rose-200">Drop the analogy when…</p>
					<div className="mt-5 grid gap-3">
						{[
							'A diagram implies every neuron is interchangeable or has one fixed activation rule.',
							'A weight update is described as if it were receptor trafficking or synaptic growth.',
							'A trained model is said to remember, understand, forget, or sleep in the biological sense.',
							'Similar behavior is treated as proof of identical internal mechanism or subjective experience.',
						].map((item) => (
							<div key={item} className="flex gap-3 rounded-xl border border-rose-300/10 bg-rose-300/5 p-3">
								<span className="text-rose-300">×</span>
								<p className="text-sm leading-6 text-slate-300">{item}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="app-surface">
				<div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[.24em] text-amber-200">Questions people actually ask</p>
						<h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Short answers, careful boundaries.</h2>
						<p className="mt-4 text-sm leading-6 text-slate-400">
							The interesting questions begin where the vocabulary makes two systems sound more alike than they are.
						</p>
					</div>
					<div className="grid gap-2">
						{commonQuestions.map((item, index) => (
							<details
								key={item.question}
								open={index === 0}
								className="group rounded-xl border border-white/8 bg-slate-950/30 px-4 py-3 open:bg-white/[.035]"
							>
								<summary className="cursor-pointer list-none pr-4 text-sm font-medium leading-6 text-white marker:hidden">
									{item.question}
									<span className="float-right text-slate-600 transition group-open:rotate-45">+</span>
								</summary>
								<p className="mt-3 border-t border-white/8 pt-3 text-xs leading-6 text-slate-400">{item.answer}</p>
							</details>
						))}
					</div>
				</div>
			</section>

			<section className="app-surface">
				<div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[.24em] text-sky-200">Pocket glossary</p>
						<h2 className="mt-3 text-2xl font-semibold text-white">Words that sound equivalent—but are not.</h2>
						<div className="mt-5 grid gap-2">
							{glossary.map(([term, definition]) => (
								<details key={term} className="group rounded-xl border border-white/8 bg-slate-950/30 px-4 py-3 open:bg-white/[.035]">
									<summary className="cursor-pointer list-none text-sm font-medium text-white marker:hidden">
										{term}
										<span className="float-right text-slate-600 transition group-open:rotate-45">+</span>
									</summary>
									<p className="mt-3 border-t border-white/8 pt-3 text-xs leading-5 text-slate-400">{definition}</p>
								</details>
							))}
						</div>
					</div>
					<aside className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 sm:p-6">
						<p className="text-xs font-semibold uppercase tracking-[.24em] text-slate-400">Evidence trail</p>
						<p className="mt-3 text-sm leading-6 text-slate-400">
							Landmark experiments and reviews behind the claims on this page. Open a source to follow the method, organism, and boundary
							conditions.
						</p>
						<div className="mt-5 divide-y divide-white/8 border-y border-white/8">
							{references.map((item, index) => (
								<a
									key={item.href}
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className="group flex items-start gap-3 py-3 transition hover:text-white"
								>
									<span className="mt-0.5 font-mono text-[9px] text-slate-600">{String(index + 1).padStart(2, '0')}</span>
									<span>
										<span className="block text-xs font-medium text-slate-200 group-hover:text-white">{item.label} ↗</span>
										<span className="mt-1 block text-[11px] leading-4 text-slate-500">{item.detail}</span>
									</span>
								</a>
							))}
						</div>
						<p className="mt-4 text-[10px] leading-4 text-slate-600">
							A model is a tool for a question. Always check whether a claim comes from a simulation, cultured cells, an animal preparation,
							or human behavior before generalizing it.
						</p>
					</aside>
				</div>
			</section>

			<section className="app-surface overflow-hidden p-0">
				<div className="border-b border-white/8 p-6 sm:p-8">
					<p className="text-xs font-semibold uppercase tracking-[.25em] text-sky-200">Stack the layers</p>
					<h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">One matrix was the toy. Depth is the real thing.</h2>
					<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
						Every mission above used two layers: sensory evidence became features, features became meaning. Real systems—silicon and
						biological alike—stack many such transforms, and the interesting behaviour lives in the stacking. Early layers hold simple,
						local patterns; deeper layers compose them into abstract, invariant concepts. This is the higher-level view the game only hinted
						at.
					</p>
				</div>
				<div className="grid lg:grid-cols-2">
					<div className="border-b border-white/8 p-6 sm:border-r sm:border-b-0 sm:p-8">
						<div className="flex items-center justify-between">
							<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Silicon side · a deep network</p>
							<span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] text-cyan-100">
								stacked matrices
							</span>
						</div>
						<p className="mt-3 text-sm leading-6 text-slate-400">
							A deep network is just the two-layer step, repeated: multiply by a weight matrix, apply a nonlinearity, pass it on. Each
							matrix re-describes the input at a higher level of abstraction.
						</p>
						<div className="mt-4 rounded-2xl border border-cyan-300/12 bg-[#07131b]/70 p-3 sm:p-4">
							<DeepNetDiagram />
						</div>
						<p className="mt-3 overflow-x-auto rounded-lg border border-white/8 bg-slate-950/40 px-3 py-2 text-center font-mono text-[11px] text-cyan-100">
							ŷ = σ(W₄ · σ(W₃ · σ(W₂ · σ(W₁ · x))))
						</p>
						<p className="mt-3 text-xs leading-5 text-slate-500">
							The nonlinearity σ is what makes depth matter—without it, stacked matrices collapse back into a single matrix and buy you
							nothing.
						</p>
					</div>
					<div className="p-6 sm:p-8">
						<div className="flex items-center justify-between">
							<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300">Biology side · a cortical hierarchy</p>
							<span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 font-mono text-[10px] text-amber-100">
								ventral stream
							</span>
						</div>
						<p className="mt-3 text-sm leading-6 text-slate-400">
							The ventral visual stream is often read the same way: successive areas represent the world at rising levels of abstraction,
							from local edges to whole objects. The staging rhymes with a deep network—loosely.
						</p>
						<div className="mt-4 space-y-2">
							{cortexStages.map((stage, index) => (
								<div key={stage.area} className="flex items-center gap-3">
									<div className="flex-1 rounded-xl border border-amber-300/12 bg-amber-300/[.04] px-3 py-2.5">
										<div className="flex items-baseline justify-between gap-2">
											<span className="font-mono text-xs font-semibold text-amber-100">{stage.area}</span>
											<span className="text-[11px] font-medium text-white">{stage.role}</span>
										</div>
										<p className="mt-1 text-[11px] leading-4 text-slate-500">{stage.detail}</p>
									</div>
									{index < cortexStages.length - 1 && <span className="shrink-0 text-amber-300/40">↓</span>}
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="border-t border-white/8 bg-white/[.025] px-6 py-4 text-sm text-slate-400 sm:px-8">
					<span className="mr-3 text-white">→</span>
					Depth explains why both systems build high-level features from low-level ones. But cortex is not a clean feedforward stack: it is
					massively recurrent, feedback runs top-down as strongly as bottom-up, and no biological area waits for a global gradient to tell
					it how to change. The hierarchy is a useful sketch, not a wiring diagram.
				</div>
			</section>

			<section className="app-surface app-surface--hero text-center">
				<p className="text-xs font-semibold uppercase tracking-[.25em] text-emerald-300">Takeaway</p>
				<h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
					The brain inspired the vocabulary.
					<br />
					It did not provide the blueprint.
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
					Artificial and biological networks can implement related computations. Understanding either one requires asking how signals move,
					how time matters, and how credit changes a connection—not merely noticing that both have “neurons.”
				</p>
			</section>

			<ModuleHandoffBanner />
		</div>
	);
}
