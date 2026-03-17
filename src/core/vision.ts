export type VisionTrackId =
  | "field-entry"
  | "ventral-stream"
  | "dorsal-stream"
  | "attention-network";

export interface VisionStage {
  id: string;
  resnetStage: string;
  corticalArea: string;
  features: string;
  biology: string;
  track: VisionTrackId;
}

export interface VisionSkipConnections {
  what: string;
  neuroscience: string;
}

export interface VisionClassification {
  label: string;
  score: number;
}

export interface VisionSyndromePreset {
  id: string;
  title: string;
  dominantTrack: VisionTrackId;
  dominantNodes: string[];
  syndromeFrame: string;
  strongestLocalization: string;
  whyItFits: string;
  weakerAlternative: string;
  whyAlternativeWeaker: string;
  decisiveNextData: string[];
  decisiveNegativeFinding: string;
  bedsideDiscriminators: string[];
  pipelineCorrelation: string;
  teachingPearls: string[];
  linkedModules: string[];
  comparePresetId: string;
}

export const visionDefaultImageUrl =
  "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg";

export const visionStages: VisionStage[] = [
  {
    id: "v1",
    resnetStage: "Conv1 + MaxPool (7x7 conv, stride 2)",
    corticalArea: "V1 (Primary Visual Cortex)",
    features: "Oriented edges, contrast boundaries, simple gratings",
    biology:
      "V1 neurons are tuned to oriented edges and retinotopic position, which is why field-defect logic remains anatomically sharp at cortical entry.",
    track: "field-entry",
  },
  {
    id: "v2",
    resnetStage: "Block 1 (3 bottleneck layers)",
    corticalArea: "V2 (Secondary Visual Cortex)",
    features: "Corners, junctions, contour grouping, border ownership",
    biology:
      "V2 begins grouping V1 outputs into more coherent surfaces and contours, setting up later ventral and dorsal divergence.",
    track: "field-entry",
  },
  {
    id: "v4",
    resnetStage: "Block 2 (4 bottleneck layers)",
    corticalArea: "V4 (Visual Area 4)",
    features: "Curvature, color constancy, moderate shape complexity",
    biology:
      "V4 is a major ventral-stream color and form hub, which is why achromatopsia and higher-order form complaints often pull the lesion here or nearby.",
    track: "ventral-stream",
  },
  {
    id: "posterior-it",
    resnetStage: "Block 3 (6 bottleneck layers)",
    corticalArea: "IT (Inferotemporal Cortex) - posterior",
    features: "Object parts, textures, category-level features",
    biology:
      "Posterior inferotemporal cortex turns grouped features into stable object components, bridging pure form analysis and object identity.",
    track: "ventral-stream",
  },
  {
    id: "anterior-it",
    resnetStage: "Block 4 (3 bottleneck layers)",
    corticalArea: "IT (Inferotemporal Cortex) - anterior",
    features: "Whole objects, view-invariant identity representations",
    biology:
      "Anterior inferotemporal and adjacent ventral occipitotemporal cortex support higher-order identity coding such as face recognition and category stability.",
    track: "ventral-stream",
  },
  {
    id: "pfc",
    resnetStage: "Global Average Pool + Fully Connected",
    corticalArea: "Prefrontal Cortex (decision/categorization)",
    features: "Task-relevant labels, semantic decisions, reportable choices",
    biology:
      "Prefrontal cortex turns perceptual representations into decision-ready reports, but it should not be mistaken for the place where all visual content is created.",
    track: "ventral-stream",
  },
];

export const visionSkipConnections: VisionSkipConnections = {
  what: "ResNet's key innovation: skip (residual) connections that bypass layers and preserve signal while later layers add abstraction.",
  neuroscience:
    "The brain also uses feedback and lateral recurrence. Visual cortex is not a one-way ladder: V1 receives top-down predictions, dorsal and ventral streams exchange constraints, and attention networks can reshape what reaches awareness.",
};

export const visionKeyInsight =
  "Cloudflare AI can classify an object, but neurological localization asks a different question: which processing step failed, which stream is implicated, and what bedside datum would most efficiently change your mind.";

