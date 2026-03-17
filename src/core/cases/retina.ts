import type { RetinaClinicalCase } from "~/core/cases";

export const retinaCases: RetinaClinicalCase[] = [
  {
    id: "painful-central-loss",
    title: "Painful central visual loss",
    oneLiner:
      "A patient reports painful monocular blur with colors looking washed out in the left eye.",
    chiefComplaint:
      "The left eye is blurrier, reading is harder, and red objects look duller than before.",
    history:
      "Pain worsens with eye movement. The right eye remains normal, and the deficit feels central rather than curtain-like or purely peripheral.",
    syndromeFrame:
      "This is an eye-specific prechiasmal syndrome. The key split is optic nerve versus macula, not retina versus cortex.",
    examFindings: [
      "Left relative afferent pupillary defect",
      "Reduced red desaturation on the left",
      "Central monocular scotoma on bedside field testing",
    ],
    prompt:
      "Which prechiasmal pattern is strongest, and why is a macular explanation weaker even though central acuity is affected?",
    hints: [
      "Decide whether the central loss distorts the image or desaturates the signal.",
      "Pain with eye movement is not a casual clue.",
    ],
    localizationCues: [
      "The deficit is monocular and central.",
      "Color washout and an afferent defect pull the localization toward the optic nerve.",
    ],
    differentialTraps: [
      "Do not label every central scotoma retinal by reflex.",
      "Do not jump to cortex when one eye alone is affected.",
    ],
    nextDataRequests: [
      "Formal color testing or red desaturation",
      "Fundus correlation to separate optic nerve from macula",
      "Further demyelinating-workup context if optic neuritis remains likely",
    ],
    teachingPoints: [
      "Central monocular loss must be split into optic nerve versus macula deliberately.",
      "Pain plus dyschromatopsia is a stronger optic-neuropathy story than a primary retinal story.",
    ],
    followUpModules: ["visual-field", "vision", "ask"],
    expectedPresetId: "optic-neuritis",
    startingPresetId: "macular-lesion",
  },
  {
    id: "transient-obscurations",
    title: "Transient obscurations with pressure clues",
    oneLiner:
      "A patient has brief dimming spells and headaches, with blurred peripheral edges but relatively preserved central acuity.",
    chiefComplaint:
      "Vision greys out for seconds when standing or bending, then recovers.",
    history:
      "There are headaches and pulse-synchronous whooshing sounds. Both eyes are involved, and the deficits cluster near the blind spot rather than as a hemianopia.",
    syndromeFrame:
      "This is a disc-swelling story until proven otherwise. The task is to recognize blind-spot logic and pressure risk early.",
    examFindings: [
      "Bilateral disc swelling",
      "Enlarged blind spots",
      "Transient visual obscurations rather than a fixed homonymous cut",
    ],
    prompt:
      "Which pattern best fits, and why is posterior cortical localization a much weaker first move?",
    hints: [
      "Ask whether the symptom is pressure-sensitive and bilateral.",
      "Blind-spot enlargement is not the language of occipital cortex.",
    ],
    localizationCues: [
      "The deficits cluster around the physiologic blind spot.",
      "The syndrome is bilateral but still prechiasmal at the optic disc.",
    ],
    differentialTraps: [
      "Do not call bilateral visual complaints cortical without reading the geometry.",
      "Do not miss papilledema because central acuity is initially preserved.",
    ],
    nextDataRequests: [
      "Urgent fundus correlation",
      "Pressure-directed evaluation if papilledema is real",
      "Formal fields to document blind-spot enlargement",
    ],
    teachingPoints: [
      "Disc swelling enlarges the blind spot before it creates a hemianopic story.",
      "Pressure clues plus transient obscurations are high-yield neuro-ophthalmology signals.",
    ],
    followUpModules: ["visual-field", "brain-atlas", "ask"],
    expectedPresetId: "papilledema",
    startingPresetId: "glaucoma",
  },
  {
    id: "progressive-peripheral-bumping",
    title: "Progressive peripheral bumping",
    oneLiner:
      "A patient slowly develops peripheral misses and repeatedly clips doorframes, but denies a clean left-right hemifield loss.",
    chiefComplaint:
      "Walking and stairs feel less secure, especially in dim light, but there was no sudden event.",
    history:
      "The decline is chronic and often unnoticed until function drops. Formal testing suggests arcuate and nasal-step style losses rather than a congruous homonymous defect.",
    syndromeFrame:
      "This is nerve-fiber architecture first, cortex second. The question is whether the field follows retinal bundle logic.",
    examFindings: [
      "Arcuate field loss",
      "No homonymous congruous pattern",
      "Optic disc cupping",
    ],
    prompt:
      "Which localization pattern is strongest, and why is an occipital field-cut interpretation weaker?",
    hints: [
      "Ask whether the geometry is eye-specific or shared between eyes.",
      "Chronic asymmetry matters here.",
    ],
    localizationCues: [
      "The defects follow arcuate fiber patterns instead of hemifield geometry.",
      "The clinical course is chronic and pressure-linked rather than sudden and vascular.",
    ],
    differentialTraps: [
      "Do not force every field complaint into a retrochiasmal map.",
      "Do not ignore monocular asymmetry when the patient says 'side vision.'",
    ],
    nextDataRequests: [
      "Cup-to-disc assessment or OCT",
      "Formal monocular perimetry",
      "Intraocular pressure and chronicity review",
    ],
    teachingPoints: [
      "Arcuate and nasal-step patterns are nerve-fiber-layer language.",
      "The retina module should teach when the field map is still an eye problem, not a hemispace problem.",
    ],
    followUpModules: ["visual-field", "ask"],
    expectedPresetId: "glaucoma",
    startingPresetId: "papilledema",
  },
  {
    id: "flashes-and-curtain",
    title: "Flashes, floaters, and a curtain",
    oneLiner:
      "A patient reports sudden flashes, new floaters, and a dark curtain descending over the left eye.",
    chiefComplaint:
      "Part of the left eye view is being covered from above, and it started abruptly.",
    history:
      "The symptom is monocular, acute, and described as a curtain rather than a clean static cut. There is no eye-movement pain or bilateral pattern.",
    syndromeFrame:
      "This is a retinal emergency story until proven otherwise. The key task is not to dilute the urgency with generic localization language.",
    examFindings: [
      "Monocular superior curtain-like loss",
      "Photopsias and floaters",
      "No homonymous pattern across both eyes",
    ],
    prompt:
      "Which pattern best fits, and why is optic neuritis the weaker alternative despite the same eye being involved?",
    hints: [
      "The shape of the loss matters here.",
      "Urgency is part of the localization logic.",
    ],
    localizationCues: [
      "Curtain language points to retinal separation.",
      "Flashes and floaters support peripheral retinal traction or detachment.",
    ],
    differentialTraps: [
      "Do not normalize a retinal-detachment story into vague monocular blur.",
      "Do not confuse curtain-like loss with central scotoma logic.",
    ],
    nextDataRequests: [
      "Urgent retinal exam",
      "Clarify whether the macula is threatened",
      "Eye-specific temporal profile and photopsia history",
    ],
    teachingPoints: [
      "Retinal detachment is urgent prechiasmal disease.",
      "The symptom description itself can be more localizing than bedside field testing.",
    ],
    followUpModules: ["visual-field", "ask"],
    expectedPresetId: "retinal-detachment",
    startingPresetId: "optic-neuritis",
  },
];
