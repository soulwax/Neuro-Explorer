import type { VisionLocalizationCase } from "~/core/cases";

export const visionCases: VisionLocalizationCase[] = [
  {
    id: "posterior-field-cut",
    title: "Posterior field cut after a hemispheric event",
    oneLiner:
      "A patient misses the left side of visual space in both eyes, and the defect looks strikingly congruous on formal testing.",
    chiefComplaint:
      "The patient keeps colliding with objects on the left but reads near central fixation better than expected.",
    history:
      "The field pattern is shared across both eyes rather than monocular, and the deficit is more stable than attention-dependent.",
    syndromeFrame:
      "This is retrochiasmal until proven otherwise. The real task is deciding whether the lesion is especially posterior rather than stopping at 'visual pathway.'",
    examFindings: [
      "Left homonymous field deficit",
      "High congruity between the two eyes",
      "Relative macular sparing pattern",
    ],
    prompt:
      "Which cortical syndrome preset best fits, and why is neglect the weaker alternative even though both can look left-sided?",
    hints: [
      "Ask whether the deficit is stable or attention-dependent.",
      "Congruity is not a decorative word here.",
    ],
    localizationCues: [
      "Homonymous geometry is preserved across both eyes.",
      "Posterior features such as congruity and central sparing push toward occipital cortex.",
    ],
    differentialTraps: [
      "Do not stop at the word retrochiasmal when the field geometry is telling you it is posterior.",
      "Do not confuse cue-sensitive neglect with a fixed homonymous cut.",
    ],
    nextDataRequests: [
      "Formal perimetry with congruity review",
      "Occipital imaging and vascular-territory correlation",
    ],
    teachingPoints: [
      "Field cuts localize entry into cortex before they localize syndrome-specific recognition failure.",
      "The absence of attention variability is a real negative finding.",
    ],
    followUpModules: ["visual-field", "brain-atlas", "ask"],
    expectedPresetId: "posterior-hemianopia",
    startingPresetId: "right-parietal-neglect",
  },
  {
    id: "face-identity-failure",
    title: "Faces are seen but not recognized",
    oneLiner:
      "A patient describes eyes, nose, and mouth normally, yet cannot identify familiar faces on sight.",
    chiefComplaint:
      "The patient knows a face is a face but cannot tell whose face it is until hearing the voice.",
    history:
      "Reading and object use are better preserved than face identity. Visual acuity is adequate and there is no dominant field-cut complaint.",
    syndromeFrame:
      "This is a category-selective ventral-stream identity problem until proven otherwise, not a primary sensory loss.",
    examFindings: [
      "Face recognition impaired",
      "Voice-based recognition relatively preserved",
      "No major homonymous field complaint",
    ],
    prompt:
      "Which syndrome preset is strongest, and why is visual-form agnosia weaker even though both live in ventral association cortex?",
    hints: [
      "Ask what is selectively impaired.",
      "A preserved description of the face matters.",
    ],
    localizationCues: [
      "The deficit is identity-specific rather than globally perceptual.",
      "Basic visual intake is adequate enough for structured description.",
    ],
    differentialTraps: [
      "Do not collapse all ventral-stream disease into a generic agnosia label.",
      "Do not call this a field problem simply because the complaint is visual.",
    ],
    nextDataRequests: [
      "Compare face, object, voice, and word recognition",
      "Inspect ventral temporal imaging, especially fusiform regions",
    ],
    teachingPoints: [
      "Category selectivity localizes later than basic form extraction.",
      "Spared non-face recognition can be more localizing than the complaint itself.",
    ],
    followUpModules: ["brain-atlas", "ask"],
    expectedPresetId: "prosopagnosia",
    startingPresetId: "visual-form-agnosia",
  },
  {
    id: "world-without-color",
    title: "The scene is intact but color disappears",
    oneLiner:
      "A patient says the world now looks washed into greys, yet can still track forms and navigate the room.",
    chiefComplaint:
      "Everything has lost its normal color quality, but shape and movement still seem understandable.",
    history:
      "There is no obvious eye-specific acuity crash and no dominant monocular field story. The complaint is perceptual color loss rather than dimness alone.",
    syndromeFrame:
      "This is a cortical color-processing syndrome until proven otherwise. The localization question is ventral color cortex versus earlier ocular input.",
    examFindings: [
      "Color naming and matching impaired",
      "Form discrimination better preserved than color experience",
      "No clear monocular field complaint",
    ],
    prompt:
      "Which syndrome preset best fits, and why is retinal color loss the weaker alternative from the story given?",
    hints: [
      "Separate color experience from eye-specific sensory failure.",
      "Preserved form is a localization clue.",
    ],
    localizationCues: [
      "Shape remains usable while color experience collapses.",
      "The complaint is binocular and cortical-feeling rather than eye-specific.",
    ],
    differentialTraps: [
      "Do not assume all color problems are retinal.",
      "Do not ignore dissociation when one visual dimension is spared.",
    ],
    nextDataRequests: [
      "Test color matching against luminance-based shape decisions",
      "Review ventral occipital imaging",
    ],
    teachingPoints: [
      "Color constancy is a cortical achievement, not just a retinal input stream.",
      "Dissociation between preserved form and lost color is a strong cortical clue.",
    ],
    followUpModules: ["retina", "brain-atlas", "ask"],
    expectedPresetId: "achromatopsia",
    startingPresetId: "posterior-hemianopia",
  },
  {
    id: "misreaching-with-good-recognition",
    title: "Sees the target but misreaches to it",
    oneLiner:
      "A patient identifies the object correctly but reaches inaccurately when trying to grasp it under visual guidance.",
    chiefComplaint:
      "The hand keeps going to the wrong place even though the patient can tell what the object is.",
    history:
      "Strength is preserved, and the deficit is worse when the movement depends on visual guidance than when the target is localized by touch or verbal cueing.",
    syndromeFrame:
      "This is a dorsal visuomotor transformation problem until proven otherwise, not a ventral identity failure.",
    examFindings: [
      "Misreaching to visually presented targets",
      "Object identification better than action guidance",
      "No major primary weakness",
    ],
    prompt:
      "Which syndrome preset is strongest, and why is prosopagnosia or other ventral identity failure the weaker family of explanations?",
    hints: [
      "Ask whether the problem is perception or action guidance.",
      "Preserved recognition is not neutral here.",
    ],
    localizationCues: [
      "The brain knows what the object is but cannot guide the hand to it accurately.",
      "The deficit becomes more obvious during visually guided action.",
    ],
    differentialTraps: [
      "Do not treat all visual complaints as ventral-stream complaints.",
      "Do not label the syndrome weakness when the reach fails in visually specific ways.",
    ],
    nextDataRequests: [
      "Compare visual reaching to proprioceptive reaching",
      "Look for gaze apraxia or simultanagnosia",
    ],
    teachingPoints: [
      "Vision for action and vision for identity are not the same system.",
      "Dorsal deficits can preserve recognition while destroying guidance.",
    ],
    followUpModules: ["brain-atlas", "ask"],
    expectedPresetId: "optic-ataxia",
    startingPresetId: "prosopagnosia",
  },
  {
    id: "left-world-ignored",
    title: "Acts blind on the left but improves with cueing",
    oneLiner:
      "A patient misses the left side in cluttered space yet can detect left-sided targets more often when attention is strongly directed there.",
    chiefComplaint:
      "The patient seems to ignore the left half of the room, but the behavior shifts depending on cueing and task competition.",
    history:
      "Line bisection drifts rightward, double simultaneous stimulation shows extinction, and the pattern is less stable than a fixed hemianopia.",
    syndromeFrame:
      "This is an attention-network syndrome until proven otherwise. The question is not simply where the field is lost, but whether the deficit is really sensory at all.",
    examFindings: [
      "Extinction with bilateral stimulation",
      "Variable left-sided awareness with cueing",
      "Rightward line-bisection drift",
    ],
    prompt:
      "Which syndrome preset best fits, and why is a posterior occipital field cut weaker even though the patient behaves left-blind?",
    hints: [
      "Ask what cueing does to the deficit.",
      "Competition is part of the exam, not noise.",
    ],
    localizationCues: [
      "The deficit varies with attention and competition.",
      "This is awareness weighting, not simply missing retinal input.",
    ],
    differentialTraps: [
      "Do not call every left-sided miss a hemianopia.",
      "Do not forget cancellation and extinction testing when confrontation feels inconsistent.",
    ],
    nextDataRequests: [
      "Cancellation testing and line bisection",
      "Broader right-parietal syndrome exam",
    ],
    teachingPoints: [
      "Neglect sits outside the ventral identity ladder and outside pure field geometry.",
      "The most localizing sign may be cue-dependence rather than the initial complaint.",
    ],
    followUpModules: ["visual-field", "brain-atlas", "ask"],
    expectedPresetId: "right-parietal-neglect",
    startingPresetId: "posterior-hemianopia",
  },
];
