export type VisualFieldMaskId =
  | "none"
  | "full"
  | "left-half"
  | "right-half"
  | "upper-left-quadrant"
  | "upper-right-quadrant"
  | "lower-left-quadrant"
  | "lower-right-quadrant"
  | "left-half-macular-sparing";

export type VisualFieldTone = "defect" | "attention";

export interface EyeFieldPattern {
  mask: VisualFieldMaskId;
  tone: VisualFieldTone;
  label: string;
}

export interface VisualFieldPreset {
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
  comparePresetId: string;
  linkedModules: string[];
  leftEye: EyeFieldPattern;
  rightEye: EyeFieldPattern;
}

export const visualFieldReadingPrinciples = [
  "Monocular loss localizes before the chiasm until proven otherwise.",
  "Bitemporal patterns are chiasmal wiring problems before they are tumor labels.",
  "Homonymous defects are retrochiasmal, and congruity usually pushes the lesion posteriorly.",
  "Neglect is an attention disorder that can mimic field loss without being a true visual field cut.",
] as const;

export const visualFieldPresets: VisualFieldPreset[] = [
  {
    id: "left-optic-nerve",
    title: "Left optic nerve",
    lesionSite: "Left optic nerve",
    syndromeFrame:
      "Complete monocular visual loss in the left eye with preserved right-eye vision is a prechiasmal syndrome until proven otherwise.",
    strongestLocalization: "Left optic nerve or severe left retinal input failure",
    whyItFits:
      "Only one eye is affected. Once the fibers have crossed or merged, defects stop respecting one eye so cleanly.",
    weakerAlternative: "Left occipital cortex",
    whyAlternativeWeaker:
      "Occipital lesions affect contralateral visual space in both eyes, not one entire monocular field.",
    decisiveNextData: [
      "Pupil exam for a left relative afferent defect",
      "Fundus and optic-disc correlation to separate retinal from optic nerve disease",
    ],
    teachingPearls: [
      "Monocular means prechiasmal until proven otherwise.",
      "Do not jump to cortex when one eye alone is blind.",
    ],
    comparePresetId: "optic-chiasm",
    linkedModules: ["retina", "vision", "ask"],
    leftEye: {
      mask: "full",
      tone: "defect",
      label: "Complete left monocular loss",
    },
    rightEye: {
      mask: "none",
      tone: "defect",
      label: "Right eye preserved",
    },
  },
  {
    id: "optic-chiasm",
    title: "Optic chiasm",
    lesionSite: "Optic chiasm",
    syndromeFrame:
      "Bitemporal hemianopia is a crossing-fiber pattern and is best explained by chiasmal compression or chiasmal injury.",
    strongestLocalization: "Optic chiasm",
    whyItFits:
      "Crossing nasal retinal fibers carry temporal visual fields. A midline lesion there strips temporal fields from both eyes at once.",
    weakerAlternative: "Occipital cortex",
    whyAlternativeWeaker:
      "Occipital lesions create homonymous, not bitemporal, defects because binocular information has already been reorganized by then.",
    decisiveNextData: [
      "Formal monocular visual fields with temporal pattern confirmation",
      "Parasellar imaging rather than posterior cortical imaging alone",
    ],
    teachingPearls: [
      "Bitemporal patterns are wiring geometry before they are disease names.",
      "The chiasm is the classic place where monocular logic becomes binocular.",
    ],
    comparePresetId: "right-optic-tract",
    linkedModules: ["retina", "brain-atlas", "ask"],
    leftEye: {
      mask: "left-half",
      tone: "defect",
      label: "Left eye temporal loss",
    },
    rightEye: {
      mask: "right-half",
      tone: "defect",
      label: "Right eye temporal loss",
    },
  },
  {
    id: "right-optic-tract",
    title: "Right optic tract",
    lesionSite: "Right optic tract or right lateral geniculate pathway",
    syndromeFrame:
      "A left homonymous hemianopia is retrochiasmal until proven otherwise, and the next question is how posterior the lesion sits.",
    strongestLocalization: "Right retrochiasmal visual pathway",
    whyItFits:
      "Both eyes lose the same left hemifield, which can only happen after visual streams have already crossed and recombined.",
    weakerAlternative: "Left optic nerve",
    whyAlternativeWeaker:
      "An optic nerve lesion cannot create matching binocular hemifield loss because it affects one eye, not shared visual space.",
    decisiveNextData: [
      "Formal perimetry to judge congruity",
      "Look for accompanying sensory, motor, or thalamic signs that push the lesion anteriorly",
    ],
    teachingPearls: [
      "Homonymous means retrochiasmal.",
      "Congruity, associated deficits, and macular sparing help tell you how posterior the lesion is.",
    ],
    comparePresetId: "right-parietal-neglect",
    linkedModules: ["vision", "brain-atlas", "ask"],
    leftEye: {
      mask: "left-half",
      tone: "defect",
      label: "Left homonymous loss",
    },
    rightEye: {
      mask: "left-half",
      tone: "defect",
      label: "Left homonymous loss",
    },
  },
  {
    id: "right-meyer-loop",
    title: "Right Meyer loop",
    lesionSite: "Right temporal optic radiations (Meyer loop)",
    syndromeFrame:
      "A left superior quadrantanopia is the classic temporal-radiation pattern: a 'pie in the sky' defect with retrochiasmal logic.",
    strongestLocalization: "Right temporal lobe optic radiations",
    whyItFits:
      "Temporal radiations sweep inferior retinal fibers that represent the superior contralateral visual field, so the deficit lands high and opposite.",
    weakerAlternative: "Right parietal optic radiations",
    whyAlternativeWeaker:
      "Parietal radiations classically produce inferior, not superior, quadrantanopic loss.",
    decisiveNextData: [
      "Quadrant-specific field testing",
      "Temporal lobe imaging and correlation with language or memory features if present",
    ],
    teachingPearls: [
      "Temporal lobe radiations give 'pie in the sky.'",
      "Quadrantanopia is often your clue that the radiations, not the whole tract, are involved.",
    ],
    comparePresetId: "right-parietal-radiations",
    linkedModules: ["vision", "brain-atlas", "ask"],
    leftEye: {
      mask: "upper-left-quadrant",
      tone: "defect",
      label: "Left superior quadrantanopia",
    },
    rightEye: {
      mask: "upper-left-quadrant",
      tone: "defect",
      label: "Left superior quadrantanopia",
    },
  },
  {
    id: "right-parietal-radiations",
    title: "Right parietal radiations",
    lesionSite: "Right parietal optic radiations",
    syndromeFrame:
      "A left inferior quadrantanopia is a dorsal-radiation problem until proven otherwise and often behaves like the mirror image of Meyer loop injury.",
    strongestLocalization: "Right parietal lobe optic radiations",
    whyItFits:
      "Parietal radiations carry superior retinal fibers that represent the inferior contralateral field, so the deficit falls low and opposite.",
    weakerAlternative: "Right temporal optic radiations",
    whyAlternativeWeaker:
      "Temporal radiations produce superior quadrantanopia, not an inferior field wedge.",
    decisiveNextData: [
      "Quadrant-specific perimetry with inferior field emphasis",
      "Look for dorsal stream, sensory, or spatial-attention clues that support parietal involvement",
    ],
    teachingPearls: [
      "Parietal radiations give 'pie on the floor.'",
      "Field geometry is often more localizing than the imaging impression alone.",
    ],
    comparePresetId: "right-meyer-loop",
    linkedModules: ["vision", "brain-atlas", "ask"],
    leftEye: {
      mask: "lower-left-quadrant",
      tone: "defect",
      label: "Left inferior quadrantanopia",
    },
    rightEye: {
      mask: "lower-left-quadrant",
      tone: "defect",
      label: "Left inferior quadrantanopia",
    },
  },
  {
    id: "right-occipital-cortex",
    title: "Right occipital cortex",
    lesionSite: "Right occipital cortex",
    syndromeFrame:
      "A congruous left homonymous defect with central sparing pushes the lesion posteriorly toward occipital cortex.",
    strongestLocalization: "Right occipital cortex",
    whyItFits:
      "Occipital lesions often create highly congruous homonymous loss, and central sparing suggests preserved macular representation or collateral blood supply.",
    weakerAlternative: "Right optic tract",
    whyAlternativeWeaker:
      "Tract lesions are often less congruous and more likely to carry other pathway signs than a clean posterior cortical field cut.",
    decisiveNextData: [
      "Perimetry looking for congruity and macular sparing",
      "Occipital imaging and vascular-territory correlation",
    ],
    teachingPearls: [
      "The more congruous the homonymous loss, the more posterior the lesion usually is.",
      "Macular sparing is a clue, not a magic word.",
    ],
    comparePresetId: "right-optic-tract",
    linkedModules: ["vision", "brain-atlas", "ask"],
    leftEye: {
      mask: "left-half-macular-sparing",
      tone: "defect",
      label: "Posterior homonymous loss with macular sparing",
    },
    rightEye: {
      mask: "left-half-macular-sparing",
      tone: "defect",
      label: "Posterior homonymous loss with macular sparing",
    },
  },
  {
    id: "right-parietal-neglect",
    title: "Right parietal neglect",
    lesionSite: "Right parietal attention network",
    syndromeFrame:
      "The patient behaves as if the left world is absent, but the problem is attentional weighting and extinction rather than a true primary visual field cut.",
    strongestLocalization: "Right parietal attention network",
    whyItFits:
      "Neglect is not a retinal or optic pathway failure. It is a network-level failure to attend to contralateral space despite potentially intact primary visual input.",
    weakerAlternative: "Right optic tract homonymous hemianopia",
    whyAlternativeWeaker:
      "A true hemianopia is a stable sensory field loss, while neglect often fluctuates with attention, competition, and double simultaneous stimulation.",
    decisiveNextData: [
      "Confrontation testing with extinction and double simultaneous stimulation",
      "Line bisection, cancellation tasks, and broader parietal syndrome evaluation",
    ],
    teachingPearls: [
      "Neglect mimics field loss without being one.",
      "When a patient sees more with cueing or attention, think network bias before optic tract.",
    ],
    comparePresetId: "right-optic-tract",
    linkedModules: ["vision", "brain-atlas", "ask"],
    leftEye: {
      mask: "left-half",
      tone: "attention",
      label: "Attention-weighted left hemispace",
    },
    rightEye: {
      mask: "left-half",
      tone: "attention",
      label: "Attention-weighted left hemispace",
    },
  },
];

export function getVisualFieldPreset(presetId: string) {
  return visualFieldPresets.find((preset) => preset.id === presetId);
}
