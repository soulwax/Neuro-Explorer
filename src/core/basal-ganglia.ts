export interface BasalGangliaParams {
  corticalDrive: number;
  dopamineTone: number;
  directPathwayGain: number;
  indirectPathwayGain: number;
  hyperdirectBrake: number;
  cueSupport: number;
  networkNoise: number;
}

export interface BasalGangliaParamDefinition {
  key: keyof BasalGangliaParams;
  label: string;
  min: number;
  max: number;
  step: number;
  detail: string;
}

export interface BasalGangliaPreset {
  id: string;
  label: string;
  summary: string;
  phenotype: string;
  strongestLocalization: string;
  clinicalLens: string;
  caution: string;
  params: BasalGangliaParams;
  bedsideClues: string[];
  differentialClues: string[];
  teachingPearls: string[];
  nextQuestions: string[];
}

export interface BasalGangliaMetrics {
  directFlow: number;
  indirectFlow: number;
  hyperdirectFlow: number;
  pallidalBrake: number;
  thalamicRelease: number;
  movementVigor: number;
  selectionStability: number;
  cueLeverage: number;
  medicationResponse: number;
  freezingRisk: number;
  unwantedMovementRisk: number;
  dyskinesiaRisk: number;
}

export interface BasalGangliaSummary {
  dominantRegime: string;
  gateState: string;
  motorState: string;
  cueDependence: string;
  therapyWindow: string;
}

export interface BasalGangliaInterpretation {
  headline: string;
  phenotype: string;
  mechanism: string;
  clinicalLens: string;
  behaviorSignals: string[];
  teachingPearls: string[];
  differentialTraps: string[];
  nextQuestions: string[];
}

