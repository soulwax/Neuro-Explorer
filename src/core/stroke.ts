/**
 * Stroke Vascular Territory Explorer
 *
 * Maps stroke symptoms to arterial territories with clinical
 * syndrome generation, localization logic, and acute management pearls.
 */

export interface VascularTerritory {
  id: string;
  artery: string;
  fullName: string;
  circulation: "anterior" | "posterior";
  parentArtery: string;
  suppliedStructures: string[];
  syndrome: StrokeSyndrome;
  variants: string[];
}

export interface StrokeSyndrome {
  name: string;
  classicPresentation: string;
  signs: StrokeSign[];
  sparings: string[];
  mechanism: string;
  mimics: string[];
  acuteManagement: string[];
}

export interface StrokeSign {
  finding: string;
  explanation: string;
  laterality: "ipsilateral" | "contralateral" | "bilateral" | "variable";
}

export interface StrokePreset {
  id: string;
  label: string;
  description: string;
  territoryId: string;
  clinicalVignette: string;
  nihssEstimate: number;
  timeWindow: string;
}

export const vascularTerritories: VascularTerritory[] = [
  {
    id: "mca-superior",
    artery: "MCA superior division",
    fullName: "Middle cerebral artery — superior division",
    circulation: "anterior",
    parentArtery: "Internal carotid artery",
    suppliedStructures: [
      "Lateral frontal lobe (motor strip — face and arm representation)",
      "Broca's area (dominant hemisphere)",
      "Frontal eye field",
      "Anterior parietal cortex (sensory strip — face and arm)",
    ],
    syndrome: {
      name: "MCA Superior Division Syndrome",
      classicPresentation:
        "Contralateral face and arm weakness > leg, with Broca's aphasia if dominant hemisphere",
      signs: [
        {
          finding: "Contralateral face and arm weakness (leg relatively spared)",
          explanation:
            "The homunculus places face and arm laterally on the convexity (MCA territory); the leg is medial (ACA territory).",
          laterality: "contralateral",
        },
        {
          finding: "Broca's (expressive/nonfluent) aphasia",
          explanation:
            "Broca's area in the inferior frontal gyrus is supplied by MCA superior division. Nonfluent, effortful speech with relatively preserved comprehension.",
          laterality: "contralateral",
        },
        {
          finding: "Contralateral face and arm sensory loss",
          explanation:
            "Anterior parietal cortex (postcentral gyrus) face/arm representation is in MCA territory.",
          laterality: "contralateral",
        },
        {
          finding: "Conjugate gaze deviation toward the lesion",
          explanation:
            "Frontal eye field damage: eyes deviate toward the lesion (away from the weak side). 'Eyes look at the lesion' in cortical stroke.",
          laterality: "ipsilateral",
        },
      ],
      sparings: [
        "Leg strength (ACA territory)",
        "Visual fields (PCA territory)",
        "Comprehension (Wernicke's in inferior division)",
      ],
      mechanism:
        "Embolic occlusion of MCA superior division (cardioembolism or artery-to-artery from ICA stenosis)",
      mimics: [
        "Hemiplegic migraine (resolves, family history)",
        "Todd's paralysis (postictal, preceded by seizure)",
        "Conversion disorder (inconsistent exam, give-way weakness)",
      ],
      acuteManagement: [
        "IV alteplase within 4.5 hours (or mechanical thrombectomy up to 24h for large vessel occlusion)",
        "NIHSS scoring for severity",
        "CT head (rule out hemorrhage) → CTA (identify occlusion)",
        "Admit to stroke unit",
      ],
    },
    variants: [
      "Isolated Broca's aphasia without significant weakness (small infarct)",
      "Faciobrachial weakness without aphasia (non-dominant hemisphere)",
    ],
  },
  {
    id: "mca-inferior",
    artery: "MCA inferior division",
    fullName: "Middle cerebral artery — inferior division",
    circulation: "anterior",
    parentArtery: "Internal carotid artery",
    suppliedStructures: [
      "Lateral temporal lobe (Wernicke's area in dominant hemisphere)",
      "Inferior parietal lobule (angular and supramarginal gyri)",
      "Lateral occipitotemporal cortex",
    ],
    syndrome: {
      name: "MCA Inferior Division Syndrome",
      classicPresentation:
        "Wernicke's aphasia (dominant) or hemispatial neglect (non-dominant) with minimal weakness",
      signs: [
        {
          finding: "Wernicke's (receptive/fluent) aphasia",
          explanation:
            "Fluent but paraphasic speech with impaired comprehension. The patient 'doesn't know they don't make sense.' Dominant hemisphere only.",
          laterality: "contralateral",
        },
        {
          finding: "Hemispatial neglect (non-dominant hemisphere)",
          explanation:
            "Right parietal lesion → left neglect: patient ignores left hemispace, may deny weakness (anosognosia).",
          laterality: "contralateral",
        },
        {
          finding: "Contralateral superior quadrantanopia",
          explanation:
            "Optic radiation fibers in the temporal lobe (Meyer's loop) are damaged, producing a 'pie in the sky' defect.",
          laterality: "contralateral",
        },
        {
          finding: "Gerstmann syndrome (dominant angular gyrus)",
          explanation:
            "Finger agnosia + acalculia + agraphia + left-right confusion. Localizes to the dominant angular gyrus.",
          laterality: "contralateral",
        },
      ],
      sparings: [
        "Motor strength (often relatively preserved — motor strip is superior division)",
        "Repetition (may be preserved if arcuate fasciculus spared → transcortical sensory aphasia)",
      ],
      mechanism:
        "Embolic occlusion of MCA inferior division",
      mimics: [
        "Delirium (fluctuating confusion — but no focal language deficit pattern)",
        "Psychiatric speech disorganization (but no paraphasias or comprehension loss on testing)",
      ],
      acuteManagement: [
        "Same stroke protocol — do not dismiss because weakness is minimal",
        "Aphasia scores poorly on NIHSS (1b, 9, 10)",
        "Language and neglect testing are critical for detecting this syndrome",
      ],
    },
    variants: [
      "Pure Wernicke's aphasia (small posterior temporal infarct)",
      "Isolated neglect syndrome (non-dominant parietal)",
    ],
  },
  {
    id: "mca-stem",
    artery: "MCA stem (M1)",
    fullName: "Middle cerebral artery — main stem",
    circulation: "anterior",
    parentArtery: "Internal carotid artery",
    suppliedStructures: [
      "Entire MCA territory (lateral hemisphere)",
      "Lenticulostriate arteries → basal ganglia, internal capsule",
    ],
    syndrome: {
      name: "Total MCA Syndrome",
      classicPresentation:
        "Dense contralateral hemiplegia, hemisensory loss, hemianopia, global aphasia (dominant) or neglect (non-dominant) — devastating stroke",
      signs: [
        {
          finding: "Dense contralateral hemiplegia (face, arm, leg)",
          explanation:
            "Both cortical and subcortical (internal capsule) motor fibers are involved.",
          laterality: "contralateral",
        },
        {
          finding: "Global aphasia (dominant hemisphere)",
          explanation:
            "Both Broca's and Wernicke's areas are infarcted. Non-fluent with no comprehension. Severe communication barrier.",
          laterality: "contralateral",
        },
        {
          finding: "Forced gaze deviation toward the lesion",
          explanation:
            "Large frontal eye field destruction drives eyes toward the lesion and away from the paralyzed side.",
          laterality: "ipsilateral",
        },
        {
          finding: "Contralateral homonymous hemianopia",
          explanation:
            "Optic radiation is infarcted along with cortical visual processing.",
          laterality: "contralateral",
        },
      ],
      sparings: [
        "Consciousness (unless massive edema → herniation)",
        "Contralateral leg may be somewhat less affected than arm/face (ACA contribution to leg area)",
      ],
      mechanism:
        "Proximal M1 occlusion — usually large vessel occlusion amenable to thrombectomy",
      mimics: [
        "ICA occlusion (similar but may include ACA territory → leg weakness too)",
      ],
      acuteManagement: [
        "EMERGENT CTA to identify M1 occlusion",
        "Mechanical thrombectomy (up to 24h with favorable perfusion imaging)",
        "IV alteplase as bridge to thrombectomy",
        "Malignant MCA edema: decompressive hemicraniectomy if age <60 and progressive herniation",
      ],
    },
    variants: [
      "Malignant MCA infarction: massive edema → midline shift → herniation",
    ],
  },
  {
    id: "aca",
    artery: "ACA",
    fullName: "Anterior cerebral artery",
    circulation: "anterior",
    parentArtery: "Internal carotid artery",
    suppliedStructures: [
      "Medial frontal lobe (leg representation on motor/sensory strips)",
      "Supplementary motor area",
      "Cingulate gyrus",
      "Corpus callosum (anterior)",
    ],
    syndrome: {
      name: "ACA Syndrome",
      classicPresentation:
        "Contralateral leg weakness > arm or face, with abulia and urinary incontinence",
      signs: [
        {
          finding: "Contralateral leg weakness (arm and face relatively spared)",
          explanation:
            "The homunculus places the leg medially (ACA territory). The arm and face are lateral (MCA territory).",
          laterality: "contralateral",
        },
        {
          finding: "Contralateral leg sensory loss",
          explanation:
            "Medial somatosensory cortex for the leg is in ACA territory.",
          laterality: "contralateral",
        },
        {
          finding: "Abulia / akinetic mutism",
          explanation:
            "Medial frontal (supplementary motor area, cingulate) damage produces profound loss of drive and initiative.",
          laterality: "bilateral",
        },
        {
          finding: "Urinary incontinence",
          explanation:
            "Medial frontal cortex contains the micturition inhibition center. Damage releases the pontine micturition reflex.",
          laterality: "variable",
        },
        {
          finding: "Alien hand syndrome (callosal)",
          explanation:
            "Anterior corpus callosum damage can disconnect motor planning. One hand acts autonomously.",
          laterality: "contralateral",
        },
      ],
      sparings: [
        "Face and arm strength (MCA territory)",
        "Language (unless bilateral or ACA supplies supplementary speech area)",
      ],
      mechanism:
        "ACA occlusion — less common than MCA stroke; may be caused by vasospasm after SAH",
      mimics: [
        "Spinal cord lesion (leg weakness with bladder involvement — but no abulia)",
        "Parasagittal meningioma (gradual onset)",
      ],
      acuteManagement: [
        "Standard stroke protocol",
        "CTA for vessel occlusion",
        "If bilateral ACA territory: consider anterior communicating artery aneurysm rupture → vasospasm",
      ],
    },
    variants: [
      "Bilateral ACA infarction (azygos ACA variant): bilateral leg weakness, akinetic mutism",
    ],
  },
  {
    id: "pca",
    artery: "PCA",
    fullName: "Posterior cerebral artery",
    circulation: "posterior",
    parentArtery: "Basilar artery (top of basilar)",
    suppliedStructures: [
      "Occipital lobe (primary visual cortex, V1-V3)",
      "Inferomedial temporal lobe (hippocampus, fusiform gyrus)",
      "Thalamus (via thalamoperforating and thalamogeniculate arteries)",
      "Splenium of corpus callosum",
    ],
    syndrome: {
      name: "PCA Syndrome",
      classicPresentation:
        "Contralateral homonymous hemianopia with macular sparing, ± memory impairment",
      signs: [
        {
          finding: "Contralateral homonymous hemianopia with macular sparing",
          explanation:
            "V1 destruction eliminates the contralateral visual field. Macular sparing occurs because the macular cortex at the occipital pole has dual supply (PCA + MCA).",
          laterality: "contralateral",
        },
        {
          finding: "Visual agnosia / prosopagnosia",
          explanation:
            "Inferior temporal involvement damages the fusiform face area or ventral visual stream.",
          laterality: "contralateral",
        },
        {
          finding: "Memory impairment",
          explanation:
            "Hippocampal infarction produces anterograde amnesia. Bilateral PCA strokes can cause devastating amnesia.",
          laterality: "variable",
        },
        {
          finding: "Alexia without agraphia (dominant hemisphere)",
          explanation:
            "Left occipital + splenium infarct: the patient can write but cannot read what they wrote. Visual information cannot reach the language areas.",
          laterality: "contralateral",
        },
      ],
      sparings: [
        "Motor strength (corticospinal tract is MCA/ACA territory)",
        "Language (except reading in dominant hemisphere)",
      ],
      mechanism:
        "Embolic or thrombotic occlusion of PCA, often from top-of-basilar embolism or vertebral artery disease",
      mimics: [
        "Migraine with aura (visual symptoms that resolve)",
        "Posterior reversible encephalopathy syndrome (PRES — bilateral, associated with hypertension/eclampsia)",
      ],
      acuteManagement: [
        "Standard stroke protocol",
        "May be missed if examiner doesn't test visual fields formally",
        "Top-of-basilar occlusion is a thrombectomy target",
      ],
    },
    variants: [
      "Fetal PCA (PCA arising from ICA instead of basilar — common variant, changes collateral patterns)",
      "Top-of-basilar syndrome: bilateral PCA + brainstem → bilateral visual loss, memory loss, LOC",
    ],
  },
  {
    id: "basilar",
    artery: "Basilar artery",
    fullName: "Basilar artery",
    circulation: "posterior",
    parentArtery: "Vertebral arteries (confluence)",
    suppliedStructures: [
      "Pons (via pontine perforating arteries)",
      "Cerebellum (via AICA, SCA)",
      "Midbrain (via top of basilar)",
    ],
    syndrome: {
      name: "Basilar Artery Syndromes",
      classicPresentation:
        "Variable brainstem signs depending on level — crossed findings, cranial nerve palsies, coma in complete occlusion",
      signs: [
        {
          finding: "Locked-in syndrome (ventral pontine infarction)",
          explanation:
            "Complete bilateral corticospinal and corticobulbar destruction. Consciousness preserved (reticular formation is dorsal). Only vertical eye movements and blinking remain.",
          laterality: "bilateral",
        },
        {
          finding: "Crossed cranial nerve/long tract findings",
          explanation:
            "Partial basilar occlusion produces ipsilateral CN palsy + contralateral hemiparesis at specific brainstem levels.",
          laterality: "contralateral",
        },
        {
          finding: "Cerebellar signs (dysmetria, ataxia, nystagmus)",
          explanation:
            "AICA or SCA territory cerebellar infarction. Risk of posterior fossa edema → brainstem compression.",
          laterality: "ipsilateral",
        },
        {
          finding: "Coma (complete basilar occlusion)",
          explanation:
            "Ascending reticular activating system destruction. Bilateral brainstem damage → loss of consciousness.",
          laterality: "bilateral",
        },
      ],
      sparings: [
        "In locked-in syndrome: consciousness, vertical eye movements, and eyelid blinking are preserved",
      ],
      mechanism:
        "Atherothrombotic or embolic occlusion of the basilar artery",
      mimics: [
        "Basilar migraine (resolves completely)",
        "Brainstem encephalitis (subacute, inflammatory markers)",
      ],
      acuteManagement: [
        "BASILAR OCCLUSION IS A NEUROVASCULAR EMERGENCY — consider thrombectomy up to 24h",
        "CTA or MRA urgently to identify occlusion",
        "Do NOT diagnose 'coma of unknown cause' without ruling out basilar occlusion",
        "Cerebellar stroke with edema → suboccipital decompression may be life-saving",
      ],
    },
    variants: [
      "Pontine warning syndrome: stuttering, fluctuating symptoms before complete occlusion",
    ],
  },
  {
    id: "pica",
    artery: "PICA",
    fullName: "Posterior inferior cerebellar artery",
    circulation: "posterior",
    parentArtery: "Vertebral artery",
    suppliedStructures: [
      "Lateral medulla",
      "Inferior cerebellum (tonsil, inferior vermis)",
    ],
    syndrome: {
      name: "Lateral Medullary Syndrome (Wallenberg)",
      classicPresentation:
        "The most classic brainstem syndrome: ipsilateral face + contralateral body pain/temperature loss, Horner, dysphagia, ataxia",
      signs: [
        {
          finding: "Ipsilateral facial pain/temperature loss",
          explanation:
            "Spinal nucleus and tract of CN V descends through the lateral medulla.",
          laterality: "ipsilateral",
        },
        {
          finding: "Contralateral body pain/temperature loss",
          explanation:
            "Lateral spinothalamic tract has already crossed in the spinal cord.",
          laterality: "contralateral",
        },
        {
          finding: "Ipsilateral Horner syndrome (ptosis, miosis, anhidrosis)",
          explanation:
            "Descending sympathetic tract runs through the lateral medulla.",
          laterality: "ipsilateral",
        },
        {
          finding: "Dysphagia, hoarseness, absent gag (CN IX, X nucleus ambiguus)",
          explanation:
            "Nucleus ambiguus in the lateral medulla supplies pharyngeal and laryngeal muscles.",
          laterality: "ipsilateral",
        },
        {
          finding: "Ipsilateral cerebellar ataxia",
          explanation:
            "Inferior cerebellar peduncle or cerebellum directly involved.",
          laterality: "ipsilateral",
        },
      ],
      sparings: [
        "Motor strength is PRESERVED — the corticospinal tract is ventral (medial medulla), not lateral",
        "Consciousness is preserved",
      ],
      mechanism:
        "Usually vertebral artery occlusion rather than PICA itself. Vertebral dissection is common in young patients.",
      mimics: [
        "MS plaque in lateral medulla (subacute, younger, MRI with other lesions)",
      ],
      acuteManagement: [
        "Urgent MRI with diffusion-weighted imaging",
        "Vertebral artery imaging (CTA or MRA) — dissection is common",
        "Swallowing assessment (aspiration risk is high)",
        "Anticoagulation if vertebral artery dissection confirmed",
      ],
    },
    variants: [
      "Medial medullary syndrome: ipsilateral tongue (CN XII) + contralateral hemiparesis + contralateral proprioception loss (different from lateral!)",
    ],
  },
  {
    id: "lacunar-capsule",
    artery: "Lenticulostriate perforators",
    fullName: "Lenticulostriate arteries (small perforating branches of MCA)",
    circulation: "anterior",
    parentArtery: "MCA (M1 segment)",
    suppliedStructures: [
      "Internal capsule (posterior limb)",
      "Basal ganglia (putamen, caudate)",
      "Corona radiata",
    ],
    syndrome: {
      name: "Pure Motor Hemiparesis (Lacunar)",
      classicPresentation:
        "Dense contralateral hemiparesis (face = arm = leg) WITHOUT cortical signs (no aphasia, no neglect, no field cut)",
      signs: [
        {
          finding: "Equal face, arm, and leg weakness (contralateral)",
          explanation:
            "Corticospinal fibers are densely packed in the posterior limb of the internal capsule. A small infarct affects all fibers equally.",
          laterality: "contralateral",
        },
        {
          finding: "NO aphasia, NO neglect, NO visual field cut",
          explanation:
            "Lacunar infarcts spare the cortex. Absence of cortical signs is a key diagnostic feature.",
          laterality: "contralateral",
        },
      ],
      sparings: [
        "Language (cortex not involved)",
        "Vision (optic radiation not involved in small lacune)",
        "Sensation (unless thalamic lacune — different syndrome)",
        "Cognition and behavior",
      ],
      mechanism:
        "Lipohyalinosis of small perforating arteries from chronic hypertension. Small infarct, big deficit due to dense fiber packing.",
      mimics: [
        "Small cortical stroke (but should have some cortical sign)",
        "Demyelination (MS — subacute, younger, MRI with other lesions)",
      ],
      acuteManagement: [
        "Standard stroke protocol — still a stroke, still needs workup",
        "Lacunar infarcts are less likely to be embolic — focus on small vessel risk factors (hypertension, diabetes)",
        "Dual antiplatelet for 21 days may reduce early recurrence (CHANCE/POINT trials)",
      ],
    },
    variants: [
      "Pure sensory stroke (thalamic lacune)",
      "Ataxic hemiparesis (pontine lacune)",
      "Dysarthria-clumsy hand (pontine lacune)",
      "Sensorimotor stroke (thalamocapsular junction)",
    ],
  },
];

