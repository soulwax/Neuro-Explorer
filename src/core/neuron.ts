export interface NeuronParams {
  tau: number;
  restingPotential: number;
  threshold: number;
  resetPotential: number;
  inputCurrent: number;
  duration: number;
  refractoryPeriod: number;
  dt: number;
}

export interface NeuronParamDefinition {
  key: keyof NeuronParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface NeuronSimulationPoint {
  t: number;
  voltage: number;
}

export interface NeuronSimulationResult {
  params: NeuronParams;
  timeSeries: NeuronSimulationPoint[];
  spikeTimes: number[];
  firingRate: number;
  explanation: {
    model: string;
    biologicalAnalogies: Record<string, string>;
    whatToNotice: string[];
  };
}

export const defaultNeuronParams: NeuronParams = {
  tau: 20,
  restingPotential: -70,
  threshold: -55,
  resetPotential: -75,
  inputCurrent: 2,
  duration: 100,
  refractoryPeriod: 2,
  dt: 0.1,
};

export const neuronParamDefinitions: NeuronParamDefinition[] = [
  {
    key: "inputCurrent",
    label: "Input Current",
    unit: "nA",
    step: 0.1,
    min: 0,
    max: 5,
  },
  {
    key: "tau",
    label: "Membrane Time Constant",
    unit: "ms",
    step: 1,
    min: 5,
    max: 60,
  },
  {
    key: "threshold",
    label: "Spike Threshold",
    unit: "mV",
    step: 1,
    min: -70,
    max: -35,
  },
  {
    key: "restingPotential",
    label: "Resting Potential",
    unit: "mV",
    step: 1,
    min: -85,
    max: -50,
  },
  {
    key: "resetPotential",
    label: "Reset Potential",
    unit: "mV",
    step: 1,
    min: -90,
    max: -45,
  },
  {
    key: "duration",
    label: "Duration",
    unit: "ms",
    step: 10,
    min: 40,
    max: 1000,
  },
  {
    key: "refractoryPeriod",
    label: "Refractory Period",
    unit: "ms",
    step: 0.5,
    min: 0.5,
    max: 10,
  },
  {
    key: "dt",
    label: "Timestep",
    unit: "ms",
    step: 0.05,
    min: 0.05,
    max: 2,
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 3): number {
  return Number(value.toFixed(digits));
}

export function sanitizeNeuronParams(params: NeuronParams): NeuronParams {
  const next = {
    ...params,
    tau: clamp(params.tau, 5, 60),
    restingPotential: clamp(params.restingPotential, -85, -50),
    threshold: clamp(params.threshold, -70, -35),
    resetPotential: clamp(params.resetPotential, -90, -45),
    inputCurrent: clamp(params.inputCurrent, 0, 5),
    duration: clamp(params.duration, 40, 1000),
    refractoryPeriod: clamp(params.refractoryPeriod, 0.5, 10),
    dt: clamp(params.dt, 0.05, 2),
  };

  if (next.resetPotential >= next.threshold) {
    next.resetPotential = next.threshold - 1;
  }

  if (next.restingPotential >= next.threshold) {
    next.restingPotential = next.threshold - 2;
  }

  return next;
}

export function simulateNeuron(input: NeuronParams): NeuronSimulationResult {
  const params = sanitizeNeuronParams(input);
  const {
    tau,
    restingPotential,
    threshold,
    resetPotential,
    inputCurrent,
    duration,
    refractoryPeriod,
    dt,
  } = params;

  const steps = Math.floor(duration / dt);
  const timeSeries: NeuronSimulationPoint[] = [];
  const spikeTimes: number[] = [];
  const membraneResistance = 10;

  let voltage = restingPotential;
  let refractoryTimer = 0;

  for (let index = 0; index <= steps; index += 1) {
    const t = round(index * dt, 2);

    if (refractoryTimer > 0) {
      refractoryTimer -= dt;
      voltage = resetPotential;
    } else {
      const delta =
        (-(voltage - restingPotential) + membraneResistance * inputCurrent) *
        (dt / tau);
      voltage += delta;
    }

    if (voltage >= threshold && refractoryTimer <= 0) {
      spikeTimes.push(t);
      timeSeries.push({ t, voltage: 40 });
      voltage = resetPotential;
      refractoryTimer = refractoryPeriod;
      continue;
    }

    if (index % 10 === 0) {
      timeSeries.push({ t, voltage: round(voltage) });
    }
  }

  const firingRate = spikeTimes.length / (duration / 1000);

  return {
    params,
    timeSeries,
    spikeTimes,
    firingRate,
    explanation: {
      model: "Leaky Integrate-and-Fire (LIF)",
      biologicalAnalogies: {
        tau: "Membrane time constant. Larger values make the membrane integrate more slowly before it leaks away charge.",
        restingPotential:
          "Baseline voltage set by ionic gradients and leak channels, usually near -70 mV in a typical neuron.",
        threshold:
          "The voltage where voltage-gated sodium channels would open strongly enough to trigger a spike.",
        resetPotential:
          "A stylized after-hyperpolarization that follows a spike before the membrane starts integrating again.",
        refractoryPeriod:
          "The brief interval where sodium channels are inactivated and the neuron cannot immediately spike again.",
        inputCurrent:
          "A stand-in for synaptic drive from other neurons. More current pushes the membrane toward threshold faster.",
      },
      whatToNotice: [
        `With ${inputCurrent.toFixed(1)} nA of drive, the model fires at ${firingRate.toFixed(1)} Hz.`,
        "Below a certain drive, the membrane creeps upward but never reaches threshold.",
        "Once threshold is crossed, the trace becomes a repeated cycle of ramp, spike, reset, and refractory pause.",
        "Shorter refractory periods allow higher maximum firing rates even with the same input current.",
      ],
    },
  };
}
