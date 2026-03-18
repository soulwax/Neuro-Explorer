'use client';

import { useEffect, useState } from 'react';
import { ModuleHandoffBanner } from '~/components/module-handoff-banner';
import { buildApiUrl, describeApiTarget, extractApiError, type ApiErrorInfo } from '~/lib/api';
import { getCurriculumModule } from '~/lib/curriculum';
import {
	defaultGridCellParams,
	gridCellParamDefinitions,
	gridCellPresets,
	type GridCellParams,
	type GridCellResult,
} from '~/lib/grid-cell';

const GRID_W = 340;
const GRID_H = 340;
const GRID_PAD = 20;
const TRACE_W = 760;
const TRACE_H = 180;
const TRACE_PAD = 24;
const CUSTOM_PRESET_ID = 'custom';
const DEFAULT_PRESET_ID = gridCellPresets[0]!.id;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isGridCellResult(payload: unknown): payload is GridCellResult {
	return (
		isRecord(payload) &&
		Array.isArray(payload.path) &&
		Array.isArray(payload.spikes) &&
		Array.isArray(payload.rateMap) &&
		isRecord(payload.summary) &&
		isRecord(payload.interpretation)
	);
}

function heatColor(value: number, maxValue: number) {
	const normalized = maxValue <= 0 ? 0 : Math.max(0, Math.min(1, value / maxValue));
	const hue = 210 - 170 * normalized;
	const saturation = 55 + 35 * normalized;
	const light = 14 + 48 * normalized;
	return `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${light.toFixed(1)}%)`;
}

