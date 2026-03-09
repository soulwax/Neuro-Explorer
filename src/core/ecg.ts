export const ecgLeadNames = [
  "I",
  "II",
  "III",
  "aVR",
  "aVL",
  "aVF",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
] as const;

export type ECGLeadName = (typeof ecgLeadNames)[number];

export type ECGPhase =
  | "Baseline"
  | "P wave"
  | "QRS"
  | "ST segment"
  | "T wave";

export interface ECGParams {
  heartRate: number;
  duration: number;
  dt: number;
  axisDegrees: number;
  pAmp: number;
  qrsAmp: number;
  tAmp: number;
  prInterval: number;
  qrsDuration: number;
  qtInterval: number;
  stShift: number;
  rhythmIrregularity: number;
  noise: number;
  baselineWander: number;
  precordialRotation: number;
  gain: number;
}

export interface ECGParamDefinition {
  key: keyof ECGParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface ECGControlGroup {
  id: string;
  label: string;
  description: string;
  keys: ReadonlyArray<keyof ECGParams>;
}

export interface ECGPreset {
  id: string;
  label: string;
  description: string;
  neuroFocus: string;
  params: ECGParams;
}

export interface ECGConsultFrame {
  id: string;
  title: string;
  syndromeFrame: string;
  strongestMechanism: string;
  weakerAlternative: string;
  whyAlternativeWeaker: string;
  nextData: string[];
  teachingPearls: string[];
  linkedPresetId: string;
}

export interface ECGPoint {
  t: number;
  mv: number;
}

export interface ECGLeadAxis {
  name: ECGLeadName;
  group: "limb" | "precordial";
  x: number;
  y: number;
  z: number;
}

export interface ECGActivationFrame {
  t: number;
  phase: ECGPhase;
  vector: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  regions: {
    atria: number;
    septum: number;
    rightVentricle: number;
    leftVentricle: number;
    repolarization: number;
  };
  dominantLead: ECGLeadName;
  dominantProjection: number;
}

export interface ECGBeatLandmarks {
  pOnset: number;
  pPeak: number;
  pOffset: number;
  qrsOnset: number;
  rPeak: number;
  qrsOffset: number;
  tOnset: number;
  tPeak: number;
  tOffset: number;
}

export interface ECGBeatProfile {
  rhythmStripLead: ECGLeadName;
  intervals: {
    rrMs: number;
    prMs: number;
    qrsMs: number;
    qtMs: number;
  };
  landmarks: ECGBeatLandmarks;
}

export interface ECGNeurocardiacSummary {
  autonomicState: string;
  vagalTone: number;
  sympatheticDrive: number;
  respiratoryCoupling: number;
  avNodalBrake: number;
  neurocriticalContext: string;
  hemodynamicRisk: "low" | "moderate" | "high";
  narrative: string;
  notes: string[];
  consultPearls: string[];
  mimicsToAvoid: string[];
  nextData: string[];
  monitoringPriorities: string[];
  redFlags: string[];
}

export interface ECGResult {
  params: ECGParams;
  leads: Record<ECGLeadName, ECGPoint[]>;
  activation: {
    beatMs: number;
    frames: ECGActivationFrame[];
    leadAxes: ECGLeadAxis[];
  };
  beat: ECGBeatProfile;
  summary: {
    beatsEstimated: number;
    rrMsNominal: number;
    qtcBazettMs: number;
    electricalAxis: string;
    dominantRhythm: string;
  };
  neurocardiac: ECGNeurocardiacSummary;
  explanation: {
    model: string;
    notes: string[];
  };
}

export const defaultEcgParams: ECGParams = {
  heartRate: 72,
  duration: 6000,
  dt: 4,
  axisDegrees: 45,
  pAmp: 0.14,
  qrsAmp: 1.1,
  tAmp: 0.34,
  prInterval: 160,
  qrsDuration: 95,
  qtInterval: 380,
  stShift: 0,
  rhythmIrregularity: 0.04,
  noise: 0.015,
  baselineWander: 0.045,
  precordialRotation: 0,
  gain: 1,
};

function preset(overrides: Partial<ECGParams>): ECGParams {
  return {
    ...defaultEcgParams,
    ...overrides,
  };
}

export const ecgPresets: ECGPreset[] = [
  {
    id: "balanced-rest",
    label: "Balanced Rest",
    description:
      "A calm sinus-like baseline with modest respiratory variability and standard conduction timings.",
    neuroFocus:
      "Use this to orient learners before comparing vagal and sympathetic autonomic shifts.",
    params: preset({}),
  },
  {
    id: "high-vagal-tone",
    label: "High Vagal Tone",
    description:
      "Slower sinus discharge, longer AV nodal delay, and clearer beat-to-beat respiratory modulation.",
    neuroFocus:
      "Highlights medullary vagal braking of the SA and AV nodes, as seen in athletic or relaxed states.",
    params: preset({
      heartRate: 52,
      prInterval: 190,
      qtInterval: 410,
      qrsAmp: 0.98,
      rhythmIrregularity: 0.1,
      baselineWander: 0.07,
      noise: 0.01,
      axisDegrees: 38,
    }),
  },
  {
    id: "sympathetic-surge",
    label: "Sympathetic Surge",
    description:
      "Faster rate, reduced variability, brisk AV conduction, and shorter repolarization timing.",
    neuroFocus:
      "Useful for teaching catecholaminergic drive from stress, pain, or exercise preparation.",
    params: preset({
      heartRate: 116,
      prInterval: 130,
      qtInterval: 330,
      tAmp: 0.28,
      qrsAmp: 1.28,
      rhythmIrregularity: 0.015,
      baselineWander: 0.03,
      noise: 0.024,
      axisDegrees: 58,
    }),
  },
  {
    id: "orthostatic-compensation",
    label: "Orthostatic Compensation",
    description:
      "Intermediate tachycardia with reduced sinus variability as the autonomic system defends pressure during posture change.",
    neuroFocus:
      "Frames ECG changes in the context of baroreflex unloading and sympathetic recruitment.",
    params: preset({
      heartRate: 96,
      prInterval: 145,
      qtInterval: 350,
      qrsAmp: 1.18,
      rhythmIrregularity: 0.025,
      baselineWander: 0.038,
      noise: 0.02,
      axisDegrees: 54,
    }),
  },
  {
    id: "neurogenic-catecholamine-surge",
    label: "Neurogenic Catecholamine Surge",
    description:
      "Marked tachycardia, blunted variability, and repolarization compression in a pattern that can tempt overcalling primary cardiac pathology.",
    neuroFocus:
      "Useful for teaching ECG changes after acute CNS stress such as subarachnoid hemorrhage or intense sympathetic discharge.",
    params: preset({
      heartRate: 132,
      prInterval: 124,
      qtInterval: 322,
      tAmp: 0.24,
      qrsAmp: 1.34,
      stShift: -0.04,
      rhythmIrregularity: 0.01,
      baselineWander: 0.022,
      noise: 0.03,
      axisDegrees: 62,
    }),
  },
  {
    id: "autonomic-failure",
    label: "Autonomic Failure",
    description:
      "A relatively fixed rhythm with blunted respiratory variability, minimal sinus lability, and a flatter autonomic signature.",
    neuroFocus:
      "Frames the tracing through impaired autonomic modulation rather than through intrinsic nodal disease alone.",
    params: preset({
      heartRate: 86,
      prInterval: 152,
      qtInterval: 364,
      qrsAmp: 1.08,
      rhythmIrregularity: 0.003,
      baselineWander: 0.012,
      noise: 0.012,
      axisDegrees: 40,
    }),
  },
  {
    id: "raised-icp-vagal-brake",
    label: "Raised ICP Vagal Brake",
    description:
      "Pronounced bradycardia with stronger AV nodal delay, used to discuss centrally driven vagal dominance and neurogenic rhythm change.",
    neuroFocus:
      "Useful when teaching that the brain can slow the heart through central autonomic pressure before the conduction system itself is structurally diseased.",
    params: preset({
      heartRate: 44,
      prInterval: 214,
      qtInterval: 430,
      qrsAmp: 1.04,
      rhythmIrregularity: 0.055,
      baselineWander: 0.05,
      noise: 0.012,
      axisDegrees: 32,
    }),
  },
  {
    id: "postictal-sympathetic-surge",
    label: "Post-ictal Sympathetic Surge",
    description:
      "Fast, adrenergic, and under-variable immediately after a generalized seizure or intense cortical discharge.",
    neuroFocus:
      "Useful for teaching how post-ictal catecholamine physiology can distort the strip before primary cardiac disease is declared.",
    params: preset({
      heartRate: 126,
      prInterval: 132,
      qtInterval: 336,
      qrsAmp: 1.26,
      tAmp: 0.27,
      rhythmIrregularity: 0.008,
      baselineWander: 0.018,
      noise: 0.028,
      axisDegrees: 60,
    }),
  },
  {
    id: "brainstem-autonomic-instability",
    label: "Brainstem Autonomic Instability",
    description:
      "A labile teaching pattern with exaggerated respiratory coupling and unstable nodal braking.",
    neuroFocus:
      "Frames the strip through medullary and pontine autonomic dysregulation rather than fixed intrinsic conduction disease.",
    params: preset({
      heartRate: 68,
      prInterval: 186,
      qtInterval: 396,
      qrsAmp: 1.06,
      rhythmIrregularity: 0.14,
      baselineWander: 0.085,
      noise: 0.018,
      axisDegrees: 28,
    }),
  },
  {
    id: "cushing-response",
    label: "Cushing-like Response",
    description:
      "Marked bradycardia and strong AV nodal braking in a pattern meant to evoke raised-pressure physiology and neurocritical urgency.",
    neuroFocus:
      "Useful when teaching that central pressure and vagal recruitment can produce a high-risk slow strip without primary nodal degeneration.",
    params: preset({
      heartRate: 38,
      prInterval: 224,
      qtInterval: 438,
      qrsAmp: 1.02,
      rhythmIrregularity: 0.045,
      baselineWander: 0.04,
      noise: 0.01,
      axisDegrees: 26,
    }),
  },
];

export const ecgConsultFrames: ECGConsultFrame[] = [
  {
    id: "neurogenic-stress-pattern",
    title: "Acute neurogenic stress pattern",
    syndromeFrame:
      "The tracing is fast, relatively fixed, and catecholamine-weighted. The teaching question is whether the ECG is reflecting primary cardiac disease or an autonomic response to acute CNS injury or severe stress physiology.",
    strongestMechanism:
      "Central sympathetic surge with neurocardiac spillover, producing a tachycardic and repolarization-shifted surface pattern.",
    weakerAlternative: "Primary ACS by ECG appearance alone",
    whyAlternativeWeaker:
      "An isolated tracing cannot outrank the physiology. When sympathetic context is overwhelming, repolarization distortion can be secondary and demands correlation rather than reflexively becoming the diagnosis.",
    nextData: [
      "Serial troponins and dynamic ECG trend rather than one tracing in isolation",
      "Bedside correlation with the neurological trigger, echo pattern, and hemodynamic context",
    ],
    teachingPearls: [
      "Neurogenic ECG changes are often diagnosis-adjacent but not diagnosis-complete.",
      "The wrong move is to let the strip erase the neurological context that generated it.",
    ],
    linkedPresetId: "neurogenic-catecholamine-surge",
  },
  {
    id: "vagotonic-bradycardia",
    title: "Central vagotonic bradycardia",
    syndromeFrame:
      "The strip is slow and shows stronger nodal braking. The teaching task is to decide whether this is a benign or centrally mediated autonomic state versus intrinsic conduction-system disease.",
    strongestMechanism:
      "Increased vagal influence on SA and AV nodal tissue, with bradycardia and PR prolongation expressed at the surface.",
    weakerAlternative: "Primary AV-node or infranodal conduction disease",
    whyAlternativeWeaker:
      "When rate slowing and nodal delay move with a coherent autonomic context, physiology explains the strip more parsimoniously than isolated conduction pathology does.",
    nextData: [
      "Symptom correlation, medication review, and response to autonomic context rather than only interval measurement",
      "Look for parallel signs of raised vagal influence before declaring fixed conduction disease",
    ],
    teachingPearls: [
      "Slow is not synonymous with structural conduction disease.",
      "Autonomic tone can move rate and PR together in a way the bedside story should recognize.",
    ],
    linkedPresetId: "raised-icp-vagal-brake",
  },
  {
    id: "orthostatic-dysautonomia",
    title: "Orthostatic autonomic compensation",
    syndromeFrame:
      "Rate rises and variability narrows as the system defends pressure. The question is whether this is an adaptive baroreflex pattern, early dysautonomia, or a primary tachyarrhythmia label applied too quickly.",
    strongestMechanism:
      "Baroreflex unloading with sympathetic recruitment and relative withdrawal of respiratory sinus modulation.",
    weakerAlternative: "Primary tachyarrhythmia by heart rate alone",
    whyAlternativeWeaker:
      "A modestly fast rhythm without chaotic atrial or ventricular behavior can still be a physiological compensation pattern, especially when it tracks posture and autonomic load.",
    nextData: [
      "Orthostatic vitals and symptom-trigger correlation",
      "Ask whether variability returns with recumbency or reduced autonomic stress",
    ],
    teachingPearls: [
      "Rate must be interpreted with context, not worshiped in isolation.",
      "Autonomic compensation can look dramatic while still being physiologically organized.",
    ],
    linkedPresetId: "orthostatic-compensation",
  },
  {
    id: "fixed-autonomic-output",
    title: "Blunted autonomic modulation",
    syndromeFrame:
      "The tracing looks relatively fixed and under-modulated. The teaching target is impaired autonomic adaptability rather than simply a normal rhythm with nothing to say.",
    strongestMechanism:
      "Reduced autonomic modulation with loss of expected sinus lability and respiratory coupling.",
    weakerAlternative: "Perfectly normal resting sinus rhythm",
    whyAlternativeWeaker:
      "A strip can be organized and still be pathologically rigid if the expected autonomic variability is absent in the right clinical setting.",
    nextData: [
      "Respiratory-linked rhythm review and bedside autonomic testing",
      "Orthostatic history, sweating symptoms, and autonomic reflex correlation",
    ],
    teachingPearls: [
      "Absence of variability can be as informative as excess variability.",
      "A calm strip is not automatically a healthy strip if the physiology should be dynamic.",
    ],
    linkedPresetId: "autonomic-failure",
  },
  {
    id: "postictal-neurocardiac-pattern",
    title: "Post-ictal neurocardiac pattern",
    syndromeFrame:
      "The strip is fast, adrenergic, and relatively rigid immediately after a seizure-like event. The teaching task is to decide whether this is transient cortical-autonomic spillover or primary cardiac disease masquerading as post-ictal physiology.",
    strongestMechanism:
      "Post-ictal sympathetic surge with transient neurocardiac spillover and reduced sinus variability.",
    weakerAlternative: "Primary tachyarrhythmia or ACS by the first strip alone",
    whyAlternativeWeaker:
      "A seizure-timed adrenergic state can produce rate acceleration and repolarization distortion before the heart itself is the main pathology, so trend and context matter more than one strip.",
    nextData: [
      "Serial ECGs and biomarkers rather than a single post-event tracing",
      "Correlate with seizure timing, lactate recovery, and neuro exam rather than reading the strip in isolation",
    ],
    teachingPearls: [
      "The post-ictal strip often says as much about autonomic storm as about myocardium.",
      "A convincing neurological trigger should stay in the differential until serial data remove it.",
    ],
    linkedPresetId: "postictal-sympathetic-surge",
  },
  {
    id: "brainstem-dysautonomia-pattern",
    title: "Brainstem dysautonomia pattern",
    syndromeFrame:
      "The rhythm is labile and over-coupled to autonomic fluctuation. The question is whether the strip is expressing unstable central modulation rather than a fixed nodal lesion.",
    strongestMechanism:
      "Medullary or pontine autonomic dysregulation with unstable vagal-sympathetic balance reaching the SA and AV nodes.",
    weakerAlternative: "Isolated intrinsic conduction disease",
    whyAlternativeWeaker:
      "Intrinsic conduction disease is usually more structurally fixed, while central dysautonomia produces context-dependent lability, respiratory coupling shifts, and mixed nodal expression.",
    nextData: [
      "Trend the strip against posture, respiration, and evolving brainstem signs",
      "Look for bulbar, ocular, or arousal clues that make the autonomic story anatomically coherent",
    ],
    teachingPearls: [
      "A labile strip can be a brainstem clue, not just a cardiac nuisance.",
      "Autonomic instability is a network problem before it is a waveform problem.",
    ],
    linkedPresetId: "brainstem-autonomic-instability",
  },
  {
    id: "cushing-neurocritical-pattern",
    title: "Raised-pressure vagal crisis",
    syndromeFrame:
      "The strip is profoundly slow with stronger nodal braking in a neurocritical context. The teaching task is to read this as a high-risk brain-heart signal rather than a benign athletic rhythm.",
    strongestMechanism:
      "Raised intracranial pressure or Cushing-like vagal recruitment slowing the sinus node and AV conduction.",
    weakerAlternative: "Benign baseline athletic bradycardia",
    whyAlternativeWeaker:
      "Athletic bradycardia is physiologically calm and stable, whereas a neurocritical vagal crisis lives inside a rising-pressure and evolving brain-injury context.",
    nextData: [
      "Immediate neuro exam, pressure context, and hemodynamic trend",
      "Do not separate the bradycardia from the neurological emergency that may be driving it",
    ],
    teachingPearls: [
      "Slow does not mean safe when the brain is supplying the brake.",
      "Context transforms the same surface waveform from benign physiology into neurocritical warning.",
    ],
    linkedPresetId: "cushing-response",
  },
];

export function getEcgPreset(presetId: string) {
  return ecgPresets.find((presetOption) => presetOption.id === presetId);
}

export const ecgParamDefinitions: ECGParamDefinition[] = [
  {
    key: "heartRate",
    label: "Heart Rate",
    unit: "bpm",
    step: 1,
    min: 30,
    max: 220,
  },
  {
    key: "axisDegrees",
    label: "Electrical Axis",
    unit: "deg",
    step: 1,
    min: -180,
    max: 180,
  },
  {
    key: "prInterval",
    label: "PR Interval",
    unit: "ms",
    step: 5,
    min: 80,
    max: 320,
  },
  {
    key: "qrsDuration",
    label: "QRS Duration",
    unit: "ms",
    step: 1,
    min: 50,
    max: 220,
  },
  {
    key: "qtInterval",
    label: "QT Interval",
    unit: "ms",
    step: 5,
    min: 220,
    max: 700,
  },
  {
    key: "pAmp",
    label: "P Amplitude",
    unit: "mV",
    step: 0.01,
    min: 0,
    max: 0.5,
  },
  {
    key: "qrsAmp",
    label: "QRS Amplitude",
    unit: "mV",
    step: 0.05,
    min: 0.2,
    max: 3,
  },
  {
    key: "tAmp",
    label: "T Amplitude",
    unit: "mV",
    step: 0.01,
    min: 0,
    max: 1.2,
  },
  {
    key: "stShift",
    label: "ST Shift",
    unit: "mV",
    step: 0.01,
    min: -0.5,
    max: 0.5,
  },
  {
    key: "rhythmIrregularity",
    label: "Respiratory Variability",
    step: 0.01,
    min: 0,
    max: 0.25,
  },
  {
    key: "precordialRotation",
    label: "Precordial Rotation",
    unit: "deg",
    step: 1,
    min: -45,
    max: 45,
  },
  {
    key: "baselineWander",
    label: "Respiratory Wander",
    unit: "mV",
    step: 0.005,
    min: 0,
    max: 0.25,
  },
  {
    key: "noise",
    label: "Muscle / Motion Noise",
    unit: "mV",
    step: 0.005,
    min: 0,
    max: 0.15,
  },
  {
    key: "gain",
    label: "Display Gain",
    unit: "x",
    step: 0.05,
    min: 0.25,
    max: 3,
  },
  {
    key: "duration",
    label: "Duration",
    unit: "ms",
    step: 250,
    min: 1500,
    max: 12000,
  },
  {
    key: "dt",
    label: "Sample Step",
    unit: "ms",
    step: 1,
    min: 1,
    max: 10,
  },
];

export const ecgControlGroups: ECGControlGroup[] = [
  {
    id: "autonomic",
    label: "Autonomic tone",
    description:
      "Controls that mostly shape sinus rate, respiratory coupling, and baroreflex-style variability.",
    keys: ["heartRate", "rhythmIrregularity", "baselineWander", "noise"],
  },
  {
    id: "conduction",
    label: "Conduction timing",
    description:
      "Intervals that change AV nodal delay, depolarization width, and repolarization timing.",
    keys: ["prInterval", "qrsDuration", "qtInterval", "axisDegrees"],
  },
  {
    id: "morphology",
    label: "Morphology and acquisition",
    description:
      "Amplitude and projection controls that shape what the surface leads record and how strongly they appear.",
    keys: [
      "pAmp",
      "qrsAmp",
      "tAmp",
      "stShift",
      "precordialRotation",
      "gain",
      "duration",
      "dt",
    ],
  },
];
