"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleHandoffBanner } from "~/components/module-handoff-banner";

type Challenge = {
  id: string;
  name: string;
  cue: string;
  domain: string;
  flavor: string;
  inputLabels: [string, string, string];
  outputLabels: [string, string, string];
  outputDescriptions: [string, string, string];
  why: string;
  bridge: string;
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
    inputLabels: ["Left contrast", "Center detail", "Right contrast"],
    outputLabels: ["Border", "Texture", "Shadow"],
    outputDescriptions: ["Matches contrast on both sides", "Prefers detail in the center", "Prefers a right-heavy gradient"],
    why: "Border wins because strong contrast arrives on both sides, matching its excitatory connections while center detail contributes little.",
    bridge: "Real edge-selective responses emerge across retinal and cortical circuits with spatial receptive fields. This three-number version captures selectivity, not the anatomy.",
    input: [0.9, 0.2, 0.8],
    weights: [[0.8, -0.3, 0.5], [0.2, 0.9, -0.1], [-0.4, 0.3, 0.9]],
  },
  {
    id: "tone",
    name: "Sort the tone",
    cue: "The middle frequency carries most of the evidence.",
    domain: "Auditory cortex",
    flavor: "Route a fleeting tone to the population tuned for its frequency.",
    inputLabels: ["Low frequency", "Middle frequency", "High frequency"],
    outputLabels: ["Low tone", "Middle tone", "High tone"],
    outputDescriptions: ["Listens mostly to low frequencies", "Listens mostly to middle frequencies", "Listens mostly to high frequencies"],
    why: "Middle tone wins because the strongest evidence is in the middle-frequency channel, where that population has its strongest connection.",
    bridge: "Auditory pathways preserve frequency maps called tonotopy, but real sound coding also depends on timing, intensity, harmonics, and context.",
    input: [0.2, 1, 0.35],
    weights: [[0.7, 0.1, 0.2], [-0.2, 0.95, 0.3], [0.5, -0.1, 0.6]],
  },
  {
    id: "motion",
    name: "Track motion",
    cue: "A late signal dominates the three-step sequence.",
    domain: "Motion pathway",
    flavor: "Predict which direction-selective population captures the trajectory.",
    inputLabels: ["Early position", "Middle position", "Late position"],
    outputLabels: ["Moves left", "Stays still", "Moves right"],
    outputDescriptions: ["Prefers an early-weighted sequence", "Combines the middle and late positions", "Prefers a strong late-position signal"],
    why: "Moves right wins because the late-position signal is strongest and the right-motion population listens to it most strongly.",
    bridge: "Biological motion selectivity depends on ordered activity across space and time. A static vector here stands in for that temporal sequence.",
    input: [0.15, 0.45, 1],
    weights: [[0.8, 0.2, -0.2], [0.25, 0.7, 0.3], [-0.15, 0.35, 0.95]],
  },
  {
    id: "face",
    name: "Complete the face",
    cue: "Two compatible features arrive; one weak feature conflicts.",
    domain: "Ventral stream",
    flavor: "Resolve a partial pattern before the percept is lost in the crowd.",
    inputLabels: ["Eye pattern", "Face outline", "Object noise"],
    outputLabels: ["Face", "Object", "Background"],
    outputDescriptions: ["Combines eye and outline evidence", "Relies strongly on the outline", "Accepts several weak scene cues"],
    why: "Face wins because eye and outline evidence both support it, while the weak object-noise signal subtracts only a little.",
    bridge: "Face perception is distributed across recurrent visual networks. No single biological ‘face neuron’ is taking this exact three-item vote.",
    input: [0.75, 0.85, 0.25],
    weights: [[0.6, 0.4, -0.2], [-0.1, 0.8, 0.25], [0.45, 0.15, 0.3]],
  },
  {
    id: "threat",
    name: "Gate the alarm",
    cue: "Context is loud, but one channel actively suppresses a response.",
    domain: "Salience network",
    flavor: "Choose the population that survives both excitation and inhibition.",
    inputLabels: ["Body cue", "Context cue", "Safety cue"],
    outputLabels: ["Orient", "Alarm", "Ignore"],
    outputDescriptions: ["Samples all cues cautiously", "Prioritizes context but hears safety", "Needs safety and suppresses body alarm"],
    why: "Alarm wins because the strong context cue drives it more than the safety cue inhibits it. Inhibition reduces the score without automatically deciding the outcome.",
    bridge: "Salience and threat involve interacting cortical, amygdala, hippocampal, autonomic, and neuromodulatory systems—not one alarm unit.",
    input: [0.55, 0.9, 0.65],
    weights: [[0.3, 0.2, 0.2], [0.1, 0.85, -0.25], [-0.4, 0.2, 0.8]],
  },
  {
    id: "language",
    name: "Resolve the word",
    cue: "The final feature is strong enough to overturn an early guess.",
    domain: "Language network",
    flavor: "Let accumulating evidence settle a three-way lexical competition.",
    inputLabels: ["Word start", "Sentence context", "Word ending"],
    outputLabels: ["Noun", "Verb", "Adjective"],
    outputDescriptions: ["Leans on the opening pattern", "Leans on sentence context", "Combines context with the ending"],
    why: "Adjective wins because the word ending provides strong support and sentence context adds more, outweighing weak opposition from the word start.",
    bridge: "Language interpretation is recurrent and context-sensitive across distributed networks. These candidates illustrate evidence accumulation, not a literal grammar circuit.",
    input: [0.3, 0.65, 0.95],
    weights: [[0.9, -0.2, 0.1], [0.2, 0.75, -0.1], [-0.1, 0.35, 0.8]],
  },
];

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
          <h3 className="mt-2 text-lg font-semibold text-white">Score each interpretation</h3>
          <p className="mt-1 text-xs text-slate-500">Evidence × connection strength → total score</p>
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
            <span key={index} title={challenge.outputLabels[index]} className={`flex size-9 items-center justify-center rounded-md transition sm:size-10 ${phase >= 4 ? "bg-emerald-300/20 text-emerald-100" : "bg-white/5 text-slate-600"}`}>{phase >= 4 ? format(value) : index + 1}</span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
        <span className={`size-2 rounded-full ${phase > 0 && phase < 4 ? "animate-pulse bg-cyan-300" : "bg-slate-700"}`} />
        {phase === 0 ? "Ready to compare all three possibilities" : phase < 4 ? `Adding “${challenge.inputLabels[phase - 1]}” to every score` : "All evidence combined; highest score selected"}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {challenge.outputLabels.map((label, index) => <div key={label} className="rounded-lg bg-white/[.035] px-2 py-2 text-center text-[10px] text-slate-400"><span className="mr-1 font-mono text-slate-600">{index + 1}</span>{label}</div>)}
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
          <h3 className="mt-2 text-lg font-semibold text-white">Populations compete</h3>
          <p className="mt-1 text-xs text-slate-500">Excitation and inhibition change firing rates</p>
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
              <text x="356" y={45 + index * 55} fill="white" fontSize="14" fontWeight="700">{index + 1}</text>
              <text x="390" y={44 + index * 55} fill={phase >= 4 ? "#fde68a" : "#64748b"} fontSize="11">{phase >= 4 ? `${Math.round(Math.max(0, value) * 38)} Hz` : "—"}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className={`size-2 rounded-full ${phase > 0 && phase < 4 ? "animate-pulse bg-amber-300" : "bg-slate-700"}`} />
        {phase === 0 ? "Populations are ready for the same evidence" : phase < 4 ? `“${challenge.inputLabels[phase - 1]}” changes each population’s activity` : "All pushes and pulls combined; highest-rate population wins"}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {challenge.outputLabels.map((label, index) => <div key={label} className="rounded-lg bg-white/[.035] px-2 py-2 text-center text-[10px] text-slate-400"><span className="mr-1 font-mono text-slate-600">{index + 1}</span>{label}</div>)}
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

