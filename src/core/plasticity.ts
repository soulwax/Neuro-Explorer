export interface PlasticityParams {
  aPlus: number;
  aMinus: number;
  tauPlus: number;
  tauMinus: number;
  initialWeight: number;
  pairCount: number;
  deltaT: number;
}

export interface PlasticityParamDefinition {
  key: keyof PlasticityParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface PlasticityPreset {
  id: string;
  label: string;
  description: string;
  clinicalLens: string;
  caution: string;
  params: PlasticityParams;
}

export interface PlasticityInterpretation {
  headline: string;
  phenotype: string;
  mechanism: string;
  clinicalLens: string;
  behaviorSignals: string[];
  differentialTraps: string[];
  nextQuestions: string[];
}

export interface PlasticityResult {
  params: PlasticityParams;
  weightHistory: { pair: number; weight: number; deltaW: number }[];
  finalWeight: number;
  direction: "LTP" | "LTD" | "no change";
  stdpCurve: { dt: number; dw: number }[];
  summary: {
    totalWeightChange: number;
    deltaPerPair: number;
    windowBias: number;
    saturationState: "floor" | "midrange" | "ceiling";
    timingPolarity: "causal" | "anti-causal" | "synchronous";
    learningRegime: string;
  };
  interpretation: PlasticityInterpretation;
  explanation: {
    hebbianRule: string;
    stdpMechanism: string;
    biologicalBasis: string[];
    connectionToAI: string;
  };
}

export const defaultPlasticityParams: PlasticityParams = {
  aPlus: 0.008,
  aMinus: 0.0085,
  tauPlus: 20,
  tauMinus: 20,
  initialWeight: 0.5,
  pairCount: 60,
  deltaT: 10,
};

export const plasticityPresets: PlasticityPreset[] = [
  {
    id: "causal-potentiation",
    label: "Causal potentiation",
    description:
      "A clean pre-before-post window where causal timing strengthens the synapse without immediately saturating it.",
    clinicalLens:
      "Use this as the baseline teaching frame for Hebbian strengthening before discussing addiction, recovery, or maladaptive reinforcement.",
    caution:
      "This is a timing-rule scaffold, not a literal disease model.",
    params: defaultPlasticityParams,
  },
  {
    id: "anti-causal-depression",
    label: "Anti-causal depression",
    description:
      "Post-before-pre timing drives the weight downward, emphasizing pruning or devaluation rather than strengthening.",
    clinicalLens:
      "Helpful for teaching LTD, mismatch learning, and why non-causal timing weakens a synapse instead of reinforcing it.",
    caution:
      "Synaptic weakening here is a local rule, not the same thing as forgetting or clinical deficit by itself.",
    params: {
      ...defaultPlasticityParams,
      deltaT: -12,
      pairCount: 80,
      initialWeight: 0.65,
    },
  },
  {
    id: "metaplastic-brake",
    label: "Metaplastic brake",
    description:
      "A causal window is still present, but the LTD side is stronger overall, so growth is restrained and runaway strengthening is resisted.",
    clinicalLens:
      "Useful for explaining stability rules, homeostatic pressure, and why a network sometimes resists further potentiation.",
    caution:
      "This is a balance-of-rules illustration rather than a full homeostatic plasticity model.",
    params: {
      ...defaultPlasticityParams,
      aPlus: 0.0065,
      aMinus: 0.0105,
      tauPlus: 16,
      tauMinus: 26,
      pairCount: 70,
      deltaT: 8,
      initialWeight: 0.6,
    },
  },
  {
    id: "runaway-potentiation",
    label: "Runaway potentiation",
    description:
      "Strong causal timing and a positive window bias drive the weight rapidly toward ceiling.",
    clinicalLens:
      "Helpful when teaching how plasticity can become maladaptive or saturate before the rest of the network has rebalanced.",
    caution:
      "Saturation in this toy model should not be treated as proof of a real disease mechanism.",
    params: {
      ...defaultPlasticityParams,
      aPlus: 0.013,
      aMinus: 0.005,
      tauPlus: 24,
      tauMinus: 16,
      pairCount: 120,
      deltaT: 6,
      initialWeight: 0.45,
    },
  },
  {
    id: "washout-depression",
    label: "Washout depression",
    description:
      "Repeated anti-causal pairing plus stronger LTD amplitude pushes the synapse toward floor.",
    clinicalLens:
      "Useful for teaching maladaptive weakening, de-association, and what it means for a pathway to lose influence rather than gain it.",
    caution:
      "This is still one local synapse, not a whole-memory erasure model.",
    params: {
      ...defaultPlasticityParams,
      aPlus: 0.006,
      aMinus: 0.012,
      tauPlus: 16,
      tauMinus: 28,
      pairCount: 120,
      deltaT: -18,
      initialWeight: 0.7,
    },
  },
];

export const plasticityParamDefinitions: PlasticityParamDefinition[] = [
  {
    key: "deltaT",
    label: "Spike Timing",
    unit: "ms",
    step: 1,
    min: -50,
    max: 50,
  },
  {
    key: "pairCount",
    label: "Number of Pairs",
    step: 5,
    min: 1,
    max: 500,
  },
  {
    key: "initialWeight",
    label: "Initial Weight",
    step: 0.05,
    min: 0,
    max: 1,
  },
  {
    key: "aPlus",
    label: "A+",
    unit: "LTP",
    step: 0.001,
    min: 0.001,
    max: 0.03,
  },
  {
    key: "aMinus",
    label: "A-",
    unit: "LTD",
    step: 0.001,
    min: 0.001,
    max: 0.03,
  },
  {
    key: "tauPlus",
    label: "Tau+",
    unit: "ms",
    step: 1,
    min: 5,
    max: 80,
  },
  {
    key: "tauMinus",
    label: "Tau-",
    unit: "ms",
    step: 1,
    min: 5,
    max: 80,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

function classifySaturation(finalWeight: number): "floor" | "midrange" | "ceiling" {
  if (finalWeight >= 0.92) {
    return "ceiling";
  }
  if (finalWeight <= 0.08) {
    return "floor";
  }
  return "midrange";
}

function buildInterpretation(
  totalWeightChange: number,
  direction: "LTP" | "LTD" | "no change",
  saturationState: "floor" | "midrange" | "ceiling",
  windowBias: number,
): PlasticityInterpretation {
  if (direction === "no change" || Math.abs(totalWeightChange) < 0.01) {
    return {
      headline: "Neutral timing window",
      phenotype: "Minimal update regime",
      mechanism:
        "The selected timing rule does not strongly favor either potentiation or depression, so the synapse remains near its starting weight.",
      clinicalLens:
        "Use this to teach that coincident activity alone is not enough; the timing structure and gain of the rule determine whether learning actually occurs.",
      behaviorSignals: [
        "Weight stays close to baseline even after repeated pairing.",
        "The rule is stable, but it also teaches very little under current conditions.",
        "Changing amplitudes or timing polarity will matter more than simply adding more pairings.",
      ],
      differentialTraps: [
        "Minimal update is not the same thing as absent plasticity capacity.",
        "A neutral outcome should not be mistaken for homeostatic health without looking at the whole rule.",
      ],
      nextQuestions: [
        "Does a small positive or negative timing shift reveal hidden asymmetry?",
        "Would stronger amplitudes or longer time constants recruit learning from the same starting point?",
      ],
    };
  }

  if (direction === "LTP" && saturationState === "ceiling") {
    return {
      headline: "Ceiling-seeking potentiation",
      phenotype: "Runaway strengthening",
      mechanism:
        "Causal timing and a positive window bias keep pushing the synapse upward until saturation, so each added pairing has less room to express nuanced learning.",
      clinicalLens:
        "Helpful for teaching maladaptive reinforcement, overshoot during recovery, or why plasticity sometimes needs a brake rather than more gain.",
      behaviorSignals: [
        "The weight rises quickly and then compresses against the upper bound.",
        "Additional pairings stop conveying nuance because the synapse is nearly saturated.",
        "Potentiation dominates the rule more than stability does.",
      ],
      differentialTraps: [
        "Saturation in a toy STDP model is not equivalent to addiction or epileptogenesis.",
        "A high final weight does not prove the biological system lacks homeostatic control.",
      ],
      nextQuestions: [
        "What happens if LTD amplitude rises slightly while timing stays causal?",
        "How early does the curve hit saturation compared with the total number of pairings?",
      ],
    };
  }

  if (direction === "LTD" && saturationState === "floor") {
    return {
      headline: "Floor-seeking depression",
      phenotype: "Washout weakening",
      mechanism:
        "Anti-causal timing combined with a depression-favoring window drives the synapse toward floor, leaving little influence for that pathway to express.",
      clinicalLens:
        "Useful when teaching de-association, pruning, and how repeated non-causal activity can remove a pathway from the competition.",
      behaviorSignals: [
        "Weight decays steadily instead of oscillating around a stable middle range.",
        "The synapse quickly loses leverage over downstream output.",
        "Repeated pairings add little subtlety once the floor is approached.",
      ],
      differentialTraps: [
        "A weakened synapse in this model is not identical to forgetting a memory trace.",
        "Depression does not imply the network is healthier; it only shows which local rule is winning.",
      ],
      nextQuestions: [
        "How much stronger would causal timing need to be to reverse the washout?",
        "Is the dominant factor timing polarity, amplitude asymmetry, or pair count?",
      ],
    };
  }

  if (windowBias < 0) {
    return {
      headline: "Stability-biased plasticity",
      phenotype: "Metaplastic restraint",
      mechanism:
        "The timing window still permits potentiation, but the overall balance leans toward depression, restraining growth and preserving midrange weights.",
      clinicalLens:
        "Helpful for explaining why real networks need braking forces that prevent every correlated event from becoming runaway strengthening.",
      behaviorSignals: [
        "Weight changes are present but moderated.",
        "The rule stays teachable without rapidly collapsing to floor or ceiling.",
        "Depression remains available as a stabilizing counterweight.",
      ],
      differentialTraps: [
        "A restrained rule is not the same thing as weak learning.",
        "Stability pressure should not be confused with simple inhibition or lack of coincidence detection.",
      ],
      nextQuestions: [
        "How much negative bias is needed before causal timing stops producing net gain?",
        "What shifts first if tauMinus or aMinus is reduced slightly?",
      ],
    };
  }

  if (direction === "LTD") {
    return {
      headline: "Dominant synaptic weakening",
      phenotype: "LTD-led remodeling",
      mechanism:
        "Anti-causal timing wins often enough to pull the synapse downward without completely collapsing it, emphasizing selective weakening over erasure.",
      clinicalLens:
        "Useful for showing that depression can be specific and instructive, not just destructive.",
      behaviorSignals: [
        "Weight falls, but the synapse still remains available for later recovery.",
        "Timing polarity matters more than raw pair count in this regime.",
        "The pathway is being deemphasized rather than annihilated.",
      ],
      differentialTraps: [
        "LTD is not synonymous with damage.",
        "A downward trend should not be confused with structural synapse loss in a real brain.",
      ],
      nextQuestions: [
        "Can a modest causal shift rescue the same starting weight?",
        "How much of the weakening is due to amplitude asymmetry versus timing sign alone?",
      ],
    };
  }

  return {
    headline: "Causal synaptic strengthening",
    phenotype: "Potentiation-dominant learning",
    mechanism:
      "Pre-before-post timing reinforces the synapse because the model interprets that sequence as causal, and the weight climbs without immediately saturating.",
    clinicalLens:
      "This is the cleanest baseline for teaching Hebbian strengthening before layering in stability or pathology analogies.",
    behaviorSignals: [
      "Weight rises steadily across pairings rather than jumping to ceiling immediately.",
      "The synapse retains enough headroom for later comparison and modulation.",
      "Causal timing is clearly doing useful instructive work.",
    ],
    differentialTraps: [
      "Potentiation here does not prove learning is globally beneficial.",
      "A stronger synapse is not the same thing as a complete memory or skill representation.",
    ],
    nextQuestions: [
      "What happens if LTD amplitude slightly exceeds LTP amplitude while timing stays causal?",
      "How quickly does causal learning lose its effect as deltaT moves away from zero?",
    ],
  };
}

export function sanitizePlasticityParams(
  params: PlasticityParams,
): PlasticityParams {
  return {
    aPlus: clamp(params.aPlus, 0.001, 0.03),
    aMinus: clamp(params.aMinus, 0.001, 0.03),
    tauPlus: clamp(params.tauPlus, 5, 80),
    tauMinus: clamp(params.tauMinus, 5, 80),
    initialWeight: clamp(params.initialWeight, 0, 1),
    pairCount: Math.floor(clamp(params.pairCount, 1, 500)),
    deltaT: clamp(params.deltaT, -50, 50),
  };
}

export function stdpWindow(dt: number, params: PlasticityParams) {
  if (dt > 0) {
    return params.aPlus * Math.exp(-dt / params.tauPlus);
  }

  if (dt < 0) {
    return -params.aMinus * Math.exp(dt / params.tauMinus);
  }

  return 0;
}

export function simulatePlasticity(input: PlasticityParams): PlasticityResult {
  const params = sanitizePlasticityParams(input);
  const weightHistory: { pair: number; weight: number; deltaW: number }[] = [];
  let weight = params.initialWeight;

  for (let pair = 0; pair < params.pairCount; pair += 1) {
    const deltaW = stdpWindow(params.deltaT, params);
    weight = clamp(weight + deltaW, 0, 1);
    weightHistory.push({
      pair: pair + 1,
      weight: round(weight),
      deltaW: round(deltaW),
    });
  }

  const stdpCurve = Array.from({ length: 101 }, (_, index) => {
    const dt = index - 50;
    return {
      dt,
      dw: round(stdpWindow(dt, params)),
    };
  });

  const direction =
    params.deltaT > 0 ? "LTP" : params.deltaT < 0 ? "LTD" : "no change";
  const finalWeight = round(weight);
  const totalWeightChange = round(finalWeight - params.initialWeight);
  const deltaPerPair = round(weightHistory[weightHistory.length - 1]?.deltaW ?? 0);
  const windowBias = round(
    params.aPlus * params.tauPlus - params.aMinus * params.tauMinus,
    6,
  );
  const saturationState = classifySaturation(finalWeight);
  const timingPolarity =
    params.deltaT > 0
      ? "causal"
      : params.deltaT < 0
        ? "anti-causal"
        : "synchronous";
  const interpretation = buildInterpretation(
    totalWeightChange,
    direction,
    saturationState,
    windowBias,
  );

  return {
    params,
    weightHistory,
    finalWeight,
    direction,
    stdpCurve,
    summary: {
      totalWeightChange,
      deltaPerPair,
      windowBias,
      saturationState,
      timingPolarity,
      learningRegime: interpretation.phenotype,
    },
    interpretation,
    explanation: {
      hebbianRule:
        '"Neurons that fire together wire together" is only the broad idea. STDP says the exact timing decides whether the synapse should strengthen or weaken.',
      stdpMechanism: `With deltaT=${params.deltaT} ms, the presynaptic spike occurs ${
        params.deltaT > 0
          ? "before"
          : params.deltaT < 0
            ? "after"
            : "at the same time as"
      } the postsynaptic spike. ${
        params.deltaT > 0
          ? "That timing is interpreted as causal, so the synapse potentiates."
          : params.deltaT < 0
            ? "That timing is interpreted as non-causal, so the synapse depresses."
            : "There is no temporal asymmetry, so the update is effectively neutral."
      }`,
      biologicalBasis: [
        "NMDA receptors behave like coincidence detectors because they need presynaptic glutamate and postsynaptic depolarization together.",
        "Pre-before-post timing can trigger calcium conditions that favor CaMKII signaling and AMPA receptor insertion.",
        "Post-before-pre timing changes calcium dynamics enough to favor phosphatases and synaptic weakening instead.",
        "Making LTD slightly stronger than LTP helps stabilize the network and prevents runaway excitation.",
      ],
      connectionToAI:
        "STDP is local and biologically plausible. Backpropagation is far more powerful, but it relies on a non-local error signal that real synapses do not obviously receive.",
    },
  };
}
