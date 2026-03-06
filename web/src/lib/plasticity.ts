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

export interface PlasticityResult {
  params: PlasticityParams;
  weightHistory: { pair: number; weight: number; deltaW: number }[];
  finalWeight: number;
  direction: "LTP" | "LTD" | "no change";
  stdpCurve: { dt: number; dw: number }[];
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

  return {
    params,
    weightHistory,
    finalWeight: round(weight),
    direction,
    stdpCurve,
    explanation: {
      hebbianRule:
        '"Neurons that fire together wire together" is only the broad idea. STDP says the exact timing decides whether the synapse should strengthen or weaken.',
      stdpMechanism: `With deltaT=${params.deltaT} ms, the presynaptic spike occurs ${
        params.deltaT > 0 ? "before" : params.deltaT < 0 ? "after" : "at the same time as"
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
