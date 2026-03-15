/**
 * Hodgkin-Huxley Action Potential Simulator
 *
 * Full ionic model with voltage-gated Na+ and K+ channels,
 * gating variables (m, h, n), and pharmacological blockade (TTX, TEA).
 */

export interface ActionPotentialParams {
  /** Max Na+ conductance (mS/cm²) */
  gNa: number;
  /** Max K+ conductance (mS/cm²) */
  gK: number;
  /** Leak conductance (mS/cm²) */
  gL: number;
  /** Na+ reversal potential (mV) */
  eNa: number;
  /** K+ reversal potential (mV) */
  eK: number;
  /** Leak reversal potential (mV) */
  eL: number;
  /** Membrane capacitance (µF/cm²) */
  cm: number;
  /** Injected current (µA/cm²) */
  injectedCurrent: number;
  /** Simulation duration (ms) */
  duration: number;
  /** Integration timestep (ms) */
  dt: number;
  /** TTX fraction blocking Na+ channels (0–1) */
  ttxBlock: number;
  /** TEA fraction blocking K+ channels (0–1) */
  teaBlock: number;
  /** Current pulse onset (ms) */
  pulseOnset: number;
  /** Current pulse duration (ms) */
  pulseDuration: number;
}

export interface ActionPotentialParamDefinition {
  key: keyof ActionPotentialParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
  group: "conductance" | "reversal" | "stimulus" | "pharmacology";
}

export interface ActionPotentialTimePoint {
  t: number;
  voltage: number;
  iNa: number;
  iK: number;
  iL: number;
  m: number;
  h: number;
  n: number;
  gNaEff: number;
  gKEff: number;
}

export interface ActionPotentialResult {
  params: ActionPotentialParams;
  timeSeries: ActionPotentialTimePoint[];
  peakVoltage: number;
  restingVoltage: number;
  spikeCount: number;
  explanation: {
    model: string;
    phases: { name: string; description: string }[];
    pharmacology: string[];
    whatToNotice: string[];
    biologicalAnalogies: Record<string, string>;
  };
}

export interface ActionPotentialPreset {
  id: string;
  label: string;
  description: string;
  params: Partial<ActionPotentialParams>;
}

export const defaultActionPotentialParams: ActionPotentialParams = {
  gNa: 120,
  gK: 36,
  gL: 0.3,
  eNa: 50,
  eK: -77,
  eL: -54.4,
  cm: 1,
  injectedCurrent: 10,
  duration: 50,
  dt: 0.01,
  ttxBlock: 0,
  teaBlock: 0,
  pulseOnset: 5,
  pulseDuration: 1,
};

export const actionPotentialParamDefinitions: ActionPotentialParamDefinition[] =
  [
    {
      key: "injectedCurrent",
      label: "Injected Current",
      unit: "µA/cm²",
      step: 0.5,
      min: 0,
      max: 50,
      group: "stimulus",
    },
    {
      key: "pulseOnset",
      label: "Pulse Onset",
      unit: "ms",
      step: 1,
      min: 0,
      max: 40,
      group: "stimulus",
    },
    {
      key: "pulseDuration",
      label: "Pulse Duration",
      unit: "ms",
      step: 0.5,
      min: 0.5,
      max: 45,
      group: "stimulus",
    },
    {
      key: "gNa",
      label: "Max gNa",
      unit: "mS/cm²",
      step: 1,
      min: 0,
      max: 200,
      group: "conductance",
    },
    {
      key: "gK",
      label: "Max gK",
      unit: "mS/cm²",
      step: 1,
      min: 0,
      max: 100,
      group: "conductance",
    },
    {
      key: "gL",
      label: "Leak gL",
      unit: "mS/cm²",
      step: 0.05,
      min: 0,
      max: 2,
      group: "conductance",
    },
    {
      key: "eNa",
      label: "E_Na",
      unit: "mV",
      step: 1,
      min: 30,
      max: 70,
      group: "reversal",
    },
    {
      key: "eK",
      label: "E_K",
      unit: "mV",
      step: 1,
      min: -100,
      max: -50,
      group: "reversal",
    },
    {
      key: "eL",
      label: "E_L",
      unit: "mV",
      step: 0.5,
      min: -70,
      max: -40,
      group: "reversal",
    },
    {
      key: "ttxBlock",
      label: "TTX Block",
      unit: "%",
      step: 5,
      min: 0,
      max: 100,
      group: "pharmacology",
    },
    {
      key: "teaBlock",
      label: "TEA Block",
      unit: "%",
      step: 5,
      min: 0,
      max: 100,
      group: "pharmacology",
    },
    {
      key: "duration",
      label: "Duration",
      unit: "ms",
      step: 5,
      min: 10,
      max: 200,
      group: "stimulus",
    },
  ];

