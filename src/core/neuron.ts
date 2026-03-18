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

export interface NeuronPreset {
  id: string;
  label: string;
  description: string;
  clinicalLens: string;
  caution: string;
  params: NeuronParams;
}

export interface NeuronInterpretation {
  headline: string;
  phenotype: string;
  mechanism: string;
  clinicalLens: string;
  bedsideSignals: string[];
  differentialTraps: string[];
  nextQuestions: string[];
}

export interface NeuronSimulationResult {
  params: NeuronParams;
  timeSeries: NeuronSimulationPoint[];
  spikeTimes: number[];
  firingRate: number;
  summary: {
    spikeCount: number;
    firingRateHz: number;
    meanIsiMs: number | null;
    firingPattern: string;
    excitabilityClass: string;
    steadyStateVoltage: number;
    thresholdSlackMv: number;
    refractoryFraction: number;
    refractoryLimited: boolean;
  };
  interpretation: NeuronInterpretation;
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

export const neuronPresets: NeuronPreset[] = [
  {
    id: "quiet-reserve",
    label: "Quiet reserve",
    description:
      "Subthreshold integration where the membrane is driven upward but never cleanly escapes into repetitive spiking.",
    clinicalLens:
      "Useful for teaching hypoexcitability, weak synaptic drive, or why a neuron can look engaged without actually recruiting output.",
    caution:
      "Silence here reflects a simple threshold model, not a diagnosis or a channel-level disease state.",
    params: {
      ...defaultNeuronParams,
      inputCurrent: 1.1,
      duration: 160,
      tau: 24,
    },
  },
  {
    id: "near-threshold",
    label: "Near threshold",
    description:
      "The membrane hovers close to threshold, so small parameter shifts determine whether output stays sparse or becomes repetitive.",
    clinicalLens:
      "Good for showing why modest changes in drive, threshold, or membrane time constant can move a cell from almost-firing to firing.",
    caution:
      "This is a threshold-recruitment teaching frame, not a full conductance-based instability model.",
    params: {
      ...defaultNeuronParams,
      inputCurrent: 1.65,
      duration: 180,
      tau: 26,
      refractoryPeriod: 2.5,
    },
  },
  {
    id: "regular-spiking",
    label: "Regular spiking",
    description:
      "A stable repetitive spiking regime where integration, threshold crossing, reset, and refractory pause are easy to see.",
    clinicalLens:
      "Use this as the canonical LIF teaching baseline before discussing hyperexcitability or refractory limits.",
    caution:
      "Regular firing here is a stylized phenotype, not a specific cortical cell class.",
    params: defaultNeuronParams,
  },
  {
    id: "hyperexcitable",
    label: "Hyperexcitable",
    description:
      "Lower threshold and stronger drive push the membrane into rapid spike recruitment with minimal quiet time between events.",
    clinicalLens:
      "Helpful for teaching increased excitability, reduced spike threshold, and why a neuron can become output-dominant before you invoke a seizure story.",
    caution:
      "Rapid spiking in this model is not equivalent to epilepsy or paroxysmal activity.",
    params: {
      ...defaultNeuronParams,
      threshold: -60,
      inputCurrent: 2.8,
      refractoryPeriod: 1,
      tau: 16,
      duration: 140,
    },
  },
  {
    id: "refractory-braked",
    label: "Refractory braked",
    description:
      "Even with strong drive, the refractory pause becomes the main limit on how often the neuron can emit spikes.",
    clinicalLens:
      "Useful when teaching the difference between strong depolarizing drive and the separate bottleneck imposed by recovery time.",
    caution:
      "This is still a reduced model, so the refractory effect is more explicit than in real channel kinetics.",
    params: {
      ...defaultNeuronParams,
      threshold: -60,
      inputCurrent: 4.4,
      refractoryPeriod: 6,
      tau: 18,
      duration: 180,
    },
  },
];

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

const MEMBRANE_RESISTANCE = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 3): number {
  return Number(value.toFixed(digits));
}

function describeFiringPattern(spikeCount: number, firingRateHz: number) {
  if (spikeCount === 0) {
    return "Subthreshold";
  }

  if (firingRateHz < 12) {
    return "Sparse recruitment";
  }

  if (firingRateHz < 35) {
    return "Regular spiking";
  }

  return "Rapid spiking";
}

