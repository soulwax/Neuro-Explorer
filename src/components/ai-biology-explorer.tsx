"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";

type Challenge = {
  id: string;
  name: string;
  cue: string;
  domain: string;
  flavor: string;
  input: [number, number, number];
  weights: [[number, number, number], [number, number, number], [number, number, number]];
};

const challenges: Challenge[] = [
  {
    id: "edge",
    name: "Find the edge",
    cue: "A strong contrast enters channels 1 and 3.",
    domain: "Visual cortex",
    flavor: "Separate a contour from background noise before it disappears.",
    input: [0.9, 0.2, 0.8],
    weights: [[0.8, -0.3, 0.5], [0.2, 0.9, -0.1], [-0.4, 0.3, 0.9]],
  },
  {
    id: "tone",
    name: "Sort the tone",
    cue: "The middle frequency carries most of the evidence.",
    domain: "Auditory cortex",
    flavor: "Route a fleeting tone to the population tuned for its frequency.",
    input: [0.2, 1, 0.35],
    weights: [[0.7, 0.1, 0.2], [-0.2, 0.95, 0.3], [0.5, -0.1, 0.6]],
  },
  {
    id: "motion",
    name: "Track motion",
    cue: "A late signal dominates the three-step sequence.",
    domain: "Motion pathway",
    flavor: "Predict which direction-selective population captures the trajectory.",
    input: [0.15, 0.45, 1],
    weights: [[0.8, 0.2, -0.2], [0.25, 0.7, 0.3], [-0.15, 0.35, 0.95]],
  },
  {
    id: "face",
    name: "Complete the face",
    cue: "Two compatible features arrive; one weak feature conflicts.",
    domain: "Ventral stream",
    flavor: "Resolve a partial pattern before the percept is lost in the crowd.",
    input: [0.75, 0.85, 0.25],
    weights: [[0.6, 0.4, -0.2], [-0.1, 0.8, 0.25], [0.45, 0.15, 0.3]],
  },
  {
    id: "threat",
    name: "Gate the alarm",
    cue: "Context is loud, but one channel actively suppresses a response.",
    domain: "Salience network",
    flavor: "Choose the population that survives both excitation and inhibition.",
    input: [0.55, 0.9, 0.65],
    weights: [[0.3, 0.2, 0.2], [0.1, 0.85, -0.25], [-0.4, 0.2, 0.8]],
  },
  {
    id: "language",
    name: "Resolve the word",
    cue: "The final feature is strong enough to overturn an early guess.",
    domain: "Language network",
    flavor: "Let accumulating evidence settle a three-way lexical competition.",
    input: [0.3, 0.65, 0.95],
    weights: [[0.9, -0.2, 0.1], [0.2, 0.75, -0.1], [-0.1, 0.35, 0.8]],
  },
];

const labels = ["A", "B", "C"] as const;

function outputsFor(challenge: Challenge) {
  return challenge.weights.map((row) =>
    row.reduce((sum, weight, index) => sum + weight * challenge.input[index]!, 0),
  );
}

function format(value: number) {
  return value.toFixed(2);
}

function strongestContribution(challenge: Challenge) {
  let best = { output: 0, input: 0, value: Number.NEGATIVE_INFINITY };
  challenge.weights.forEach((row, output) => row.forEach((weight, input) => {
    const value = weight * challenge.input[input]!;
    if (value > best.value) best = { output, input, value };
  }));
  return best;
}

