'use client';

import { useState } from 'react';
import { buildApiUrl, describeApiTarget, extractApiError, type ApiErrorInfo } from '~/lib/api';
import {
	askExamplePrompts,
	askLevelOptions,
	askPromptKits,
	askReasoningRubric,
	askTopicOptions,
	type AskExamplePrompt,
	type AskPromptKit,
} from '~/lib/ask';

interface AskSuccessResponse {
	topic: string;
	level: string;
	question: string;
	answer: string;
}

function isAskSuccessResponse(payload: unknown): payload is AskSuccessResponse {
	return typeof payload === 'object' && payload !== null && typeof (payload as AskSuccessResponse).answer === 'string';
}

export function AskTutor() {
	const [level, setLevel] = useState('post-clinical');
	const [topic, setTopic] = useState('');
	const [question, setQuestion] = useState('');
	const [result, setResult] = useState<AskSuccessResponse | null>(null);
	const [error, setError] = useState<ApiErrorInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const selectedLevel = askLevelOptions.find((option) => option.id === level) ?? askLevelOptions[0]!;
	const selectedTopic = askTopicOptions.find((option) => option.id === topic) ?? null;

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
		<div className="space-y-6">
			<section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Neuro Tutor</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Post-clinical neurology tutoring</h1>
						<p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
							The tutor now defaults to consult-level teaching: syndrome grammar, localization hierarchy, competing alternatives, and the
							single next data point that should sharpen the case.
						</p>
					</div>
					<div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
						API target: {describeApiTarget()}
					</div>
				</div>
			</section>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
				</div>

				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Reasoning standard</p>
					<h2 className="mt-1 text-xl font-semibold text-white">What the tutor now tries to do</h2>
					<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
						<li>Force syndrome formulation before naming a lesion or disease.</li>
						<li>Rank localization layers instead of jumping to one label too early.</li>
						<li>Explain what additional data would most efficiently change the differential.</li>
						<li>State what finding would most change the localization if the current answer is wrong.</li>
						<li>Teach like consult rounds or oral boards, not like a flashcard deck.</li>
					</ul>
				</div>
			</section>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Shared reasoning rubric</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Grade the answer step by step</h2>
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

				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
					<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tutor response</p>
					<h2 className="mt-1 text-xl font-semibold text-white">Tutor answer</h2>

					{result ? (
						<div className="mt-5 space-y-4">
							<div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Topic</p>
								<p className="mt-2 text-sm font-medium text-white">{result.topic}</p>
								<p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">Depth mode</p>
								<p className="mt-2 text-sm font-medium text-white">{result.level}</p>
								<p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">Question</p>
								<p className="mt-2 text-sm leading-7 text-slate-300">{result.question}</p>
							</div>
							<div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4 whitespace-pre-wrap text-sm leading-7 text-slate-100">
								{result.answer}
							</div>
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
							Ask a question to exercise the tutor route.
						</p>
					)}
				</div>

				<div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
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
