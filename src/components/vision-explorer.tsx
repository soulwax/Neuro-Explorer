'use client';

import { useMemo, useState } from 'react';
import { CaseQuestionPanel } from '~/components/case-question-panel';
import { CaseProgressPanel } from '~/components/case-progress-panel';
import { CaseShell } from '~/components/case-shell';
import { CompareShell } from '~/components/compare-shell';
import { ModuleHandoffBanner } from '~/components/module-handoff-banner';
import { RevealPanel } from '~/components/reveal-panel';
import { visionCases } from '~/core/cases/vision';
import { buildApiUrl, describeApiTarget, extractApiError, type ApiErrorInfo } from '~/lib/api';
import { buildCaseHandoffLinks } from '~/lib/case-handoff';
import { useCaseProgress } from '~/lib/case-progress';
import { getCurriculumModule } from '~/lib/curriculum';
import {
	getVisionSyndromePreset,
	visionDefaultImageUrl,
	visionKeyInsight,
	visionReadingRules,
	visionSkipConnections,
	visionStages,
	visionSyndromePresets,
	type VisionClassification,
	type VisionSkipConnections,
	type VisionStage,
	type VisionSyndromePreset,
	type VisionTrackId,
} from '~/lib/vision';

interface VisionSuccessResponse {
	classifications: VisionClassification[];
	processing_pipeline: VisionStage[];
	skip_connections: VisionSkipConnections;
	interpretation: string;
}

function isVisionSuccessResponse(payload: unknown): payload is VisionSuccessResponse {
	return typeof payload === 'object' && payload !== null && Array.isArray((payload as VisionSuccessResponse).classifications);
}

function trackPalette(track: VisionTrackId) {
	switch (track) {
		case 'field-entry':
			return {
				badge: 'Field entry',
				accent: 'text-cyan-100',
				card: 'border-cyan-300/20 bg-cyan-300/8',
			};
		case 'ventral-stream':
			return {
				badge: 'Ventral stream',
				accent: 'text-emerald-100',
				card: 'border-emerald-300/20 bg-emerald-300/8',
			};
		case 'dorsal-stream':
			return {
				badge: 'Dorsal stream',
				accent: 'text-amber-100',
				card: 'border-amber-300/20 bg-amber-300/8',
			};
		case 'attention-network':
			return {
				badge: 'Attention network',
				accent: 'text-fuchsia-100',
				card: 'border-fuchsia-300/20 bg-fuchsia-300/8',
			};
	}
}

function matchesNode(stage: VisionStage, nodes: string[]) {
	const stageText = `${stage.id} ${stage.corticalArea}`.toLowerCase();
	return nodes.some((node) => stageText.includes(node.toLowerCase()));
}