const factCards = [
  {
    tag: "The unit",
    title: "A neuron is already a network",
    fact: "Dendritic branches can combine inputs linearly or nonlinearly, so treating one cell as a single weighted sum discards computation happening before the soma.",
    use: "Useful when someone says an artificial node is a faithful model of a biological neuron.",
  },
  {
    tag: "The connection",
    title: "A synapse is not one stored number",
    fact: "Its effective strength depends on transmitter release, receptor state, recent spikes, location on the dendrite, and the receiving cell’s current state.",
    use: "The same presynaptic spike can have a different effect a moment later.",
  },
  {
    tag: "The clock",
    title: "Recent history changes the present",
    fact: "Short-term synaptic plasticity can alter effective connection strength over milliseconds to seconds through processes such as facilitation and vesicle depletion.",
    use: "Biological inference and biological learning are not cleanly separated phases.",
  },
  {
    tag: "The memory",
    title: "Recall can become an update",
    fact: "Under the right conditions, reactivation can make a consolidated memory temporarily labile before it is restabilized—a process called reconsolidation.",
    use: "Retrieval is not always a read-only database query, but reactivation alone is not always sufficient.",
  },
  {
    tag: "The budget",
    title: "Communication is expensive",
    fact: "Biophysical energy budgets attribute much of gray-matter signaling cost to action potentials and postsynaptic currents, favoring sparse and efficient codes.",
    use: "Compare whole systems and workloads; never turn this into a simplistic brain-watts versus GPU-watts claim.",
  },
  {
    tag: "The unknown",
    title: "Brain credit assignment is open",
    fact: "Backpropagation solves credit assignment in artificial networks. Whether cortical circuits approximate parts of it—and by what mechanisms—remains an active research question.",
    use: "“The brain definitely backprops” and “the brain could never use error signals” are both stronger than the evidence.",
  },
] as const;

