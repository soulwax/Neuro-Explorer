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

export interface GridCellPreset {
  id: string;
  label: string;
  description: string;
  clinicalLens: string;
  caution: string;
  params: GridCellParams;
}

export interface GridCellInterpretation {
  headline: string;
  phenotype: string;
  mechanism: string;
  clinicalLens: string;
  behaviorSignals: string[];
  differentialTraps: string[];
  nextQuestions: string[];
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
    totalDistanceCm: number;
    boundaryBiasPct: number;
    peakToMeanRatio: number;
    thetaState: string;
    navigationRegime: string;
  };
  interpretation: GridCellInterpretation;
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

export const gridCellPresets: GridCellPreset[] = [
  {
    id: "canonical-lattice",
    label: "Canonical lattice",
    description:
      "A balanced entorhinal grid with enough theta modulation and spatial sharpness to display a clean hexagonal teaching pattern.",
    clinicalLens:
      "Use this as the baseline map before discussing navigational fragility, low-resolution fields, or noisy path integration.",
    caution:
      "This is a simplified navigation scaffold, not a literal recording from a patient or rodent.",
    params: defaultGridCellParams,
  },
  {
    id: "theta-locked",
    label: "Theta locked",
    description:
      "Sharper fields and stronger theta modulation emphasize rhythmic, high-contrast spatial sampling.",
    clinicalLens:
      "Helpful for teaching why entorhinal coding is often discussed together with theta state rather than as a static picture.",
    caution:
      "Strong theta structure here is illustrative only and not an EEG claim.",
    params: {
      ...defaultGridCellParams,
      sharpness: 2.6,
      maxRate: 24,
      thetaMod: 0.82,
      turnNoise: 0.12,
      spacing: 30,
    },
  },
  {
    id: "broad-fields",
    label: "Broad fields",
    description:
      "Large spacing and softer field edges produce a lower-resolution map with more diffuse occupancy hot spots.",
    clinicalLens:
      "Useful for teaching the difference between having a spatial code at all and having one that is precise enough for fine navigation.",
    caution:
      "Diffuse fields in this model are not a diagnosis of medial temporal degeneration.",
    params: {
      ...defaultGridCellParams,
      spacing: 48,
      sharpness: 1.05,
      maxRate: 14,
      thetaMod: 0.3,
      speed: 15,
    },
  },
  {
    id: "noisy-explorer",
    label: "Noisy explorer",
    description:
      "Turn noise and weak theta structure degrade map stability, making the field harder to sample cleanly across the arena.",
    clinicalLens:
      "Helpful for teaching why path integration can fail because sampling is noisy, not only because the lattice itself disappeared.",
    caution:
      "Disorganized exploration here is a path-integration analogy, not a full syndrome model.",
    params: {
      ...defaultGridCellParams,
      thetaMod: 0.12,
      turnNoise: 0.58,
      sharpness: 1.2,
      orientation: 34,
      speed: 22,
    },
  },
  {
    id: "compact-room",
    label: "Compact room",
    description:
      "A smaller arena and tighter spacing show how the same lattice logic rescales when the navigational environment shrinks.",
    clinicalLens:
      "Useful for teaching that spatial coding depends on both cell parameters and the environment being explored.",
    caution:
      "A smaller environment here is an experimental frame, not a disease analogy.",
    params: {
      ...defaultGridCellParams,
      arenaSize: 80,
      durationSec: 70,
      spacing: 22,
      sharpness: 2.1,
      phaseX: 2,
      phaseY: -2,
      speed: 14,
    },
  },
];

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

