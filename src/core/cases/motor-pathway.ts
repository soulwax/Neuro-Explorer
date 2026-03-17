import type { MotorPathwayClinicalCase } from "~/core/cases";

export const motorPathwayCases: MotorPathwayClinicalCase[] = [
  {
    id: "crossed-findings",
    title: "Ipsilateral eye, contralateral body",
    oneLiner:
      "A patient wakes with left ptosis and a dilated pupil, plus right-sided hemiparesis.",
    chiefComplaint:
      "Can't open the left eye. The right arm and leg are weak.",
    history:
      "Sudden onset on waking. Hypertensive history. The crossed pattern (one side for the eye, opposite for the body) localizes definitively.",
    syndromeFrame:
      "This is a brainstem localization problem. Crossed findings (ipsilateral cranial nerve + contralateral long tract) point to the midbrain, pons, or medulla — never cerebral hemisphere.",
    examFindings: [
      "Left ptosis, dilated pupil, eye 'down and out' (CN III)",
      "Right hemiparesis (face, arm, leg equally)",
      "Preserved consciousness",
    ],
    prompt:
      "Why do crossed findings localize to brainstem, and which specific level produces this combination?",
    hints: [
      "Cranial nerve nuclei and their fascicles are in the brainstem. The corticospinal tract passes through on its way to the decussation.",
      "CN III exits the midbrain. Therefore: ipsilateral CN III + contralateral hemiparesis = midbrain.",
    ],
    localizationCues: [
      "Ipsilateral CN III = midbrain lesion (Weber syndrome).",
      "The corticospinal tract has not yet crossed, so contralateral weakness makes sense.",
    ],
    differentialTraps: [
      "Do not diagnose a hemispheric stroke when there are crossed findings.",
      "Do not confuse CN III palsy with Horner syndrome (both cause ptosis but for different reasons).",
    ],
    nextDataRequests: [
      "Urgent MRI brainstem with diffusion-weighted imaging",
      "MRA to assess posterior circulation",
      "CT angiography if MRI is not immediately available",
    ],
    teachingPoints: [
      "Crossed = brainstem. This rule has almost no exceptions in clinical neurology.",
      "The specific cranial nerve involved identifies the brainstem level: III = midbrain, VI/VII = pons, XII = medulla.",
    ],
    followUpModules: ["brain-atlas", "visual-field", "ask"],
    expectedLesionId: "cerebral-peduncle",
    startingLesionId: "internal-capsule",
  },
  {
    id: "umn-vs-lmn-face",
    title: "Central versus peripheral facial weakness",
    oneLiner:
      "A patient has right-sided facial droop, but you need to decide if the forehead is involved.",
    chiefComplaint:
      "The right side of my face is drooping. Food falls out of my mouth.",
    history:
      "Sudden onset. The critical exam finding is whether the forehead is involved. Forehead sparing = UMN (contralateral hemisphere). Forehead involved = LMN (ipsilateral CN VII).",
    syndromeFrame:
      "This is the most common UMN vs. LMN question in clinical neurology. The forehead receives bilateral UMN input, so only LMN lesions affect it.",
    examFindings: [
      "Right lower face weakness (nasolabial fold flat, mouth droops)",
      "Key finding: Can the patient wrinkle the RIGHT forehead?",
      "If forehead spared: UMN pattern (contralateral stroke likely)",
      "If forehead involved: LMN pattern (Bell's palsy or pontine lesion)",
    ],
    prompt:
      "Explain the anatomical basis for forehead sparing in UMN facial weakness.",
    hints: [
      "The upper face motor neurons receive input from BOTH hemispheres.",
      "A unilateral UMN lesion spares the forehead because the intact hemisphere still drives those neurons.",
    ],
    localizationCues: [
      "Forehead spared = supranuclear = UMN = above the CN VII nucleus in the pons.",
      "Forehead involved = nuclear or infranuclear = LMN = at or below the CN VII nucleus.",
    ],
    differentialTraps: [
      "Do not diagnose Bell's palsy without checking for forehead involvement.",
      "Do not miss a stroke by assuming all facial weakness is Bell's palsy.",
    ],
    nextDataRequests: [
      "Complete facial nerve exam (forehead, eye closure, smile, platysma)",
      "If UMN pattern: urgent stroke imaging",
      "If LMN pattern: check for vesicles (Ramsay Hunt), parotid mass, bilateral involvement (GBS)",
    ],
    teachingPoints: [
      "Bilateral corticobulbar input to the upper face motor neurons is why UMN lesions spare the forehead.",
      "This is the most important UMN vs. LMN distinction to get right in the emergency department.",
    ],
    followUpModules: ["brain-atlas", "action-potential", "ask"],
    expectedLesionId: "basilar-pons",
    startingLesionId: "motor-cortex",
  },
  {
    id: "brisk-reflexes-wasted-hand",
    title: "Brisk reflexes in a wasted hand",
    oneLiner:
      "A 62-year-old man has progressive right hand weakness with thenar atrophy and fasciculations, but the reflexes are pathologically brisk.",
    chiefComplaint:
      "My right hand is weaker and smaller. I've noticed twitching in the arm.",
    history:
      "Progressive over 8 months. Started with right grip weakness, now affecting intrinsic hand muscles. Widespread fasciculations. No sensory symptoms. No pain.",
    syndromeFrame:
      "The combination of LMN signs (atrophy, fasciculations) and UMN signs (hyperreflexia, Babinski) in the same territory is the hallmark of ALS. This pattern should never be attributed to two separate lesions when one disease explains both.",
    examFindings: [
      "Right thenar and interosseous wasting",
      "Fasciculations in right biceps and both calves",
      "3+ reflexes throughout, bilateral Babinski",
      "No sensory loss anywhere",
      "Tongue fasciculations (bulbar involvement)",
    ],
    prompt:
      "Why is the combination of UMN and LMN signs in the same limb the critical diagnostic pattern, and why must you not attribute hyperreflexia to anxiety?",
    hints: [
      "UMN alone = stroke, MS, etc. LMN alone = radiculopathy, neuropathy. BOTH together = motor neuron disease until proven otherwise.",
      "Hyperreflexia in a wasted limb cannot be benign.",
    ],
    localizationCues: [
      "Atrophy + fasciculations = LMN (anterior horn cell).",
      "Hyperreflexia + Babinski = UMN (corticospinal tract).",
      "Both present simultaneously = two levels of the motor pathway affected.",
    ],
    differentialTraps: [
      "Do not blame hyperreflexia on anxiety or 'brisk reflexes' when there is concurrent atrophy.",
      "Do not diagnose cervical spondylotic myelopathy without explaining the widespread fasciculations and bulbar involvement.",
    ],
    nextDataRequests: [
      "EMG/NCS showing widespread denervation in 3+ body regions",
      "MRI cervical spine to exclude structural lesion",
      "Bulbar function assessment (speech, swallowing, tongue)",
    ],
    teachingPoints: [
      "ALS is diagnosed by recognizing simultaneous UMN and LMN involvement in multiple body regions.",
      "The motor pathway explorer shows why mixed UMN+LMN signs cannot be explained by a single focal lesion — it requires disease at multiple levels.",
    ],
    followUpModules: ["neuron", "action-potential", "eeg", "ask"],
    expectedLesionId: "als-mixed",
    startingLesionId: "anterior-horn",
  },
  {
    id: "spinal-cord-hemisection",
    title: "Ipsilateral weakness, contralateral pain loss",
    oneLiner:
      "A patient with a stab wound at the T10 level has ipsilateral leg weakness and contralateral loss of pain sensation.",
    chiefComplaint:
      "My right leg is weak and my left leg doesn't feel hot or sharp.",
    history:
      "Penetrating trauma to the right side of the back at T10 level. Immediate onset of right leg weakness with preserved sensation to the right leg (except proprioception loss). Pain and temperature sensation lost on the left leg.",
    syndromeFrame:
      "This is Brown-Séquard syndrome: spinal cord hemisection. The crossed pattern at the spinal level reflects different decussation points for motor (pyramidal decussation at medulla) versus spinothalamic (crosses within 1-2 levels of entry).",
    examFindings: [
      "Right leg UMN weakness (spastic, hyperreflexic, Babinski+)",
      "Right leg loss of proprioception and vibration (dorsal columns)",
      "Left leg loss of pain and temperature below T10 (spinothalamic)",
      "Band of ipsilateral sensory loss at T10 (posterior root entry zone)",
    ],
    prompt:
      "Why does motor weakness appear ipsilateral but pain loss appears contralateral in a hemisection?",
    hints: [
      "The corticospinal tract has ALREADY crossed (at the medullary pyramids). A right-sided cord lesion cuts the right lateral corticospinal tract = right leg weakness.",
      "The spinothalamic tract crosses within 1-2 segments of spinal entry. A right-sided cord lesion cuts left-sided pain fibers that have already crossed.",
    ],
    localizationCues: [
      "Ipsilateral UMN weakness = lateral corticospinal tract (already crossed).",
      "Contralateral pain/temperature loss = lateral spinothalamic tract (already crossed from opposite side).",
      "Ipsilateral proprioception loss = dorsal columns (uncrossed at cord level).",
    ],
    differentialTraps: [
      "Do not expect complete hemisection in practice — most Brown-Séquard is partial.",
      "Do not confuse with anterior cord syndrome (bilateral weakness + pain loss, spared proprioception).",
    ],
    nextDataRequests: [
      "MRI thoracic spine urgent",
      "Assess for cord compression vs. transaction",
      "Serial neurological exams to track evolution",
    ],
    teachingPoints: [
      "Brown-Séquard is the ultimate teaching case for tract anatomy: each tract's decussation level determines whether the deficit is ipsilateral or contralateral.",
      "The motor pathway crosses at the medullary pyramids. The spinothalamic tract crosses near its entry level. The dorsal columns don't cross until the medulla. Knowing these three facts explains the entire syndrome.",
    ],
    followUpModules: ["brain-atlas", "action-potential", "ask"],
    expectedLesionId: "lateral-corticospinal",
    startingLesionId: "motor-cortex",
  },
];