const timeScales = [
  { scale: "milliseconds", machine: "One scheduled operation or layer transition", biology: "Spikes, synaptic delay, coincidence, refractoriness", anchor: "Classic cultured-neuron STDP changed sign around pre/post order within roughly ±20 ms." },
  { scale: "seconds", machine: "A sequence window, recurrent state, or generated token stream", biology: "Short-term facilitation/depression, working state, neuromodulation", anchor: "A biological connection’s effective gain can drift during the computation itself." },
  { scale: "minutes → hours", machine: "Training steps, checkpointing, evaluation", biology: "Plasticity induction, consolidation cascades, protein-dependent changes", anchor: "A lasting change is a biochemical process, not merely assignment to a variable." },
  { scale: "days → years", machine: "Further training, fine-tuning, model replacement", biology: "Systems consolidation, skill learning, development, homeostatic adaptation", anchor: "Brains must learn while keeping an organism functioning and older knowledge usable." },
] as const;

const glossary = [
  ["Activation", "The numerical output of an artificial unit after its weighted input is transformed."],
  ["Action potential", "A regenerative electrical spike that travels along a neuron’s axon; its timing often carries more information than its size."],
  ["Weight", "A trainable parameter that scales a signal in an artificial network."],
  ["Synaptic efficacy", "The context-dependent influence one biological neuron has on another—not a literal scalar stored at the junction."],
  ["Gradient", "A collection of derivatives indicating how parameter changes would alter an objective or loss."],
  ["Credit assignment", "The problem of deciding which internal changes deserve credit or blame for an outcome."],
  ["LTP / LTD", "Families of processes that produce persistent increases or decreases in synaptic efficacy."],
  ["Neuromodulator", "A chemical signal, such as dopamine or acetylcholine, that can change excitability, plasticity, and circuit state."],
] as const;

const commonQuestions = [
  {
    question: "Is a negative artificial weight the same as an inhibitory synapse?",
    answer: "No. A negative weight is a mathematical sign. Biological inhibition is produced by particular cells, transmitters, receptors, locations, and timing. Inhibition can subtract, divide gain, sharpen selectivity, synchronize activity, or veto a response depending on the circuit.",
  },
  {
    question: "Does an AI system learn while it answers?",
    answer: "Usually, deployed model parameters stay fixed during inference. Its temporary context or recurrent state can still change without changing its learned weights. Brains do not observe such a clean boundary: activity, short-term plasticity, neuromodulation, and longer-term learning can overlap.",
  },
  {
    question: "Are biological spikes just binary zeroes and ones?",
    answer: "A single action potential is approximately all-or-none, but neural codes can use firing rate, precise timing, synchrony, silence, and bursts. Dendrites and synapses also use graded, analog processes before a spike is produced.",
  },
  {
    question: "Does the brain minimize one loss function?",
    answer: "There is no established single global objective for the brain. Reward, prediction error, homeostasis, novelty, attention, bodily needs, and many local plasticity processes can interact. Optimization language may be useful, but the chosen objective is a scientific hypothesis—not an observed master variable.",
  },
  {
    question: "If an AI activation matches brain activity, is the mechanism solved?",
    answer: "No. Similar representations or behavior can make a model useful, but multiple mechanisms can produce similar outputs. Strong comparisons test new predictions across stimuli, development, perturbations, errors, and learning—not correlation alone.",
  },
] as const;