function pathTrace(points: GridCellResult['path'], arenaSize: number) {
	const scale = (GRID_W - GRID_PAD * 2) / Math.max(arenaSize, 1);

	return points
		.map((point, index) => {
			const x = GRID_PAD + point.x * scale;
			const y = GRID_H - GRID_PAD - point.y * scale;
			return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(' ');
}

function rateTracePath(points: GridCellResult['path'], durationSec: number) {
	const maxRate = Math.max(1, ...points.map((point) => point.rateHz));
	const xScale = (TRACE_W - TRACE_PAD * 2) / Math.max(durationSec, 1);
	const yScale = (TRACE_H - 26) / maxRate;

	return points
		.map((point, index) => {
			const x = TRACE_PAD + point.t * xScale;
			const y = TRACE_H - 16 - point.rateHz * yScale;
			return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(' ');
}

function SummaryCard({
	label,
	value,
	accent,
	detail,
}: Readonly<{
	label: string;
	value: string;
	accent: string;
	detail: string;
}>) {
	return (
		<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
			<p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
			<p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
			<p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
		</div>
	);
}

export function GridCellExplorer() {
	const [params, setParams] = useState<GridCellParams>(defaultGridCellParams);
	const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
	const [result, setResult] = useState<GridCellResult | null>(null);
	const [error, setError] = useState<ApiErrorInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const activePreset =
		gridCellPresets.find((preset) => preset.id === activePresetId) ?? null;
	const handoffModules = ['brain-atlas', 'sleep', 'ask']
		.map((slug) => getCurriculumModule(slug))
		.filter(
			(
				module,
			): module is NonNullable<ReturnType<typeof getCurriculumModule>> =>
				module !== undefined,
		);

	async function loadGridField(nextParams = params) {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(buildApiUrl('/grid-cell', nextParams));
			const payload = (await response.json()) as unknown;

			if (!response.ok) {
				setError(extractApiError(payload, 'The grid-cell route could not generate a navigation field.'));
				setResult(null);
				return;
			}

			if (!isGridCellResult(payload)) {
				setError({
					message: 'Unexpected response shape',
					suggestion: 'The grid-cell endpoint returned a payload this UI does not understand yet.',
				});
				setResult(null);
				return;
			}

			setResult(payload);
		} catch (requestError) {
			const message = requestError instanceof Error ? requestError.message : 'Unknown request failure';
			setError({
				message,
				suggestion: 'Check the local `/api/grid-cell` route and try again.',
			});
			setResult(null);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		void loadGridField(defaultGridCellParams);
		// Initial bootstrap only.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function applyPreset(presetId: string) {
		const preset = gridCellPresets.find((item) => item.id === presetId);
		if (!preset) {
			return;
		}

		setParams(preset.params);
		setActivePresetId(preset.id);
		void loadGridField(preset.params);
	}

	function updateParam<K extends keyof GridCellParams>(key: K, value: number) {
		if (Number.isNaN(value)) {
			return;
		}

		setParams((current) => ({
			...current,
			[key]: value,
		}));
		setActivePresetId(CUSTOM_PRESET_ID);
	}

	const maxMapRate = Math.max(0, ...(result?.rateMap.flatMap((row) => row) ?? [0]));
	const maxTraceRate = Math.max(1, ...(result?.path.map((point) => point.rateHz) ?? [1]));

	return (
		<div className="space-y-6">
			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Grid Cell Navigator</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
							Spatial code precision, theta framing, and navigation phenotypes
						</h1>
						<p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
							Grid Cell now teaches more than a nice lattice. It compares canonical maps, broad low-resolution
							fields, noisy exploration, compact-room remapping, and theta-locked precision so students can
							reason about what actually makes a spatial code useful.
						</p>
					</div>
					<div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
						API target: {describeApiTarget()}
					</div>
				</div>
			</section>

			<ModuleHandoffBanner />

			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Teaching presets</p>
						<h2 className="mt-1 text-xl font-semibold text-white">Start from a navigation phenotype</h2>
					</div>
					<p className="max-w-2xl text-sm leading-7 text-slate-300">
						Each preset emphasizes a different spatial story: crisp entorhinal tiling, diffuse low-resolution
						maps, noisy path integration, or environment-driven rescaling.
					</p>
				</div>

				<div className="mt-5 flex flex-wrap gap-3">
					{gridCellPresets.map((preset) => (
						<button
							key={preset.id}
							type="button"
							onClick={() => applyPreset(preset.id)}
							className={`rounded-full px-4 py-2 text-sm font-medium transition ${
								activePresetId === preset.id
									? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]'
									: 'border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white'
							}`}
						>
							{preset.label}
						</button>
					))}
					{activePresetId === CUSTOM_PRESET_ID ? (
						<span className="rounded-full border border-white/10 bg-slate-950/35 px-4 py-2 text-sm text-slate-300">
							Custom parameter set
						</span>
					) : null}
				</div>

				<div className="mt-5 rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4">
					<p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
						{activePreset?.label ?? 'Custom interpretation'}
					</p>
					<p className="mt-3 text-sm leading-7 text-slate-200">
						{activePreset?.description ??
							'You are outside the canned presets now. Use the phenotype summary below to see what kind of spatial code the current parameters are really producing.'}
					</p>
					<p className="mt-3 text-sm leading-7 text-slate-300">
						{activePreset?.clinicalLens ?? result?.interpretation.clinicalLens ?? 'Generate a field to see the clinical teaching frame.'}
					</p>
					<p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
						{activePreset?.caution ?? 'Treat this as a navigation-coding scaffold rather than a literal recording.'}
					</p>
				</div>
			</section>

			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{gridCellParamDefinitions.map((definition) => (
						<label key={definition.key} className="block">
							<span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
								{definition.label}
								{definition.unit ? ` (${definition.unit})` : ''}
							</span>
							<input
								type="number"
								value={params[definition.key]}
								min={definition.min}
								max={definition.max}
								step={definition.step}
								onChange={(event) => updateParam(definition.key, Number(event.target.value))}
								className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
							/>
						</label>
					))}
				</div>

				<div className="mt-6 flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={() => void loadGridField()}
						disabled={isLoading}
						className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isLoading ? 'Generating...' : 'Generate Grid Field'}
					</button>
					<button
						type="button"
						onClick={() => {
							setParams(defaultGridCellParams);
							setActivePresetId(DEFAULT_PRESET_ID);
							void loadGridField(defaultGridCellParams);
						}}
						disabled={isLoading}
						className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
					>
						Reset defaults
					</button>
					{result ? (
						<p className="text-sm text-slate-300">
							{result.path.length} samples | {result.spikes.length} spikes | peak {result.summary.peakRateHz.toFixed(1)} Hz
						</p>
					) : null}
				</div>

				{error ? (
					<div className="mt-5 rounded-[24px] border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
						<p className="font-medium">{error.message}</p>
						{error.suggestion ? <p className="mt-2 text-rose-100/80">{error.suggestion}</p> : null}
						{error.details ? (
							<pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950/40 p-3 text-xs text-rose-100/85">{error.details}</pre>
						) : null}
					</div>
				) : null}
			</section>

			<section className="grid gap-6 xl:grid-cols-2">
				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Arena path + spikes</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Navigation through physical space</h2>
					<svg viewBox={`0 0 ${GRID_W} ${GRID_H}`} className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45">
						<rect
							x={GRID_PAD}
							y={GRID_PAD}
							width={GRID_W - GRID_PAD * 2}
							height={GRID_H - GRID_PAD * 2}
							rx="8"
							fill="#0d1424"
							stroke="#1e2d4a"
						/>
						{Array.from({ length: 5 }, (_, index) => {
							const x = GRID_PAD + ((GRID_W - GRID_PAD * 2) / 6) * (index + 1);
							return (
								<g key={index}>
									<line x1={x} y1={GRID_PAD} x2={x} y2={GRID_H - GRID_PAD} stroke="#18243b" strokeWidth="0.7" />
									<line x1={GRID_PAD} y1={x} x2={GRID_W - GRID_PAD} y2={x} stroke="#18243b" strokeWidth="0.7" />
								</g>
							);
						})}
						{result ? (
							<>
								<path d={pathTrace(result.path, result.params.arenaSize)} fill="none" stroke="rgba(79,195,247,0.35)" strokeWidth="1.1" />
								{result.spikes.map((spike, index) => {
									const scale = (GRID_W - GRID_PAD * 2) / Math.max(result.params.arenaSize, 1);
									const x = GRID_PAD + spike.x * scale;
									const y = GRID_H - GRID_PAD - spike.y * scale;

									return <circle key={`${spike.t}-${index}`} cx={x} cy={y} r="2.2" fill="#ffd166" opacity="0.82" />;
								})}
								{result.path.length ? (
									<>
										{(() => {
											const scale = (GRID_W - GRID_PAD * 2) / Math.max(result.params.arenaSize, 1);
											const start = result.path[0]!;
											const end = result.path[result.path.length - 1]!;

											return (
												<>
													<circle cx={GRID_PAD + start.x * scale} cy={GRID_H - GRID_PAD - start.y * scale} r="4" fill="#00e676" />
													<circle cx={GRID_PAD + end.x * scale} cy={GRID_H - GRID_PAD - end.y * scale} r="4" fill="#ff5252" />
												</>
											);
										})()}
									</>
								) : null}
							</>
						) : (
							<text x={GRID_W / 2} y={GRID_H / 2} textAnchor="middle" fill="#6b7f99" fontSize="12">
								Generate Grid Field
							</text>
						)}
					</svg>
				</div>

				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Firing rate map</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Hexagonal lattice occupancy</h2>
					<svg viewBox={`0 0 ${GRID_W} ${GRID_H}`} className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45">
						<rect
							x={GRID_PAD}
							y={GRID_PAD}
							width={GRID_W - GRID_PAD * 2}
							height={GRID_H - GRID_PAD * 2}
							rx="8"
							fill="#0d1424"
							stroke="#1e2d4a"
						/>
						{result ? (
							result.rateMap.map((row, rowIndex) =>
								row.map((value, colIndex) => {
									const cellW = (GRID_W - GRID_PAD * 2) / Math.max(row.length, 1);
									const cellH = (GRID_H - GRID_PAD * 2) / Math.max(result.rateMap.length, 1);
									const fill = value <= 0 ? '#0f1729' : heatColor(value, maxMapRate);

									return (
										<rect
											key={`${rowIndex}-${colIndex}`}
											x={GRID_PAD + colIndex * cellW}
											y={GRID_PAD + rowIndex * cellH}
											width={cellW + 0.4}
											height={cellH + 0.4}
											fill={fill}
										/>
									);
								}),
							)
						) : (
							<text x={GRID_W / 2} y={GRID_H / 2} textAnchor="middle" fill="#6b7f99" fontSize="12">
								Generate Grid Field
							</text>
						)}
					</svg>
				</div>
			</section>

			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
				<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Instantaneous firing rate</p>
				<h2 className="mt-1 text-xl font-semibold text-white">Theta-modulated rate trace</h2>
				<svg viewBox={`0 0 ${TRACE_W} ${TRACE_H}`} className="mt-5 w-full rounded-[24px] border border-white/6 bg-slate-950/45">
					<line x1={TRACE_PAD} y1="10" x2={TRACE_PAD} y2={TRACE_H - 16} stroke="#1e2d4a" />
					<line x1={TRACE_PAD} y1={TRACE_H - 16} x2={TRACE_W - TRACE_PAD} y2={TRACE_H - 16} stroke="#1e2d4a" />
					{result
						? Array.from({ length: 9 }, (_, index) => {
								const t = (result.params.durationSec / 8) * index;
								const x = TRACE_PAD + (t / Math.max(result.params.durationSec, 1)) * (TRACE_W - TRACE_PAD * 2);
								return <line key={index} x1={x} y1="10" x2={x} y2={TRACE_H - 16} stroke="#18243b" strokeWidth="0.7" />;
							})
						: null}
					{result ? (
						<>
							<path d={rateTracePath(result.path, result.params.durationSec)} fill="none" stroke="#4fc3f7" strokeWidth="1.5" />
							<text x={TRACE_W - TRACE_PAD} y="18" textAnchor="end" fill="#6b7f99" fontSize="10">
								Peak {maxTraceRate.toFixed(1)} Hz
							</text>
						</>
					) : (
						<text x={TRACE_W / 2} y={TRACE_H / 2} textAnchor="middle" fill="#6b7f99" fontSize="12">
							Generate Grid Field
						</text>
					)}
				</svg>
			</section>

			{result ? (
				<>
					<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Phenotype</p>
							<h2 className="mt-1 text-xl font-semibold text-white">{result.interpretation.headline}</h2>
							<div className="mt-4 flex flex-wrap gap-2">
								<span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
									{result.summary.navigationRegime}
								</span>
								<span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
									{result.summary.thetaState}
								</span>
							</div>
							<p className="mt-4 text-sm leading-7 text-slate-300">{result.interpretation.mechanism}</p>

							<div className="mt-5 grid gap-3 sm:grid-cols-2">
								<SummaryCard
									label="Coverage"
									value={`${result.summary.coveragePct.toFixed(1)}%`}
									accent="text-white"
									detail="How much of the arena was actually sampled strongly enough to estimate the map."
								/>
								<SummaryCard
									label="Mean rate"
									value={`${result.summary.meanRateHz.toFixed(2)} Hz`}
									accent="text-cyan-100"
									detail="The average output rate across the full navigation run."
								/>
								<SummaryCard
									label="Peak contrast"
									value={`${result.summary.peakToMeanRatio.toFixed(2)}x`}
									accent="text-amber-100"
									detail="How sharply the field's best hot spots stand out over the average rate."
								/>
								<SummaryCard
									label="Boundary bias"
									value={`${result.summary.boundaryBiasPct.toFixed(1)}%`}
									accent="text-rose-100"
									detail="How much the exploration path hugged arena walls rather than sampling the center evenly."
								/>
								<SummaryCard
									label="Distance"
									value={`${result.summary.totalDistanceCm.toFixed(1)} cm`}
									accent="text-sky-100"
									detail="Total path length traversed during the run."
								/>
								<SummaryCard
									label="Spacing"
									value={`${result.summary.spacingCm.toFixed(1)} cm`}
									accent="text-emerald-100"
									detail="The intrinsic scale of the lattice relative to the explored environment."
								/>
							</div>
						</div>

						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Clinical lens</p>
							<h2 className="mt-1 text-xl font-semibold text-white">What this map teaches</h2>
							<p className="mt-4 text-sm leading-7 text-slate-300">{result.interpretation.clinicalLens}</p>
							<div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-200">
								{result.explanation.model}
							</div>
						</div>
					</section>

					<section className="grid gap-6 lg:grid-cols-3">
						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Behavioral readout</p>
							<h2 className="mt-1 text-xl font-semibold text-white">What learners should notice</h2>
							<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
								{result.interpretation.behaviorSignals.map((item) => (
									<li key={item} className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
										{item}
									</li>
								))}
							</ul>
						</div>

						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Differential traps</p>
							<h2 className="mt-1 text-xl font-semibold text-white">What not to overclaim</h2>
							<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
								{result.interpretation.differentialTraps.map((item) => (
									<li key={item} className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
										{item}
									</li>
								))}
							</ul>
						</div>

						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Next questions</p>
							<h2 className="mt-1 text-xl font-semibold text-white">Useful follow-up experiments</h2>
							<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
								{result.interpretation.nextQuestions.map((item) => (
									<li key={item} className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
										{item}
									</li>
								))}
							</ul>
						</div>
					</section>

					<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Model notes</p>
							<h2 className="mt-1 text-xl font-semibold text-white">Why the map looks this way</h2>
							<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
								{result.explanation.notes.map((note) => (
									<li key={note} className="rounded-3xl border border-white/10 bg-slate-950/35 px-4 py-3">
										{note}
									</li>
								))}
							</ul>
						</div>

						<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Continue the loop</p>
							<h2 className="mt-1 text-xl font-semibold text-white">Use this with anatomy, sleep, and tutoring</h2>
							<div className="mt-4 space-y-3">
								{handoffModules.map((module) => (
									<div key={module.slug} className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
										<p className="text-sm font-semibold text-white">{module.title}</p>
										<p className="mt-2 text-sm leading-6 text-slate-300">{module.trainingStage}</p>
									</div>
								))}
							</div>
						</div>
					</section>
				</>
			) : null}
		</div>
	);
}
