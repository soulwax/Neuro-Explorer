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

export interface ECGResult {
  params: ECGParams;
  leads: Record<ECGLeadName, ECGPoint[]>;
  activation: {
    beatMs: number;
    frames: ECGActivationFrame[];
    leadAxes: ECGLeadAxis[];
  };
  summary: {
    beatsEstimated: number;
    rrMsNominal: number;
    qtcBazettMs: number;
    electricalAxis: string;
    dominantRhythm: string;
  };
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
    label: "Rhythm Variability",
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
    label: "Baseline Wander",
    unit: "mV",
    step: 0.005,
    min: 0,
    max: 0.25,
  },
  {
    key: "noise",
    label: "Noise",
    unit: "mV",
    step: 0.005,
    min: 0,
    max: 0.15,
  },
  {
    key: "gain",
    label: "Gain",
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
