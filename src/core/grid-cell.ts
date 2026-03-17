export interface GridCellParams {
  arenaSize: number;
  durationSec: number;
  dtMs: number;
  speed: number;
  spacing: number;
  orientation: number;
  phaseX: number;
  phaseY: number;
  sharpness: number;
  maxRate: number;
  thetaMod: number;
  turnNoise: number;
}

export interface GridCellParamDefinition {
  key: keyof GridCellParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface GridPathPoint {
  t: number;
  x: number;
  y: number;
  rateHz: number;
}

export interface GridSpikePoint {
  t: number;
  x: number;
  y: number;
}

export interface GridCellResult {
  params: GridCellParams;
  path: GridPathPoint[];
  spikes: GridSpikePoint[];
  rateMap: number[][];
  summary: {
    spikeCount: number;
    meanRateHz: number;
    coveragePct: number;
    peakRateHz: number;
    orientationDeg: number;
    spacingCm: number;
  };
  explanation: {
    model: string;
    notes: string[];
  };
}

export const defaultGridCellParams: GridCellParams = {
  arenaSize: 120,
  durationSec: 90,
  dtMs: 40,
  speed: 18,
  spacing: 32,
  orientation: 18,
  phaseX: 6,
  phaseY: -4,
  sharpness: 1.8,
  maxRate: 18,
  thetaMod: 0.45,
  turnNoise: 0.22,
};

export const gridCellParamDefinitions: GridCellParamDefinition[] = [
  {
    key: "arenaSize",
    label: "Arena Size",
    unit: "cm",
    step: 5,
    min: 60,
    max: 240,
  },
  {
    key: "durationSec",
    label: "Duration",
    unit: "s",
    step: 5,
    min: 20,
    max: 240,
  },
  {
    key: "dtMs",
    label: "Step",
    unit: "ms",
    step: 5,
    min: 20,
    max: 120,
  },
  {
    key: "speed",
    label: "Speed",
    unit: "cm/s",
    step: 1,
    min: 4,
    max: 60,
  },
  {
    key: "spacing",
    label: "Grid Spacing",
    unit: "cm",
    step: 1,
    min: 12,
    max: 80,
  },
  {
    key: "orientation",
    label: "Orientation",
    unit: "deg",
    step: 1,
    min: -90,
    max: 90,
  },
  {
    key: "phaseX",
    label: "Phase X",
    unit: "cm",
    step: 1,
    min: -120,
    max: 120,
  },
  {
    key: "phaseY",
    label: "Phase Y",
    unit: "cm",
    step: 1,
    min: -120,
    max: 120,
  },
  {
    key: "sharpness",
    label: "Field Sharpness",
    step: 0.1,
    min: 0.4,
    max: 4,
  },
  {
    key: "maxRate",
    label: "Max Rate",
    unit: "Hz",
    step: 1,
    min: 2,
    max: 40,
  },
  {
    key: "thetaMod",
    label: "Theta Mod",
    step: 0.05,
    min: 0,
    max: 1,
  },
  {
    key: "turnNoise",
    label: "Turn Noise",
    step: 0.01,
    min: 0.02,
    max: 0.7,
  },
];