export const visionReadingRules = [
  "If the complaint is a field cut, localize the entry problem before you call it a recognition deficit.",
  "Category-selective failures with preserved acuity and fields usually belong to late ventral stream, not V1.",
  "Reaching, scanning, and scene-integration failures often implicate dorsal or attention networks rather than ventral identity cortex.",
  "Variability with cueing or competition should make you think attention network before stable sensory loss.",
] as const;

export const visionSyndromePresets: VisionSyndromePreset[] = [
  {
    id: "posterior-hemianopia",
    title: "Posterior homonymous hemianopia",
    dominantTrack: "field-entry",
    dominantNodes: ["V1", "occipital cortex"],
    syndromeFrame:
      "A congruous homonymous visual field deficit is a retrochiasmal syndrome until proven otherwise, and the decisive move is ranking how posterior the lesion is.",
    strongestLocalization:
      "Contralateral occipital cortex or posterior optic radiations",
    whyItFits:
      "A highly congruous shared-space field cut with central sparing logic pulls the lesion toward occipital cortex rather than the anterior tract.",
    weakerAlternative: "Optic nerve or chiasm",
    whyAlternativeWeaker:
      "Prechiasmal lesions stay monocular or bitemporal. They do not produce a congruous homonymous deficit that behaves like a cortical map.",
    decisiveNextData: [
      "Formal perimetry to define congruity and macular sparing",
      "Occipital imaging and vascular-territory correlation",
    ],
    decisiveNegativeFinding:
      "Preserved monocular acuity and the absence of eye-specific visual loss argue against a prechiasmal explanation.",
    bedsideDiscriminators: [
      "Homonymous field geometry",
      "Congruity between the two eyes",
      "Macular sparing pattern",
    ],
    pipelineCorrelation:
      "This fails at cortical entry, where retinotopic space is still the dominant organizing principle.",
    teachingPearls: [
      "Field defects are anatomy maps before they are disease labels.",
      "The more congruous the defect, the more posterior the retrochiasmal lesion usually is.",
    ],
    linkedModules: ["visual-field", "brain-atlas", "ask"],
    comparePresetId: "right-parietal-neglect",
  },
  {
    id: "prosopagnosia",
    title: "Prosopagnosia",
    dominantTrack: "ventral-stream",
    dominantNodes: ["fusiform face area", "anterior IT"],
    syndromeFrame:
      "The patient sees a face well enough to describe it, but cannot bind the visual identity of that face to recognition, which is a high-order ventral-stream problem.",
    strongestLocalization:
      "Right ventral occipitotemporal face-recognition network",
    whyItFits:
      "Identity-selective failure with preserved basic perception localizes later than V1 and later than most dorsal visuospatial steps.",
    weakerAlternative: "Primary visual cortex lesion",
    whyAlternativeWeaker:
      "V1 injury should produce acuity or field deficits, not isolated failure of facial identity with preserved object description.",
    decisiveNextData: [
      "Compare face recognition against object, voice, and word recognition",
      "Inspect ventral temporal imaging, especially fusiform cortex",
    ],
    decisiveNegativeFinding:
      "The absence of major acuity loss or a primary field cut makes early visual cortex weaker than late ventral stream.",
    bedsideDiscriminators: [
      "Can describe a face but cannot identify it",
      "Voice recognition may remain intact",
      "Object naming can be less impaired than face identity",
    ],
    pipelineCorrelation:
      "This aligns with late inferotemporal identity stages, where category-specific recognition becomes stable enough for person knowledge.",
    teachingPearls: [
      "What is spared can localize as strongly as what is lost.",
      "Prosopagnosia is a ventral identity disorder, not generic poor vision.",
    ],
    linkedModules: ["brain-atlas", "ask"],
    comparePresetId: "visual-form-agnosia",
  },
  {
    id: "achromatopsia",
    title: "Cortical achromatopsia",
    dominantTrack: "ventral-stream",
    dominantNodes: ["V4", "ventral occipital cortex"],
    syndromeFrame:
      "The patient can follow form and motion, yet the world loses stable color, which is a classic cortical dissociation rather than a generic ocular complaint.",
    strongestLocalization: "V4-dominant ventral visual cortex",
    whyItFits:
      "Color constancy and intermediate-shape coding live strongly in V4, so color collapse with relative form preservation pulls the lesion there.",
    weakerAlternative: "Retinal cone disorder",
    whyAlternativeWeaker:
      "Retinal cone pathology alters the sensory input itself and often brings broader ocular abnormalities, while cortical achromatopsia can preserve many early visual functions.",
    decisiveNextData: [
      "Test color naming and matching against preserved luminance-based shape judgments",
      "Review ventral occipital imaging instead of stopping at ocular examination",
    ],
    decisiveNegativeFinding:
      "Preserved shape discrimination with lost color experience argues against a purely retinal explanation.",
    bedsideDiscriminators: [
      "Color naming and matching failure",
      "Relatively preserved edge and form perception",
      "No major eye-specific field pattern",
    ],
    pipelineCorrelation:
      "This most directly aligns with V4, where color constancy and richer contour representation become prominent.",
    teachingPearls: [
      "Color is not finished in the retina; it becomes perceptually stable in cortex.",
      "Preserved shape with lost color is a strong dissociation, not a contradiction.",
    ],
    linkedModules: ["retina", "brain-atlas", "ask"],
    comparePresetId: "posterior-hemianopia",
  },
  {
    id: "visual-form-agnosia",
    title: "Visual form agnosia",
    dominantTrack: "ventral-stream",
    dominantNodes: ["occipitotemporal association cortex", "posterior IT"],
    syndromeFrame:
      "Visual input reaches the patient, yet coherent object form cannot be assembled reliably enough for recognition or copying, suggesting an intermediate ventral-stream integration failure.",
    strongestLocalization:
      "Occipitotemporal visual association cortex between early occipital encoding and late inferotemporal identity stages",
    whyItFits:
      "The lesion seems later than pure field encoding but earlier than fully abstract identity mapping, which is where features must become stable object form.",
    weakerAlternative: "Optic neuropathy",
    whyAlternativeWeaker:
      "Optic nerve pathology should degrade the incoming signal broadly, often with acuity or contrast loss, rather than selectively breaking complex form assembly.",
    decisiveNextData: [
      "Compare copying, shape matching, and object naming to separate perceptual assembly from semantics",
      "Review posterior ventral-stream imaging for associative visual cortex involvement",
    ],
    decisiveNegativeFinding:
      "Preserved basic sensation with disproportionate object-form failure makes optic neuropathy a much weaker explanation.",
    bedsideDiscriminators: [
      "Can see local features but not coherent object structure",
      "Copying and matching break before semantic naming fully explains the deficit",
      "Acuity may be relatively preserved",
    ],
    pipelineCorrelation:
      "This sits between V2/V4 grouping operations and the IT identity stages, where features must become coherent object form before recognition can succeed.",
    teachingPearls: [
      "Association cortex lesions often break the link between intact sensation and useful perception.",
      "Visual agnosia is localized by the failed processing step, not by whether the patient can see at all.",
    ],
    linkedModules: ["brain-atlas", "ask"],
    comparePresetId: "prosopagnosia",
  },
  {
    id: "optic-ataxia",
    title: "Optic ataxia",
    dominantTrack: "dorsal-stream",
    dominantNodes: ["superior parietal lobule", "dorsal occipitoparietal stream"],
    syndromeFrame:
      "The patient can describe the target but misreaches visually toward it, which is a dorsal visuomotor transformation problem rather than a ventral identity failure.",
    strongestLocalization:
      "Dorsal occipitoparietal stream, especially superior parietal visuomotor integration",
    whyItFits:
      "Perception is present enough to identify the object, but visuomotor mapping of seen space into hand action is broken.",
    weakerAlternative: "Ventral stream agnosia",
    whyAlternativeWeaker:
      "Ventral lesions impair recognition and category identity more than visually guided reaching itself.",
    decisiveNextData: [
      "Compare visually guided reaching to reaching with proprioceptive or verbal cue support",
      "Look for broader dorsal-parietal findings such as simultanagnosia or gaze apraxia",
    ],
    decisiveNegativeFinding:
      "Preserved object recognition with disproportionate reaching failure argues against ventral-stream identity loss.",
    bedsideDiscriminators: [
      "Misreaching to seen targets",
      "Recognition better than action guidance",
      "Possible coexisting dorsal-parietal signs",
    ],
    pipelineCorrelation:
      "This reflects the visual system's dorsal output stream, where spatial coordinates are transformed into action-ready maps.",
    teachingPearls: [
      "Knowing what an object is does not mean the brain can guide the hand to it.",
      "Dorsal stream disorders are often action-space failures, not identity failures.",
    ],
    linkedModules: ["brain-atlas", "ask"],
    comparePresetId: "prosopagnosia",
  },
  {
    id: "simultanagnosia",
    title: "Simultanagnosia",
    dominantTrack: "dorsal-stream",
    dominantNodes: ["bilateral dorsal occipitoparietal association cortex"],
    syndromeFrame:
      "The patient can perceive fragments but cannot integrate a full scene, pointing toward a dorsal scene-integration and spatial-attention failure rather than a simple recognition deficit.",
    strongestLocalization:
      "Dorsal occipitoparietal scene-integration network, often bilateral or dominant posterior parietal association cortex",
    whyItFits:
      "Local detail may be visible while global spatial integration collapses, which is classic for dorsal stream and Balint-type scene processing failure.",
    weakerAlternative: "Pure ventral object-identity lesion",
    whyAlternativeWeaker:
      "Ventral lesions can impair recognition of specific objects or categories, but simultanagnosia is defined by failure to perceive multiple elements as one coherent scene.",
    decisiveNextData: [
      "Test Navon-style global versus local perception and cluttered-scene reading",
      "Assess for gaze apraxia or optic ataxia to see whether a broader Balint pattern is emerging",
    ],
    decisiveNegativeFinding:
      "The ability to identify isolated objects better than whole scenes argues against a pure ventral identity disorder.",
    bedsideDiscriminators: [
      "Sees one object at a time in a complex scene",
      "Global scene understanding worse than local detail",
      "May co-occur with gaze apraxia or optic ataxia",
    ],
    pipelineCorrelation:
      "This belongs to the dorsal spatial-integration stream, where scenes and multiple spatial relations must be held together for awareness and action.",
    teachingPearls: [
      "Scene perception is not just object recognition repeated many times.",
      "Balint-style disorders are high-value dorsal localizers because they expose the spatial integration layer directly.",
    ],
    linkedModules: ["brain-atlas", "ask"],
    comparePresetId: "visual-form-agnosia",
  },
  {
    id: "right-parietal-neglect",
    title: "Right parietal neglect",
    dominantTrack: "attention-network",
    dominantNodes: ["right temporoparietal junction", "right inferior parietal attention network"],
    syndromeFrame:
      "The patient behaves as if the left world is absent, but the decisive clue is variability with attention, cueing, and competition rather than a fixed sensory field cut.",
    strongestLocalization:
      "Right parietal attention network with hemispatial neglect",
    whyItFits:
      "Neglect is a network-level failure to weight contralateral space, so performance shifts with competition and cueing rather than staying like a stable hemianopia.",
    weakerAlternative: "Occipital field cut",
    whyAlternativeWeaker:
      "A true hemianopia behaves like a consistent sensory map loss, not a deficit that improves with attentional cueing or collapses mainly under double simultaneous stimulation.",
    decisiveNextData: [
      "Cancellation tasks, line bisection, and double simultaneous stimulation",
      "Look for broader right-parietal syndrome features beyond pure visual complaint",
    ],
    decisiveNegativeFinding:
      "Variable detection with cueing argues against a stable occipital sensory deficit.",
    bedsideDiscriminators: [
      "Extinction with bilateral stimulation",
      "Rightward line-bisection drift",
      "Improvement with directed cueing",
    ],
    pipelineCorrelation:
      "This sits outside the ventral identity ladder itself and instead reflects the attention network that determines what visual content reaches awareness and report.",
    teachingPearls: [
      "Neglect mimics visual loss without being one.",
      "When competition changes the deficit, think attention network before primary sensory cortex.",
    ],
    linkedModules: ["visual-field", "brain-atlas", "ask"],
    comparePresetId: "posterior-hemianopia",
  },
];

export function getVisionSyndromePreset(presetId: string) {
  return visionSyndromePresets.find((preset) => preset.id === presetId);
}
