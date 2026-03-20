'use client';

import { Suspense, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation';
import { ModuleHandoffBanner } from '~/components/module-handoff-banner';
import { buildApiUrl, describeApiTarget, extractApiError, type ApiErrorInfo } from '~/lib/api';
import {
	askExamplePrompts,
	askLevelOptions,
	askPromptKits,
	askReasoningRubric,
	askScoreScale,
	askTopicOptions,
	type AskCriterionScore,
	type AskEvaluation,
	type AskExamplePrompt,
	type AskPromptKit,
} from '~/lib/ask';

interface AskSuccessResponse {
	topic: string;
	level: string;
	question: string;
	answer: string;
	evaluation: AskEvaluation;
}

const rubricById = new Map(askReasoningRubric.map((criterion) => [criterion.id, criterion]));

function isAskSuccessResponse(payload: unknown): payload is AskSuccessResponse {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		typeof (payload as AskSuccessResponse).answer === 'string' &&
		typeof (payload as AskSuccessResponse).evaluation === 'object' &&
		(payload as AskSuccessResponse).evaluation !== null
	);
}

function formatLevelLabel(levelId: string) {
	return askLevelOptions.find((option) => option.id === levelId)?.label ?? levelId;
}

function formatTopicLabel(topicId: string) {
	if (!topicId || topicId === 'general') {
		return 'General';
	}

	return askTopicOptions.find((option) => option.id === topicId)?.label ?? topicId;
}

function formatScore(score: number | null, maxScore: number) {
	return score === null ? 'Manual rubric' : `${score}/${maxScore}`;
}

function formatCriterionScore(score: number | null) {
	return score === null ? 'Manual' : `${score}/4`;
}

function scoreTone(score: number | null) {
	if (score === null) {
		return 'border-white/10 bg-white/6 text-slate-300';
	}

	if (score >= 4) {
		return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-50';
	}

	if (score >= 3) {
		return 'border-cyan-300/30 bg-cyan-300/10 text-cyan-50';
	}

	if (score >= 2) {
		return 'border-amber-300/30 bg-amber-300/10 text-amber-50';
	}

	return 'border-rose-300/30 bg-rose-300/12 text-rose-50';
}

function confidenceTone(confidenceLabel: AskEvaluation['confidenceLabel']) {
	switch (confidenceLabel) {
		case 'high':
			return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-50';
		case 'low':
			return 'border-rose-300/30 bg-rose-300/12 text-rose-50';
		default:
			return 'border-amber-300/30 bg-amber-300/10 text-amber-50';
	}
}

function AskTutorSearchPrefill({
	hasAppliedSearchPrefill,
	setHasAppliedSearchPrefill,
	setQuestion,
	setTopic,
}: Readonly<{
	hasAppliedSearchPrefill: boolean;
	setHasAppliedSearchPrefill: Dispatch<SetStateAction<boolean>>;
	setQuestion: Dispatch<SetStateAction<string>>;
	setTopic: Dispatch<SetStateAction<string>>;
}>) {
	const searchParams = useSearchParams();

	useEffect(() => {
		if (hasAppliedSearchPrefill) {
			return;
		}

		const nextQuestion = searchParams.get('question')?.trim() ?? '';
		const nextTopic = searchParams.get('topic')?.trim() ?? '';

		if (!nextQuestion && !nextTopic) {
			return;
		}

		if (nextQuestion) {
			setQuestion(nextQuestion);
		}
		if (nextTopic && askTopicOptions.some((option) => option.id === nextTopic)) {
			setTopic(nextTopic);
		}
		setHasAppliedSearchPrefill(true);
	}, [
		hasAppliedSearchPrefill,
		searchParams,
		setHasAppliedSearchPrefill,
		setQuestion,
		setTopic,
	]);

	return null;
}