function MatrixPanel({ challenge, phase }: Readonly<{ challenge: Challenge; phase: number }>) {
  const outputs = outputsFor(challenge);
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#07131b]/85 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Silicon side</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Matrix multiply</h3>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] text-cyan-100">GPU / ANN</span>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 font-mono text-xs sm:gap-4 sm:text-sm" aria-label="Weight matrix multiplied by input vector">
        <div className="grid grid-cols-3 gap-1 border-x border-cyan-300/35 px-2 py-2 sm:gap-2 sm:px-3">
          {challenge.weights.flatMap((row, rowIndex) => row.map((value, columnIndex) => (
            <span
              key={`${rowIndex}-${columnIndex}`}
              className={`flex size-9 items-center justify-center rounded-md transition duration-300 sm:size-10 ${phase === columnIndex + 1 ? "bg-cyan-300/25 text-white shadow-[0_0_18px_rgba(34,211,238,.24)]" : "bg-white/5 text-slate-400"}`}
            >
              {value.toFixed(1)}
            </span>
          )))}
        </div>
        <span className="text-slate-500">×</span>
        <div className="grid gap-1 border-x border-violet-300/35 px-2 py-2 sm:gap-2">
          {challenge.input.map((value, index) => (
            <span key={index} className={`flex size-9 items-center justify-center rounded-md sm:size-10 ${phase === index + 1 ? "bg-violet-300/25 text-white" : "bg-white/5 text-violet-200"}`}>{value.toFixed(1)}</span>
          ))}
        </div>
        <span className="text-slate-500">=</span>
        <div className="grid gap-1 border-x border-emerald-300/35 px-2 py-2 sm:gap-2">
          {outputs.map((value, index) => (
            <span key={index} className={`flex size-9 items-center justify-center rounded-md transition sm:size-10 ${phase >= 4 ? "bg-emerald-300/20 text-emerald-100" : "bg-white/5 text-slate-600"}`}>{phase >= 4 ? format(value) : "—"}</span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
        <span className={`size-2 rounded-full ${phase > 0 && phase < 4 ? "animate-pulse bg-cyan-300" : "bg-slate-700"}`} />
        {phase === 0 ? "Awaiting input" : phase < 4 ? `Accumulating column ${phase} of 3` : "Weighted sums complete"}
      </div>
    </div>
  );
}

function BrainPanel({ challenge, phase }: Readonly<{ challenge: Challenge; phase: number }>) {
  const outputs = outputsFor(challenge);
  const max = Math.max(...outputs);
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-amber-300/15 bg-[#171008]/85 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300">Biology side</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Neurons integrate</h3>
        </div>
        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 font-mono text-[10px] text-amber-100">Cortex / spikes</span>
      </div>
      <svg viewBox="0 0 420 190" className="mt-3 w-full" role="img" aria-label="Three input neurons connected to three output neurons">
        {challenge.weights.flatMap((row, outputIndex) => row.map((weight, inputIndex) => (
          <line
            key={`${outputIndex}-${inputIndex}`}
            x1="72" y1={40 + inputIndex * 55} x2="344" y2={40 + outputIndex * 55}
            stroke={weight >= 0 ? "#fbbf24" : "#a78bfa"}
            strokeOpacity={phase === inputIndex + 1 || phase >= 4 ? Math.min(0.8, Math.abs(weight) + 0.15) : 0.12}
            strokeWidth={1 + Math.abs(weight) * 3}
            className="transition-all duration-300"
          />
        )))}
        {challenge.input.map((value, index) => (
          <g key={`input-${index}`}>
            <circle cx="58" cy={40 + index * 55} r={15 + value * 5} fill="#22180b" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="58" cy={40 + index * 55} r="6" fill={phase === index + 1 ? "#fef3c7" : "#f59e0b"} className={phase === index + 1 ? "animate-pulse" : ""} />
            <text x="22" y={44 + index * 55} fill="#94a3b8" fontSize="11">{value.toFixed(1)}</text>
          </g>
        ))}
        {outputs.map((value, index) => {
          const winner = value === max && phase >= 4;
          return (
            <g key={`output-${index}`}>
              <circle cx="360" cy={40 + index * 55} r="22" fill={winner ? "#78350f" : "#20150a"} stroke={winner ? "#fde68a" : "#b45309"} strokeWidth={winner ? 4 : 2} className="transition-all duration-300" />
              {winner && <circle cx="360" cy={40 + index * 55} r="30" fill="none" stroke="#fbbf24" opacity=".65" className="animate-ping" />}
              <text x="355" y={45 + index * 55} fill="white" fontSize="14" fontWeight="700">{labels[index]}</text>
              <text x="390" y={44 + index * 55} fill={phase >= 4 ? "#fde68a" : "#64748b"} fontSize="11">{phase >= 4 ? `${Math.round(Math.max(0, value) * 38)} Hz` : "—"}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className={`size-2 rounded-full ${phase > 0 && phase < 4 ? "animate-pulse bg-amber-300" : "bg-slate-700"}`} />
        {phase === 0 ? "Membrane near resting potential" : phase < 4 ? "Postsynaptic potentials are summing" : "Highest-rate population wins"}
      </div>
    </div>
  );
}

const differences = [
  {
    number: "01",
    kicker: "The resemblance is mathematical",
    title: "Same abstraction. Different event.",
    ai: "A stored number is multiplied, accumulated, then passed through an activation function. The operation is scheduled and numerically precise.",
    brain: "Ions cross membranes. Thousands of noisy excitatory and inhibitory inputs change voltage until a cell may emit an all-or-none spike.",
    verdict: "Both can be described as weighted integration. Only one is literally doing matrix arithmetic.",
  },
  {
    number: "02",
    kicker: "Time enters the picture",
    title: "Clock cycles are not spike timing.",
    ai: "Layers usually update in discrete steps. Training and inference are often separate phases; identical inputs normally produce identical activations.",
    brain: "Computation unfolds continuously. Milliseconds, oscillations, refractory periods, neuromodulators, and recent history all alter the response.",
    verdict: "A biological neuron is a living dynamical system, not a static activation function.",
  },
  {
    number: "03",
    kicker: "Now the analogy breaks",
    title: "Backpropagation is not long-term potentiation.",
    ai: "Backprop computes how much each parameter contributed to a global error, then an optimizer updates weights using that gradient.",
    brain: "LTP and LTD depend on local activity, calcium, receptor trafficking, spike timing, cell state, and modulatory signals. Synapses have no known global gradient ledger.",
    verdict: "Both change connection strength, but their credit-assignment machinery is fundamentally different.",
  },
];

export function AiBiologyExplorer() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [phase, setPhase] = useState(0);
  const [score, setScore] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wager, setWager] = useState(1);
  const [probeUsed, setProbeUsed] = useState(false);
  const [roundStarted, setRoundStarted] = useState(() => Date.now());
  const [lastResult, setLastResult] = useState<{ correct: boolean; points: number; quick: boolean; seconds: number } | null>(null);
  const [played, setPlayed] = useState<string[]>([]);
  const [learningMode, setLearningMode] = useState<"before" | "after">("before");
  const challenge = challenges[challengeIndex]!;
  const outputs = useMemo(() => outputsFor(challenge), [challenge]);
  const winner = outputs.indexOf(Math.max(...outputs));
  const revealed = phase >= 4;
  const runComplete = revealed && played.length === challenges.length;
  const probe = strongestContribution(challenge);
  const sortedOutputs = [...outputs].sort((a, b) => b - a);
  const decisionMargin = sortedOutputs[0]! - sortedOutputs[1]!;

  useEffect(() => {
    if (phase < 1 || phase >= 4) return;
    const timer = window.setTimeout(() => setPhase((value) => value + 1), 520);
    return () => window.clearTimeout(timer);
  }, [phase]);

  function runRound() {
    if (guess === null || phase > 0) return;
    setPhase(1);
    if (!played.includes(challenge.id)) {
      const correct = guess === winner;
      const seconds = Math.max(1, Math.round((Date.now() - roundStarted) / 1000));
      const quick = seconds <= 12 && !probeUsed;
      const nextStreak = correct ? streak + 1 : 0;
      const points = correct ? wager * 100 + (quick ? 50 : 0) + Math.min(100, streak * 25) : 0;
      setPlayed((current) => [...current, challenge.id]);
      setLastResult({ correct, points, quick, seconds });
      setStreak(nextStreak);
      setBestStreak((current) => Math.max(current, nextStreak));
      if (correct) setScore((current) => current + points);
      if (correct) setCorrectRounds((current) => current + 1);
    }
  }

  function nextRound() {
    setChallengeIndex((current) => (current + 1) % challenges.length);
    setGuess(null);
    setPhase(0);
    setWager(1);
    setProbeUsed(false);
    setLastResult(null);
    setRoundStarted(Date.now());
  }

  function resetRun() {
    setChallengeIndex(0);
    setGuess(null);
    setPhase(0);
    setScore(0);
    setCorrectRounds(0);
    setStreak(0);
    setBestStreak(0);
    setWager(1);
    setProbeUsed(false);
    setLastResult(null);
    setPlayed([]);
    setRoundStarted(Date.now());
  }

  return (
    <div className="app-page-stack">
      <section className="app-surface app-surface--hero relative overflow-hidden">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-cyan-300/8 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 size-64 rounded-full bg-amber-300/8 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Machines × minds</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">Same answer.<br /><span className="text-slate-400">Alien machinery.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Artificial networks borrowed the language of neurons. Put both sides through the same tiny recognition task—then scroll beneath the metaphor.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-semibold text-white">2</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">substrates</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-semibold text-white">1</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">task</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-semibold text-white">≠</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">equivalent</p></div>
          </div>
        </div>
      </section>

      <section className="app-surface p-3 sm:p-5">
        <div className="mb-4 flex gap-1.5 px-2" aria-label={`${played.length} of ${challenges.length} missions complete`}>
          {challenges.map((item, index) => (
            <span key={item.id} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${played.includes(item.id) ? "bg-emerald-300" : index === challengeIndex ? "bg-white/40" : "bg-white/10"}`} />
          ))}
        </div>
        <div className="flex flex-col gap-4 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Mission {challengeIndex + 1} / {challenges.length}</p>
              <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wider text-slate-400">{challenge.domain}</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">{challenge.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{challenge.flavor}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-2 text-center"><p className="text-[9px] uppercase tracking-wider text-slate-500">Neural credits</p><p className="mt-1 font-mono text-sm font-semibold text-emerald-200">{score.toLocaleString()}</p></div>
            <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-2 text-center"><p className="text-[9px] uppercase tracking-wider text-slate-500">Streak</p><p className="mt-1 font-mono text-sm font-semibold text-amber-200">{streak > 1 ? "🔥 " : ""}{streak}</p></div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 rounded-2xl border border-white/8 bg-slate-950/30 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">Incoming signal</p>
            <p className="mt-1 text-sm text-slate-200">{challenge.cue} <strong className="text-white">Which output wins?</strong></p>
            {probeUsed && <p className="mt-2 text-xs text-violet-200">Probe report: input {probe.input + 1} gives output {labels[probe.output]} the strongest single excitatory push ({format(probe.value)}).</p>}
          </div>
          <div>
            <p className="mb-2 text-[9px] uppercase tracking-wider text-slate-500">Confidence multiplier</p>
            <div className="flex gap-1">
              {[1, 2, 3].map((value) => <button key={value} type="button" disabled={phase > 0} onClick={() => setWager(value)} className={`h-9 rounded-lg border px-3 font-mono text-xs transition ${wager === value ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100" : "border-white/10 bg-white/5 text-slate-400"}`}>×{value}</button>)}
            </div>
          </div>
          <button type="button" disabled={probeUsed || phase > 0} onClick={() => setProbeUsed(true)} className="glass-btn glass-btn--secondary justify-center">◉ Deploy probe</button>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <MatrixPanel challenge={challenge} phase={phase} />
          <BrainPanel challenge={challenge} phase={phase} />
        </div>

        <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-white/8 bg-slate-950/25 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="mr-2 text-xs font-medium uppercase tracking-wider text-slate-500">Your prediction</span>
            {labels.map((label, index) => (
              <button key={label} type="button" disabled={phase > 0} onClick={() => setGuess(index)} className={`size-10 rounded-xl border text-sm font-semibold transition ${guess === index ? "border-white/40 bg-white/15 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"}`}>{label}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {revealed && lastResult && <div className="text-right"><p className={`text-sm font-medium ${lastResult.correct ? "text-emerald-300" : "text-amber-200"}`}>{lastResult.correct ? `Locked! +${lastResult.points} credits` : `Signal escaped — ${labels[winner]} wins`}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{lastResult.quick ? "⚡ quick-read bonus · " : ""}{lastResult.seconds}s response</p></div>}
            {revealed ? <button type="button" onClick={runComplete ? resetRun : nextRound} className="glass-btn glass-btn--primary">{runComplete ? "Play again ↻" : "Next mission →"}</button> : <button type="button" onClick={runRound} disabled={guess === null || phase > 0} className="glass-btn glass-btn--primary">Ignite both sides</button>}
          </div>
        </div>
        {revealed && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-white/[.025] p-3"><p className="text-[9px] uppercase tracking-wider text-slate-500">Winning sum</p><p className="mt-1 font-mono text-lg text-white">{labels[winner]} = {format(outputs[winner]!)}</p></div>
            <div className="rounded-xl border border-white/8 bg-white/[.025] p-3"><p className="text-[9px] uppercase tracking-wider text-slate-500">Decision margin</p><p className="mt-1 font-mono text-lg text-white">+{format(decisionMargin)}</p></div>
            <div className="rounded-xl border border-white/8 bg-white/[.025] p-3"><p className="text-[9px] uppercase tracking-wider text-slate-500">Shared rule</p><p className="mt-1 text-sm text-white">weighted input → competition</p></div>
          </div>
        )}
        {runComplete && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-emerald-300">Run debrief</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><p className="text-3xl font-semibold text-white">{score.toLocaleString()} credits</p><p className="mt-1 text-sm text-slate-300">Best streak: {bestStreak} · Accuracy: {Math.round((correctRounds / challenges.length) * 100)}%</p></div><p className="max-w-md text-xs leading-5 text-slate-400">You learned to read the shared weighted-sum abstraction. The rest of this page explains why matching winners do not imply matching machinery.</p></div>
          </div>
        )}
        <p className="mt-4 px-2 text-xs leading-5 text-slate-500">Teaching simplification: firing rate stands in for a biological population response. Real neural circuits are recurrent, time-varying, and vastly more complex.</p>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Scroll past the metaphor</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Similarity at the surface.<br />Difference all the way down.</h2>
        </div>
      </section>

      {differences.map((item, index) => (
        <section key={item.number} className="app-surface overflow-hidden p-0">
          <div className="border-b border-white/8 px-5 py-5 sm:px-8">
            <div className="flex items-start gap-5"><span className="font-mono text-xs text-slate-600">{item.number}</span><div><p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.kicker}</p><h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{item.title}</h2></div></div>
          </div>
          <div className="grid md:grid-cols-2">
            <div className="border-b border-white/8 p-6 md:border-r md:border-b-0 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Artificial network</p><p className="mt-4 text-sm leading-7 text-slate-300">{item.ai}</p></div>
            <div className="p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Biological network</p><p className="mt-4 text-sm leading-7 text-slate-300">{item.brain}</p></div>
          </div>
          <div className="border-t border-white/8 bg-white/[.025] px-6 py-4 text-sm text-slate-400"><span className="mr-3 text-white">→</span>{item.verdict}</div>
          {index === 2 && (
            <div className="border-t border-white/8 p-5 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
                <div><p className="text-xs uppercase tracking-[.22em] text-violet-300">Learning microscope</p><h3 className="mt-2 text-xl font-semibold text-white">Watch the update, not just the weight.</h3><p className="mt-3 text-sm leading-6 text-slate-400">The bars may both grow. What caused the growth is the important distinction.</p><div className="mt-5 flex gap-2"><button type="button" onClick={() => setLearningMode("before")} className={`glass-pill ${learningMode === "before" ? "is-active" : ""}`}>Before</button><button type="button" onClick={() => setLearningMode("after")} className={`glass-pill ${learningMode === "after" ? "is-active" : ""}`}>After one update</button></div></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-cyan-300/12 bg-cyan-300/5 p-4"><div className="flex items-end gap-3 h-28">{[.35,.62,.45,.76].map((height, i) => <div key={i} className="flex-1 rounded-t bg-cyan-300/55 transition-all duration-500" style={{height: `${(learningMode === "after" ? height + [0.08,-0.03,0.12,0.02][i]! : height) * 100}%`}} />)}</div><p className="mt-3 text-xs font-medium text-cyan-100">Gradient routed from a global loss</p></div>
                  <div className="rounded-2xl border border-amber-300/12 bg-amber-300/5 p-4"><div className="flex items-end gap-3 h-28">{[.35,.62,.45,.76].map((height, i) => <div key={i} className="flex-1 rounded-t bg-amber-300/55 transition-all duration-500" style={{height: `${(learningMode === "after" ? height + [0,.08,0,0][i]! : height) * 100}%`}} />)}</div><p className="mt-3 text-xs font-medium text-amber-100">Local coincidence opens a plasticity window</p></div>
                </div>
              </div>
            </div>
          )}
        </section>
      ))}

      <section className="app-surface">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">Metal vs brain — the field guide</p>
        <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Substrate", "Transistors", "Cells, glia, chemistry"],
            ["Signal", "Numbers / voltage states", "Spikes + graded potentials"],
            ["Timing", "Clocked or batched", "Continuous and stateful"],
            ["Learning", "Explicit objective", "Many local plasticity rules"],
            ["Memory", "Addressable storage", "Distributed, reconstructive"],
            ["Precision", "High numerical precision", "Noisy but adaptive"],
            ["Repair", "Replace a component", "Plastic reorganization"],
            ["Embodiment", "Optional input/output", "Metabolism and body inseparable"],
          ].map(([label, machine, biology]) => <div key={label} className="bg-[#0d151d] p-4"><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">{label}</p><p className="mt-3 text-sm text-cyan-100">{machine}</p><p className="mt-1 text-sm text-amber-100">{biology}</p></div>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Energy comparisons depend heavily on system boundaries, hardware, workload, and whether training, cooling, and embodiment are counted; simple “watts versus watts” claims are usually misleading.</p>
      </section>

      <section className="app-surface app-surface--hero text-center">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-emerald-300">Takeaway</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">The brain inspired the vocabulary.<br />It did not provide the blueprint.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">Artificial and biological networks can implement related computations. Understanding either one requires asking how signals move, how time matters, and how credit changes a connection—not merely noticing that both have “neurons.”</p>
      </section>

      <ModuleHandoffBanner />
    </div>
  );
}