const references = [
  { label: "Rumelhart, Hinton & Williams (1986)", detail: "Back-propagating errors", href: "https://www.nature.com/articles/323533a0" },
  { label: "Bliss & Lømo (1973)", detail: "Long-lasting hippocampal potentiation", href: "https://pubmed.ncbi.nlm.nih.gov/4727084/" },
  { label: "Bi & Poo (1998)", detail: "Spike timing and synaptic modification", href: "https://pubmed.ncbi.nlm.nih.gov/9852584/" },
  { label: "London & Häusser (2005)", detail: "Dendritic computation", href: "https://pubmed.ncbi.nlm.nih.gov/16033324/" },
  { label: "Attwell & Laughlin (2001)", detail: "Gray-matter signaling energy budget", href: "https://pubmed.ncbi.nlm.nih.gov/11598490/" },
  { label: "Lillicrap et al. (2020)", detail: "Backpropagation and the brain", href: "https://www.nature.com/articles/s41583-020-0277-3" },
  { label: "Sevenster, Beckers & Kindt (2012)", detail: "Boundary conditions for reconsolidation", href: "https://pubmed.ncbi.nlm.nih.gov/22406658/" },
  { label: "Ghanbari et al. (2017)", detail: "Short-term synaptic plasticity time scales", href: "https://pubmed.ncbi.nlm.nih.gov/28873406/" },
  { label: "Shapley & Xing (2013)", detail: "Inhibition, gain control, and selectivity", href: "https://pubmed.ncbi.nlm.nih.gov/23036513/" },
  { label: "Saxe, Nelli & Summerfield (2021)", detail: "How to compare deep networks and brains", href: "https://www.nature.com/articles/s41583-020-00395-8" },
] as const;