function CriterionScoreCard({ criterion }: Readonly<{ criterion: AskCriterionScore }>) {
	const rubricCriterion = rubricById.get(criterion.id);

	return (
		<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
						{rubricCriterion?.label ?? criterion.id}
					</p>
					{rubricCriterion ? (
						<p className="mt-2 text-sm leading-6 text-slate-400">{rubricCriterion.description}</p>
					) : null}
				</div>
				<span
					className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${scoreTone(
						criterion.score,
					)}`}
				>
					{formatCriterionScore(criterion.score)}
				</span>
			</div>

			<p className="mt-4 text-sm leading-7 text-slate-300">{criterion.feedback}</p>

			<div className="mt-4 rounded-[18px] border border-white/10 bg-white/6 p-3">
				<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Strongest signal</p>
				<p className="mt-2 text-sm leading-6 text-slate-200">{criterion.strongestSignal}</p>
			</div>

			{criterion.missedSignals.length > 0 ? (
				<div className="mt-4 rounded-[18px] border border-white/10 bg-white/6 p-3">
					<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Still missing</p>
					<ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
						{criterion.missedSignals.map((signal) => (
							<li key={signal}>• {signal}</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
}

export function AskTutor() {
	const [level, setLevel] = useState('post-clinical');
	const [topic, setTopic] = useState('');
	const [question, setQuestion] = useState('');
	const [result, setResult] = useState<AskSuccessResponse | null>(null);
	const [error, setError] = useState<ApiErrorInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasAppliedSearchPrefill, setHasAppliedSearchPrefill] = useState(false);
	const responseSectionRef = useRef<HTMLDivElement | null>(null);

	const selectedLevel = askLevelOptions.find((option) => option.id === level) ?? askLevelOptions[0]!;
	const selectedTopic = askTopicOptions.find((option) => option.id === topic) ?? null;

	useEffect(() => {
		if (!isLoading && !result && !error) {
			return;
		}

		requestAnimationFrame(() => {
			responseSectionRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		});
	}, [error, isLoading, result]);

	async function askQuestion(nextQuestion = question, nextTopic = topic, nextLevel = level) {
		const trimmedQuestion = nextQuestion.trim();
		if (!trimmedQuestion) {
			setError({
				message: 'Question required',
				suggestion: 'Ask for lesion localization, a mechanistic differential, or a case-conference style walkthrough.',
			});
			setResult(null);
			return;
		}

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await fetch(buildApiUrl('/ask'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					question: trimmedQuestion,
					topic: nextTopic || undefined,
					level: nextLevel || undefined,
				}),
			});
			const payload = (await response.json()) as unknown;

			if (!response.ok) {
				setError(extractApiError(payload, 'The tutor route could not generate a response.'));
				setResult(null);
				return;
			}

			if (!isAskSuccessResponse(payload)) {
				setError({
					message: 'Unexpected response shape',
					suggestion: 'The tutor answered, but the UI did not recognize the payload.',
				});
				setResult(null);
				return;
			}

			setResult(payload);
		} catch (requestError) {
			const message = requestError instanceof Error ? requestError.message : 'Unknown request failure';
			setError({
				message,
				suggestion: 'Check the local `/api/ask` route and try again.',
			});
			setResult(null);
		} finally {
			setIsLoading(false);
		}
	}

	function runExample(example: AskExamplePrompt) {
		setLevel(example.level);
		setTopic(example.topic);
		setQuestion(example.question);
		void askQuestion(example.question, example.topic, example.level);
	}

	function runPromptKit(kit: AskPromptKit) {
		setLevel(kit.level);
		setTopic(kit.topic);
		setQuestion(kit.question);
		void askQuestion(kit.question, kit.topic, kit.level);
	}

	return (
		<div className="app-page-stack">
			<Suspense fallback={null}>
				<AskTutorSearchPrefill
					hasAppliedSearchPrefill={hasAppliedSearchPrefill}
					setHasAppliedSearchPrefill={setHasAppliedSearchPrefill}
					setQuestion={setQuestion}
					setTopic={setTopic}
				/>
			</Suspense>

			<section className="app-surface app-surface--hero">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Neuro Tutor</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Post-clinical neurology tutoring</h1>
						<p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
							The tutor now answers like consult rounds and then self-audits the reasoning: syndrome grammar, localization hierarchy,
							mechanism, alternatives, decisive next data, and the one finding that should overturn the current frame.
						</p>
					</div>
					<div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
						API target: {describeApiTarget()}
					</div>
				</div>
			</section>

			<ModuleHandoffBanner />

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
				<div className="app-surface">
					<div className="grid gap-4 md:grid-cols-3">
						<label className="block">
							<span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Depth mode</span>
							<select
								value={level}
								onChange={(event) => setLevel(event.target.value)}
								className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
							>
								{askLevelOptions.map((option) => (
									<option key={option.id} value={option.id}>
										{option.label}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Topic focus</span>
							<select
								value={topic}
								onChange={(event) => setTopic(event.target.value)}
								className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
							>
								<option value="">General</option>
								{askTopicOptions.map((option) => (
									<option key={option.id} value={option.id}>
										{option.label}
									</option>
								))}
							</select>
						</label>

						<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
							<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Teaching frame</p>
							<p className="mt-3 text-sm leading-6 text-slate-300">{selectedTopic?.description ?? selectedLevel.description}</p>
						</div>
					</div>

					<label className="mt-4 block">
						<span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Your question</span>
						<textarea
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
							rows={5}
							placeholder="A patient has vertical diplopia, ptosis, and a blown pupil. Walk me from syndrome to localization, key alternatives, and the most important bedside discriminators."
							className="w-full rounded-[24px] border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-7 text-slate-100 outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/60"
						/>
					</label>

					<div className="mt-4 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => void askQuestion()}
							disabled={isLoading}
							className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_28px_rgba(103,211,255,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isLoading ? 'Asking...' : 'Ask tutor'}
						</button>
						<button
							type="button"
							onClick={() => {
								setLevel('post-clinical');
								setTopic('');
								setQuestion('');
								setError(null);
								setResult(null);
							}}
							disabled={isLoading}
							className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
						>
							Clear
						</button>
					</div>

					<p className="mt-4 text-sm leading-6 text-slate-400">
						{isLoading
							? 'Consulting the tutor now. The response panel below will update automatically.'
							: 'The answer and rubric audit appear in the Tutor response panel below.'}
					</p>
				</div>

				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Reasoning standard</p>
					<h2 className="mt-1 text-xl font-semibold text-white">What the tutor now checks explicitly</h2>
					<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
						<li>Force syndrome formulation before naming a lesion or disease.</li>
						<li>Rank localization layers instead of jumping to one label too early.</li>
						<li>Explain what additional data would most efficiently change the differential.</li>
						<li>State what finding would most change the localization if the current answer is wrong.</li>
						<li>Return a rubric-based self-audit instead of leaving the grading implicit.</li>
					</ul>
				</div>
			</section>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Shared reasoning rubric</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Grade the answer step by step</h2>

					<div className="mt-5 flex flex-wrap gap-2">
						{askScoreScale.map((entry) => (
							<div
								key={entry.score}
								className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-2 text-xs text-slate-200"
							>
								<span className="font-semibold text-white">{entry.score}</span> {entry.label}
							</div>
						))}
					</div>

					<div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{askReasoningRubric.map((criterion) => (
							<div key={criterion.id} className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-cyan-100">{criterion.label}</p>
								<p className="mt-3 text-sm leading-7 text-slate-300">{criterion.description}</p>
								<ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
									{criterion.signals.map((signal) => (
										<li key={signal}>• {signal}</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Module handoff</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Use the tutor across the whole app</h2>
					<div className="mt-4 space-y-3">
						{askPromptKits.map((kit) => (
							<button
								key={kit.id}
								type="button"
								onClick={() => runPromptKit(kit)}
								className="block w-full rounded-[24px] border border-white/10 bg-slate-950/35 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-950/55"
							>
								<p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
									{kit.moduleTitle} · {kit.levelLabel}
								</p>
								<p className="mt-2 text-sm font-medium text-white">{kit.title}</p>
								<p className="mt-2 text-sm leading-6 text-slate-300">{kit.whyUse}</p>
							</button>
						))}
					</div>
				</div>
			</section>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
				<div
					ref={responseSectionRef}
					className="app-surface"
				>
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tutor response</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Answer and score</h2>

					{isLoading ? (
						<div
							className="mt-5 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm text-cyan-50"
							aria-live="polite"
						>
							<p className="font-semibold uppercase tracking-[0.18em] text-cyan-100">Generating response</p>
							<p className="mt-3 leading-7 text-cyan-50/90">
								Workers AI is building the tutor answer and rubric audit now. This panel will populate as soon as the request finishes.
							</p>
							{question.trim() ? (
								<div className="mt-4 rounded-[18px] border border-white/10 bg-slate-950/35 p-4 text-slate-100">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current question</p>
									<p className="mt-2 leading-7">{question.trim()}</p>
								</div>
							) : null}
						</div>
					) : result ? (
						<div className="mt-5 space-y-4">
							<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Topic</p>
								<p className="mt-2 text-sm font-medium text-white">{formatTopicLabel(result.topic)}</p>
								<p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">Depth mode</p>
								<p className="mt-2 text-sm font-medium text-white">{formatLevelLabel(result.level)}</p>
								<p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">Question</p>
								<p className="mt-2 text-sm leading-7 text-slate-300">{result.question}</p>
							</div>

							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
								<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rubric score</p>
									<p className="mt-3 text-2xl font-semibold text-white">
										{formatScore(result.evaluation.overallScore, result.evaluation.maxScore)}
									</p>
									<p className="mt-3 text-sm leading-6 text-slate-300">{result.evaluation.overallVerdict}</p>
								</div>

								<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Confidence</p>
									<span
										className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${confidenceTone(
											result.evaluation.confidenceLabel,
										)}`}
									>
										{result.evaluation.confidenceLabel}
									</span>
									<p className="mt-3 text-sm leading-6 text-slate-300">{result.evaluation.confidenceReason}</p>
								</div>

								<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Next step</p>
									<p className="mt-3 text-sm leading-6 text-slate-200">{result.evaluation.nextStep}</p>
								</div>

								<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Change-my-mind finding</p>
									<p className="mt-3 text-sm leading-6 text-slate-200">{result.evaluation.changeMindFinding}</p>
								</div>
							</div>

							{!result.evaluation.scoreAvailable ? (
								<div className="rounded-[24px] border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
									Structured scoring was not fully available for this run, so the tutor returned the answer with a manual-grading fallback.
								</div>
							) : null}

							<div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4 whitespace-pre-wrap text-sm leading-7 text-slate-100">
								{result.answer}
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-emerald-100">Strengths</p>
									<ul className="mt-3 space-y-2 text-sm leading-7 text-slate-100">
										{result.evaluation.strengths.map((strength) => (
											<li key={strength}>• {strength}</li>
										))}
									</ul>
								</div>

								<div className="rounded-[24px] border border-rose-300/25 bg-rose-300/12 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-rose-100">Gaps to tighten</p>
									<ul className="mt-3 space-y-2 text-sm leading-7 text-rose-50">
										{result.evaluation.gaps.map((gap) => (
											<li key={gap}>• {gap}</li>
										))}
									</ul>
								</div>
							</div>

							<div className="grid gap-4 xl:grid-cols-2">
								{result.evaluation.criterionScores.map((criterion) => (
									<CriterionScoreCard key={criterion.id} criterion={criterion} />
								))}
							</div>
						</div>
					) : error ? (
						<div className="mt-5 rounded-[24px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100" aria-live="polite">
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
							Ask a question to exercise the tutor route and see the structured rubric scoring.
						</p>
					)}
				</div>

				<div className="app-surface">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Suggested prompts</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Start with these advanced prompts</h2>
					<div className="mt-4 space-y-3">
						{askExamplePrompts.map((example) => (
							<button
								key={`${example.topic}-${example.question}`}
								type="button"
								onClick={() => runExample(example)}
								className="block w-full rounded-[24px] border border-white/10 bg-slate-950/35 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-950/55"
							>
								<p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
									{example.topicLabel} · {example.levelLabel}
								</p>
								<p className="mt-2 text-sm leading-7 text-slate-200">{example.question}</p>
							</button>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
