import type { VisualFieldLocalizationCase } from "~/core/cases";

export const visualFieldCases: VisualFieldLocalizationCase[] = [
  {
    id: "monocular-loss",
    title: "Sudden monocular loss",
    oneLiner:
      "A patient loses vision in the left eye, while the right eye sees normally.",
    chiefComplaint: "The left eye suddenly went dark, but the right eye is unchanged.",
    history:
      "The deficit respects one eye completely rather than one side of space. Reading with the right eye remains possible.",
    syndromeFrame:
      "This is a monocular visual syndrome, which localizes before the chiasm until proven otherwise.",
    examFindings: [
      "Left-eye visual loss with intact right-eye field",
      "No homonymous pattern on bedside testing",
      "No clear cortical visual behavior change",
    ],
    prompt:
      "Which lesion pattern is the best fit, and why is a cortical explanation much weaker?",
    hints: [
      "One-eye defects localize before binocular streams merge.",
      "Ask whether the problem is eye-specific or space-specific.",
    ],
    localizationCues: [
      "The deficit respects one eye, not one hemifield of shared space.",
      "Later visual pathway lesions stop behaving monocularly.",
    ],
    differentialTraps: [
      "Do not call monocular blindness an occipital problem.",
      "Do not confuse a single-eye complaint with a homonymous field cut that the patient describes poorly.",
    ],
    nextDataRequests: [
      "Pupil exam for an afferent defect",
      "Retinal and optic nerve correlation before chasing retrochiasmal lesions",
    ],
    teachingPoints: [
      "Monocular means prechiasmal until proven otherwise.",
      "The first localization split in visual neurology is eye-specific versus space-specific.",
    ],
    followUpModules: ["retina", "vision", "ask"],
    expectedPresetId: "left-optic-nerve",
    startingPresetId: "right-optic-tract",
  },
  {
    id: "bitemporal-pattern",
    title: "Temporal fields disappear on both sides",
    oneLiner:
      "A patient keeps missing objects at the far temporal edge of both visual fields.",
    chiefComplaint:
      "Door frames and people at the far edge of vision vanish on both sides.",
    history:
      "Central vision is relatively preserved, but the field pattern is symmetric and temporal in each eye rather than homonymous.",
    syndromeFrame:
      "This is a crossing-fiber pattern. The highest-yield question is where binocular wiring geometry is vulnerable.",
    examFindings: [
      "Temporal field loss in both eyes",
      "No monocular blindness",
      "No homonymous left-right shared-space deficit",
    ],
    prompt:
      "Which lesion pattern best explains this field geometry, and why is posterior cortex the wrong first answer?",
    hints: [
      "Think about where nasal retinal fibers cross.",
      "This is binocular, but not homonymous.",
    ],
    localizationCues: [
      "Temporal loss in both eyes is the signature pattern.",
      "The defect localizes before cortex because it is still organized by crossing anatomy.",
    ],
    differentialTraps: [
      "Do not force every binocular pattern into the occipital lobes.",
      "Do not misread bitemporal loss as a homonymous hemianopia.",
    ],
    nextDataRequests: [
      "Formal monocular perimetry",
      "Parasellar imaging if the field pattern is confirmed",
    ],
    teachingPoints: [
      "Bitemporal defects are classic chiasmal patterns.",
      "The field diagram often localizes better than the symptom narrative alone.",
    ],
    followUpModules: ["retina", "brain-atlas", "ask"],
    expectedPresetId: "optic-chiasm",
    startingPresetId: "right-occipital-cortex",
  },
  {
    id: "pie-in-the-sky",
    title: "Upper-left quadrant disappears",
    oneLiner:
      "A patient repeatedly misses objects in the upper-left visual quadrant of both eyes.",
    chiefComplaint:
      "The patient notices missing information high and to the left rather than total blindness.",
    history:
      "The defect is quadrant-specific and shared across both eyes, with otherwise intact central acuity.",
    syndromeFrame:
      "This is a retrochiasmal quadrantanopia, and the task is to decide whether the radiations are running through temporal or parietal cortex.",
    examFindings: [
      "Left superior quadrantanopic loss",
      "Both eyes share the same affected quadrant",
      "No complete hemifield loss",
    ],
    prompt:
      "Which radiation pattern is the strongest fit, and what makes the parietal alternative weaker?",
    hints: [
      "Decide whether the missing quadrant is high or low.",
      "Radiation lesions carve quadrants more often than whole hemifields.",
    ],
    localizationCues: [
      "The deficit is homonymous and superior.",
      "Temporal radiations carry the information that lands in this upper field pattern.",
    ],
    differentialTraps: [
      "Do not confuse superior quadrantanopia with its parietal mirror image.",
      "Do not overcall occipital cortex when the defect looks like a radiation wedge.",
    ],
    nextDataRequests: [
      "Quadrant-specific formal field testing",
      "Temporal lobe imaging and temporal-syndrome correlation if present",
    ],
    teachingPoints: [
      "Meyer loop gives 'pie in the sky.'",
      "Quadrantanopia often means partial retrochiasmal pathway involvement rather than whole-tract loss.",
    ],
    followUpModules: ["vision", "brain-atlas", "ask"],
    expectedPresetId: "right-meyer-loop",
    startingPresetId: "right-parietal-radiations",
  },
  {
    id: "posterior-hemianopia",
    title: "Clean posterior homonymous loss",
    oneLiner:
      "A patient has a left homonymous defect that looks highly congruous and seems to spare central vision.",
    chiefComplaint:
      "The patient misses the left side of visual space, but central fixation feels more preserved than expected.",
    history:
      "The field defect is stable and shared between both eyes. The pattern appears very similar from eye to eye rather than ragged or asymmetrical.",
    syndromeFrame:
      "This is a posterior retrochiasmal syndrome until proven otherwise. The key question is what about the field pattern pushes the lesion all the way back toward occipital cortex.",
    examFindings: [
      "Left homonymous visual field loss",
      "High congruity between the two eyes",
      "Relative macular sparing pattern",
    ],
    prompt:
      "Which lesion pattern is the strongest fit, and why is a more anterior tract lesion weaker?",
    hints: [
      "Ask how congruous the two-eye pattern is.",
      "Central sparing is a clue, not a coincidence.",
    ],
    localizationCues: [
      "The defect is homonymous and highly congruous.",
      "Macular sparing pushes the lesion posteriorly in the hierarchy.",
    ],
    differentialTraps: [
      "Do not stop at 'retrochiasmal' if the field geometry is telling you it is especially posterior.",
      "Do not use macular sparing as a slogan without explaining why it matters.",
    ],
    nextDataRequests: [
      "Formal perimetry for congruity and central sparing",
      "Occipital imaging and vascular-territory review",
    ],
    teachingPoints: [
      "Congruity helps rank retrochiasmal lesions by posterior depth.",
      "Occipital cortex is often the cleanest explanation for a posterior-looking homonymous cut.",
    ],
    followUpModules: ["vision", "brain-atlas", "ask"],
    expectedPresetId: "right-occipital-cortex",
    startingPresetId: "right-optic-tract",
  },
  {
    id: "neglect-versus-cut",
    title: "Looks blind on the left, but is it a field cut?",
    oneLiner:
      "A patient ignores the left side during cancellation tasks yet sees more when strongly cued.",
    chiefComplaint:
      "The patient acts as if the left world is missing, but the pattern shifts with attention.",
    history:
      "Line bisection drifts rightward, double simultaneous stimulation shows extinction, and the patient can detect left-sided targets better when attention is directed there.",
    syndromeFrame:
      "This is a hemispatial-attention syndrome until proven otherwise. The key distinction is true sensory field loss versus attentional extinction.",
    examFindings: [
      "Left-sided neglect behavior",
      "Extinction on double simultaneous stimulation",
      "Variable left-sided awareness with cueing",
    ],
    prompt:
      "Which localization pattern best fits, and why is a true optic-tract field cut weaker even though the patient seems to miss the left side?",
    hints: [
      "Ask whether attention changes the deficit.",
      "Stable cuts behave differently from neglect under competition.",
    ],
    localizationCues: [
      "Performance changes with cueing and competition.",
      "Neglect is a network problem layered on perception, not pure visual pathway failure.",
    ],
    differentialTraps: [
      "Do not call every left-sided miss a hemianopia.",
      "Do not forget extinction and cancellation tasks when the confrontation exam feels inconsistent.",
    ],
    nextDataRequests: [
      "Double simultaneous stimulation and cancellation testing",
      "Broader parietal syndrome exam, including spatial attention tasks",
    ],
    teachingPoints: [
      "Neglect mimics a field cut without being one.",
      "The decisive clue is often variability with attention rather than field geometry alone.",
    ],
    followUpModules: ["vision", "brain-atlas", "ask"],
    expectedPresetId: "right-parietal-neglect",
    startingPresetId: "right-optic-tract",
  },
];