export function AiBiologyExplorer() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [phase, setPhase] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [probeUsed, setProbeUsed] = useState(false);
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
  const winningContributions = challenge.input.map((input, index) => ({
    label: challenge.inputLabels[index],
    input,
    weight: challenge.weights[winner]![index]!,
    effect: input * challenge.weights[winner]![index]!,
  }));

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
        <div className="mb-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            ["1", "Read the evidence", "Three labeled input signals arrive with different strengths."],
            ["2", "Choose an interpretation", "Each candidate listens to those signals through a different mix of connections."],
            ["3", "Watch both compute", "The highest weighted total becomes the matrix score and the winning firing population."],
          ].map(([step, title, detail]) => <div key={step} className="bg-[#0b151d] p-4"><div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-full bg-white/8 font-mono text-xs text-white">{step}</span><p className="text-sm font-semibold text-white">{title}</p></div><p className="mt-2 pl-10 text-xs leading-5 text-slate-400">{detail}</p></div>)}
        </div>
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
            <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-2 text-center"><p className="text-[9px] uppercase tracking-wider text-slate-500">Correct</p><p className="mt-1 font-mono text-sm font-semibold text-emerald-200">{correctRounds} / {played.length}</p></div>
            <div className="rounded-xl border border-white/10 bg-slate-950/35 px-4 py-2 text-center"><p className="text-[9px] uppercase tracking-wider text-slate-500">Streak</p><p className="mt-1 font-mono text-sm font-semibold text-amber-200">{streak > 1 ? "🔥 " : ""}{streak}</p></div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 rounded-2xl border border-white/8 bg-slate-950/30 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">Incoming signal</p>
            <p className="mt-1 text-sm text-slate-200">{challenge.cue} <strong className="text-white">Which output wins?</strong></p>
            {probeUsed && <p className="mt-2 text-xs text-violet-200">Clue: <strong>{challenge.inputLabels[probe.input]}</strong> gives <strong>{challenge.outputLabels[probe.output]}</strong> the strongest single excitatory push. Other signals can still change the winner.</p>}
          </div>
          <button type="button" disabled={probeUsed || phase > 0} onClick={() => setProbeUsed(true)} className="glass-btn glass-btn--secondary justify-center">Show one clue</button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Input evidence strengths">
          {challenge.input.map((value, index) => <div key={challenge.inputLabels[index]} className="rounded-xl border border-violet-300/10 bg-violet-300/5 p-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-violet-100">{challenge.inputLabels[index]}</p><span className="font-mono text-[10px] text-violet-200">{Math.round(value * 100)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-950/60"><div className="h-full rounded-full bg-violet-300/70" style={{width: `${value * 100}%`}} /></div></div>)}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <MatrixPanel challenge={challenge} phase={phase} />
          <BrainPanel challenge={challenge} phase={phase} />
        </div>

        <div className="mt-3 rounded-2xl border border-white/8 bg-slate-950/25 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">What does the evidence represent?</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {challenge.outputLabels.map((label, index) => (
              <button key={label} type="button" disabled={phase > 0} onClick={() => setGuess(index)} className={`min-h-20 rounded-xl border px-4 py-3 text-left transition ${guess === index ? "border-white/40 bg-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,.06)]" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"}`}><span className="font-mono text-[10px] text-slate-500">{index + 1}</span><span className="ml-2 text-sm font-semibold">{label}</span><span className="mt-1.5 block text-[10px] leading-4 text-slate-500">{challenge.outputDescriptions[index]}</span></button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {revealed && <p className={`text-sm font-medium ${guess === winner ? "text-emerald-300" : "text-amber-200"}`}>{guess === winner ? "Correct — " : "Best match: "}<strong>{challenge.outputLabels[winner]}</strong></p>}
            {revealed ? <button type="button" onClick={runComplete ? resetRun : nextRound} className="glass-btn glass-btn--primary">{runComplete ? "Play again ↻" : "Next mission →"}</button> : <button type="button" onClick={runRound} disabled={guess === null || phase > 0} className="glass-btn glass-btn--primary">Run comparison</button>}
          </div>
        </div>
        {revealed && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
            <div className="grid gap-3 border-b border-white/8 p-4 sm:grid-cols-[1fr_1fr_1.5fr]">
              <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Winning interpretation</p><p className="mt-1 text-base font-semibold text-white">{challenge.outputLabels[winner]}</p><p className="mt-1 font-mono text-xs text-slate-500">total {format(outputs[winner]!)}</p></div>
              <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Lead over runner-up</p><p className="mt-1 font-mono text-lg text-white">+{format(decisionMargin)}</p><p className="mt-1 text-[10px] text-slate-500">A smaller lead means a closer call.</p></div>
              <div className="rounded-xl border border-emerald-300/12 bg-emerald-300/5 p-3"><p className="text-[9px] uppercase tracking-wider text-emerald-200/70">Why it won</p><p className="mt-1 text-xs leading-5 text-slate-300">{challenge.why}</p></div>
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Open the winning total</p><p className="mt-1 text-xs text-slate-400">Each input is multiplied by this interpretation’s connection. Positive effects support it; negative effects suppress it.</p></div><p className="font-mono text-xs text-slate-500">effects add to {format(outputs[winner]!)}</p></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {winningContributions.map((item) => (
                  <div key={item.label} className={`rounded-xl border p-3 ${item.effect >= 0 ? "border-emerald-300/12 bg-emerald-300/5" : "border-violet-300/12 bg-violet-300/5"}`}>
                    <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-white">{item.label}</p><span className={`font-mono text-sm font-semibold ${item.effect >= 0 ? "text-emerald-200" : "text-violet-200"}`}>{item.effect >= 0 ? "+" : ""}{format(item.effect)}</span></div>
                    <p className="mt-2 font-mono text-[10px] text-slate-500">{format(item.input)} evidence × {format(item.weight)} connection</p>
                    <p className="mt-1 text-[10px] text-slate-400">{item.effect >= 0 ? "supports the winner" : "suppresses the winner"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-amber-300/12 bg-amber-300/5 p-3"><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-amber-200/70">Biology bridge</p><p className="mt-1 text-xs leading-5 text-slate-300">{challenge.bridge}</p></div>
            </div>
          </div>
        )}
        {runComplete && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-emerald-300">Run debrief</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><p className="text-3xl font-semibold text-white">{correctRounds} of {challenges.length} correct</p><p className="mt-1 text-sm text-slate-300">Best streak: {bestStreak} · Accuracy: {Math.round((correctRounds / challenges.length) * 100)}%</p></div><p className="max-w-md text-xs leading-5 text-slate-400">You learned to read the shared weighted-sum abstraction. The rest of this page explains why matching winners do not imply matching machinery.</p></div>
          </div>
        )}
        <p className="mt-4 px-2 text-xs leading-5 text-slate-500">Teaching simplification: firing rate stands in for a biological population response. Real neural circuits are recurrent, time-varying, and vastly more complex.</p>
      </section>

      <section className="app-surface">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-200">Six facts the game hides</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">The simplification is the lesson—and the trap.</h2>
          </div>
          <p className="max-w-sm text-xs leading-5 text-slate-400">Each card names a place where the visual analogy becomes scientifically incomplete.</p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {factCards.map((item, index) => (
            <article key={item.title} className="group rounded-2xl border border-white/10 bg-slate-950/35 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.045]">
              <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">{item.tag}</p><span className="font-mono text-[10px] text-slate-600">0{index + 1}</span></div>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.fact}</p>
              <div className="mt-4 border-t border-white/8 pt-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Why it matters</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.use}</p></div>
            </article>
          ))}
        </div>
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

      <section className="app-surface overflow-hidden p-0">
        <div className="border-b border-white/8 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-violet-200">A map of time</p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">“Fast” and “slow” mean different things.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Wall-clock benchmarks rarely teach mechanism. This ladder compares the kinds of events that occupy each scale, not which system “wins.”</p>
        </div>
        <div className="divide-y divide-white/8">
          {timeScales.map((item, index) => (
            <div key={item.scale} className="grid gap-4 p-5 sm:grid-cols-[110px_1fr_1fr] sm:p-7">
              <div><span className="font-mono text-[10px] text-slate-600">T{index + 1}</span><p className="mt-1 text-sm font-semibold text-white">{item.scale}</p></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300">Machine frame</p><p className="mt-2 text-sm leading-6 text-slate-300">{item.machine}</p></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-amber-300">Biological frame</p><p className="mt-2 text-sm leading-6 text-slate-300">{item.biology}</p><p className="mt-2 text-xs leading-5 text-slate-500">{item.anchor}</p></div>
            </div>
          ))}
        </div>
      </section>

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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="app-surface">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-emerald-200">Use the analogy when…</p>
          <div className="mt-5 grid gap-3">
            {[
              "Explaining how many weak inputs can combine into a strong response.",
              "Showing how excitation, inhibition, and competition shape an output.",
              "Introducing distributed representations: a pattern can live across many units.",
              "Asking how changing connections changes future behavior.",
            ].map((item) => <div key={item} className="flex gap-3 rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-3"><span className="text-emerald-300">✓</span><p className="text-sm leading-6 text-slate-300">{item}</p></div>)}
          </div>
        </div>
        <div className="app-surface">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-rose-200">Drop the analogy when…</p>
          <div className="mt-5 grid gap-3">
            {[
              "A diagram implies every neuron is interchangeable or has one fixed activation rule.",
              "A weight update is described as if it were receptor trafficking or synaptic growth.",
              "A trained model is said to remember, understand, forget, or sleep in the biological sense.",
              "Similar behavior is treated as proof of identical internal mechanism or subjective experience.",
            ].map((item) => <div key={item} className="flex gap-3 rounded-xl border border-rose-300/10 bg-rose-300/5 p-3"><span className="text-rose-300">×</span><p className="text-sm leading-6 text-slate-300">{item}</p></div>)}
          </div>
        </div>
      </section>

      <section className="app-surface">
        <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-amber-200">Questions people actually ask</p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Short answers, careful boundaries.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">The interesting questions begin where the vocabulary makes two systems sound more alike than they are.</p>
          </div>
          <div className="grid gap-2">
            {commonQuestions.map((item, index) => (
              <details key={item.question} open={index === 0} className="group rounded-xl border border-white/8 bg-slate-950/30 px-4 py-3 open:bg-white/[.035]">
                <summary className="cursor-pointer list-none pr-4 text-sm font-medium leading-6 text-white marker:hidden">{item.question}<span className="float-right text-slate-600 transition group-open:rotate-45">+</span></summary>
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
                  <summary className="cursor-pointer list-none text-sm font-medium text-white marker:hidden">{term}<span className="float-right text-slate-600 transition group-open:rotate-45">+</span></summary>
                  <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-5 text-slate-400">{definition}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-slate-400">Evidence trail</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">Landmark experiments and reviews behind the claims on this page. Open a source to follow the method, organism, and boundary conditions.</p>
            <div className="mt-5 divide-y divide-white/8 border-y border-white/8">
              {references.map((item, index) => (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="group flex items-start gap-3 py-3 transition hover:text-white">
                  <span className="mt-0.5 font-mono text-[9px] text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                  <span><span className="block text-xs font-medium text-slate-200 group-hover:text-white">{item.label} ↗</span><span className="mt-1 block text-[11px] leading-4 text-slate-500">{item.detail}</span></span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-[10px] leading-4 text-slate-600">A model is a tool for a question. Always check whether a claim comes from a simulation, cultured cells, an animal preparation, or human behavior before generalizing it.</p>
          </aside>
        </div>
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
