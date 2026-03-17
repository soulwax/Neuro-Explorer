'use client';

import { useMemo, useState } from 'react';
import { ModuleHandoffBanner } from '~/components/module-handoff-banner';
import {
	defaultEEGParams,
	eegBands,
	eegChannelNames,
	eegControlGroups,
	eegParamDefinitions,
	eegPresets,
	simulateEEG,
	type EEGBand,
	type EEGChannelName,
	type EEGParams,
	type EEGPoint,
} from '~/lib/eeg';
import { eegCases } from '~/core/cases/eeg-neuro';

/* ---- Layout constants ---- */
const TRACE_WIDTH = 900;
const TRACE_CHANNEL_HEIGHT = 28;
const TRACE_PAD_LEFT = 52;
const TRACE_PAD_RIGHT = 12;
const TRACE_PAD_TOP = 8;

const BAND_BAR_WIDTH = 320;
const BAND_BAR_HEIGHT = 160;
const BAND_PAD = 24;

const bandColors: Record<EEGBand, string> = {
	delta: '#a78bfa',
	theta: '#67d3ff',
	alpha: '#44d39a',
	beta: '#ffd58a',
	gamma: '#ff7c76',
};

/* ---- Helpers ---- */

function buildTracePath(
	points: EEGPoint[],
	yCenter: number,
	yScale: number,
	xScale: number,
	padLeft: number,
) {
	if (points.length === 0) return '';
	const parts: string[] = [];
	// Downsample for rendering performance
	const step = Math.max(1, Math.floor(points.length / 600));
	for (let i = 0; i < points.length; i += step) {
		const p = points[i]!;
		const x = padLeft + p.t * xScale;
		const y = yCenter - p.uv * yScale;
		parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
	}
	return parts.join(' ');
}

type ViewMode = 'traces' | 'cases';

