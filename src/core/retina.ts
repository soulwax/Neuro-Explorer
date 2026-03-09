export type StimulusType = "spot" | "annulus" | "edge";

export interface RetinaParams {
  gridSize: number;
  centerSigma: number;
  surroundSigma: number;
  surroundStrength: number;
  stimulusType: StimulusType;
  stimulusRadius: number;
  annulusWidth: number;
  stimulusX: number;
  stimulusY: number;
  contrast: number;
}

export interface RetinaParamDefinition {
  key: Exclude<keyof RetinaParams, "stimulusType">;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface MatrixPoint {
  x: number;
  y: number;
  value: number;
}

export interface CurvePoint {
  x: number;
  value: number;
}

export interface RetinaSummary {
  preferredSpotRadius: number;
  suppressionTroughOffset: number;
  edgeResponse: number;
  annulusResponse: number;
  centerMass: number;
  surroundMass: number;
  operatingMode: "Center dominated" | "Balanced" | "Surround dominated";
}

export interface RetinaResult {
  params: RetinaParams;
  receptiveField: MatrixPoint[];
  stimulus: MatrixPoint[];
  response: number;
  sizeTuning: CurvePoint[];
  positionScan: CurvePoint[];
  summary: RetinaSummary;
  explanation: {
    model: string;
    notes: string[];
  };
}

export type RetinaPhysiologyPresetId =
  | "foveal-sampling"
  | "balanced-on-center"
  | "surround-overdrive"
  | "edge-prioritization";

export interface RetinaPhysiologyPreset {
  id: RetinaPhysiologyPresetId;
  title: string;
  summary: string;
  teachingFocus: string;
  whatToWatch: string[];
  params: RetinaParams;
}

export type RetinaClinicalMaskId =
  | "none"
  | "central-scotoma"
  | "central-distortion"
  | "blind-spot-enlarged"
  | "arcuate-loss"
  | "superior-curtain";

export type RetinaClinicalTone = "retina" | "optic-nerve" | "disc";

export interface RetinaClinicalPattern {
  mask: RetinaClinicalMaskId;
  tone: RetinaClinicalTone;
  label: string;
}

export interface RetinaClinicalPreset {
  id: string;
  title: string;
  lesionSite: string;
  syndromeFrame: string;
  strongestLocalization: string;
  whyItFits: string;
  weakerAlternative: string;
  whyAlternativeWeaker: string;
  decisiveNextData: string[];
  teachingPearls: string[];
  examClues: string[];
  comparePresetId: string;
  linkedModules: string[];
  leftEye: RetinaClinicalPattern;
  rightEye: RetinaClinicalPattern;
}

export const defaultRetinaParams: RetinaParams = {
  gridSize: 29,
  centerSigma: 2.6,
  surroundSigma: 5.8,
  surroundStrength: 0.58,
  stimulusType: "spot",
  stimulusRadius: 4.5,
  annulusWidth: 2.5,
  stimulusX: 0,
  stimulusY: 0,
  contrast: 1,
};

export const retinaParamDefinitions: RetinaParamDefinition[] = [
  {
    key: "gridSize",
    label: "Grid Size",
    unit: "cells",
    step: 2,
    min: 15,
    max: 41,
  },
  {
    key: "centerSigma",
    label: "Center Sigma",
    unit: "cells",
    step: 0.1,
    min: 0.8,
    max: 8,
  },
  {
    key: "surroundSigma",
    label: "Surround Sigma",
    unit: "cells",
    step: 0.1,
    min: 1.4,
    max: 12,
  },
  {
    key: "surroundStrength",
    label: "Surround Strength",
    step: 0.01,
    min: 0.1,
    max: 1.5,
  },
  {
    key: "stimulusRadius",
    label: "Stimulus Radius",
    unit: "cells",
    step: 0.1,
    min: 0.5,
    max: 12,
  },
  {
    key: "annulusWidth",
    label: "Annulus Width",
    unit: "cells",
    step: 0.1,
    min: 0.5,
    max: 8,
  },
  {
    key: "stimulusX",
    label: "Stimulus X",
    unit: "cells",
    step: 0.5,
    min: -12,
    max: 12,
  },
  {
    key: "stimulusY",
    label: "Stimulus Y",
    unit: "cells",
    step: 0.5,
    min: -12,
    max: 12,
  },
  {
    key: "contrast",
    label: "Contrast",
    step: 0.1,
    min: -1,
    max: 1,
  },
];

export const retinaStimulusTypes = [
  { value: "spot", label: "Spot" },
  { value: "annulus", label: "Annulus" },
  { value: "edge", label: "Edge" },
] as const;

export const retinaPhysiologyPresets: RetinaPhysiologyPreset[] = [
  {
    id: "foveal-sampling",
    title: "Foveal high-acuity sampling",
    summary:
      "Small center, compact surround, and a tight spot capture how fine central vision prefers small high-contrast targets.",
    teachingFocus:
      "Use this when you want the preferred spot radius to sit small and sharply centered.",
    whatToWatch: [
      "The size-tuning peak shifts toward a smaller spot.",
      "Horizontal translation punishes tiny stimulus displacements more quickly.",
    ],
    params: {
      ...defaultRetinaParams,
      centerSigma: 1.8,
      surroundSigma: 4.1,
      surroundStrength: 0.48,
      stimulusRadius: 2.2,
      stimulusType: "spot",
    },
  },
  {
    id: "balanced-on-center",
    title: "Balanced ON-center baseline",
    summary:
      "A stable ON-center/OFF-surround regime that is useful as the neutral teaching starting point.",
    teachingFocus:
      "Use this to explain how center gain rises before the surround catches up and suppresses the response.",
    whatToWatch: [
      "The spot response rises then falls back as the surround is recruited.",
      "The annulus stays relatively suppressive even when the center looks normal.",
    ],
    params: {
      ...defaultRetinaParams,
    },
  },
  {
    id: "surround-overdrive",
    title: "Surround overdrive",
    summary:
      "A heavier surround shows how broader illumination or annular stimulation can flatten or invert the net response.",
    teachingFocus:
      "Use this to explain why larger stimuli can produce less output than smaller stimuli.",
    whatToWatch: [
      "The annulus becomes strongly negative.",
      "The net response shifts toward suppression even with positive contrast.",
    ],
    params: {
      ...defaultRetinaParams,
      centerSigma: 2.2,
      surroundSigma: 6.7,
      surroundStrength: 0.92,
      stimulusRadius: 5.4,
      stimulusType: "annulus",
      annulusWidth: 3.6,
    },
  },
  {
    id: "edge-prioritization",
    title: "Edge prioritization",
    summary:
      "An edge stimulus and stronger surround emphasize how the retina cares about spatial contrast more than raw luminance.",
    teachingFocus:
      "Use this when connecting retinal preprocessing to later border, contour, and field-localization logic.",
    whatToWatch: [
      "The edge response becomes more prominent than the broad spot response.",
      "Position scan asymmetry becomes the easiest way to see contrast extraction.",
    ],
    params: {
      ...defaultRetinaParams,
      centerSigma: 2.4,
      surroundSigma: 5.5,
      surroundStrength: 0.74,
      stimulusType: "edge",
      stimulusRadius: 4.5,
    },
  },
];

export const retinaClinicalPresets: RetinaClinicalPreset[] = [
  {
    id: "optic-neuritis",
    title: "Optic neuritis pattern",
    lesionSite: "Left optic nerve",
    syndromeFrame:
      "Painful monocular central blur with dyschromatopsia and an afferent defect is optic neuritis until proven otherwise.",
    strongestLocalization: "Left optic nerve, prechiasmal",
    whyItFits:
      "Central scotoma plus color desaturation and pain with eye movement strongly favors optic nerve inflammation over a purely retinal explanation.",
    weakerAlternative: "Macular lesion",
    whyAlternativeWeaker:
      "Macular disease can degrade central acuity, but it is much weaker when the story includes pain with eye movement, a relative afferent defect, and broader color washout.",
    decisiveNextData: [
      "Red desaturation and color-plate asymmetry",
      "Relative afferent pupillary defect testing",
      "Fundus correlation before labeling the deficit cortical",
    ],
    teachingPearls: [
      "Central scotoma is not automatically retinal. Split optic nerve from macula deliberately.",
      "Eye-specific loss with pain and dyschromatopsia is optic nerve until proven otherwise.",
    ],
    examClues: [
      "Pain with eye movement",
      "Reduced color saturation",
      "Relative afferent pupillary defect",
    ],
    comparePresetId: "macular-lesion",
    linkedModules: ["visual-field", "vision", "ask"],
    leftEye: {
      mask: "central-scotoma",
      tone: "optic-nerve",
      label: "Central monocular scotoma",
    },
    rightEye: {
      mask: "none",
      tone: "optic-nerve",
      label: "Right eye preserved",
    },
  },
  {
    id: "papilledema",
    title: "Papilledema pattern",
    lesionSite: "Bilateral optic-disc swelling",
    syndromeFrame:
      "Transient visual obscurations with enlarged blind spots should force optic-disc and raised-pressure reasoning before cortex.",
    strongestLocalization: "Bilateral optic-disc swelling with raised intracranial pressure risk",
    whyItFits:
      "An enlarged blind spot is a disc-swelling pattern, especially when it is bilateral and fluctuates with pressure-sensitive symptoms.",
    weakerAlternative: "Occipital visual loss",
    whyAlternativeWeaker:
      "Posterior cortical lesions do not create bilateral enlarged blind spots centered on the physiologic blind spot.",
    decisiveNextData: [
      "Disc exam or fundus photography for swelling",
      "Headache, pulse-synchronous tinnitus, and transient-obscuration history",
      "Urgent pressure-directed evaluation if papilledema is real",
    ],
    teachingPearls: [
      "Blind-spot enlargement is a disc clue, not a hemianopia clue.",
      "Visual obscurations plus disc swelling should trigger intracranial-pressure thinking immediately.",
    ],
    examClues: [
      "Transient visual obscurations",
      "Headache or pulsatile tinnitus",
      "Bilateral disc swelling",
    ],
    comparePresetId: "glaucoma",
    linkedModules: ["visual-field", "brain-atlas", "ask"],
    leftEye: {
      mask: "blind-spot-enlarged",
      tone: "disc",
      label: "Enlarged blind spot",
    },
    rightEye: {
      mask: "blind-spot-enlarged",
      tone: "disc",
      label: "Enlarged blind spot",
    },
  },
  {
    id: "glaucoma",
    title: "Glaucomatous nerve-fiber pattern",
    lesionSite: "Optic nerve head and retinal nerve fiber layer",
    syndromeFrame:
      "Progressive peripheral loss with arcuate defects and nasal-step logic is a retinal-nerve-fiber pattern, not a cortical field cut.",
    strongestLocalization: "Optic nerve head and retinal nerve fiber layer injury",
    whyItFits:
      "Arcuate loss follows retinal nerve-fiber architecture and does not behave like a clean homonymous retrochiasmal defect.",
    weakerAlternative: "Parietal or occipital field cut",
    whyAlternativeWeaker:
      "Cortical lesions respect shared hemifield geometry across both eyes, while glaucoma produces eye-specific or asymmetric nerve-fiber-pattern loss.",
    decisiveNextData: [
      "Cup-to-disc assessment and OCT if available",
      "Formal monocular perimetry looking for arcuate or nasal-step loss",
      "Intraocular pressure and chronicity history",
    ],
    teachingPearls: [
      "Arcuate defects follow nerve-fiber bundles, not occipital map geometry.",
      "Do not mislabel asymmetric monocular peripheral loss as a homonymous cortical syndrome.",
    ],
    examClues: [
      "Peripheral bumping or missed steps",
      "Arcuate or nasal-step field loss",
      "Optic disc cupping",
    ],
    comparePresetId: "papilledema",
    linkedModules: ["visual-field", "ask"],
    leftEye: {
      mask: "arcuate-loss",
      tone: "optic-nerve",
      label: "Arcuate superior-nasal loss",
    },
    rightEye: {
      mask: "arcuate-loss",
      tone: "optic-nerve",
      label: "Arcuate superior-nasal loss",
    },
  },
  {
    id: "retinal-detachment",
    title: "Retinal detachment pattern",
    lesionSite: "Detached peripheral retina",
    syndromeFrame:
      "Flashes, floaters, and a monocular curtain descending across vision are retinal detachment until proven otherwise.",
    strongestLocalization: "Detached retina in the affected eye",
    whyItFits:
      "A curtain-like monocular deficit with photopsias is classic retinal warning language and should not be softened into a vague visual complaint.",
    weakerAlternative: "Optic neuritis",
    whyAlternativeWeaker:
      "Optic neuritis prefers central blur, color loss, and pain rather than a peripheral curtain with flashes and floaters.",
    decisiveNextData: [
      "Urgent dilated retinal exam or ocular ultrasound if needed",
      "Clarify curtain direction and associated flashes or floaters",
      "Treat timing as urgent because the macula may still be salvageable",
    ],
    teachingPearls: [
      "Curtain plus photopsias is a retinal emergency story until proven otherwise.",
      "Retinal detachment is monocular and prechiasmal even when the patient describes 'part of the world' missing.",
    ],
    examClues: [
      "Flashes and floaters",
      "Monocular curtain descending over vision",
      "Urgency tied to macular involvement",
    ],
    comparePresetId: "optic-neuritis",
    linkedModules: ["visual-field", "ask"],
    leftEye: {
      mask: "superior-curtain",
      tone: "retina",
      label: "Superior curtain-like monocular loss",
    },
    rightEye: {
      mask: "none",
      tone: "retina",
      label: "Right eye preserved",
    },
  },
  {
    id: "macular-lesion",
    title: "Macular lesion pattern",
    lesionSite: "Macula or foveal retinal tissue",
    syndromeFrame:
      "Central distortion, reduced reading acuity, and metamorphopsia localize to the macula before they localize to the brain.",
    strongestLocalization: "Macula or foveal retinal tissue",
    whyItFits:
      "The complaint is central and detail-dependent, but the story is retinal rather than optic-neuropathic when metamorphopsia and line distortion dominate the exam.",
    weakerAlternative: "Optic neuritis",
    whyAlternativeWeaker:
      "Optic neuritis is stronger when dyschromatopsia, afferent defect, and pain with eye movement accompany the central loss.",
    decisiveNextData: [
      "Amsler-grid style distortion testing",
      "Fundus and macular exam correlation",
      "Separate acuity loss from color desaturation and RAPD logic",
    ],
    teachingPearls: [
      "Central loss can be retinal or optic nerve. The clue is whether the deficit distorts the image or desaturates the signal.",
      "Metamorphopsia is a retinal word until proven otherwise.",
    ],
    examClues: [
      "Distorted central lines",
      "Reading difficulty with preserved peripheral field",
      "Metamorphopsia",
    ],
    comparePresetId: "optic-neuritis",
    linkedModules: ["visual-field", "vision", "ask"],
    leftEye: {
      mask: "central-distortion",
      tone: "retina",
      label: "Central distortion and blur",
    },
    rightEye: {
      mask: "none",
      tone: "retina",
      label: "Right eye preserved",
    },
  },
];

export const retinaLocalizationRules = [
  "Eye-specific loss stays prechiasmal until the history proves otherwise.",
  "Central scotoma requires a deliberate optic-nerve versus macular split, not a reflex cortical label.",
  "Blind-spot enlargement points toward optic-disc swelling and raised-pressure reasoning.",
  "Arcuate or nasal-step defects follow retinal nerve-fiber architecture, not occipital map geometry.",
  "Curtain-like monocular loss with photopsias is retinal detachment language and should be treated urgently.",
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

function gaussian(distanceSquared: number, sigma: number): number {
  return Math.exp(-distanceSquared / (2 * sigma * sigma));
}

function peakPoint(points: CurvePoint[]) {
  return points.reduce((best, point) =>
    point.value > best.value ? point : best,
  );
}

function troughPoint(points: CurvePoint[]) {
  return points.reduce((best, point) =>
    point.value < best.value ? point : best,
  );
}

export function sanitizeRetinaParams(params: RetinaParams): RetinaParams {
  const next = {
    ...params,
    gridSize: Math.floor(clamp(params.gridSize, 15, 41)),
    centerSigma: clamp(params.centerSigma, 0.8, 8),
    surroundSigma: clamp(params.surroundSigma, 1.4, 12),
    surroundStrength: clamp(params.surroundStrength, 0.1, 1.5),
    stimulusRadius: clamp(params.stimulusRadius, 0.5, 12),
    annulusWidth: clamp(params.annulusWidth, 0.5, 8),
    stimulusX: clamp(params.stimulusX, -12, 12),
    stimulusY: clamp(params.stimulusY, -12, 12),
    contrast: clamp(params.contrast, -1, 1),
  };

  if (next.gridSize % 2 === 0) {
    next.gridSize += 1;
  }

  next.surroundSigma = clamp(next.surroundSigma, next.centerSigma + 0.5, 12);

  return next;
}

function receptiveFieldValue(x: number, y: number, params: RetinaParams): number {
  const distanceSquared = x * x + y * y;
  return (
    gaussian(distanceSquared, params.centerSigma) -
    params.surroundStrength * gaussian(distanceSquared, params.surroundSigma)
  );
}

function stimulusValue(
  x: number,
  y: number,
  params: RetinaParams,
  radius = params.stimulusRadius,
  xOffset = params.stimulusX,
): number {
  const dx = x - xOffset;
  const dy = y - params.stimulusY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  switch (params.stimulusType) {
    case "spot":
      return distance <= radius ? params.contrast : 0;
    case "annulus":
      return distance >= radius && distance <= radius + params.annulusWidth
        ? params.contrast
        : 0;
    case "edge":
      return dx >= 0 ? params.contrast : 0;
  }
}

function computeResponse(
  params: RetinaParams,
  radius = params.stimulusRadius,
  xOffset = params.stimulusX,
): number {
  const half = Math.floor(params.gridSize / 2);
  let total = 0;

  for (let y = -half; y <= half; y += 1) {
    for (let x = -half; x <= half; x += 1) {
      total +=
        receptiveFieldValue(x, y, params) *
        stimulusValue(x, y, params, radius, xOffset);
    }
  }

  return total;
}

export function simulateRetina(input: RetinaParams): RetinaResult {
  const params = sanitizeRetinaParams(input);
  const half = Math.floor(params.gridSize / 2);
  const receptiveField: MatrixPoint[] = [];
  const stimulus: MatrixPoint[] = [];

  for (let y = -half; y <= half; y += 1) {
    for (let x = -half; x <= half; x += 1) {
      receptiveField.push({
        x,
        y,
        value: round(receptiveFieldValue(x, y, params)),
      });
      stimulus.push({
        x,
        y,
        value: round(stimulusValue(x, y, params)),
      });
    }
  }

  const sizeTuning: CurvePoint[] = [];
  for (let radius = 0.5; radius <= 12; radius += 0.5) {
    sizeTuning.push({
      x: round(radius, 2),
      value: round(
        computeResponse({ ...params, stimulusType: "spot" }, radius, 0),
        5,
      ),
    });
  }

  const positionScan: CurvePoint[] = [];
  for (let xOffset = -12; xOffset <= 12; xOffset += 0.5) {
    positionScan.push({
      x: round(xOffset, 2),
      value: round(
        computeResponse(params, params.stimulusRadius, xOffset),
        5,
      ),
    });
  }

  const preferredSpot = peakPoint(sizeTuning);
  const suppressionTrough = troughPoint(positionScan);
  const edgeResponse = round(
    computeResponse({ ...params, stimulusType: "edge" }),
    5,
  );
  const annulusResponse = round(
    computeResponse({ ...params, stimulusType: "annulus" }),
    5,
  );
  const response = round(computeResponse(params), 5);
  const centerMass = round(
    receptiveField.reduce(
      (total, point) => total + (point.value > 0 ? point.value : 0),
      0,
    ),
    5,
  );
  const surroundMass = round(
    Math.abs(
      receptiveField.reduce(
        (total, point) => total + (point.value < 0 ? point.value : 0),
        0,
      ),
    ),
    5,
  );
  const operatingMode =
    response > 0.05
      ? "Center dominated"
      : response < -0.05
        ? "Surround dominated"
        : "Balanced";

  return {
    params,
    receptiveField,
    stimulus,
    response,
    sizeTuning,
    positionScan,
    summary: {
      preferredSpotRadius: preferredSpot.x,
      suppressionTroughOffset: suppressionTrough.x,
      edgeResponse,
      annulusResponse,
      centerMass,
      surroundMass,
      operatingMode,
    },
    explanation: {
      model:
        "A difference-of-Gaussians receptive field approximating ON-center/OFF-surround retinal ganglion-cell behavior before cortical interpretation begins.",
      notes: [
        "Small bright spots excite the ON center strongly before the inhibitory surround can dominate.",
        "As the spot expands, the surround contributes more negative drive and the net response can fall back toward zero or below.",
        "Edge and annulus stimuli reveal that the retina emphasizes contrast structure, not raw luminance alone.",
        "Clinical localization starts by deciding whether degraded input is retinal or optic-nerve level before it ever becomes a cortical problem.",
      ],
    },
  };
}

export function getRetinaPhysiologyPreset(presetId: string) {
  return retinaPhysiologyPresets.find((preset) => preset.id === presetId);
}

export function getRetinaClinicalPreset(presetId: string) {
  return retinaClinicalPresets.find((preset) => preset.id === presetId);
}