const HEATMAP_BINS = 24;
const DEG_TO_RAD = Math.PI / 180;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 3): number {
  return Number(value.toFixed(digits));
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSeed(params: GridCellParams): number {
  const values = [
    params.arenaSize,
    params.durationSec,
    params.dtMs,
    params.speed,
    params.spacing,
    params.orientation,
    params.phaseX,
    params.phaseY,
    params.sharpness,
    params.maxRate,
    params.thetaMod,
    params.turnNoise,
  ];
  return values.reduce((acc, value, index) => {
    const scaled = Math.round((value + 500) * 1000);
    return (acc ^ (scaled + index * 2654435761)) >>> 0;
  }, 2166136261);
}

function gridRate(x: number, y: number, params: GridCellParams): number {
  const k = (4 * Math.PI) / (Math.sqrt(3) * params.spacing);
  const px = x - params.arenaSize / 2 - params.phaseX;
  const py = y - params.arenaSize / 2 - params.phaseY;
  const baseAngle = params.orientation * DEG_TO_RAD;

  let sum = 0;
  for (let index = 0; index < 3; index += 1) {
    const angle = baseAngle + index * (Math.PI / 3);
    sum += Math.cos(k * (Math.cos(angle) * px + Math.sin(angle) * py));
  }

  return Math.exp(params.sharpness * (sum - 3));
}

function buildInterpretation(
  params: GridCellParams,
  coveragePct: number,
  boundaryBiasPct: number,
  peakToMeanRatio: number,
): GridCellInterpretation {
  if (params.turnNoise > 0.45 || coveragePct < 28) {
    return {
      headline: "Disorganized exploratory sampling",
      phenotype: "Noisy path-integration regime",
      mechanism:
        "The arena is sampled unevenly and turning noise is high enough that the lattice is harder to express as a stable navigational map.",
      clinicalLens:
        "Use this to teach that navigation can fail because sampling and path integration become unstable, not only because the grid pattern itself vanished.",
      behaviorSignals: [
        "Coverage stays patchy instead of evenly tiling the arena.",
        "Rate hot spots exist, but exploration noise makes them hard to sample coherently.",
        "Boundary bias often rises because the trajectory keeps revisiting constrained edges.",
      ],
      differentialTraps: [
        "A messy map here does not diagnose entorhinal degeneration.",
        "Poor coverage can reflect exploratory strategy as much as field quality.",
      ],
      nextQuestions: [
        "Does reducing turn noise rescue the map without touching field sharpness?",
        "How much of the problem is sampling versus the intrinsic lattice parameters?",
      ],
    };
  }

  if (params.thetaMod >= 0.7 && params.sharpness >= 2.3 && peakToMeanRatio >= 3) {
    return {
      headline: "High-fidelity theta-locked lattice",
      phenotype: "Sharp rhythmic grid code",
      mechanism:
        "Strong theta modulation and sharp field structure concentrate firing into crisp spatial hot spots, making the lattice easy to read and compare.",
      clinicalLens:
        "Helpful for teaching why grid-cell discussions often include theta state, phase organization, and movement sampling together.",
      behaviorSignals: [
        "Peak rate clearly stands out above the mean field rate.",
        "The spatial map looks crisp rather than smeared.",
        "Rhythmic structure amplifies the contrast of the field readout.",
      ],
      differentialTraps: [
        "A sharp lattice is not the same thing as perfect navigation in a real organism.",
        "Theta-locked firing here is a conceptual teaching tool, not a direct scalp EEG inference.",
      ],
      nextQuestions: [
        "What happens if theta strength falls while sharpness stays high?",
        "Does the map degrade more from weaker theta or from stronger turn noise?",
      ],
    };
  }

  if (params.spacing >= 42 || params.sharpness <= 1.2) {
    return {
      headline: "Broad low-resolution fields",
      phenotype: "Diffuse spatial code",
      mechanism:
        "Field spacing is wide or the lattice is too soft-edged, so the map still exists but carries less spatial precision per region of the arena.",
      clinicalLens:
        "Useful for teaching that having a spatial code is different from having one precise enough for high-resolution navigation.",
      behaviorSignals: [
        "Rate hot spots are larger and less sharply bounded.",
        "Peak-to-mean contrast is lower than in a crisp lattice.",
        "The field feels more like regional guidance than pinpoint spatial anchoring.",
      ],
      differentialTraps: [
        "Diffuse coding does not mean the system is non-functional.",
        "Large spacing should not be confused with poor sampling alone.",
      ],
      nextQuestions: [
        "Does increasing sharpness or reducing spacing improve precision more quickly?",
        "How much of the diffuse look is caused by the field itself versus the arena scale?",
      ],
    };
  }

  if (params.arenaSize <= 90 && params.spacing <= 26) {
    return {
      headline: "Compact environment remapping",
      phenotype: "Small-room lattice",
      mechanism:
        "The same grid logic is compressed into a smaller arena, so field spacing and environment scale interact to create a tighter map.",
      clinicalLens:
        "Helpful for teaching that navigation coding depends on both intrinsic cell parameters and the environment being sampled.",
      behaviorSignals: [
        "The field tiles a smaller space without losing its hexagonal logic.",
        "Coverage can rise quickly because the arena is easier to traverse repeatedly.",
        "Spacing becomes easier to interpret relative to the environment size.",
      ],
      differentialTraps: [
        "A compact map is not automatically a better map.",
        "Small-room scaling should not be mistaken for stronger theta or sharper cells.",
      ],
      nextQuestions: [
        "What happens if the same field spacing is placed back into a larger arena?",
        "Does the lattice stay interpretable when environment size changes but exploration time does not?",
      ],
    };
  }

  return {
    headline: "Canonical entorhinal lattice",
    phenotype: "Balanced spatial grid code",
    mechanism:
      "The model tiles the arena with a readable hexagonal pattern while preserving enough coverage, rhythm, and field contrast to behave like a stable teaching baseline.",
    clinicalLens:
      "This is the safest baseline for teaching path integration and entorhinal coding before discussing noisy exploration or low-resolution fields.",
    behaviorSignals: [
      "Coverage is broad enough to inspect the whole lattice.",
      "Peak and mean firing remain well separated without becoming extreme.",
      "Theta, field sharpness, and sampling all contribute without one dominating the entire picture.",
    ],
    differentialTraps: [
      "A clean grid pattern does not mean hippocampal coding is irrelevant; this is one node in a larger navigation system.",
      "The model is explanatory rather than biologically exhaustive.",
    ],
    nextQuestions: [
      "Which parameter degrades the map first: spacing, sharpness, theta, or turn noise?",
      "How do environment size and lattice spacing interact in this baseline?",
    ],
  };
}

export function sanitizeGridCellParams(params: GridCellParams): GridCellParams {
  const next = {
    ...params,
    arenaSize: clamp(params.arenaSize, 60, 240),
    durationSec: clamp(params.durationSec, 20, 240),
    dtMs: clamp(params.dtMs, 20, 120),
    speed: clamp(params.speed, 4, 60),
    spacing: clamp(params.spacing, 12, 80),
    orientation: clamp(params.orientation, -90, 90),
    sharpness: clamp(params.sharpness, 0.4, 4),
    maxRate: clamp(params.maxRate, 2, 40),
    thetaMod: clamp(params.thetaMod, 0, 1),
    turnNoise: clamp(params.turnNoise, 0.02, 0.7),
    phaseX: params.phaseX,
    phaseY: params.phaseY,
  };

  next.phaseX = clamp(
    params.phaseX,
    -next.arenaSize / 2,
    next.arenaSize / 2,
  );
  next.phaseY = clamp(
    params.phaseY,
    -next.arenaSize / 2,
    next.arenaSize / 2,
  );

  return next;
}

export function simulateGridCell(input: GridCellParams): GridCellResult {
  const params = sanitizeGridCellParams(input);
  const dtSec = params.dtMs / 1000;
  const steps = Math.floor(params.durationSec / dtSec);
  const rng = createRng(makeSeed(params));
  const path: GridPathPoint[] = [];
  const spikes: GridSpikePoint[] = [];
  const occupancy = Array.from({ length: HEATMAP_BINS }, () =>
    Array.from({ length: HEATMAP_BINS }, () => 0),
  );
  const spikeMap = Array.from({ length: HEATMAP_BINS }, () =>
    Array.from({ length: HEATMAP_BINS }, () => 0),
  );

  let x = params.arenaSize * 0.56;
  let y = params.arenaSize * 0.52;
  let heading = 0.7;
  let peakRateHz = 0;
  let totalDistanceCm = 0;
  let boundaryVisits = 0;

  for (let index = 0; index <= steps; index += 1) {
    const t = index * dtSec;

    heading += (rng() - 0.5) * params.turnNoise;
    heading += 0.04 * Math.sin(t * 0.37) + 0.02 * Math.cos(t * 0.18);

    let dx = Math.cos(heading) * params.speed * dtSec;
    let dy = Math.sin(heading) * params.speed * dtSec;

    if (x + dx < 0 || x + dx > params.arenaSize) {
      heading = Math.PI - heading;
      dx = Math.cos(heading) * params.speed * dtSec;
    }
    if (y + dy < 0 || y + dy > params.arenaSize) {
      heading = -heading;
      dy = Math.sin(heading) * params.speed * dtSec;
    }

    const nextX = clamp(x + dx, 0, params.arenaSize);
    const nextY = clamp(y + dy, 0, params.arenaSize);
    totalDistanceCm += Math.hypot(nextX - x, nextY - y);
    x = nextX;
    y = nextY;

    const wallMargin = params.arenaSize * 0.12;
    if (
      x <= wallMargin ||
      x >= params.arenaSize - wallMargin ||
      y <= wallMargin ||
      y >= params.arenaSize - wallMargin
    ) {
      boundaryVisits += 1;
    }

    const thetaFactor =
      1 -
      params.thetaMod * 0.5 +
      params.thetaMod * 0.5 * (1 + Math.sin(2 * Math.PI * 8 * t));
    const normalizedRate = gridRate(x, y, params);
    const rateHz =
      0.05 + params.maxRate * Math.pow(normalizedRate, 0.92) * thetaFactor;
    const spikeProbability = clamp(rateHz * dtSec, 0, 0.95);
    const spiked = rng() < spikeProbability;

    path.push({
      t: round(t, 2),
      x: round(x, 2),
      y: round(y, 2),
      rateHz: round(rateHz, 3),
    });

    if (spiked) {
      spikes.push({ t: round(t, 2), x: round(x, 2), y: round(y, 2) });
    }

    const binX = clamp(
      Math.floor((x / params.arenaSize) * HEATMAP_BINS),
      0,
      HEATMAP_BINS - 1,
    );
    const binY = clamp(
      Math.floor((y / params.arenaSize) * HEATMAP_BINS),
      0,
      HEATMAP_BINS - 1,
    );
    occupancy[binY]![binX]! += dtSec;
    if (spiked) {
      spikeMap[binY]![binX]! += 1;
    }

    peakRateHz = Math.max(peakRateHz, rateHz);
  }

  let visitedBins = 0;
  const rateMap = occupancy.map((row, rowIndex) =>
    row.map((seconds, colIndex) => {
      if (seconds <= 0) {
        return 0;
      }
      visitedBins += 1;
      return round(spikeMap[rowIndex]![colIndex]! / seconds, 2);
    }),
  );

  const meanRateHz = round(spikes.length / params.durationSec, 2);
  const coveragePct = round(
    (visitedBins / (HEATMAP_BINS * HEATMAP_BINS)) * 100,
    1,
  );
  const boundaryBiasPct = round((boundaryVisits / path.length) * 100, 1);
  const peakToMeanRatio = round(peakRateHz / Math.max(meanRateHz, 0.5), 2);
  const thetaState =
    params.thetaMod >= 0.7
      ? "theta locked"
      : params.thetaMod >= 0.35
        ? "mixed theta drive"
        : "weak theta drive";
  const interpretation = buildInterpretation(
    params,
    coveragePct,
    boundaryBiasPct,
    peakToMeanRatio,
  );

  return {
    params,
    path,
    spikes,
    rateMap,
    summary: {
      spikeCount: spikes.length,
      meanRateHz,
      coveragePct,
      peakRateHz: round(peakRateHz, 2),
      orientationDeg: round(params.orientation, 1),
      spacingCm: round(params.spacing, 1),
      totalDistanceCm: round(totalDistanceCm, 1),
      boundaryBiasPct,
      peakToMeanRatio,
      thetaState,
      navigationRegime: interpretation.phenotype,
    },
    interpretation,
    explanation: {
      model:
        "A simplified entorhinal grid-cell firing field generated from three cosine gratings separated by 60 degrees and modulated by exploratory sampling plus theta state.",
      notes: [
        "Grid cells tile physical space with a hexagonal lattice that supports path integration and spatial mapping.",
        "Changing spacing rescales the lattice, while orientation rotates the whole firing pattern in the arena.",
        "Theta modulation changes how strongly rhythmic state shapes the expressed firing pattern, not just how pretty the trace looks.",
        "A weak map can reflect noisy exploration or poor coverage as much as the intrinsic field geometry.",
      ],
    },
  };
}
