export interface DopamineParams {
  durationMs: number;
  dtMs: number;
  trialCount: number;
  cueTime: number;
  rewardTime: number;
  rewardSize: number;
  learningRate: number;
  discount: number;
  traceDecay: number;
  omissionTrial: number;
}

export interface TracePoint {
  t: number;
  value: number;
}

export interface TrialSnapshot {
  trial: number;
  label: string;
  rewardDelivered: boolean;
  predictionError: TracePoint[];
  valueTrace: TracePoint[];
}

export interface SnapshotMetric {
  trial: number;
  label: string;
  rewardDelivered: boolean;
  cuePeak: number;
  rewardPeak: number;
  cueValue: number;
  rewardValue: number;
}

export interface LearningPoint {
  trial: number;
  cueError: number;
  rewardError: number;
}

export interface DopamineParamDefinition {
  key: keyof DopamineParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface DopaminePreset {
  id: string;
  label: string;
  description: string;
  clinicalLens: string;
  caution: string;
  params: DopamineParams;
}

export interface DopamineInterpretation {
  headline: string;
  phenotype: string;
  mechanism: string;
  clinicalLens: string;
  behaviorSignals: string[];
  differentialTraps: string[];
  nextQuestions: string[];
}

export interface DopamineResult {
  params: DopamineParams;
  snapshots: TrialSnapshot[];
  snapshotMetrics: SnapshotMetric[];
  learningCurve: LearningPoint[];
  summary: {
    finalCueResponse: number;
    finalRewardResponse: number;
    omissionDip: number;
    shiftTrial: number | null;
    cueRewardRatio: number;
    transferIndex: number;
    omissionSeverity: "minimal" | "moderate" | "severe";
    learningRegime: string;
  };
  interpretation: DopamineInterpretation;
  explanation: {
    model: string;
    notes: string[];
  };
}

export const defaultDopamineParams: DopamineParams = {
  durationMs: 2500,
  dtMs: 25,
  trialCount: 36,
  cueTime: 700,
  rewardTime: 1700,
  rewardSize: 1,
  learningRate: 0.2,
  discount: 0.985,
  traceDecay: 0.92,
  omissionTrial: 28,
};

export const dopaminePresets: DopaminePreset[] = [
  {
    id: "classical-transfer",
    label: "Classical transfer",
    description:
      "A clean teaching baseline where reward prediction error migrates from reward delivery toward the predictive cue over repeated trials.",
    clinicalLens:
      "Use this as the canonical reinforcement-learning scaffold before discussing disease, addiction, or motivational blunting.",
    caution:
      "This is a teaching baseline, not a literal patient phenotype.",
    params: defaultDopamineParams,
  },
  {
    id: "cue-capture",
    label: "Cue capture",
    description:
      "Rapid value back-propagation with a strong cue response and a deeper negative dip when an expected reward is withheld.",
    clinicalLens:
      "Useful when teaching cue-triggered behavior, conditioned wanting, and why predictive cues can become more behaviorally powerful than the reward itself.",
    caution:
      "This is a learning-frame analogy, not a full addiction model.",
    params: {
      ...defaultDopamineParams,
      trialCount: 48,
      rewardSize: 1.3,
      learningRate: 0.28,
      traceDecay: 0.98,
      omissionTrial: 38,
    },
  },
  {
    id: "blunted-transfer",
    label: "Blunted transfer",
    description:
      "Smaller positive responses overall, slower cue takeover, and a shallower omission penalty even after repeated exposure.",
    clinicalLens:
      "Use this as a teaching lens for reduced reward scaling, apathy, hypodopaminergic states, or Parkinsonian reinforcement blunting discussions.",
    caution:
      "Blunting here is illustrative only and should not be treated as a disease simulator.",
    params: {
      ...defaultDopamineParams,
      rewardSize: 0.55,
      learningRate: 0.08,
      traceDecay: 0.7,
      omissionTrial: 0,
    },
  },
  {
    id: "volatile-expectation",
    label: "Volatile expectation",
    description:
      "Fast learning creates brittle expectation: cue responses rise quickly, but omitted reward triggers a disproportionately steep negative signal.",
    clinicalLens:
      "Helpful for teaching the difference between strong prediction and stable control, especially around frustration sensitivity and brittle reward expectation.",
    caution:
      "This is a computational lens for unstable prediction, not a psychiatric diagnosis.",
    params: {
      ...defaultDopamineParams,
      trialCount: 28,
      rewardSize: 1.1,
      learningRate: 0.45,
      discount: 0.93,
      traceDecay: 0.6,
      omissionTrial: 18,
    },
  },
  {
    id: "slow-conditioning",
    label: "Slow conditioning",
    description:
      "Reward responses remain late and cue takeover stays incomplete because learning and temporal-credit assignment are deliberately sluggish.",
    clinicalLens:
      "Useful when teaching early learning, low salience, or incomplete cue assignment without jumping too quickly to pathology.",
    caution:
      "Slow transfer is not the same thing as absent motivation or absent dopamine.",
    params: {
      ...defaultDopamineParams,
      trialCount: 30,
      learningRate: 0.06,
      traceDecay: 0.82,
      omissionTrial: 24,
    },
  },
];

export const dopamineParamDefinitions: DopamineParamDefinition[] = [
  {
    key: "durationMs",
    label: "Trial Duration",
    unit: "ms",
    step: 50,
    min: 1000,
    max: 5000,
  },
  {
    key: "dtMs",
    label: "Time Step",
    unit: "ms",
    step: 5,
    min: 10,
    max: 100,
  },
  {
    key: "trialCount",
    label: "Trials",
    step: 1,
    min: 4,
    max: 80,
  },
  {
    key: "cueTime",
    label: "Cue Time",
    unit: "ms",
    step: 25,
    min: 100,
    max: 4700,
  },
  {
    key: "rewardTime",
    label: "Reward Time",
    unit: "ms",
    step: 25,
    min: 200,
    max: 4900,
  },
  {
    key: "rewardSize",
    label: "Reward Size",
    step: 0.1,
    min: 0.1,
    max: 3,
  },
  {
    key: "learningRate",
    label: "Learning Rate",
    step: 0.01,
    min: 0.01,
    max: 0.8,
  },
  {
    key: "discount",
    label: "Discount",
    step: 0.001,
    min: 0.8,
    max: 0.999,
  },
  {
    key: "traceDecay",
    label: "Trace Decay",
    step: 0.01,
    min: 0,
    max: 1,
  },
  {
    key: "omissionTrial",
    label: "Omission Trial",
    step: 1,
    min: 0,
    max: 80,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}

export function sanitizeDopamineParams(
  params: DopamineParams,
): DopamineParams {
  const next = {
    ...params,
    durationMs: clamp(params.durationMs, 1000, 5000),
    dtMs: clamp(params.dtMs, 10, 100),
    trialCount: Math.floor(clamp(params.trialCount, 4, 80)),
    rewardSize: clamp(params.rewardSize, 0.1, 3),
    learningRate: clamp(params.learningRate, 0.01, 0.8),
    discount: clamp(params.discount, 0.8, 0.999),
    traceDecay: clamp(params.traceDecay, 0, 1),
  };

  next.cueTime = clamp(next.cueTime, 100, next.durationMs - 300);
  next.rewardTime = clamp(next.rewardTime, next.cueTime + 100, next.durationMs - 100);
  next.omissionTrial = Math.floor(clamp(next.omissionTrial, 0, next.trialCount));

  return next;
}

function selectSnapshotTrials(params: DopamineParams) {
  const trials = new Map<number, string>();
  trials.set(1, "Novel reward");
  trials.set(Math.max(2, Math.ceil(params.trialCount / 3)), "Early transfer");
  trials.set(Math.max(3, Math.ceil((params.trialCount * 2) / 3)), "Late transfer");
  trials.set(params.trialCount, "Well learned");

  if (params.omissionTrial > 0 && params.omissionTrial <= params.trialCount) {
    trials.set(params.omissionTrial, "Reward omitted");
  }

  return trials;
}

function eventWindowMetric(
  trace: TracePoint[],
  centerMs: number,
  halfWindowMs: number,
  mode: "max" | "min",
) {
  const start = centerMs - halfWindowMs;
  const end = centerMs + halfWindowMs;
  const points = trace.filter((point) => point.t >= start && point.t <= end);

  if (points.length === 0) {
    return 0;
  }

  return points.reduce((best, point) => {
    return mode === "max"
      ? Math.max(best, point.value)
      : Math.min(best, point.value);
  }, points[0]!.value);
}

function pointNearestTime(trace: TracePoint[], targetMs: number) {
  if (trace.length === 0) {
    return 0;
  }

  let bestPoint = trace[0]!;
  let bestDistance = Math.abs(bestPoint.t - targetMs);

  for (const point of trace) {
    const distance = Math.abs(point.t - targetMs);
    if (distance < bestDistance) {
      bestPoint = point;
      bestDistance = distance;
    }
  }

  return bestPoint.value;
}

function classifyOmissionSeverity(omissionDip: number): "minimal" | "moderate" | "severe" {
  const magnitude = Math.abs(Math.min(0, omissionDip));
  if (magnitude >= 0.55) {
    return "severe";
  }
  if (magnitude >= 0.22) {
    return "moderate";
  }
  return "minimal";
}

function buildInterpretation(
  finalCueResponse: number,
  finalRewardResponse: number,
  omissionDip: number,
  shiftTrial: number | null,
  cueRewardRatio: number,
  transferIndex: number,
  params: DopamineParams,
): DopamineInterpretation {
  const omissionSeverity = classifyOmissionSeverity(omissionDip);
  const shiftLate = shiftTrial === null || shiftTrial > params.trialCount * 0.75;
  const weakSignals =
    Math.max(finalCueResponse, Math.abs(finalRewardResponse), Math.abs(omissionDip)) < 0.2;

  if (weakSignals) {
    return {
      headline: "Low-amplitude reinforcement transfer",
      phenotype: "Blunted transfer",
      mechanism:
        "Prediction errors stay small at both cue and reward time, so value never cleanly migrates toward the cue. The system updates, but not with much vigor.",
      clinicalLens:
        "Use this as a teaching frame for reduced reward scaling, apathy, hypodopaminergic states, or Parkinsonian reinforcement blunting discussions.",
      behaviorSignals: [
        "Cue-triggered behavior stays weak because predictive value never fully takes over.",
        "Reward remains only modestly informative, so learning feels shallow rather than sharp.",
        "Omission hurts less because strong expectation never formed in the first place.",
      ],
      differentialTraps: [
        "Small signals do not prove absent dopamine; low salience and weak temporal-credit assignment can look similar in the model.",
        "Blunted transfer is not the same thing as depression or Parkinson disease in a real patient.",
      ],
      nextQuestions: [
        "Is reward magnitude too small, learning too slow, or trace decay too weak for cue transfer to stabilize?",
        "What changes when reward size rises without changing learning rate?",
      ],
    };
  }

  if (omissionSeverity === "severe" && cueRewardRatio > 1.25) {
    return {
      headline: "Brittle high-expectation learning",
      phenotype: "Volatile expectation",
      mechanism:
        "Cue value rises quickly, but the learned expectation is fragile: once the expected reward fails to appear, the negative prediction error is disproportionately deep.",
      clinicalLens:
        "Helpful when teaching frustration sensitivity, brittle reward expectation, and the difference between strong prediction and stable control.",
      behaviorSignals: [
        "Predictive cues quickly dominate the response profile.",
        "Omission produces a large negative dip because expectation outruns resilience.",
        "Behavior would likely feel highly expectation-bound and abruptly disrupted by reward failure.",
      ],
      differentialTraps: [
        "A large omission dip does not necessarily mean the model is healthier; it can mean the expectation is brittle.",
        "Fast learning is not the same thing as stable learning.",
      ],
      nextQuestions: [
        "Does lowering learning rate or increasing trace stability soften the omission penalty?",
        "How much of the volatility is driven by discounting versus the learning rate itself?",
      ],
    };
  }

  if (shiftLate && finalRewardResponse >= finalCueResponse * 0.7) {
    return {
      headline: "Reward-locked learning",
      phenotype: "Slow or incomplete transfer",
      mechanism:
        "Positive error still rides on reward delivery because the cue has not yet inherited enough value. Temporal-credit assignment remains incomplete.",
      clinicalLens:
        "Useful for teaching early conditioning, low salience, or incomplete cue assignment without overcalling pathology.",
      behaviorSignals: [
        "Reward delivery remains the strongest driver of positive prediction error.",
        "Cue-evoked anticipation is present but does not dominate the trial.",
        "The system behaves as though learning has started but has not consolidated.",
      ],
      differentialTraps: [
        "Late shift does not mean failed learning; it may simply mean the training history is short or the task is low salience.",
        "Reward-dominant traces should not be mistaken for a reward-size problem alone.",
      ],
      nextQuestions: [
        "What happens if trial count increases while all other parameters stay fixed?",
        "Does stronger trace decay or higher discounting better explain the incomplete transfer?",
      ],
    };
  }

  if (cueRewardRatio >= 1.6 && transferIndex > 0) {
    return {
      headline: "Cue-dominant prediction transfer",
      phenotype: "Cue capture",
      mechanism:
        "Most positive error has migrated toward the predictive cue, so the reward itself becomes less surprising while the cue acquires motivational power.",
      clinicalLens:
        "Use this to teach conditioned cue capture, habitization, and why predictive cues can become more behaviorally potent than the reward itself.",
      behaviorSignals: [
        "Cue onset becomes the most behaviorally important event in the trial.",
        "Reward delivery adds little new information once value has moved upstream.",
        "Omission still matters because the system now expects reward before it arrives.",
      ],
      differentialTraps: [
        "Cue dominance is not automatically pathological; it is also the normal signature of well-learned prediction.",
        "High cue response does not mean the reward stopped mattering, only that it stopped being surprising.",
      ],
      nextQuestions: [
        "Does omission sensitivity scale with the same cue that now dominates the positive response?",
        "What happens when reward size changes after the cue has already captured value?",
      ],
    };
  }

  return {
    headline: "Balanced prediction transfer",
    phenotype: "Canonical temporal-difference learning",
    mechanism:
      "The model shows the expected transition from reward surprise toward cue-based prediction without either remaining reward-locked or becoming extremely brittle.",
    clinicalLens:
      "This is the safest teaching frame for baseline reinforcement learning before discussing disease analogies or exaggerated cue capture.",
    behaviorSignals: [
      "Cue response strengthens over time while reward surprise declines.",
      "Omitted reward generates a negative dip once expectation has formed.",
      "Learning is strong enough to shift in time without becoming unstable.",
    ],
    differentialTraps: [
      "A healthy-looking shift does not mean the real brain uses only this single algorithm; this is one explanatory scaffold.",
      "Do not collapse value, salience, pleasure, and vigor into one dopamine label just because the trace is clean.",
    ],
    nextQuestions: [
      "Which parameter changes cue takeover most efficiently in this run: learning rate, discounting, or trace decay?",
      "At what trial does omission become clinically meaningful rather than just mathematically present?",
    ],
  };
}

export function simulateDopamine(input: DopamineParams): DopamineResult {
  const params = sanitizeDopamineParams(input);
  const stepCount = Math.floor(params.durationMs / params.dtMs);
  const cueIndex = Math.round(params.cueTime / params.dtMs);
  const rewardIndex = Math.round(params.rewardTime / params.dtMs);
  const values = Array.from({ length: stepCount + 1 }, () => 0);
  const snapshots: TrialSnapshot[] = [];
  const learningCurve: LearningPoint[] = [];
  const snapshotTrials = selectSnapshotTrials(params);

  for (let trial = 1; trial <= params.trialCount; trial += 1) {
    const rewardDelivered = params.omissionTrial === 0 || trial !== params.omissionTrial;
    const errors: TracePoint[] = [];
    const eligibility = Array.from({ length: stepCount + 1 }, () => 0);

    for (let step = 0; step < stepCount; step += 1) {
      const currentValue = step < cueIndex ? 0 : values[step]!;
      const nextValue = step + 1 < cueIndex ? 0 : values[step + 1]!;
      const reward = rewardDelivered && step === rewardIndex ? params.rewardSize : 0;
      const delta = reward + params.discount * nextValue - currentValue;

      if (step >= cueIndex) {
        for (let index = cueIndex; index <= step; index += 1) {
          eligibility[index]! *= params.discount * params.traceDecay;
        }
        eligibility[step]! += 1;
        for (let index = cueIndex; index <= step; index += 1) {
          values[index]! += params.learningRate * delta * eligibility[index]!;
        }
      }

      errors.push({
        t: round(step * params.dtMs, 2),
        value: round(delta, 4),
      });
    }

    const valueTrace: TracePoint[] = values.slice(0, stepCount).map((value, step) => ({
      t: round(step * params.dtMs, 2),
      value: round(step < cueIndex ? 0 : value, 4),
    }));

    learningCurve.push({
      trial,
      cueError: round(eventWindowMetric(errors, params.cueTime, 80, "max"), 4),
      rewardError: round(
        eventWindowMetric(
          errors,
          params.rewardTime,
          80,
          rewardDelivered ? "max" : "min",
        ),
        4,
      ),
    });

    if (snapshotTrials.has(trial)) {
      snapshots.push({
        trial,
        label: snapshotTrials.get(trial) ?? `Trial ${trial}`,
        rewardDelivered,
        predictionError: errors,
        valueTrace,
      });
    }
  }

  const snapshotMetrics = snapshots.map((snapshot) => ({
    trial: snapshot.trial,
    label: snapshot.label,
    rewardDelivered: snapshot.rewardDelivered,
    cuePeak: round(eventWindowMetric(snapshot.predictionError, params.cueTime, 80, "max"), 4),
    rewardPeak: round(
      eventWindowMetric(
        snapshot.predictionError,
        params.rewardTime,
        80,
        snapshot.rewardDelivered ? "max" : "min",
      ),
      4,
    ),
    cueValue: round(pointNearestTime(snapshot.valueTrace, params.cueTime), 4),
    rewardValue: round(pointNearestTime(snapshot.valueTrace, params.rewardTime), 4),
  }));

  const finalPoint = learningCurve[learningCurve.length - 1];
  const omissionPoint =
    params.omissionTrial > 0 && params.omissionTrial <= learningCurve.length
      ? learningCurve[params.omissionTrial - 1]
      : null;

  let shiftTrial: number | null = null;
  for (const point of learningCurve) {
    if (point.cueError > Math.max(0.02, point.rewardError)) {
      shiftTrial = point.trial;
      break;
    }
  }

  const finalCueResponse = round(finalPoint?.cueError ?? 0, 4);
  const finalRewardResponse = round(finalPoint?.rewardError ?? 0, 4);
  const omissionDip = round(omissionPoint?.rewardError ?? 0, 4);
  const cueRewardRatio = round(
    finalCueResponse / Math.max(Math.abs(finalRewardResponse), 0.05),
    3,
  );
  const transferIndex = round(finalCueResponse - Math.max(0, finalRewardResponse), 4);
  const omissionSeverity = classifyOmissionSeverity(omissionDip);
  const interpretation = buildInterpretation(
    finalCueResponse,
    finalRewardResponse,
    omissionDip,
    shiftTrial,
    cueRewardRatio,
    transferIndex,
    params,
  );

  return {
    params,
    snapshots,
    snapshotMetrics,
    learningCurve,
    summary: {
      finalCueResponse,
      finalRewardResponse,
      omissionDip,
      shiftTrial,
      cueRewardRatio,
      transferIndex,
      omissionSeverity,
      learningRegime: interpretation.phenotype,
    },
    interpretation,
    explanation: {
      model:
        "A temporal-difference learning model used as a teaching scaffold for dopamine-like reward-prediction error signals described by Wolfram Schultz and colleagues.",
      notes: [
        "Unexpected reward produces a strong positive prediction error when the model has not yet assigned value to the cue.",
        "With learning, value back-propagates toward the predictive cue, so positive error shifts earlier in time.",
        "Once expectation is established, omitted reward generates a negative error around the expected reward time.",
        "This model is deliberately explanatory rather than biologically exhaustive: it separates learning transfer, cue capture, and omission sensitivity without claiming to be a literal disease simulator.",
      ],
    },
  };
}