export const actionPotentialPresets: ActionPotentialPreset[] = [
  {
    id: "normal-ap",
    label: "Normal Action Potential",
    description:
      "Standard Hodgkin-Huxley squid giant axon with a brief current pulse",
    params: {
      gNa: 120,
      gK: 36,
      gL: 0.3,
      injectedCurrent: 10,
      ttxBlock: 0,
      teaBlock: 0,
      pulseDuration: 1,
      duration: 50,
    },
  },
  {
    id: "ttx-partial",
    label: "Partial TTX Block",
    description:
      "50% Na+ channel blockade — reduced amplitude, slower upstroke, may still fire",
    params: { ttxBlock: 50, teaBlock: 0, injectedCurrent: 10 },
  },
  {
    id: "ttx-full",
    label: "Full TTX Block",
    description:
      "100% Na+ channel blockade — no regenerative depolarization, passive response only",
    params: { ttxBlock: 100, teaBlock: 0, injectedCurrent: 10 },
  },
  {
    id: "tea-block",
    label: "TEA K+ Block",
    description:
      "K+ channels blocked — delayed repolarization, prolonged AP, no undershoot",
    params: { ttxBlock: 0, teaBlock: 80, injectedCurrent: 10 },
  },
  {
    id: "both-blocked",
    label: "TTX + TEA",
    description:
      "Both Na+ and K+ channels partially blocked — chaotic subthreshold oscillations",
    params: { ttxBlock: 60, teaBlock: 60, injectedCurrent: 10 },
  },
  {
    id: "sustained-current",
    label: "Sustained Current",
    description:
      "Prolonged injection to show repetitive firing and adaptation",
    params: {
      injectedCurrent: 10,
      pulseOnset: 5,
      pulseDuration: 40,
      duration: 80,
      ttxBlock: 0,
      teaBlock: 0,
    },
  },
  {
    id: "subthreshold",
    label: "Subthreshold",
    description: "Current too weak to reach threshold — passive decay only",
    params: { injectedCurrent: 3, pulseDuration: 1, ttxBlock: 0, teaBlock: 0 },
  },
  {
    id: "high-frequency",
    label: "High-Frequency Firing",
    description:
      "Strong sustained current driving rapid repetitive spiking",
    params: {
      injectedCurrent: 20,
      pulseOnset: 2,
      pulseDuration: 90,
      duration: 100,
      ttxBlock: 0,
      teaBlock: 0,
    },
  },
  {
    id: "demyelination",
    label: "Demyelination Model",
    description:
      "Increased leak conductance simulating demyelinated membrane — conduction failure",
    params: {
      gL: 1.2,
      injectedCurrent: 10,
      pulseDuration: 1,
      ttxBlock: 0,
      teaBlock: 0,
    },
  },
  {
    id: "local-anesthetic",
    label: "Local Anesthetic",
    description:
      "Partial Na+ block (like lidocaine) — graded reduction in excitability",
    params: { ttxBlock: 70, teaBlock: 0, injectedCurrent: 15 },
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

// Hodgkin-Huxley rate functions (original 1952 formulation, shifted to rest at ~-65 mV)
function alphaM(v: number): number {
  const dv = v + 40;
  if (Math.abs(dv) < 1e-6) return 1.0;
  return (0.1 * dv) / (1 - Math.exp(-dv / 10));
}

function betaM(v: number): number {
  return 4 * Math.exp(-(v + 65) / 18);
}

function alphaH(v: number): number {
  return 0.07 * Math.exp(-(v + 65) / 20);
}

function betaH(v: number): number {
  return 1 / (1 + Math.exp(-(v + 35) / 10));
}

function alphaN(v: number): number {
  const dv = v + 55;
  if (Math.abs(dv) < 1e-6) return 0.1;
  return (0.01 * dv) / (1 - Math.exp(-dv / 10));
}

function betaN(v: number): number {
  return 0.125 * Math.exp(-(v + 65) / 80);
}

function steadyState(alpha: number, beta: number): number {
  return alpha / (alpha + beta);
}

export function sanitizeActionPotentialParams(
  params: ActionPotentialParams,
): ActionPotentialParams {
  return {
    gNa: clamp(params.gNa, 0, 200),
    gK: clamp(params.gK, 0, 100),
    gL: clamp(params.gL, 0, 2),
    eNa: clamp(params.eNa, 30, 70),
    eK: clamp(params.eK, -100, -50),
    eL: clamp(params.eL, -70, -40),
    cm: clamp(params.cm, 0.5, 2),
    injectedCurrent: clamp(params.injectedCurrent, 0, 50),
    duration: clamp(params.duration, 10, 200),
    dt: clamp(params.dt, 0.005, 0.1),
    ttxBlock: clamp(params.ttxBlock, 0, 100),
    teaBlock: clamp(params.teaBlock, 0, 100),
    pulseOnset: clamp(params.pulseOnset, 0, params.duration - 1),
    pulseDuration: clamp(params.pulseDuration, 0.5, params.duration),
  };
}

export function simulateActionPotential(
  input: ActionPotentialParams,
): ActionPotentialResult {
  const params = sanitizeActionPotentialParams(input);
  const {
    gNa,
    gK,
    gL,
    eNa,
    eK,
    eL,
    cm,
    injectedCurrent,
    duration,
    dt,
    ttxBlock,
    teaBlock,
    pulseOnset,
    pulseDuration,
  } = params;

  const ttxFrac = 1 - ttxBlock / 100;
  const teaFrac = 1 - teaBlock / 100;

  // Initial conditions at resting potential (~-65 mV)
  const vRest = -65;
  let v = vRest;
  let m = steadyState(alphaM(vRest), betaM(vRest));
  let h = steadyState(alphaH(vRest), betaH(vRest));
  let n = steadyState(alphaN(vRest), betaN(vRest));

  const steps = Math.floor(duration / dt);
  const timeSeries: ActionPotentialTimePoint[] = [];
  const decimation = Math.max(1, Math.floor(steps / 2000));

  let peakVoltage = vRest;
  let spikeCount = 0;
  let wasAboveThreshold = false;

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;

    // Current injection
    const iExt =
      t >= pulseOnset && t <= pulseOnset + pulseDuration
        ? injectedCurrent
        : 0;

    // Ionic currents
    const gNaEff = gNa * ttxFrac * m * m * m * h;
    const gKEff = gK * teaFrac * n * n * n * n;
    const iNa = gNaEff * (v - eNa);
    const iK = gKEff * (v - eK);
    const iL = gL * (v - eL);

    // Record
    if (i % decimation === 0) {
      timeSeries.push({
        t: round(t, 2),
        voltage: round(v, 2),
        iNa: round(-iNa, 2),
        iK: round(-iK, 2),
        iL: round(-iL, 2),
        m: round(m, 4),
        h: round(h, 4),
        n: round(n, 4),
        gNaEff: round(gNaEff, 2),
        gKEff: round(gKEff, 2),
      });
    }

    if (v > peakVoltage) peakVoltage = v;

    // Spike detection
    const aboveThreshold = v > -20;
    if (aboveThreshold && !wasAboveThreshold) spikeCount++;
    wasAboveThreshold = aboveThreshold;

    // Gating variable derivatives
    const am = alphaM(v);
    const bm = betaM(v);
    const ah = alphaH(v);
    const bh = betaH(v);
    const an = alphaN(v);
    const bn = betaN(v);

    // Forward Euler integration
    const dv = (iExt - iNa - iK - iL) / cm;
    const dm = am * (1 - m) - bm * m;
    const dh = ah * (1 - h) - bh * h;
    const dn = an * (1 - n) - bn * n;

    v += dv * dt;
    m += dm * dt;
    h += dh * dt;
    n += dn * dt;

    // Clamp gating variables
    m = clamp(m, 0, 1);
    h = clamp(h, 0, 1);
    n = clamp(n, 0, 1);
  }

  const pharmacologyNotes: string[] = [];
  if (ttxBlock > 0) {
    pharmacologyNotes.push(
      `TTX blocks ${ttxBlock}% of Na+ channels, reducing the regenerative depolarization${ttxBlock >= 80 ? " enough to abolish the spike entirely" : ""}.`,
    );
  }
  if (teaBlock > 0) {
    pharmacologyNotes.push(
      `TEA blocks ${teaBlock}% of K+ channels, slowing repolarization and widening the action potential${teaBlock >= 60 ? " — note the loss of undershoot" : ""}.`,
    );
  }
  if (ttxBlock === 0 && teaBlock === 0) {
    pharmacologyNotes.push("No pharmacological blockade applied.");
  }

  return {
    params,
    timeSeries,
    peakVoltage: round(peakVoltage, 1),
    restingVoltage: round(vRest, 1),
    spikeCount,
    explanation: {
      model: "Hodgkin-Huxley (1952)",
      phases: [
        {
          name: "Resting",
          description:
            "Membrane sits near -65 mV, set by K+ leak and the Na+/K+ ATPase. Gates: m low, h high, n moderate.",
        },
        {
          name: "Depolarization",
          description:
            "Stimulus raises V past threshold → m gates open fast → Na+ rushes in → positive feedback drives the upstroke to ~+40 mV.",
        },
        {
          name: "Repolarization",
          description:
            "h gates close (Na+ inactivation) while n gates open (delayed K+ rectifier) → outward K+ current pulls V back down.",
        },
        {
          name: "Undershoot",
          description:
            "K+ channels are still open after Na+ channels close → V dips below resting (afterhyperpolarization) before n gates relax.",
        },
        {
          name: "Recovery",
          description:
            "h gates de-inactivate and n gates close → membrane returns to resting, ready for the next spike.",
        },
      ],
      pharmacology: pharmacologyNotes,
      whatToNotice: [
        spikeCount > 0
          ? `The model produces ${spikeCount} spike${spikeCount > 1 ? "s" : ""} with a peak of ${round(peakVoltage, 1)} mV.`
          : "No spikes — the stimulus is subthreshold or channels are too blocked for regenerative depolarization.",
        "Watch the gating variables: m (fast activation) leads, h (inactivation) follows, n (K+ activation) is slowest.",
        "The Na+ current (blue) is brief and large; the K+ current (red) is slower and sustains repolarization.",
        teaBlock > 30
          ? "With K+ blockade, repolarization is delayed — the spike is broader and the undershoot disappears."
          : "The afterhyperpolarization sets the relative refractory period: another spike requires stronger stimulus during this window.",
      ],
      biologicalAnalogies: {
        gNa: "Density of voltage-gated Na+ channels. Reduced in demyelination or by TTX/local anesthetics.",
        gK: "Density of delayed-rectifier K+ channels. Blocked by TEA and 4-aminopyridine.",
        gL: "Background leak conductance. Increases with membrane damage or demyelination.",
        "m gate":
          "Na+ activation — opens within ~0.1 ms of depolarization. The fastest gate.",
        "h gate":
          "Na+ inactivation — closes with ~1 ms delay, creating the absolute refractory period.",
        "n gate":
          "K+ activation — opens with ~1 ms delay, drives repolarization and the afterhyperpolarization.",
        TTX: "Tetrodotoxin (pufferfish toxin) — plugs Na+ channel pore from outside. Also models lidocaine mechanism.",
        TEA: "Tetraethylammonium — blocks K+ channels from outside. Reveals the Na+ component in isolation.",
      },
    },
  };
}
