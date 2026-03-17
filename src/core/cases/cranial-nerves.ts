import type { CranialNerveClinicalCase } from "~/core/cases";

export const cranialNerveCases: CranialNerveClinicalCase[] = [
  {
    id: "worst-headache-dilated-pupil",
    title: "Worst headache with a dilated pupil",
    oneLiner:
      "A 48-year-old woman with sudden severe headache and left ptosis with a fixed dilated pupil.",
    chiefComplaint:
      "Worst headache of my life. My left eye won't open and everything is double.",
    history:
      "Thunderclap onset headache reaching maximum intensity in seconds. Left eye drooping. Sees double when the lid is lifted. The pupil on the left is larger than the right.",
    syndromeFrame:
      "This is a pupil-involving CN III palsy until posterior communicating artery aneurysm is excluded. The parasympathetic fibers on the SURFACE of the nerve are compressed first by external mass.",
    examFindings: [
      "Left ptosis (complete)",
      "Left eye 'down and out' (SR, MR, IR, IO paralyzed)",
      "Left pupil 6mm and unreactive (parasympathetic fibers compressed)",
      "Right eye and pupil normal",
    ],
    prompt:
      "Why does external compression of CN III affect the pupil first, and why is this an emergency?",
    hints: [
      "Parasympathetic fibers travel on the OUTSIDE (superficial) of the CN III trunk.",
      "An expanding PComm aneurysm compresses from outside → hits parasympathetics first.",
      "Microvascular ischemia (diabetes) affects the INSIDE (vasa nervorum) → spares the pupil.",
    ],
    localizationCues: [
      "Ipsilateral fixed dilated pupil = CN III parasympathetic fibers compressed from outside.",
      "Thunderclap headache + CN III palsy = aneurysm until proven otherwise.",
    ],
    differentialTraps: [
      "Do not diagnose diabetic CN III palsy when the pupil is involved.",
      "Do not wait for CT before considering angiography — a normal CT does not exclude a non-ruptured aneurysm.",
    ],
    nextDataRequests: [
      "CT head (SAH?), then CT angiography STAT",
      "If CTA negative: conventional angiography (DSA) to exclude small aneurysm",
      "Lumbar puncture if CT is negative (xanthochromia for SAH)",
    ],
    teachingPoints: [
      "Pupil-INVOLVING CN III = compressive (aneurysm) until proven otherwise.",
      "Pupil-SPARING CN III = microvascular (diabetes) is the most common cause, but requires close follow-up.",
    ],
    followUpModules: ["brain-atlas", "stroke", "motor-pathway", "ask"],
    expectedNerveNumber: 3,
    syndromeId: null,
  },
  {
    id: "facial-droop-forehead-spared",
    title: "Right face droop but the forehead works",
    oneLiner:
      "A 70-year-old with sudden right lower facial weakness — forehead wrinkling is intact.",
    chiefComplaint:
      "The right side of my mouth is drooping. Food is falling out.",
    history:
      "Sudden onset 1 hour ago. Left arm is also weak. Speech is slurred. The patient can wrinkle the right forehead and close the right eye normally.",
    syndromeFrame:
      "Forehead SPARING = UMN facial weakness = supranuclear lesion (contralateral hemisphere). This is a stroke pattern, not Bell's palsy.",
    examFindings: [
      "Right lower facial weakness (nasolabial fold flat, mouth droops)",
      "Right forehead wrinkling INTACT (can raise eyebrows symmetrically)",
      "Left arm drift",
      "Slurred speech",
    ],
    prompt:
      "Explain the anatomical basis for forehead sparing and why this changes the diagnosis from Bell's palsy to stroke.",
    hints: [
      "Upper face motor neurons receive input from BOTH hemispheres.",
      "Lower face motor neurons receive input from the CONTRALATERAL hemisphere only.",
    ],
    localizationCues: [
      "Forehead spared = UMN = above the facial nucleus = contralateral hemisphere lesion.",
      "Associated arm weakness confirms a hemispheric (not pontine) localization.",
    ],
    differentialTraps: [
      "Do not diagnose Bell's palsy when the forehead is spared.",
      "Do not miss the arm weakness — this makes it a stroke, not an isolated CN VII palsy.",
    ],
    nextDataRequests: [
      "Stroke protocol: CT head → CTA → tPA consideration",
      "NIHSS scoring",
      "MRI with DWI if within window",
    ],
    teachingPoints: [
      "Forehead sparing is the single most important exam finding distinguishing UMN from LMN facial weakness.",
      "The bilateral corticobulbar innervation of upper face motor neurons is why UMN lesions spare the forehead.",
    ],
    followUpModules: ["motor-pathway", "stroke", "brain-atlas", "ask"],
    expectedNerveNumber: 7,
    syndromeId: null,
  },
  {
    id: "vertigo-hints-exam",
    title: "Acute vertigo — is it the ear or the brain?",
    oneLiner:
      "A 60-year-old with sudden severe vertigo, nausea, and unsteadiness. Is this peripheral or central?",
    chiefComplaint:
      "The room is spinning. I can't walk. I'm vomiting.",
    history:
      "Sudden onset 2 hours ago. No hearing loss. No headache initially. The critical question: peripheral (vestibular neuritis) or central (posterior fossa stroke)?",
    syndromeFrame:
      "The HINTS exam (Head Impulse, Nystagmus, Test of Skew) is more sensitive than MRI in the first 48 hours for posterior fossa stroke. A negative head impulse test in acute vertigo is a DANGEROUS finding.",
    examFindings: [
      "Nystagmus: direction-changing (beats left looking left, beats right looking right) — CENTRAL pattern",
      "Head impulse test: NEGATIVE (no corrective saccade) — peripheral pathways INTACT",
      "Skew deviation present: left eye higher than right — CENTRAL pattern",
      "Mild left limb ataxia on finger-to-nose",
    ],
    prompt:
      "Why does a negative head impulse test in acute vertigo point to a CENTRAL cause, and why is this more dangerous?",
    hints: [
      "A POSITIVE head impulse (corrective saccade) means the peripheral vestibular system is damaged = vestibular neuritis = benign.",
      "A NEGATIVE head impulse means the peripheral system works fine = the problem is central = stroke until proven otherwise.",
    ],
    localizationCues: [
      "Direction-changing nystagmus = central.",
      "Negative head impulse = central (peripheral pathways intact).",
      "Skew deviation = brainstem/cerebellar (otolithic pathway disruption).",
    ],
    differentialTraps: [
      "Do not diagnose vestibular neuritis if the HINTS exam shows any central features.",
      "MRI can be FALSE NEGATIVE in the first 48 hours for posterior fossa stroke — HINTS is more sensitive.",
    ],
    nextDataRequests: [
      "Urgent MRI with DWI (acknowledge possible false negative in hyperacute posterior fossa)",
      "CTA for vertebrobasilar circulation",
      "If HINTS is central: treat as stroke until proven otherwise",
    ],
    teachingPoints: [
      "HINTS exam outperforms MRI in the first 48 hours for posterior fossa stroke diagnosis.",
      "A negative head impulse test in acute vertigo is a red flag for central pathology — it means the ear works fine and the problem is in the brain.",
    ],
    followUpModules: ["brain-atlas", "stroke", "eeg", "ask"],
    expectedNerveNumber: 8,
    syndromeId: null,
  },
];
