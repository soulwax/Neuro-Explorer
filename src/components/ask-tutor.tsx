"use client";

import { useState } from "react";
import {
  buildApiUrl,
  describeApiTarget,
  extractApiError,
  type ApiErrorInfo,
} from "~/lib/api";
import {
  askExamplePrompts,
  askTopicOptions,
  type AskExamplePrompt,
} from "~/lib/ask";

interface AskSuccessResponse {
  topic: string;
  question: string;
  answer: string;
}

function isAskSuccessResponse(payload: unknown): payload is AskSuccessResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as AskSuccessResponse).answer === "string"
  );
}

export function AskTutor() {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskSuccessResponse | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTopic =
    askTopicOptions.find((option) => option.id === topic) ?? null;

  async function askQuestion(nextQuestion = question, nextTopic = topic) {
    const trimmedQuestion = nextQuestion.trim();
    if (!trimmedQuestion) {
      setError({
        message: "Question required",
        suggestion:
          "Ask about a mechanism, a patient, or an AI-to-biology analogy.",
      });
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl("/ask"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          topic: nextTopic || undefined,
        }),
      });
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        setError(
          extractApiError(
            payload,
            "The tutor route could not generate a response.",
          ),
        );
        setResult(null);
        return;
      }

      if (!isAskSuccessResponse(payload)) {
        setError({
          message: "Unexpected response shape",
          suggestion:
            "The tutor answered, but the UI did not recognize the payload.",
        });
        setResult(null);
        return;
      }

      setResult(payload);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unknown request failure";
        setError({
          message,
          suggestion: "Check the local `/api/ask` route and try again.",
        });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  function runExample(example: AskExamplePrompt) {
    setTopic(example.topic);
    setQuestion(example.question);
    void askQuestion(example.question, example.topic);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Neuro Tutor
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Socratic tutoring inside the primary Next.js app
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              The conversation flow now lives directly in App Router while the
              server route handles Cloudflare-backed tutor inference.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
            API target: {describeApiTarget()}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
                Topic focus
              </span>
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
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Why focus helps
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {selectedTopic?.description ??
                  "Leave the topic open for broad questions, or choose a specific domain to ground the tutor's answer."}
              </p>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
              Your question
            </span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={5}
              placeholder="Why can a neuron be strongly stimulated and still fail to fire again during the absolute refractory period?"
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
              {isLoading ? "Asking..." : "Ask tutor"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTopic("");
                setQuestion("");
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
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Socratic stance
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            What the tutor tries to do
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <li>Ask guiding questions before dumping answers.</li>
            <li>Connect abstractions to experiments, patients, and behavior.</li>
            <li>Draw explicit parallels between neuroscience and AI when useful.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Tutor response
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Tutor answer
          </h2>

          {result ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Topic
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {result.topic}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Question
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {result.question}
                </p>
              </div>
              <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/8 p-4 whitespace-pre-wrap text-sm leading-7 text-slate-100">
                {result.answer}
              </div>
            </div>
          ) : error ? (
            <div className="mt-5 rounded-[24px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
              <p className="font-semibold">{error.message}</p>
              {error.suggestion ? (
                <p className="mt-3 leading-6 text-rose-50/90">
                  {error.suggestion}
                </p>
              ) : null}
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
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Suggested prompts
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Start with these
          </h2>
          <div className="mt-4 space-y-3">
            {askExamplePrompts.map((example) => (
              <button
                key={`${example.topic}-${example.question}`}
                type="button"
                onClick={() => runExample(example)}
                className="block w-full rounded-[24px] border border-white/10 bg-slate-950/35 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-950/55"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">
                  {example.topicLabel}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  {example.question}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
