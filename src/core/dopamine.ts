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

export interface DopamineResult {
  params: DopamineParams;
  snapshots: TrialSnapshot[];
  learningCurve: LearningPoint[];
  summary: {
    finalCueResponse: number;
    finalRewardResponse: number;
    omissionDip: number;
    shiftTrial: number | null;
  };
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
  trials.set(Math.max(2, Math.ceil(params.trialCount / 2)), "Mid learning");
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

  return {
    params,
    snapshots,
    learningCurve,
    summary: {
      finalCueResponse: round(finalPoint?.cueError ?? 0, 4),
      finalRewardResponse: round(finalPoint?.rewardError ?? 0, 4),
      omissionDip: round(omissionPoint?.rewardError ?? 0, 4),
      shiftTrial,
    },
    explanation: {
      model:
        "A temporal-difference learning model approximating dopamine reward-prediction error signals described by Wolfram Schultz and colleagues.",
      notes: [
        "At first, an unexpected reward produces a strong positive prediction error at reward time.",
        "With learning, the error shifts earlier toward the predictive cue as value propagates backward in time.",
        "If reward is omitted after expectation has formed, prediction error becomes negative around the expected reward time.",
      ],
    },
  };
}