export function EEGExplorer() {
	const [params, setParams] = useState<EEGParams>(defaultEEGParams);
	const [activePreset, setActivePreset] = useState<string>('normal-awake');
	const [viewMode, setViewMode] = useState<ViewMode>('traces');
	const [selectedChannels, setSelectedChannels] = useState<Set<EEGChannelName>>(
		new Set(eegChannelNames),
	);

	const result = useMemo(() => simulateEEG(params), [params]);

	const visibleChannels = result.channels.filter((ch) => selectedChannels.has(ch.channel));
	const totalHeight = TRACE_PAD_TOP + visibleChannels.length * TRACE_CHANNEL_HEIGHT + 8;
	const maxDuration = params.durationSec;
	const xScale = (TRACE_WIDTH - TRACE_PAD_LEFT - TRACE_PAD_RIGHT) / maxDuration;

	// Compute a reasonable y-scale: normalize to max amplitude across visible channels
	const maxAmp = useMemo(() => {
		let m = 1;
		for (const ch of visibleChannels) {
			for (const p of ch.timeSeries) {
				const a = Math.abs(p.uv);
				if (a > m) m = a;
			}
		}
		return m;
	}, [visibleChannels]);
	const yScale = (TRACE_CHANNEL_HEIGHT * 0.42) / maxAmp;

	// Global band powers (average across channels)
	const globalBandPowers = useMemo(() => {
		const bands: EEGBand[] = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
		return bands.map((band) => {
			const total = result.channels.reduce((sum, ch) => {
				const bp = ch.bandPowers.find((b) => b.band === band);
				return sum + (bp?.power ?? 0);
			}, 0);
			return { band, power: total / result.channels.length };
		});
	}, [result]);

	const maxBandPower = Math.max(1, ...globalBandPowers.map((b) => b.power));

	function applyPreset(presetId: string) {
		const preset = eegPresets.find((p) => p.id === presetId);
		if (preset) {
			setParams(preset.params);
			setActivePreset(presetId);
		}
	}

	function updateParam<K extends keyof EEGParams>(key: K, value: EEGParams[K]) {
		setParams((current) => ({ ...current, [key]: value }));
		setActivePreset('');
	}

	function toggleChannel(ch: EEGChannelName) {
		setSelectedChannels((current) => {
			const next = new Set(current);
			if (next.has(ch)) {
				if (next.size > 1) next.delete(ch);
			} else {
				next.add(ch);
			}
			return next;
		});
	}

	function selectAllChannels() {
		setSelectedChannels(new Set(eegChannelNames));
	}

	const activePresetData = eegPresets.find((p) => p.id === activePreset);

	return (
		<div className="space-y-6">
			{/* Header */}
			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
							EEG Lab
						</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
							Neural oscillations across the scalp
						</h1>
						<p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
							Explore the 19-channel 10-20 montage EEG with tunable band amplitudes,
							clinical presets, focal abnormalities, and epileptiform discharges.
							All waveforms are generated locally from superposed oscillator models.
						</p>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setViewMode(viewMode === 'traces' ? 'cases' : 'traces')}
							className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
						>
							{viewMode === 'traces' ? 'Case mode' : 'Trace mode'}
						</button>
						<button
							type="button"
							onClick={() => {
								setParams(defaultEEGParams);
								setActivePreset('normal-awake');
							}}
							className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
						>
							Reset defaults
						</button>
					</div>
				</div>
			</section>

			<ModuleHandoffBanner />

			{viewMode === 'cases' ? (
				<EEGCaseMode onApplyPreset={applyPreset} />
			) : (
				<>
					{/* Preset selector */}
					<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
						<p className="text-xs uppercase tracking-[0.24em] text-slate-400">
							Clinical presets
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{eegPresets.map((preset) => (
								<button
									key={preset.id}
									type="button"
									onClick={() => applyPreset(preset.id)}
									className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
										activePreset === preset.id
											? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-100'
											: 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30 hover:bg-white/10 hover:text-white'
									}`}
								>
									{preset.label}
								</button>
							))}
						</div>
						{activePresetData && (
							<div className="mt-4 rounded-3xl border border-cyan-300/15 bg-cyan-300/6 p-4 text-sm leading-7 text-slate-300">
								<p className="font-medium text-cyan-100">{activePresetData.description}</p>
								<p className="mt-2 text-slate-400">{activePresetData.clinicalContext}</p>
							</div>
						)}
					</section>

					{/* Parameter controls */}
					<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
						<div className="space-y-5">
							{eegControlGroups.map((group) => (
								<div key={group.id}>
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
										{group.label}
									</p>
									<div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
										{group.keys.map((key) => {
											const def = eegParamDefinitions.find((d) => d.key === key);
											if (!def) return null;
											return (
												<label key={key} className="block">
													<span className="mb-1 block text-xs text-slate-500">
														{def.label}
														{def.unit ? ` (${def.unit})` : ''}
													</span>
													<input
														type="number"
														value={params[key] as number}
														min={def.min}
														max={def.max}
														step={def.step}
														onChange={(e) =>
															updateParam(key, Number(e.target.value) as EEGParams[typeof key])
														}
														className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
													/>
												</label>
											);
										})}
									</div>
								</div>
							))}

							{/* Dropdown selectors for enum params */}
							<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
								<label className="block">
									<span className="mb-1 block text-xs text-slate-500">
										Focal Slowing
									</span>
									<select
										value={params.focalSlowing}
										onChange={(e) =>
											updateParam('focalSlowing', e.target.value as EEGParams['focalSlowing'])
										}
										className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
									>
										<option value="none">None</option>
										<option value="left-temporal">Left Temporal</option>
										<option value="right-temporal">Right Temporal</option>
										<option value="left-frontal">Left Frontal</option>
										<option value="right-frontal">Right Frontal</option>
									</select>
								</label>
								<label className="block">
									<span className="mb-1 block text-xs text-slate-500">
										Epileptiform Pattern
									</span>
									<select
										value={params.epileptiform}
										onChange={(e) =>
											updateParam('epileptiform', e.target.value as EEGParams['epileptiform'])
										}
										className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
									>
										<option value="none">None</option>
										<option value="left-temporal-spikes">Left Temporal Spikes</option>
										<option value="right-temporal-spikes">Right Temporal Spikes</option>
										<option value="generalized-spike-wave">Generalized 3 Hz Spike-Wave</option>
										<option value="burst-suppression">Burst Suppression</option>
									</select>
								</label>
							</div>
						</div>
					</section>

					{/* Channel selector */}
					<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
						<div className="flex items-center gap-3">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">
								Channels
							</p>
							<button
								type="button"
								onClick={selectAllChannels}
								className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
							>
								All
							</button>
						</div>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{eegChannelNames.map((ch) => (
								<button
									key={ch}
									type="button"
									onClick={() => toggleChannel(ch)}
									className={`rounded-full border px-2.5 py-1 text-xs font-mono transition ${
										selectedChannels.has(ch)
											? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-100'
											: 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300'
									}`}
								>
									{ch}
								</button>
							))}
						</div>
					</section>

					{/* Multi-channel trace display */}
					<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
						<p className="text-xs uppercase tracking-[0.24em] text-slate-400">
							EEG Traces
						</p>
						<h2 className="mt-1 text-xl font-semibold text-white">
							{visibleChannels.length}-channel montage
						</h2>
						<div className="mt-4 overflow-x-auto">
							<svg
								viewBox={`0 0 ${TRACE_WIDTH} ${totalHeight}`}
								className="w-full min-w-[700px] rounded-[24px] border border-white/6 bg-slate-950/45"
								preserveAspectRatio="xMidYMid meet"
							>
								{/* Time grid lines */}
								{Array.from({ length: Math.ceil(maxDuration) + 1 }, (_, i) => {
									const x = TRACE_PAD_LEFT + i * xScale;
									return (
										<g key={`grid-${i}`}>
											<line
												x1={x}
												y1={0}
												x2={x}
												y2={totalHeight}
												stroke="#1e2d4a"
												strokeWidth="0.5"
											/>
											<text x={x} y={totalHeight - 2} fill="#4a6080" fontSize="8" textAnchor="middle">
												{i}s
											</text>
										</g>
									);
								})}
								{/* Channel traces */}
								{visibleChannels.map((ch, index) => {
									const yCenter = TRACE_PAD_TOP + index * TRACE_CHANNEL_HEIGHT + TRACE_CHANNEL_HEIGHT / 2;
									const path = buildTracePath(ch.timeSeries, yCenter, yScale, xScale, TRACE_PAD_LEFT);
									return (
										<g key={ch.channel}>
											{/* Channel baseline */}
											<line
												x1={TRACE_PAD_LEFT}
												y1={yCenter}
												x2={TRACE_WIDTH - TRACE_PAD_RIGHT}
												y2={yCenter}
												stroke="#1a2740"
												strokeWidth="0.3"
											/>
											{/* Channel label */}
											<text
												x={TRACE_PAD_LEFT - 4}
												y={yCenter + 3}
												textAnchor="end"
												fill="#6b8aab"
												fontSize="9"
												fontFamily="monospace"
											>
												{ch.channel}
											</text>
											{/* Waveform */}
											<path
												d={path}
												fill="none"
												stroke="#67d3ff"
												strokeWidth="0.8"
												opacity="0.85"
											/>
										</g>
									);
								})}
							</svg>
						</div>
					</section>

					{/* Band powers and interpretation */}
					<section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
						{/* Band power bar chart */}
						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">
								Spectral power
							</p>
							<h2 className="mt-1 text-xl font-semibold text-white">
								Average band power
							</h2>
							<svg
								viewBox={`0 0 ${BAND_BAR_WIDTH} ${BAND_BAR_HEIGHT}`}
								className="mt-4 w-full rounded-[24px] border border-white/6 bg-slate-950/45"
							>
								{globalBandPowers.map((bp, i) => {
									const barWidth = (BAND_BAR_WIDTH - BAND_PAD * 2 - 40) / 5;
									const x = BAND_PAD + i * (barWidth + 8);
									const barMaxH = BAND_BAR_HEIGHT - 50;
									const barH = Math.max(2, (bp.power / maxBandPower) * barMaxH);
									const y = BAND_BAR_HEIGHT - 28 - barH;
									return (
										<g key={bp.band}>
											<rect
												x={x}
												y={y}
												width={barWidth}
												height={barH}
												rx={4}
												fill={bandColors[bp.band]}
												opacity="0.8"
											/>
											<text
												x={x + barWidth / 2}
												y={BAND_BAR_HEIGHT - 16}
												textAnchor="middle"
												fill="#8899aa"
												fontSize="9"
											>
												{eegBands[bp.band].label.split(' ')[0]}
											</text>
											<text
												x={x + barWidth / 2}
												y={y - 4}
												textAnchor="middle"
												fill={bandColors[bp.band]}
												fontSize="8"
											>
												{bp.power.toFixed(0)}
											</text>
										</g>
									);
								})}
							</svg>
							<div className="mt-3 flex flex-wrap gap-3">
								{globalBandPowers.map((bp) => (
									<div key={bp.band} className="flex items-center gap-1.5">
										<span
											className="inline-block h-2.5 w-2.5 rounded-full"
											style={{ backgroundColor: bandColors[bp.band] }}
										/>
										<span className="text-xs text-slate-400">{eegBands[bp.band].label}</span>
									</div>
								))}
							</div>
						</div>

						{/* Interpretation panel */}
						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">
								Interpretation
							</p>
							<h2 className="mt-1 text-xl font-semibold text-white">
								Pattern analysis
							</h2>

							<div className="mt-4 space-y-3">
								<div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
										Dominant activity
									</p>
									<p className="mt-2 text-lg font-semibold text-cyan-100">
										{result.dominantFrequency} Hz ({result.dominantBand})
									</p>
								</div>

								<div className="rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4 text-sm leading-7 text-slate-300">
									<p className="font-semibold text-amber-100">
										{result.interpretation.pattern}
									</p>
								</div>

								{result.interpretation.notes.map((note) => (
									<div
										key={note}
										className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300"
									>
										{note}
									</div>
								))}
							</div>
						</div>
					</section>
				</>
			)}
		</div>
	);
}

/* ---- Case mode ---- */

function EEGCaseMode({ onApplyPreset }: { onApplyPreset: (id: string) => void }) {
	const [activeCaseIndex, setActiveCaseIndex] = useState(0);
	const activeCase = eegCases[activeCaseIndex];

	if (!activeCase) return null;

	return (
		<div className="space-y-6">
			{/* Case selector */}
			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
				<p className="text-xs uppercase tracking-[0.24em] text-slate-400">
					Clinical cases
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					{eegCases.map((c, i) => (
						<button
							key={c.id}
							type="button"
							onClick={() => setActiveCaseIndex(i)}
							className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
								activeCaseIndex === i
									? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-100'
									: 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30 hover:bg-white/10'
							}`}
						>
							{c.title}
						</button>
					))}
				</div>
			</section>

			{/* Case content */}
			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
				<p className="text-xs uppercase tracking-[0.24em] text-slate-400">
					{activeCase.oneLiner}
				</p>
				<h2 className="mt-2 text-2xl font-semibold text-white">{activeCase.title}</h2>

				<div className="mt-5 space-y-4">
					<div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Chief Complaint</p>
						<p className="mt-2 text-sm leading-7 text-slate-300">{activeCase.chiefComplaint}</p>
					</div>

					<div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-400">History</p>
						<p className="mt-2 text-sm leading-7 text-slate-300">{activeCase.history}</p>
					</div>

					<div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Exam Findings</p>
						<ul className="mt-2 space-y-1 text-sm text-slate-300">
							{activeCase.examFindings.map((finding) => (
								<li key={finding} className="flex gap-2">
									<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/50" />
									{finding}
								</li>
							))}
						</ul>
					</div>

					<div className="rounded-3xl border border-amber-300/18 bg-amber-200/8 p-4">
						<p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Question</p>
						<p className="mt-2 text-sm font-medium leading-7 text-amber-100">
							{activeCase.prompt}
						</p>
					</div>
				</div>
			</section>

			{/* Collapsible reveal panels */}
			<CollapsibleSection title="Hints">
				<ul className="space-y-2 text-sm text-slate-300">
					{activeCase.hints.map((hint) => (
						<li key={hint} className="flex gap-2">
							<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/50" />
							{hint}
						</li>
					))}
				</ul>
			</CollapsibleSection>

			<CollapsibleSection title="Localization cues">
				<ul className="space-y-2 text-sm text-slate-300">
					{activeCase.localizationCues.map((cue) => (
						<li key={cue} className="flex gap-2">
							<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/50" />
							{cue}
						</li>
					))}
				</ul>
			</CollapsibleSection>

			<CollapsibleSection title="Differential traps">
				<ul className="space-y-2 text-sm text-slate-300">
					{activeCase.differentialTraps.map((trap) => (
						<li key={trap} className="flex gap-2">
							<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300/50" />
							{trap}
						</li>
					))}
				</ul>
			</CollapsibleSection>

			<CollapsibleSection title="Teaching points and EEG patterns">
				<div className="space-y-3">
					<ul className="space-y-2 text-sm text-slate-300">
						{activeCase.teachingPoints.map((point) => (
							<li key={point} className="flex gap-2">
								<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/50" />
								{point}
							</li>
						))}
					</ul>
					<div className="flex gap-2 pt-2">
						<button
							type="button"
							onClick={() => onApplyPreset(activeCase.expectedPresetId)}
							className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/20"
						>
							Load expected EEG pattern
						</button>
						<button
							type="button"
							onClick={() => onApplyPreset(activeCase.startingPresetId)}
							className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
						>
							Load starting pattern
						</button>
					</div>
				</div>
			</CollapsibleSection>
		</div>
	);
}

/* ---- Collapsible section for case reveals ---- */

function CollapsibleSection({
	title,
	children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
	const [open, setOpen] = useState(false);

	return (
		<section className="rounded-[28px] border border-white/10 bg-white/6 backdrop-blur">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex w-full items-center justify-between p-5 text-left"
			>
				<span className="text-sm font-medium text-slate-200">{title}</span>
				<span className="text-xs text-slate-500">{open ? 'Hide' : 'Reveal'}</span>
			</button>
			{open && <div className="border-t border-white/5 px-5 pb-5 pt-4">{children}</div>}
		</section>
	);
}
