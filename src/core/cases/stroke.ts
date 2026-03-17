import type { StrokeClinicalCase } from "~/core/cases";

export const strokeCases: StrokeClinicalCase[] = [
  {
    id: "wake-up-hemianopia",
    title: "Wake-up visual field loss with normal strength",
    oneLiner:
      "A 65-year-old wakes with inability to see anything on the left side. Motor exam is entirely normal.",
    chiefComplaint:
      "I'm bumping into things on my left. I nearly walked into a door frame this morning.",
    history:
      "Noticed on waking. Last seen normal at bedtime (8 hours ago). No headache. No weakness. History of atrial fibrillation, not anticoagulated.",
    syndromeFrame:
      "An isolated homonymous hemianopia with normal motor exam = PCA territory stroke. The PCA supplies the occipital cortex (vision) but NOT the motor strip or internal capsule. Motor sparing is the key to PCA localization.",
    examFindings: [
      "Complete left homonymous hemianopia with macular sparing",
      "Normal motor exam (5/5 throughout)",
      "Normal language and cognition",
      "Irregular pulse (atrial fibrillation)",
    ],
    prompt:
      "Why is this a PCA and not an MCA stroke, and what does macular sparing tell you?",
    hints: [
      "MCA strokes cause weakness. PCA strokes spare the motor system entirely.",
      "Macular sparing occurs because the occipital pole has dual supply (PCA + MCA collaterals).",
    ],
    localizationCues: [
      "Isolated hemianopia without weakness = occipital cortex = PCA territory.",
      "Macular sparing = posterior occipital cortex at the pole has collateral supply.",
    ],
    differentialTraps: [
      "Do not dismiss a visual field cut as 'just vision' — this is a stroke requiring full workup.",
      "Do not confuse with optic tract lesion (no macular sparing, RAPD present in tract lesions).",
    ],
    nextDataRequests: [
      "MRI DWI to confirm PCA territory infarct",
      "Echo + Holter (likely cardioembolic from AF)",
      "Initiate anticoagulation for stroke prevention",
    ],
    teachingPoints: [
      "PCA stroke is often missed because there is no weakness. Visual field testing is mandatory in stroke assessment.",
      "An isolated hemianopia patient may present to ophthalmology, not neurology — awareness of vascular territories prevents delays.",
    ],
    followUpModules: ["visual-field", "brain-atlas", "cranial-nerves", "ask"],
    expectedTerritoryId: "pca",
    startingTerritoryId: "mca-inferior",
  },
  {
    id: "dense-hemiplegia-no-cortical",
    title: "Dense hemiplegia with no cortical signs",
    oneLiner:
      "A 72-year-old hypertensive with sudden left face, arm, and leg weakness — equal in all three. No aphasia, no neglect, no field cut.",
    chiefComplaint:
      "My whole left side went weak all at once. I dropped my coffee and my leg buckled.",
    history:
      "Sudden onset 2 hours ago. Equally dense weakness in face, arm, and leg. Speech is normal. Understands everything. No visual complaints. Long history of poorly controlled hypertension and diabetes.",
    syndromeFrame:
      "Dense equal hemiparesis WITHOUT cortical signs = internal capsule lacunar infarct (pure motor hemiparesis). The corticospinal fibers are so densely packed in the posterior limb that a tiny infarct produces devastating weakness.",
    examFindings: [
      "Left face, arm, and leg 2/5 power (equally dense)",
      "Normal speech and language",
      "No neglect or extinction",
      "Full visual fields",
      "No sensory loss",
    ],
    prompt:
      "Why does the ABSENCE of cortical signs help localize this, and why is a lacunar infarct from a small artery?",
    hints: [
      "Cortical signs (aphasia, neglect, field cut) require cortical involvement — MCA cortical branches.",
      "The internal capsule has no cortex — it's deep white matter supplied by small perforating arteries.",
    ],
    localizationCues: [
      "Equal face = arm = leg weakness = dense fiber packing = capsular, not cortical.",
      "NO cortical signs = subcortical lesion (capsule or pons).",
    ],
    differentialTraps: [
      "Do not assume cortical stroke just because the deficit is dense.",
      "Do not skip vascular imaging — some 'lacunar' presentations are actually from large vessel disease.",
    ],
    nextDataRequests: [
      "MRI DWI (small capsular infarct)",
      "CTA to exclude ICA stenosis as embolic source",
      "Aggressive hypertension and diabetes management",
    ],
    teachingPoints: [
      "The absence of cortical signs is itself a localizing finding — it points to subcortical (capsular or brainstem) localization.",
      "Lacunar infarcts are small vessel disease — the mechanism is lipohyalinosis from chronic hypertension, not embolism.",
    ],
    followUpModules: ["motor-pathway", "brain-atlas", "ecg", "ask"],
    expectedTerritoryId: "lacunar-capsule",
    startingTerritoryId: "mca-stem",
  },
  {
    id: "conscious-quadriplegic",
    title: "The conscious quadriplegic — locked-in syndrome",
    oneLiner:
      "A 62-year-old found 'unresponsive' who is actually fully conscious but can only communicate with eye blinks.",
    chiefComplaint:
      "Found unresponsive at home. Initially treated as comatose in the ED.",
    history:
      "Found on the floor. No response to voice or painful stimuli. A nurse notices the patient seems to track with his eyes. When asked to look up, the eyes move upward. When asked to blink twice for yes, the patient blinks twice.",
    syndromeFrame:
      "Locked-in syndrome from ventral pontine infarction (basilar artery occlusion). The patient is FULLY CONSCIOUS — the reticular activating system (dorsal pons) is intact. The corticospinal and corticobulbar tracts (ventral pons) are destroyed bilaterally. Only vertical eye movements (midbrain, above the lesion) and blinking remain.",
    examFindings: [
      "Quadriplegia (no limb movement to command or pain)",
      "Anarthria (no speech)",
      "Vertical eye movements INTACT (look up on command)",
      "Blinking INTACT (can blink to command)",
      "FULL CONSCIOUSNESS (communicates via blink code)",
      "Bilateral Babinski signs",
    ],
    prompt:
      "Why are vertical eye movements and blinking preserved while everything else is lost?",
    hints: [
      "Vertical gaze centers are in the midbrain (above the pontine lesion).",
      "The reticular activating system is dorsal — ventral pontine infarction spares consciousness.",
    ],
    localizationCues: [
      "Quadriplegia + anarthria + preserved consciousness = ventral pons.",
      "Preserved vertical gaze = midbrain (above lesion) is intact.",
    ],
    differentialTraps: [
      "Do NOT diagnose coma without testing eye movements and blinking to command.",
      "Locked-in syndrome is frequently misdiagnosed as coma or persistent vegetative state — this is devastating for the patient.",
    ],
    nextDataRequests: [
      "Urgent CTA/MRA of basilar artery",
      "Consider thrombectomy even late (basilar occlusion has extended treatment windows)",
      "EEG to confirm normal cortical activity (rules out diffuse cortical injury)",
    ],
    teachingPoints: [
      "Always test for locked-in syndrome in apparent coma: ask the patient to look up and blink on command.",
      "Basilar artery occlusion is the great imitator of coma — the patient may be fully aware of everything happening around them.",
    ],
    followUpModules: ["cranial-nerves", "motor-pathway", "brain-atlas", "ask"],
    expectedTerritoryId: "basilar",
    startingTerritoryId: "mca-stem",
  },
];