function VisionSyndromeCard({
	preset,
	title,
	detail,
	pipeline,
}: Readonly<{
	preset: VisionSyndromePreset;
	title: string;
	detail: string;
	pipeline: VisionStage[];
}>) {
	const palette = trackPalette(preset.dominantTrack);
	const correlatedStages = pipeline.filter((stage) => matchesNode(stage, preset.dominantNodes));

	return (
		<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
			<div className="flex flex-wrap items-center gap-2">
				<p className="text-sm font-semibold text-white">{title}</p>
				<span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${palette.card} ${palette.accent}`}>
					{palette.badge}
				</span>
			</div>
			<p className="mt-3 text-sm leading-7 text-slate-300">{detail}</p>

			<div className="mt-4 grid gap-3">
				<div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
					<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dominant nodes</p>
					<p className="mt-2 text-sm text-white">{preset.dominantNodes.join(' -> ')}</p>
				</div>
				<div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
					<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Bedside discriminators</p>
					<ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
						{preset.bedsideDiscriminators.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>
				<div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
					<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Decisive negative finding</p>
					<p className="mt-2 text-sm leading-7 text-slate-300">{preset.decisiveNegativeFinding}</p>
				</div>
				<div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
					<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Closest modeled stages</p>
					{correlatedStages.length ? (
						<div className="mt-3 flex flex-wrap gap-2">
							{correlatedStages.map((stage) => (
								<span
									key={`${preset.id}-${stage.id}`}
									className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-200"
								>
									{stage.corticalArea}
								</span>
							))}
						</div>
					) : (
						<p className="mt-2 text-sm leading-7 text-slate-300">
							This syndrome sits outside the classifier ladder itself and depends more on network-level spatial awareness.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

export function VisionExplorer() {
	const visionCurriculum = getCurriculumModule('vision');
	const [imageUrl, setImageUrl] = useState(visionDefaultImageUrl);
	const [result, setResult] = useState<VisionSuccessResponse | null>(null);
	const [error, setError] = useState<ApiErrorInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [activeStageCount, setActiveStageCount] = useState(0);
	const [selectedPresetId, setSelectedPresetId] = useState<string>(visionSyndromePresets[0]!.id);
	const [comparePresetId, setComparePresetId] = useState<string>(visionSyndromePresets[0]!.comparePresetId);
	const [caseId, setCaseId] = useState<string>(visionCases[0]!.id);
	const [casePresetId, setCasePresetId] = useState<string>(visionCases[0]!.startingPresetId);
	const [revealed, setRevealed] = useState(false);
	const {
		summary: caseProgressSummary,
		recordAttempt,
		resetProgress,
	} = useCaseProgress('vision', visionCases.length);

	const pipeline = result?.processing_pipeline ?? visionStages;
	const skipConnections = result?.skip_connections ?? visionSkipConnections;
	const selectedPreset = useMemo(
		() => getVisionSyndromePreset(selectedPresetId) ?? getVisionSyndromePreset(visionSyndromePresets[0]!.id)!,
		[selectedPresetId],
	);
	const comparePreset = useMemo(
		() =>
			getVisionSyndromePreset(comparePresetId) ??
			getVisionSyndromePreset(selectedPreset.comparePresetId) ??
			selectedPreset,
		[comparePresetId, selectedPreset],
	);
	const activeCase = useMemo(() => visionCases.find((item) => item.id === caseId) ?? visionCases[0]!, [caseId]);
	const casePreset = useMemo(
		() =>
			getVisionSyndromePreset(casePresetId) ??
			getVisionSyndromePreset(activeCase.startingPresetId)!,
		[casePresetId, activeCase],
	);
	const targetPreset = useMemo(
		() => getVisionSyndromePreset(activeCase.expectedPresetId)!,
		[activeCase],
	);
	const caseMatches = casePreset.id === targetPreset.id;
	const followUpLinks = buildCaseHandoffLinks(activeCase.followUpModules, {
		fromSlug: 'vision',
		fromTitle: visionCurriculum?.title ?? 'Visual Cortex',
		caseId: activeCase.id,
		caseTitle: activeCase.title,
		prompt: activeCase.prompt,
		selectedLabel: casePreset.title,
		targetLabel: targetPreset.title,
	});
	const topClassification = result?.classifications[0] ?? null;

	async function classify(nextImageUrl?: string) {
		const submittedUrl = (nextImageUrl ?? imageUrl).trim();
		if (!submittedUrl) {
			setError({
				message: 'Image URL required',
				suggestion: 'Paste a public http:// or https:// image URL first.',
			});
			setResult(null);
			return;
		}

		setIsLoading(true);
		setError(null);
		setResult(null);
		setActiveStageCount(0);

		const intervalId = window.setInterval(() => {
			setActiveStageCount((current) => (current < visionStages.length ? current + 1 : current));
		}, 260);

		try {
			const response = await fetch(buildApiUrl('/vision', { url: submittedUrl }));
			const payload = (await response.json()) as unknown;

			if (!response.ok) {
				setError(extractApiError(payload, 'The vision route could not classify that image URL.'));
				setActiveStageCount(0);
				return;
			}

			if (!isVisionSuccessResponse(payload)) {
				setError({
					message: 'Unexpected response shape',
					suggestion: 'The vision route returned a payload the UI does not understand yet.',
				});
				setActiveStageCount(0);
				return;
			}

			setResult(payload);
			setActiveStageCount(visionStages.length);
		} catch (requestError) {
			const message = requestError instanceof Error ? requestError.message : 'Unknown request failure';
			setError({
				message,
				suggestion: 'Check the local `/api/vision` route and try again.',
			});
			setActiveStageCount(0);
		} finally {
			window.clearInterval(intervalId);
			setIsLoading(false);
		}
	}

	function applyPresetSelection(presetId: string) {
		const preset = getVisionSyndromePreset(presetId);
		if (!preset) {
			return;
		}

		setSelectedPresetId(preset.id);
		setComparePresetId(preset.comparePresetId);
	}

	function revealCase() {
		recordAttempt({
			caseId: activeCase.id,
			caseTitle: activeCase.title,
			correct: caseMatches,
			selectedLabel: casePreset.title,
			targetLabel: targetPreset.title,
		});
		setRevealed(true);
	}

	return (
		<div className="app-page-stack">
			<section className="app-surface app-surface--hero">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Visual Cortex</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">From classifier output to cortical syndrome reasoning</h1>
						<p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
							Workers AI still classifies the image, but the module now asks the harder neurological question: which visual processing
							step failed, which stream is implicated, and what single bedside datum would most efficiently re-rank the localization.
						</p>
					</div>
					<div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
						API target: {describeApiTarget()}
					</div>
				</div>
			</section>

			<ModuleHandoffBanner />

			<section className="app-surface">
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_320px]">
					<label className="block">
						<span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Image URL</span>
						<input
							type="url"
							value={imageUrl}
							onChange={(event) => setImageUrl(event.target.value)}
							placeholder="https://example.com/public-image.jpg"
							className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
						/>
					</label>

					<div className="flex flex-wrap items-end gap-3">
						<button
							type="button"
							onClick={() => void classify()}
							disabled={isLoading}
							className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isLoading ? 'Classifying...' : 'Classify image'}
						</button>
						<button
							type="button"
							onClick={() => {
								setImageUrl(visionDefaultImageUrl);
								void classify(visionDefaultImageUrl);
							}}
							disabled={isLoading}
							className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
						>
							Try sample image
						</button>
					</div>
				</div>

				<div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
					<div>
						<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Classifier pipeline</p>
						<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
							{pipeline.map((stage, index) => {
								const isActive = activeStageCount > index;
								const palette = trackPalette(stage.track);
								return (
									<div
										key={stage.id}
										className={`rounded-[24px] border p-4 transition ${
											isActive
												? 'border-cyan-300/35 bg-cyan-300/10 shadow-[0_12px_24px_rgba(103,211,255,0.12)]'
												: 'border-white/10 bg-slate-950/32'
										}`}
									>
										<div className="flex flex-wrap items-center gap-2">
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">{stage.corticalArea}</p>
											<span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${palette.card} ${palette.accent}`}>
												{palette.badge}
											</span>
										</div>
										<p className="mt-2 text-sm font-medium text-white">{stage.resnetStage}</p>
										<p className="mt-3 text-sm leading-6 text-slate-300">{stage.features}</p>
									</div>
								);
							})}
						</div>
					</div>

					<div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5">
						<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Preview and stance</p>
						<div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/60">
							{imageUrl.trim() ? (
								<img src={imageUrl} alt="Classification target" className="aspect-square w-full object-cover" />
							) : (
								<div className="flex aspect-square items-center justify-center px-6 text-center text-sm text-slate-400">
									Paste a public image URL to preview it here before sending it to the Worker.
								</div>
							)}
						</div>
						<p className="mt-4 text-sm leading-7 text-slate-300">{visionKeyInsight}</p>
						<div className="mt-4 rounded-[20px] border border-white/10 bg-white/6 p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Top label right now</p>
							<p className="mt-2 text-sm font-medium text-white">
								{topClassification ? `${topClassification.label} (${(topClassification.score * 100).toFixed(1)}%)` : 'No label yet'}
							</p>
							<p className="mt-3 text-sm leading-7 text-slate-300">
								The classifier can tell you what the object resembles. It cannot, by itself, tell you whether the lesion is early
								visual cortex, late ventral identity cortex, dorsal visuospatial cortex, or an attention network.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Classification output</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Workers AI labels</h2>

					{result ? (
						<div className="mt-5 space-y-4">
							{result.classifications.map((classification) => {
								const width = `${Math.max(6, Math.min(100, classification.score * 100)).toFixed(1)}%`;
								return (
									<div key={classification.label}>
										<div className="flex items-center justify-between gap-3 text-sm">
											<span className="font-medium text-white">{classification.label}</span>
											<span className="font-mono text-slate-400">{(classification.score * 100).toFixed(1)}%</span>
										</div>
										<div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-950/60">
											<div className="h-full rounded-full bg-cyan-300" style={{ width }} />
										</div>
									</div>
								);
							})}
							<p className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4 text-sm leading-7 text-slate-200">
								{result.interpretation}
							</p>
						</div>
					) : error ? (
						<div className="mt-5 rounded-[24px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
							<p className="font-semibold">{error.message}</p>
							{error.suggestion ? <p className="mt-3 leading-6 text-rose-50/90">{error.suggestion}</p> : null}
							{error.details ? (
								<pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-xs text-slate-200">
									{error.details}
								</pre>
							) : null}
						</div>
					) : (
						<p className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
							Submit an image URL to classify it through the internal vision route.
						</p>
					)}
				</div>

				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Residual reasoning</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Why recurrence still matters</h2>
					<p className="mt-4 text-sm leading-7 text-slate-300">{skipConnections.what}</p>
					<p className="mt-4 text-sm leading-7 text-slate-300">{skipConnections.neuroscience}</p>
				</div>
			</section>

			<section className="app-surface">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Syndrome presets</p>
						<h2 className="mt-1 text-xl font-semibold text-white">Read the failed processing step before naming the lesion</h2>
					</div>
					{visionCurriculum ? <p className="text-sm text-slate-300">{visionCurriculum.trainingStage}</p> : null}
				</div>

				<div className="mt-5 flex flex-wrap gap-3">
					{visionSyndromePresets.map((preset) => (
						<button
							key={preset.id}
							type="button"
							onClick={() => applyPresetSelection(preset.id)}
							className={`rounded-full px-4 py-2 text-sm font-medium transition ${
								preset.id === selectedPreset.id
									? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]'
									: 'border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white'
							}`}
						>
							{preset.title}
						</button>
					))}
				</div>

				<div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
					<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
						<p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Syndrome frame</p>
						<h3 className="mt-2 text-lg font-semibold text-white">{selectedPreset.title}</h3>
						<p className="mt-4 text-sm leading-7 text-slate-300">{selectedPreset.syndromeFrame}</p>

						<div className="mt-5 grid gap-4 lg:grid-cols-2">
							<div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Strongest localization</p>
								<p className="mt-2 text-sm font-medium text-white">{selectedPreset.strongestLocalization}</p>
								<p className="mt-3 text-sm leading-7 text-slate-300">{selectedPreset.whyItFits}</p>
							</div>
							<div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Decisive next data</p>
								<ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
									{selectedPreset.decisiveNextData.map((item) => (
										<li key={item}>• {item}</li>
									))}
								</ul>
							</div>
						</div>

						<div className="mt-5 rounded-[20px] border border-white/10 bg-white/6 p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Teaching pearls</p>
							<ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
								{selectedPreset.teachingPearls.map((item) => (
									<li key={item}>• {item}</li>
								))}
							</ul>
						</div>
					</div>

					<VisionSyndromeCard
						preset={selectedPreset}
						title={selectedPreset.strongestLocalization}
						detail={selectedPreset.pipelineCorrelation}
						pipeline={pipeline}
					/>
				</div>
			</section>

			<CompareShell
				title="Best fit versus attractive wrong turn"
				leftLabel={`Best fit: ${selectedPreset.title}`}
				rightLabel={`Compare to: ${comparePreset.title}`}
				left={
					<VisionSyndromeCard
						preset={selectedPreset}
						title={selectedPreset.strongestLocalization}
						detail={selectedPreset.whyItFits}
						pipeline={pipeline}
					/>
				}
				right={
					<div className="space-y-4">
						<div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
							<label className="block">
								<span className="text-xs uppercase tracking-[0.18em] text-slate-400">Compare preset</span>
								<select
									value={comparePreset.id}
									onChange={(event) => setComparePresetId(event.target.value)}
									className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
								>
									{visionSyndromePresets
										.filter((preset) => preset.id !== selectedPreset.id)
										.map((preset) => (
											<option key={preset.id} value={preset.id}>
												{preset.title}
											</option>
										))}
								</select>
							</label>
						</div>
						<VisionSyndromeCard
							preset={comparePreset}
							title={comparePreset.strongestLocalization}
							detail={comparePreset.whyItFits}
							pipeline={pipeline}
						/>
						<div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-amber-100">Why the selected preset wins</p>
							<p className="mt-3 text-sm leading-7 text-slate-300">
								{selectedPreset.weakerAlternative === comparePreset.strongestLocalization
									? selectedPreset.whyAlternativeWeaker
									: `Compared with ${comparePreset.title}, the selected syndrome is stronger because ${selectedPreset.whyItFits.toLowerCase()}`}
							</p>
						</div>
					</div>
				}
			/>

			<CaseShell
				eyebrow="Case Mode"
				title="Commit to the syndrome before the reveal"
				summary="Treat these like consult questions. Decide whether the complaint belongs to field-entry cortex, late ventral recognition, dorsal visuospatial action, or an attention network before you reveal the best fit."
				actions={
					<>
						{visionCases.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => {
									setCaseId(item.id);
									setCasePresetId(item.startingPresetId);
									setRevealed(false);
								}}
								className={`rounded-full px-4 py-2 text-sm font-medium transition ${
									item.id === activeCase.id
										? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]'
										: 'border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white'
								}`}
							>
								{item.title}
							</button>
						))}
					</>
				}
			>
				<div className="space-y-5">
					<CaseProgressPanel
						summary={caseProgressSummary}
						onReset={resetProgress}
					/>

					{visionCurriculum ? (
						<div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
							<div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Training stage</p>
								<p className="mt-3 text-sm font-medium text-white">{visionCurriculum.trainingStage}</p>
							</div>
							<div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Advanced objectives</p>
								<ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
									{visionCurriculum.advancedObjectives.map((objective) => (
										<li key={objective}>• {objective}</li>
									))}
								</ul>
							</div>
						</div>
					) : null}

					<CaseQuestionPanel
						title={activeCase.title}
						oneLiner={activeCase.oneLiner}
						chiefComplaint={activeCase.chiefComplaint}
						history={activeCase.history}
						syndromeFrame={activeCase.syndromeFrame}
						examFindings={activeCase.examFindings}
						prompt={activeCase.prompt}
						hints={activeCase.hints}
						localizationCues={activeCase.localizationCues}
						differentialTraps={activeCase.differentialTraps}
						nextDataRequests={activeCase.nextDataRequests}
					/>

					<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Working syndrome selection</p>
						<div className="mt-4 flex flex-wrap gap-3">
							{visionSyndromePresets.map((preset) => (
								<button
									key={preset.id}
									type="button"
									onClick={() => setCasePresetId(preset.id)}
									className={`rounded-full px-4 py-2 text-sm font-medium transition ${
										preset.id === casePreset.id
											? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(103,211,255,0.24)]'
											: 'border border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white'
									}`}
								>
									{preset.title}
								</button>
							))}
						</div>
						<p className="mt-4 text-sm text-slate-300">
							Current pick: <span className="font-semibold text-white">{casePreset.title}</span>
						</p>
					</div>

					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							onClick={revealCase}
							className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5"
						>
							Reveal localization
						</button>
						<button
							type="button"
							onClick={() => {
								setCasePresetId(activeCase.startingPresetId);
								setRevealed(false);
							}}
							className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
						>
							Reset selection
						</button>
					</div>

					{revealed ? (
						<>
							<RevealPanel
								correct={caseMatches}
								selectedLabel={casePreset.title}
								targetLabel={targetPreset.title}
								explanation={`${targetPreset.strongestLocalization}. ${targetPreset.whyItFits}`}
								teachingPoints={activeCase.teachingPoints}
								nextDataRequests={activeCase.nextDataRequests}
								followUpLinks={followUpLinks}
							/>

							<CompareShell
								title="Your working syndrome versus strongest fit"
								leftLabel={`Your pick: ${casePreset.title}`}
								rightLabel={`Target: ${targetPreset.title}`}
								left={
									<VisionSyndromeCard
										preset={casePreset}
										title={casePreset.strongestLocalization}
										detail={casePreset.whyItFits}
										pipeline={pipeline}
									/>
								}
								right={
									<VisionSyndromeCard
										preset={targetPreset}
										title={targetPreset.strongestLocalization}
										detail={targetPreset.whyItFits}
										pipeline={pipeline}
									/>
								}
							/>
						</>
					) : null}
				</div>
			</CaseShell>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Reading rules</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Four rules that prevent most cortical-vision mistakes</h2>
					<div className="mt-5 grid gap-4 md:grid-cols-2">
						{visionReadingRules.map((item, index) => (
							<div key={item} className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Rule {index + 1}</p>
								<p className="mt-3 text-sm leading-7 text-slate-300">{item}</p>
							</div>
						))}
					</div>
				</div>

				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Module handoff</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Continue the pathway</h2>
					<div className="mt-5 space-y-3">
						{['retina', 'visual-field', 'brain-atlas', 'ask'].map((slug) => {
							const module = getCurriculumModule(slug);
							if (!module) {
								return null;
							}

							return (
								<div key={slug} className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
									<p className="text-sm font-semibold text-white">{module.title}</p>
									<p className="mt-2 text-sm leading-6 text-slate-300">{module.trainingStage}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<section className="app-surface">
				<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Stage biology</p>
				<h2 className="mt-1 text-xl font-semibold text-white">Why each modeled stage still matters</h2>
				<div className="mt-5 grid gap-4 lg:grid-cols-2">
					{pipeline.map((stage) => (
						<div key={`${stage.id}-biology`} className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
							<div className="flex flex-wrap items-center gap-2">
								<p className="text-sm font-semibold text-white">{stage.corticalArea}</p>
								<span
									className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
										trackPalette(stage.track).card
									} ${trackPalette(stage.track).accent}`}
								>
									{trackPalette(stage.track).badge}
								</span>
							</div>
							<p className="mt-3 text-sm leading-7 text-slate-300">{stage.biology}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
