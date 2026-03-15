import type { DermatomeClinicalCase } from "~/core/cases";

export const dermatomeCases: DermatomeClinicalCase[] = [
  {
    id: "cape-distribution-burns",
    title: "Bilateral burns the patient didn't feel",
    oneLiner:
      "A 35-year-old with painless burns on both hands discovered while cooking.",
    chiefComplaint:
      "I keep burning my hands and don't feel it. I found blisters I didn't know about.",
    history:
      "Progressive bilateral hand numbness over 2 years. Multiple painless burns and cuts. Proprioception is normal — no clumsiness. Headaches with coughing (Valsalva-triggered).",
    syndromeFrame:
      "Bilateral dissociated sensory loss (pain/temperature lost, proprioception preserved) in a cape distribution = central cord process (syringomyelia). The crossing spinothalamic fibers in the anterior white commissure are disrupted by the expanding syrinx, while dorsal columns at the periphery are spared.",
    examFindings: [
      "Loss of pain and temperature bilaterally: C4-T6 (cape distribution)",
      "Preserved proprioception and vibration in the hands",
      "Bilateral hand intrinsic muscle wasting (anterior horn involvement)",
      "Chiari I malformation on MRI with cervicothoracic syrinx",
    ],
    prompt:
      "Why does syringomyelia produce dissociated sensory loss, and why is the cape distribution diagnostic?",
    hints: [
      "The spinothalamic fibers CROSS in the anterior white commissure — right through the center of the cord.",
      "A central cavity disrupts these crossing fibers at the levels it occupies, but the dorsal columns at the posterior periphery are untouched.",
    ],
    localizationCues: [
      "Bilateral pain/temperature loss + preserved proprioception = crossing fibers disrupted = central cord.",
      "Cape distribution = the syrinx occupies cervical + upper thoracic segments.",
    ],
    differentialTraps: [
      "Do not attribute painless burns to peripheral neuropathy without checking if proprioception is spared — peripheral neuropathy affects all modalities.",
      "Do not miss the Chiari malformation — headaches with cough/Valsalva are the clue.",
    ],
    nextDataRequests: [
      "MRI cervicothoracic spine with sagittal views (syrinx)",
      "MRI craniocervical junction (Chiari malformation)",
      "EMG/NCS if anterior horn involvement suspected (hand wasting)",
    ],
    teachingPoints: [
      "Syringomyelia is the classic teaching case for dissociated sensory loss at the spinal cord level.",
      "The tract anatomy explains everything: crossing fibers (spinothalamic) are vulnerable to central lesions; peripheral fibers (dorsal columns) are spared.",
    ],
    followUpModules: ["motor-pathway", "brain-atlas", "action-potential", "ask"],
    expectedLesionId: "central-cord",
    startingLesionId: "polyneuropathy",
  },
  {
    id: "unsteady-dark-positive-romberg",
    title: "Unsteady in the dark with a positive Romberg",
    oneLiner:
      "A 55-year-old with progressive gait unsteadiness that worsens dramatically in the dark or with eyes closed.",
    chiefComplaint:
      "I stumble when it's dark. In the shower with my eyes closed I nearly fall. My feet feel like they're wrapped in cotton.",
    history:
      "Progressive over 1 year. Numbness in the feet. Difficulty knowing where his feet are without looking. History of excessive alcohol use and poor diet.",
    syndromeFrame:
      "Sensory ataxia from posterior column disease (B12 deficiency / subacute combined degeneration). Loss of proprioception forces visual dependence — darkness removes this compensation (positive Romberg).",
    examFindings: [
      "Absent vibration sense at both ankles and knees",
      "Severely impaired joint position sense at great toes",
      "Positive Romberg test (sways and falls with eyes closed)",
      "Absent ankle jerks (peripheral neuropathy component)",
      "Wide-based stamping gait (sensory ataxia)",
      "Pain and temperature: INTACT",
    ],
    prompt:
      "Why is the Romberg test positive in posterior column disease but negative in cerebellar ataxia?",
    hints: [
      "Romberg tests proprioceptive dependence. With eyes open, vision compensates for proprioceptive loss.",
      "Cerebellar ataxia is equally bad with eyes open or closed — the cerebellum doesn't depend on visual compensation.",
    ],
    localizationCues: [
      "Proprioception lost + pain/temperature preserved = dorsal column selective disease.",
      "Positive Romberg = proprioceptive problem, not cerebellar.",
    ],
    differentialTraps: [
      "Do not diagnose cerebellar disease just because the patient is ataxic — check the Romberg.",
      "Do not forget B12 and copper levels in any patient with posterior column signs.",
    ],
    nextDataRequests: [
      "Serum B12 and methylmalonic acid (MMA is more sensitive)",
      "MRI spine (posterior column T2 signal in subacute combined degeneration)",
      "Copper level (copper deficiency mimics B12 deficiency exactly)",
    ],
    teachingPoints: [
      "The Romberg test distinguishes sensory (proprioceptive) ataxia from cerebellar ataxia — this is one of the most important bedside distinctions in neurology.",
      "Subacute combined degeneration (B12) affects dorsal columns + lateral corticospinal tracts — hence 'combined.'",
    ],
    followUpModules: ["motor-pathway", "brain-atlas", "action-potential", "ask"],
    expectedLesionId: "posterior-cord",
    startingLesionId: "polyneuropathy",
  },
  {
    id: "crossed-sensory-loss",
    title: "Different sides for face and body numbness",
    oneLiner:
      "A 58-year-old with left facial numbness and right body numbness — opposite sides.",
    chiefComplaint:
      "My left face is numb to touch and my right body is numb to pinprick. The sides are different.",
    history:
      "Sudden onset with vertigo, nausea, and difficulty swallowing. The crossed sensory pattern (face on one side, body on the other) is pathognomonic for a lateral brainstem lesion.",
    syndromeFrame:
      "Crossed sensory loss = lateral brainstem (Wallenberg syndrome). The spinal nucleus of V (ipsilateral face) and the spinothalamic tract (contralateral body) are both in the lateral medulla. They carry pain/temperature from DIFFERENT sides because the spinothalamic tract has already crossed in the cord.",
    examFindings: [
      "Left facial pain/temperature loss (spinal nucleus of V)",
      "Right body pain/temperature loss (lateral spinothalamic tract)",
      "Left Horner syndrome (descending sympathetics)",
      "Dysphagia and hoarseness (nucleus ambiguus — CN IX, X)",
      "Left cerebellar ataxia",
      "NORMAL motor strength throughout",
    ],
    prompt:
      "Explain why the face and body sensory loss are on opposite sides in a single unilateral lesion.",
    hints: [
      "The spinal nucleus of V is an ipsilateral structure — it processes pain/temperature from the ipsilateral face.",
      "The spinothalamic tract has already crossed in the spinal cord — it carries contralateral body signals.",
    ],
    localizationCues: [
      "Crossed sensory = face and body pain/temperature on DIFFERENT sides = lateral brainstem.",
      "NO motor weakness = the corticospinal tract (ventral medulla) is spared.",
    ],
    differentialTraps: [
      "Do not attempt to explain crossed sensory loss with a cortical or spinal lesion — it requires a brainstem crossing point.",
      "Do not miss the Horner syndrome — it confirms the lateral brainstem localization.",
    ],
    nextDataRequests: [
      "MRI brainstem with DWI",
      "CTA/MRA for vertebral artery dissection (common cause in young patients)",
      "Swallowing assessment (aspiration risk from CN IX/X involvement)",
    ],
    teachingPoints: [
      "Crossed sensory loss is the single most reliable sign for lateral brainstem localization.",
      "Understanding WHY the crossing happens requires knowing that the spinothalamic tract crosses in the cord but the trigeminal spinal tract is an ipsilateral structure.",
    ],
    followUpModules: ["cranial-nerves", "stroke", "brain-atlas", "ask"],
    expectedLesionId: "lateral-medulla",
    startingLesionId: "thalamic",
  },
];
