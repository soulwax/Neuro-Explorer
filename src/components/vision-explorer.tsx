"use client";

import { useState } from "react";
import {
  buildApiUrl,
  describeApiTarget,
  extractApiError,
  type ApiErrorInfo,
} from "~/lib/api";
import {
  visionDefaultImageUrl,
  visionKeyInsight,
  visionSkipConnections,
  visionStages,
  type VisionClassification,
  type VisionSkipConnections,
  type VisionStage,
} from "~/lib/vision";

interface VisionSuccessResponse {
  classifications: VisionClassification[];
  processing_pipeline: VisionStage[];
  skip_connections: VisionSkipConnections;
  interpretation: string;
}

function isVisionSuccessResponse(
  payload: unknown,
): payload is VisionSuccessResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    Array.isArray((payload as VisionSuccessResponse).classifications)
  );
}

export function VisionExplorer() {
  const [imageUrl, setImageUrl] = useState(visionDefaultImageUrl);
  const [result, setResult] = useState<VisionSuccessResponse | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStageCount, setActiveStageCount] = useState(0);

  async function classify(nextImageUrl?: string) {
    const submittedUrl = (nextImageUrl ?? imageUrl).trim();
    if (!submittedUrl) {
      setError({
        message: "Image URL required",
        suggestion: "Paste a public http:// or https:// image URL first.",
      });
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setActiveStageCount(0);

    const intervalId = window.setInterval(() => {
      setActiveStageCount((current) =>
        current < visionStages.length ? current + 1 : current,
      );
    }, 260);

    try {
      const response = await fetch(buildApiUrl("/vision", { url: submittedUrl }));
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        setError(
          extractApiError(
            payload,
            "The vision route could not classify that image URL.",
          ),
        );
        setActiveStageCount(0);
        return;
      }

      if (!isVisionSuccessResponse(payload)) {
        setError({
          message: "Unexpected response shape",
          suggestion:
            "The vision route returned a payload the UI does not understand yet.",
        });
        setActiveStageCount(0);
        return;
      }

      setResult(payload);
      setActiveStageCount(visionStages.length);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unknown request failure";
        setError({
          message,
          suggestion: "Check the local `/api/vision` route and try again.",
        });
      setActiveStageCount(0);
    } finally {
      window.clearInterval(intervalId);
      setIsLoading(false);
    }
  }

  const pipeline = result?.processing_pipeline ?? visionStages;
  const skipConnections = result?.skip_connections ?? visionSkipConnections;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_16px_48px_rgba(3,10,20,0.22)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Visual Cortex
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Visual cortex inference inside the primary Next.js app
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              The App Router UI now talks directly to an internal server route
              that forwards image classification to Cloudflare AI.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
            API target: {describeApiTarget()}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_320px]">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
              Image URL
            </span>
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
              {isLoading ? "Classifying..." : "Classify image"}
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
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Ventral stream pipeline
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pipeline.map((stage, index) => {
                const isActive = activeStageCount > index;
                return (
                  <div
                    key={stage.corticalArea}
                    className={`rounded-[24px] border p-4 transition ${
                      isActive
                        ? "border-cyan-300/35 bg-cyan-300/10 shadow-[0_12px_24px_rgba(103,211,255,0.12)]"
                        : "border-white/10 bg-slate-950/32"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      {stage.corticalArea}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {stage.resnetStage}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {stage.features}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Preview
            </p>
            <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/60">
              {imageUrl.trim() ? (
                <img
                  src={imageUrl}
                  alt="Classification target"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center px-6 text-center text-sm text-slate-400">
                  Paste a public image URL to preview it here before sending it to
                  the Worker.
                </div>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {visionKeyInsight}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Classification output
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Workers AI labels
          </h2>

          {result ? (
            <div className="mt-5 space-y-4">
              {result.classifications.map((classification) => {
                const width = `${Math.max(
                  6,
                  Math.min(100, classification.score * 100),
                ).toFixed(1)}%`;
                return (
                  <div key={classification.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-white">
                        {classification.label}
                      </span>
                      <span className="font-mono text-slate-400">
                        {(classification.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-950/60">
                      <div
                        className="h-full rounded-full bg-cyan-300"
                        style={{ width }}
                      />
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
              Submit an image URL to classify it through the internal vision
              route.
            </p>
          )}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Skip connections
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Residual paths as cortical feedback
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {skipConnections.what}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {skipConnections.neuroscience}
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Biology notes
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Why each stage matters
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {pipeline.map((stage) => (
            <div
              key={`${stage.corticalArea}-biology`}
              className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
            >
              <p className="text-sm font-semibold text-white">
                {stage.corticalArea}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {stage.biology}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