function meanInterSpikeInterval(spikeTimes: number[]) {
  if (spikeTimes.length < 2) {
    return null;
  }

  const intervals = spikeTimes
    .slice(1)
    .map((spikeTime, index) => spikeTime - spikeTimes[index]!);
  const mean =
    intervals.reduce((total, value) => total + value, 0) / intervals.length;
  return mean;
}

function buildInterpretation(
  spikeCount: number,
  firingRateHz: number,
  thresholdSlackMv: number,
  refractoryFraction: number,
): NeuronInterpretation {
  if (spikeCount === 0 && thresholdSlackMv <= -2.5) {
    return {
      headline: "Quiet subthreshold reserve",
      phenotype: "Hypoexcitable or weakly driven regime",
      mechanism:
        "The membrane integrates upward but the steady-state drive remains comfortably below threshold, so the neuron never transitions into repetitive firing.",
      clinicalLens:
        "Use this to teach the difference between participating in a circuit and actually being recruited into output.",
      bedsideSignals: [
        "Small increases in input current would matter more than tiny reset changes because the cell is still living below threshold.",
        "A longer tau can make the ramp slower and more visible without guaranteeing spikes.",
        "The absence of spikes here says more about recruitment than about transmission failure.",
      ],
      differentialTraps: [
        "No spikes in a LIF model do not prove sodium-channel block or structural lesion.",
        "Subthreshold behavior should not be mistaken for inhibition unless the model actually contains inhibitory input.",
      ],
      nextQuestions: [
        "How much extra depolarizing drive is needed before threshold becomes reachable?",
        "Does lowering threshold recruit spikes more efficiently than raising current in this run?",
      ],
    };
  }

  if (spikeCount === 0) {
    return {
      headline: "Borderline recruitment",
      phenotype: "Near-threshold reserve",
      mechanism:
        "The cell sits close to threshold, so modest parameter shifts could recruit output, but current conditions still do not sustain a spike.",
      clinicalLens:
        "Helpful for explaining why small physiologic changes can flip a neuron from almost-silent to firing.",
      bedsideSignals: [
        "The membrane trace shows engagement without clean output release.",
        "Threshold and input current become the most sensitive levers in this zone.",
        "This is a recruitment margin problem more than a refractory problem.",
      ],
      differentialTraps: [
        "Near-threshold silence is not the same thing as a dead or disconnected neuron.",
        "A borderline regime should not be over-read as instability without repetitive output.",
      ],
      nextQuestions: [
        "Which single parameter shift recruits the first spike most efficiently?",
        "Is the bottleneck threshold placement or insufficient steady-state drive?",
      ],
    };
  }

  if (refractoryFraction >= 0.18 || firingRateHz >= 45) {
    return {
      headline: "Refractory-limited high drive",
      phenotype: "High excitability with recovery bottleneck",
      mechanism:
        "Strong depolarizing drive keeps pushing the membrane toward threshold, but the refractory pause becomes the main limiter on output frequency.",
      clinicalLens:
        "Useful when teaching that excitability and maximal firing rate are related but not identical concepts.",
      bedsideSignals: [
        "Changing refractory period now matters almost as much as changing input current.",
        "The cell spends a meaningful fraction of the run recovering rather than integrating.",
        "Output looks vigorous, but the ceiling is imposed by reset and recovery timing.",
      ],
      differentialTraps: [
        "Rapid spiking here is not equivalent to epileptiform bursting or synchrony.",
        "High drive does not mean the neuron has escaped the constraints of refractoriness.",
      ],
      nextQuestions: [
        "What happens if refractory period shortens while drive stays fixed?",
        "Would lowering threshold or shortening recovery produce the larger rate jump?",
      ],
    };
  }

  if (firingRateHz >= 12) {
    return {
      headline: "Stable repetitive recruitment",
      phenotype: "Regular spiking output",
      mechanism:
        "Drive exceeds threshold enough to produce a steady cycle of integration, threshold crossing, reset, and recovery without becoming dominated by the refractory ceiling.",
      clinicalLens:
        "This is the cleanest baseline for teaching how a simple neuron turns continuous input into discrete output.",
      bedsideSignals: [
        "The membrane ramp is visible between spikes instead of collapsing into near-continuous firing.",
        "Input current, threshold, and refractory period all remain interpretable levers.",
        "The output is rhythmic enough to reason about but not so extreme that one parameter dominates everything.",
      ],
      differentialTraps: [
        "Regular spiking does not identify a specific cortical neuron subtype by itself.",
        "A clean spike train in LIF is a teaching abstraction, not a full conductance-based explanation.",
      ],
      nextQuestions: [
        "How far can threshold move before the regime stops firing regularly?",
        "What changes first when current rises: firing rate, spike count, or refractory occupancy?",
      ],
    };
  }

  return {
    headline: "Sparse recruited output",
    phenotype: "Low-frequency spiking",
    mechanism:
      "The membrane crosses threshold only intermittently, so the cell is recruited but still operating close to the boundary between silence and stable repetitive output.",
    clinicalLens:
      "Useful for showing how a neuron can be active without yet becoming a strongly driving element in the network.",
    bedsideSignals: [
      "Mean interspike interval stays long, which signals incomplete recruitment rather than refractory saturation.",
      "Threshold shifts can disproportionately change spike count in this regime.",
      "The trace still spends much of its time integrating below threshold.",
    ],
    differentialTraps: [
      "Sparse spiking should not be confused with fatigue or adaptation because this model lacks those mechanisms.",
      "Low frequency does not imply low importance in a real circuit.",
    ],
    nextQuestions: [
      "Is the cell limited more by threshold placement or by insufficient current?",
      "How quickly does the regime become regular if drive increases slightly?",
    ],
  };
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

  let voltage = restingPotential;
  let refractoryTimer = 0;

  for (let index = 0; index <= steps; index += 1) {
    const t = round(index * dt, 2);

    if (refractoryTimer > 0) {
      refractoryTimer -= dt;
      voltage = resetPotential;
    } else {
      const delta =
        (-(voltage - restingPotential) + MEMBRANE_RESISTANCE * inputCurrent) *
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

  const spikeCount = spikeTimes.length;
  const firingRateHz = spikeCount / (duration / 1000);
  const meanIsiMs = meanInterSpikeInterval(spikeTimes);
  const firingPattern = describeFiringPattern(spikeCount, firingRateHz);
  const steadyStateVoltage = restingPotential + MEMBRANE_RESISTANCE * inputCurrent;
  const thresholdSlackMv = round(steadyStateVoltage - threshold, 3);
  const refractoryFraction = round(
    Math.min(1, (spikeCount * refractoryPeriod) / duration),
    3,
  );
  const refractoryLimited =
    spikeCount > 0 && (refractoryFraction >= 0.18 || firingRateHz >= 45);
  const interpretation = buildInterpretation(
    spikeCount,
    firingRateHz,
    thresholdSlackMv,
    refractoryFraction,
  );

  return {
    params,
    timeSeries,
    spikeTimes,
    firingRate: firingRateHz,
    summary: {
      spikeCount,
      firingRateHz: round(firingRateHz, 3),
      meanIsiMs: meanIsiMs === null ? null : round(meanIsiMs, 3),
      firingPattern,
      excitabilityClass: interpretation.phenotype,
      steadyStateVoltage: round(steadyStateVoltage, 3),
      thresholdSlackMv,
      refractoryFraction,
      refractoryLimited,
    },
    interpretation,
    explanation: {
      model: "Leaky Integrate-and-Fire (LIF)",
      biologicalAnalogies: {
        tau:
          "Membrane time constant. Larger values make the membrane integrate more slowly before leak drags it back.",
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
        `With ${inputCurrent.toFixed(1)} nA of drive, the model settles into a ${interpretation.phenotype.toLowerCase()}.`,
        `The steady-state membrane estimate is ${round(steadyStateVoltage, 1).toFixed(1)} mV, which is ${
          thresholdSlackMv >= 0 ? "above" : "below"
        } threshold by ${Math.abs(round(thresholdSlackMv, 1)).toFixed(1)} mV.`,
        meanIsiMs === null
          ? "Because the model does not spike repeatedly, interspike timing is not yet the limiting feature."
          : `Once recruited, the mean interspike interval is ${round(meanIsiMs, 1).toFixed(1)} ms.`,
        refractoryLimited
          ? "Recovery time is now a visible bottleneck on output, not just a background implementation detail."
          : "Integration and threshold remain the main levers; refractoriness has not yet taken over the phenotype.",
      ],
    },
  };
}