export interface BasalGangliaSimulationResult {
  params: BasalGangliaParams;
  metrics: BasalGangliaMetrics;
  summary: BasalGangliaSummary;
  interpretation: BasalGangliaInterpretation;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function toPct(value: number) {
  return Math.round(clamp01(value) * 100);
}

function describeCueDependence(value: number) {
  if (value >= 70) {
    return "high cue dependence";
  }
  if (value >= 45) {
    return "moderate cue dependence";
  }
  return "low cue dependence";
}

function describeTherapyWindow(value: number) {
  if (value >= 70) {
    return "wide dopamine-responsive window";
  }
  if (value >= 45) {
    return "partial medication leverage";
  }
  return "limited dopamine leverage";
}

function describeGateState(pallidalBrake: number, thalamicRelease: number) {
  if (pallidalBrake >= 72) {
    return "locked pallidal gate";
  }
  if (pallidalBrake >= 56) {
    return "over-braked gate";
  }
  if (thalamicRelease >= 66) {
    return "under-braked release state";
  }
  return "balanced gating";
}

function buildInterpretation(metrics: BasalGangliaMetrics): BasalGangliaInterpretation {
  const behaviorSignals: string[] = [];
  const teachingPearls: string[] = [];
  const differentialTraps: string[] = [];
  const nextQuestions: string[] = [];

  let headline = "Balanced loop competition with usable thalamic release";
  let phenotype = "Balanced action selection";
  let mechanism =
    "Direct facilitation, indirect suppression, and hyperdirect stopping remain close enough to keep thalamic release available without spilling into uncontrolled movement.";
  let clinicalLens =
    "Think of this as a loop that can scale and stop movement without making the learner choose between pure weakness and pure ataxia.";

  if (metrics.dyskinesiaRisk >= 68) {
    headline = "Dopaminergic overshoot with dyskinetic spill";
    phenotype = "Hyperkinetic release state";
    mechanism =
      "Direct-pathway facilitation now outruns indirect and hyperdirect braking, so the thalamocortical gate opens too easily and extra movement fragments leak into the motor stream.";
    clinicalLens =
      "This is the teaching frame for peak-dose dyskinesia: more movement is not the same thing as better movement, because the loop is overshooting its target.";
  } else if (metrics.unwantedMovementRisk >= 62) {
    headline = "Indirect-pathway underbraking with excessive release";
    phenotype = "Suppression failure";
    mechanism =
      "The indirect brake is no longer strong enough to contain competing motor programs, so unwanted movement escapes when the thalamus is released too broadly.";
    clinicalLens =
      "Use this frame for chorea or ballistic movement when the key problem is failed suppression rather than improved vigor.";
  } else if (metrics.freezingRisk >= 62 && metrics.movementVigor <= 52) {
    headline = "Conflict-sensitive gate lock and freezing bias";
    phenotype = "Freezing-prone hypokinetic state";
    mechanism =
      "Dopamine depletion combines with heavy hyperdirect braking, so the system can still stop but struggles to re-initiate movement once conflict or turning demands appear.";
    clinicalLens =
      "This is the axial-freezing teaching frame: the patient is not weak, but the loop cannot release movement cleanly when the task becomes complex.";
  } else if (metrics.movementVigor <= 46) {
    headline = "Dopamine-depleted under-scaling of movement";
    phenotype = "Hypokinetic basal ganglia syndrome";
    mechanism =
      "Reduced dopaminergic support weakens direct facilitation and leaves indirect braking relatively dominant, so the pallidal output stays too inhibitory and self-initiated movement loses amplitude.";
    clinicalLens =
      "Think parkinsonian bradykinesia and rigidity rather than corticospinal weakness: movement is too small and too hard to release, not absent because the tract is disconnected.";
  }

  if (metrics.movementVigor <= 50) {
    behaviorSignals.push(
      "Self-initiated movement should look underscaled, slower, and less automatic than seated strength testing predicts.",
    );
  }
  if (metrics.cueLeverage >= 55) {
    behaviorSignals.push(
      "External cueing should help gait initiation or step amplitude more than it helps a pure pyramidal weakness syndrome.",
    );
  }
  if (metrics.freezingRisk >= 58) {
    behaviorSignals.push(
      "Doorways, turning, and dual-task load should provoke fragmentation or outright freezing before they cause true weakness.",
    );
  }
  if (metrics.unwantedMovementRisk >= 56) {
    behaviorSignals.push(
      "Unwanted movement fragments should appear as overflow, chorea, dystonic intrusion, or ballistic release rather than as cerebellar decomposition.",
    );
  }
  if (metrics.dyskinesiaRisk >= 60) {
    behaviorSignals.push(
      "Medication state matters: the loop may move from useful release into writhing or fidgety excess when dopaminergic support overshoots.",
    );
  }
  if (behaviorSignals.length === 0) {
    behaviorSignals.push(
      "Automatic movement scaling, stopping, and suppression remain in workable balance under this parameter set.",
    );
  }

  teachingPearls.push(
    "Basal ganglia loops select and scale movement; they do not simply flip movement on and off.",
  );
  if (metrics.cueLeverage >= 55) {
    teachingPearls.push(
      "Strong cue benefit means the loop can still move when external structure helps it clear the gate.",
    );
  }
  if (metrics.dyskinesiaRisk >= 60) {
    teachingPearls.push(
      "Medication response is a window, not a ramp: the same therapy that rescues release can overshoot into dyskinesia.",
    );
  } else if (metrics.unwantedMovementRisk >= 56) {
    teachingPearls.push(
      "Hyperkinetic states are most teachable as suppression failures of competing motor programs.",
    );
  } else if (metrics.freezingRisk >= 58) {
    teachingPearls.push(
      "Freezing is a transition failure with too much fast braking, not a generic form of severe weakness.",
    );
  } else {
    teachingPearls.push(
      "A workable loop keeps direct release, indirect suppression, and rapid stopping close enough to stay flexible.",
    );
  }

  if (metrics.cueLeverage >= 55) {
    differentialTraps.push(
      "Cue-responsive hypokinesia argues for basal ganglia loop dysfunction, not a pure corticospinal output lesion.",
    );
  }
  if (metrics.unwantedMovementRisk >= 56) {
    differentialTraps.push(
      "Do not collapse all excess movement into 'too much dopamine' when indirect-pathway or subthalamic underbraking is the tighter circuit explanation.",
    );
  }
  if (metrics.selectionStability <= 48) {
    differentialTraps.push(
      "Irregular movement does not automatically mean cerebellum if the phenotype is built around gating failure, cue response, or medication state shifts.",
    );
  }
  differentialTraps.push(
    "Rigidity and bradykinesia localize differently from primary weakness: the movement can be generated, but the gate releases it poorly.",
  );

  nextQuestions.push(
    "How much do external rhythm, visual stripes, or strong cueing improve movement initiation and amplitude?",
  );
  if (metrics.dyskinesiaRisk >= 56) {
    nextQuestions.push(
      "Does the phenotype fluctuate with medication timing enough to separate useful release from peak-dose overshoot?",
    );
  } else {
    nextQuestions.push(
      "Does medication timing change the phenotype, or is the main bottleneck conflict-sensitive freezing and axial control?",
    );
  }
  if (metrics.unwantedMovementRisk >= 56) {
    nextQuestions.push(
      "Are the unwanted movements patterned and suppressible, or are they broad, violent releases that suggest subthalamic failure?",
    );
  } else {
    nextQuestions.push(
      "Are there corticospinal, cerebellar, or sensory findings that would pull the case out of a basal ganglia loop explanation?",
    );
  }

  return {
    headline,
    phenotype,
    mechanism,
    clinicalLens,
    behaviorSignals,
    teachingPearls,
    differentialTraps,
    nextQuestions,
  };
}

export const defaultBasalGangliaParams: BasalGangliaParams = {
  corticalDrive: 62,
  dopamineTone: 58,
  directPathwayGain: 60,
  indirectPathwayGain: 52,
  hyperdirectBrake: 40,
  cueSupport: 38,
  networkNoise: 26,
};

export const basalGangliaParamDefinitions: BasalGangliaParamDefinition[] = [
  {
    key: "corticalDrive",
    label: "Cortical drive",
    min: 20,
    max: 100,
    step: 1,
    detail: "How much movement demand reaches the loop from frontal-motor cortex.",
  },
  {
    key: "dopamineTone",
    label: "Dopamine tone",
    min: 0,
    max: 100,
    step: 1,
    detail: "Facilitates direct-pathway release and restrains indirect overbraking.",
  },
  {
    key: "directPathwayGain",
    label: "Direct pathway",
    min: 0,
    max: 100,
    step: 1,
    detail: "How strongly the D1 pathway disinhibits thalamocortical output.",
  },
  {
    key: "indirectPathwayGain",
    label: "Indirect pathway",
    min: 0,
    max: 100,
    step: 1,
    detail: "How strongly the D2 route suppresses competing motor programs.",
  },
  {
    key: "hyperdirectBrake",
    label: "Hyperdirect brake",
    min: 0,
    max: 100,
    step: 1,
    detail: "Rapid stop-signal drive through cortex-STN-GPi during conflict or task switching.",
  },
  {
    key: "cueSupport",
    label: "Cue support",
    min: 0,
    max: 100,
    step: 1,
    detail: "How much external rhythm or environmental structure can rescue movement release.",
  },
  {
    key: "networkNoise",
    label: "Network noise",
    min: 0,
    max: 100,
    step: 1,
    detail: "Competing oscillation, variability, and unstable loop selection pressure.",
  },
];

export const basalGangliaPresets: BasalGangliaPreset[] = [
  {
    id: "balanced-selection",
    label: "Balanced selection",
    summary:
      "A reference loop where direct release, indirect suppression, and rapid stopping stay in reasonable balance.",
    phenotype: "Balanced action selection",
    strongestLocalization:
      "Healthy cortico-striato-pallido-thalamo-cortical competition with enough brake to suppress noise but enough release to scale movement.",
    clinicalLens:
      "Use this baseline before teaching pathology so learners can see that basal ganglia circuitry is about selecting and scaling movement, not simply turning movement on or off.",
    caution:
      "This is a teaching baseline, not a claim that healthy motor control is static or context-free.",
    params: defaultBasalGangliaParams,
    bedsideClues: [
      "Self-initiated and externally cued movement are both available.",
      "Stopping is possible without the gait collapsing into freezing.",
      "Unwanted movement is contained without excessive rigidity or hypokinesia.",
    ],
    differentialClues: [
      "A normal loop does not look purely cerebellar, pyramidal, or sensory because no single failure mode dominates the pattern.",
      "The key teaching move is to compare pathology against this baseline rather than memorizing separate disease lists.",
    ],
    teachingPearls: [
      "Direct and indirect pathways are partners, not enemies: one releases the chosen program while the other suppresses competitors.",
      "The hyperdirect route matters most when the learner has to explain fast stopping, conflict, or turning hesitation.",
    ],
    nextQuestions: [
      "What changes first when dopamine falls: movement vigor, cue dependence, or suppression of unwanted movement?",
      "Which bedside task exposes hyperdirect braking better: straight walking, turning, or dual-task gait?",
    ],
  },
  {
    id: "parkinson-off",
    label: "Parkinson off",
    summary:
      "Low dopaminergic support with excessive pallidal brake, reduced movement vigor, and high cue dependence.",
    phenotype: "Hypokinetic parkinsonian state",
    strongestLocalization:
      "Nigrostriatal dopamine depletion shifting the loop toward indirect and hyperdirect dominance.",
    clinicalLens:
      "This is the classic under-released movement state: bradykinesia, rigidity, and small automatic movements without a true corticospinal disconnect.",
    caution:
      "Parkinsonism is a syndrome, not one disease. Use the loop logic before deciding whether the pattern is idiopathic, atypical, vascular, or drug-induced.",
    params: {
      corticalDrive: 56,
      dopamineTone: 18,
      directPathwayGain: 48,
      indirectPathwayGain: 76,
      hyperdirectBrake: 64,
      cueSupport: 78,
      networkNoise: 34,
    },
    bedsideClues: [
      "Self-initiated movement is reduced more than raw leg strength or bedside power testing would predict.",
      "Cueing improves step size and initiation better than it improves true weakness.",
      "Turns and doorway transitions reveal the gate problem more clearly than straight walking alone.",
    ],
    differentialClues: [
      "Pure corticospinal weakness is weaker when the problem is amplitude and release rather than loss of force.",
      "A frontal gait disorder becomes weaker when external cueing and medication state clearly change the phenotype.",
    ],
    teachingPearls: [
      "Bradykinesia is not just 'slowness'; it is underscaled movement with delayed release and reduced automaticity.",
      "Rigidity and freezing travel with overbraking, not with cerebellar decomposition.",
    ],
    nextQuestions: [
      "How much does cueing or levodopa improve step amplitude, arm swing, or turning?",
      "Is the main bottleneck generalized hypokinesia or conflict-sensitive freezing?",
    ],
  },
  {
    id: "dopamine-on",
    label: "Medication on",
    summary:
      "Recovered thalamic release with better movement vigor but still enough brake to avoid broad hyperkinetic spill.",
    phenotype: "Responsive parkinsonian loop",
    strongestLocalization:
      "Dopamine-repleted basal ganglia loop with improved direct facilitation and partially normalized indirect restraint.",
    clinicalLens:
      "Teach this as the useful therapeutic target: larger, smoother movement without losing all suppression of unwanted programs.",
    caution:
      "Improvement with dopaminergic therapy supports a basal ganglia loop diagnosis, but it does not by itself settle which parkinsonian syndrome is present.",
    params: {
      corticalDrive: 64,
      dopamineTone: 68,
      directPathwayGain: 72,
      indirectPathwayGain: 46,
      hyperdirectBrake: 42,
      cueSupport: 60,
      networkNoise: 32,
    },
    bedsideClues: [
      "Stride length, movement amplitude, and initiation are clearly better than in the off state.",
      "Cueing still helps, but the loop no longer depends on it as heavily to release movement.",
      "Stopping remains possible without severe freezing or broad hyperkinetic overflow.",
    ],
    differentialClues: [
      "If movement improves but suppression collapses, you may have moved past the useful on state into dyskinetic overshoot.",
      "A cerebellar gait remains weaker if improvement tracks medication timing more than stance width or dysmetria.",
    ],
    teachingPearls: [
      "A good on state is not normal physiology, but it demonstrates that the gate can still be pharmacologically rebalanced.",
      "Teach learners to compare off, on, and dyskinetic states as three different loop configurations rather than as one disease with one severity score.",
    ],
    nextQuestions: [
      "Which signs improve first with medication: gait initiation, bradykinesia, rigidity, or tremor?",
      "How close is the patient to the edge where useful release turns into overshoot?",
    ],
  },
  {
    id: "freezing-overbrake",
    label: "Freezing overbrake",
    summary:
      "Heavy hyperdirect stopping pressure creates a conflict-sensitive gate lock even when some movement can still be generated.",
    phenotype: "Freezing-prone axial state",
    strongestLocalization:
      "Cortex-STN-GPi overbraking layered on top of a hypokinetic loop, especially during turns or competing task demands.",
    clinicalLens:
      "This is the frame for patients who can move in some contexts but repeatedly fail to launch or continue movement when the task becomes complex.",
    caution:
      "Not every start hesitation is basal ganglia. Frontal gait disorders remain in the differential when cueing helps little and cognitive-urinary features dominate.",
    params: {
      corticalDrive: 58,
      dopamineTone: 30,
      directPathwayGain: 44,
      indirectPathwayGain: 70,
      hyperdirectBrake: 88,
      cueSupport: 74,
      networkNoise: 40,
    },
    bedsideClues: [
      "Straight walking may look better than turning, doorway entry, or dual-task transitions.",
      "The first step fails because the gate cannot release cleanly under conflict, not because the leg is too weak.",
      "External cueing can rescue the pattern, but only if the environmental demand is simplified enough.",
    ],
    differentialClues: [
      "Frontal gait apraxia is weaker when rhythmic cueing and medication state still shift the phenotype substantially.",
      "Pure anxiety does not explain a reproducible doorway and turn signature with otherwise preserved leg power.",
    ],
    teachingPearls: [
      "The hyperdirect pathway is the fast brake. When it dominates, the patient can stop but struggles to restart.",
      "Freezing is a selection-and-transition failure, not simply severe bradykinesia turned up louder.",
    ],
    nextQuestions: [
      "Does the phenotype worsen more with turning and dual-tasking than with a straight fast walk?",
      "Does simplifying the environment or adding strong cueing reduce the gate lock?",
    ],
  },
  {
    id: "peak-dose-dyskinesia",
    label: "Peak-dose dyskinesia",
    summary:
      "Excess dopaminergic support with high direct release and unstable suppression pushes the loop into hyperkinetic overshoot.",
    phenotype: "Dyskinetic overshoot",
    strongestLocalization:
      "Medication-driven direct-pathway excess with insufficient restraint from indirect and hyperdirect braking.",
    clinicalLens:
      "Teach this as the point where better movement amplitude becomes uncontrolled movement, because thalamic release is now too easy and too noisy.",
    caution:
      "This is not the same as chorea from structural indirect-pathway failure. Medication timing and state fluctuation remain the decisive discriminators.",
    params: {
      corticalDrive: 66,
      dopamineTone: 88,
      directPathwayGain: 82,
      indirectPathwayGain: 28,
      hyperdirectBrake: 28,
      cueSupport: 46,
      networkNoise: 58,
    },
    bedsideClues: [
      "Amplitude is no longer the main problem; overflow and writhing fragments dominate the movement pattern.",
      "The hyperkinetic state often tracks medication peaks rather than remaining constant across the day.",
      "Suppressing extra movement is harder than generating movement itself.",
    ],
    differentialClues: [
      "A structural chorea syndrome is weaker when the phenotype rises and falls with dopaminergic dosing.",
      "Cerebellar ataxia is weaker because the movement excess looks like spill and overflow, not error-correction failure.",
    ],
    teachingPearls: [
      "More dopamine is not always more normal. The loop has an optimal window, not a linear benefit curve.",
      "Always teach useful on-state and dyskinetic overshoot side by side so learners stop treating them as the same thing.",
    ],
    nextQuestions: [
      "How tightly does the movement excess follow medication timing?",
      "Can the patient suppress or redirect the overflow, or does it break through regardless of task context?",
    ],
  },
  {
    id: "indirect-collapse",
    label: "Indirect collapse",
    summary:
      "Marked underbraking of competing motor programs with broad thalamic release and unstable suppression.",
    phenotype: "Choreic under-suppression",
    strongestLocalization:
      "Indirect-pathway failure or striatal suppression loss, as in hyperkinetic loop disorders such as Huntington disease.",
    clinicalLens:
      "The teaching point here is failed suppression: the system is not simply energetic, it is releasing too many motor fragments that should have stayed inhibited.",
    caution:
      "This is still a simplification. Real chorea includes cortical, cognitive, psychiatric, and sensory timing features that extend beyond one scalar loop model.",
    params: {
      corticalDrive: 62,
      dopamineTone: 54,
      directPathwayGain: 74,
      indirectPathwayGain: 16,
      hyperdirectBrake: 22,
      cueSupport: 32,
      networkNoise: 54,
    },
    bedsideClues: [
      "Movement fragments intrude unpredictably rather than staying locked in one patterned dystonic posture.",
      "The main failure is suppressive containment, not improved voluntary scaling.",
      "Cueing helps less than in dopamine-depleted hypokinetic states because the problem is not simple under-release.",
    ],
    differentialClues: [
      "Peak-dose dyskinesia is weaker when the hyperkinetic state is not clearly medication-linked.",
      "A pure cerebellar explanation is weaker when the movement looks like random release of competing programs rather than inaccurate targeting.",
    ],
    teachingPearls: [
      "Indirect-pathway failure is the fastest circuit way to explain why too many movements escape.",
      "Teach chorea as loss of suppression before you teach it as 'dance-like movement.'",
    ],
    nextQuestions: [
      "Does the pattern fluctuate with medication state, or is it more structurally persistent?",
      "Are there cognitive or psychiatric features that fit a broader striatal syndrome?",
    ],
  },
];

export function getBasalGangliaPreset(id: string) {
  return basalGangliaPresets.find((preset) => preset.id === id);
}

export function simulateBasalGanglia(
  params: BasalGangliaParams,
): BasalGangliaSimulationResult {
  const cortical = params.corticalDrive / 100;
  const dopamine = params.dopamineTone / 100;
  const directGain = params.directPathwayGain / 100;
  const indirectGain = params.indirectPathwayGain / 100;
  const hyperdirect = params.hyperdirectBrake / 100;
  const cue = params.cueSupport / 100;
  const noise = params.networkNoise / 100;

  const directFlow = clamp01(
    cortical * (0.34 + directGain * 0.66) * (0.25 + dopamine * 0.85),
  );
  const indirectFlow = clamp01(
    cortical * (0.24 + indirectGain * 0.76) * (1.08 - dopamine * 0.62),
  );
  const hyperdirectFlow = clamp01(
    (0.18 + cortical * 0.52) * (0.38 + hyperdirect * 0.62) * (0.84 + noise * 0.34),
  );
  const pallidalBrake = clamp01(
    0.28 +
      indirectFlow * 0.56 +
      hyperdirectFlow * 0.42 -
      directFlow * 0.68 +
      Math.max(0, noise - 0.68) * 0.12,
  );
  const thalamicRelease = clamp01(1 - pallidalBrake);
  const movementVigor = clamp01(
    thalamicRelease * 0.72 + dopamine * 0.16 + cue * 0.12 - noise * 0.18,
  );
  const selectionStability = clamp01(
    1 -
      noise * 0.55 -
      Math.max(0, directFlow - indirectFlow - 0.18) * 0.5 -
      Math.max(0, indirectFlow - directFlow - 0.22) * 0.28 +
      Math.min(directFlow, indirectFlow) * 0.22,
  );
  const cueLeverage = clamp01(
    cue * 0.48 +
      Math.max(0, 0.6 - movementVigor) * 0.25 +
      (1 - dopamine) * 0.18 -
      noise * 0.14,
  );
  const medicationResponse = clamp01(
    (1 - dopamine) * 0.56 +
      Math.max(0, 0.62 - directFlow) * 0.26 -
      Math.max(0, hyperdirectFlow - 0.55) * 0.15 -
      Math.max(0, noise - 0.5) * 0.2,
  );
  const freezingRisk = clamp01(
    (1 - dopamine) * 0.3 +
      hyperdirectFlow * 0.34 +
      Math.max(0, pallidalBrake - 0.55) * 0.36 -
      cue * 0.18,
  );
  const unwantedMovementRisk = clamp01(
    Math.max(0, directFlow - indirectFlow * 0.72 - hyperdirectFlow * 0.28) * 1.2 +
      noise * 0.3,
  );
  const dyskinesiaRisk = clamp01(
    Math.max(0, dopamine - 0.68) * 0.7 +
      Math.max(0, directFlow - indirectFlow) * 0.36 +
      noise * 0.18,
  );

  const metrics: BasalGangliaMetrics = {
    directFlow: toPct(directFlow),
    indirectFlow: toPct(indirectFlow),
    hyperdirectFlow: toPct(hyperdirectFlow),
    pallidalBrake: toPct(pallidalBrake),
    thalamicRelease: toPct(thalamicRelease),
    movementVigor: toPct(movementVigor),
    selectionStability: toPct(selectionStability),
    cueLeverage: toPct(cueLeverage),
    medicationResponse: toPct(medicationResponse),
    freezingRisk: toPct(freezingRisk),
    unwantedMovementRisk: toPct(unwantedMovementRisk),
    dyskinesiaRisk: toPct(dyskinesiaRisk),
  };

  let dominantRegime = "balanced selection";
  let motorState = "stable movement release";
  if (metrics.dyskinesiaRisk >= 68) {
    dominantRegime = "direct-pathway overshoot";
    motorState = "hyperkinetic overshoot";
  } else if (metrics.unwantedMovementRisk >= 62) {
    dominantRegime = "indirect suppression failure";
    motorState = "hyperkinetic release";
  } else if (metrics.freezingRisk >= 62 && metrics.movementVigor <= 52) {
    dominantRegime = "hyperdirect overbraking";
    motorState = "freezing-prone hypokinesia";
  } else if (metrics.movementVigor <= 46) {
    dominantRegime = "dopamine-depleted underrelease";
    motorState = "hypokinetic output";
  }

  return {
    params,
    metrics,
    summary: {
      dominantRegime,
      gateState: describeGateState(metrics.pallidalBrake, metrics.thalamicRelease),
      motorState,
      cueDependence: describeCueDependence(metrics.cueLeverage),
      therapyWindow: describeTherapyWindow(metrics.medicationResponse),
    },
    interpretation: buildInterpretation(metrics),
  };
}