export const strokePresets: StrokePreset[] = [
  {
    id: "mca-dominant",
    label: "Dominant MCA Stroke",
    description:
      "Left MCA superior division: right face/arm weakness + Broca's aphasia",
    territoryId: "mca-superior",
    clinicalVignette:
      "A 72-year-old with atrial fibrillation develops sudden right face and arm weakness with effortful, nonfluent speech. She understands commands. Right leg is strong. 'Tell me your name.' → '...my...name...is...uh...'",
    nihssEstimate: 12,
    timeWindow: "Last known normal 45 minutes ago",
  },
  {
    id: "neglect-stroke",
    label: "Non-Dominant MCA (Neglect)",
    description: "Right MCA inferior division: left neglect, denies deficits",
    territoryId: "mca-inferior",
    clinicalVignette:
      "A 68-year-old found with left arm weakness. When asked about the left arm, he says 'That's not my arm.' He does not look to the left and eats food only from the right side of his plate. No aphasia.",
    nihssEstimate: 14,
    timeWindow: "Found down — last normal 6 hours ago",
  },
  {
    id: "malignant-mca",
    label: "Malignant MCA Infarction",
    description: "Complete M1 occlusion with progressive herniation",
    territoryId: "mca-stem",
    clinicalVignette:
      "A 55-year-old with sudden dense left hemiplegia, gaze deviation to the right, left hemianopia, and global aphasia. CTA shows right M1 occlusion. CT at 24 hours shows massive edema with 12mm midline shift.",
    nihssEstimate: 24,
    timeWindow: "Onset 2 hours ago — CTA confirms M1 occlusion",
  },
  {
    id: "pca-hemianopia",
    label: "PCA Stroke",
    description: "Isolated homonymous hemianopia with macular sparing",
    territoryId: "pca",
    clinicalVignette:
      "A 65-year-old reports 'missing the left side of things' since this morning. He bumps into objects on the left. Visual fields show a complete left homonymous hemianopia with macular sparing. Motor exam is entirely normal.",
    nihssEstimate: 3,
    timeWindow: "Noticed on waking — sleep onset stroke",
  },
  {
    id: "wallenberg-stroke",
    label: "Wallenberg Syndrome",
    description: "Lateral medullary stroke with classic crossed findings",
    territoryId: "pica",
    clinicalVignette:
      "A 58-year-old with sudden vertigo, nausea, dysphagia, and hoarseness. Left Horner syndrome, left facial numbness to pinprick, and right body numbness to pinprick. Left arm past-points on finger-to-nose. Normal strength throughout.",
    nihssEstimate: 5,
    timeWindow: "Onset 3 hours ago during exercise",
  },
  {
    id: "lacunar-pure-motor",
    label: "Lacunar Pure Motor",
    description: "Internal capsule lacune: dense hemiparesis without cortical signs",
    territoryId: "lacunar-capsule",
    clinicalVignette:
      "A 70-year-old hypertensive diabetic with sudden equal weakness of left face, arm, and leg. No language deficit. No neglect. No visual field cut. MRI shows a 1.5 cm DWI lesion in the right posterior limb of the internal capsule.",
    nihssEstimate: 6,
    timeWindow: "Onset 1 hour ago — witnessed",
  },
  {
    id: "basilar-locked-in",
    label: "Basilar Occlusion (Locked-In)",
    description: "Ventral pontine infarction: quadriplegia with preserved consciousness",
    territoryId: "basilar",
    clinicalVignette:
      "A 62-year-old found unresponsive. Initially thought to be comatose. A nurse notices the patient tracks with his eyes and can blink to command. He cannot move any limbs, speak, or swallow. Vertical eye movements are intact.",
    nihssEstimate: 38,
    timeWindow: "Unknown — found down",
  },
  {
    id: "aca-leg",
    label: "ACA Stroke",
    description: "Leg-predominant weakness with abulia and incontinence",
    territoryId: "aca",
    clinicalVignette:
      "A 60-year-old post-SAH patient develops right leg weakness 5 days after subarachnoid hemorrhage. Face and arm are normal. She is apathetic and incontinent. Transcranial Doppler shows vasospasm in the left ACA.",
    nihssEstimate: 4,
    timeWindow: "Day 5 post-SAH — vasospasm-mediated delayed ischemia",
  },
];

export function getVascularTerritory(id: string): VascularTerritory | undefined {
  return vascularTerritories.find((t) => t.id === id);
}
