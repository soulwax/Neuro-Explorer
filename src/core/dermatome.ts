/**
 * Dermatome & Sensory Pathway Explorer
 *
 * Sensory localization from receptor to cortex with dermatome maps,
 * tract anatomy, and clinical sensory syndrome generation.
 */

export interface SensoryModality {
  id: string;
  name: string;
  receptor: string;
  fiberType: string;
  pathway: string;
  crossingLevel: string;
  corticalDestination: string;
}

export interface Dermatome {
  level: string;
  landmark: string;
  clinicalTest: string;
  root: string;
  myotomePartner: string;
  reflexPartner: string | null;
}

export interface SensoryTract {
  id: string;
  name: string;
  modalities: string[];
  course: string[];
  crossingLevel: string;
  clinicalTestMethod: string;
}

export interface SensoryLesionLevel {
  id: string;
  label: string;
  anatomicalLevel: string;
  description: string;
  category: "peripheral" | "spinal" | "brainstem" | "thalamic" | "cortical";
}

export interface SensoryLesionResult {
  lesion: SensoryLesionLevel;
  findings: SensoryFinding[];
  pattern: string;
  distribution: string;
  sparedModalities: string[];
  keyDistinctions: string[];
  clinicalCorrelate: string;
  explanation: {
    mechanism: string;
    whatToNotice: string[];
    localizationLogic: string[];
  };
}

export interface SensoryFinding {
  modality: string;
  status: "lost" | "preserved" | "diminished" | "dissociated";
  territory: string;
  explanation: string;
}

export interface SensoryPreset {
  id: string;
  label: string;
  description: string;
  lesionId: string;
  clinicalVignette: string;
}

export const sensoryModalities: SensoryModality[] = [
  {
    id: "pain-temperature",
    name: "Pain & Temperature",
    receptor: "Free nerve endings (Aδ for sharp pain, C for burning pain/temperature)",
    fiberType: "Aδ (thinly myelinated, fast) and C (unmyelinated, slow)",
    pathway: "Lateral spinothalamic tract",
    crossingLevel: "Within 1-2 segments of spinal cord entry (anterior white commissure)",
    corticalDestination: "Primary somatosensory cortex (S1) and insular cortex",
  },
  {
    id: "light-touch",
    name: "Light Touch (crude)",
    receptor: "Meissner's corpuscles, Merkel discs, free endings",
    fiberType: "Aβ (myelinated, fast)",
    pathway: "Anterior spinothalamic tract (and partially dorsal columns)",
    crossingLevel: "Within spinal cord (anterior commissure), but bilateral representation",
    corticalDestination: "Primary somatosensory cortex (S1)",
  },
  {
    id: "proprioception",
    name: "Proprioception & Vibration",
    receptor: "Muscle spindles, joint receptors, Pacinian corpuscles",
    fiberType: "Aα and Aβ (large, heavily myelinated, fastest)",
    pathway: "Dorsal columns (fasciculus gracilis for legs, fasciculus cuneatus for arms) → medial lemniscus",
    crossingLevel: "Medulla (internal arcuate fibers → medial lemniscus)",
    corticalDestination: "Primary somatosensory cortex (S1), posterior parietal cortex",
  },
  {
    id: "two-point",
    name: "Two-Point Discrimination & Stereognosis",
    receptor: "Meissner's and Merkel cells (tactile acuity)",
    fiberType: "Aβ (myelinated)",
    pathway: "Dorsal columns → medial lemniscus",
    crossingLevel: "Medulla",
    corticalDestination: "Primary somatosensory cortex (S1) — particularly Brodmann areas 1 and 2",
  },
];

export const sensoryTracts: SensoryTract[] = [
  {
    id: "dorsal-columns",
    name: "Dorsal Columns — Medial Lemniscus",
    modalities: ["Proprioception", "Vibration", "Fine touch", "Two-point discrimination"],
    course: [
      "Peripheral receptor → dorsal root ganglion",
      "Enter spinal cord → ascend IPSILATERALLY in dorsal columns",
      "Fasciculus gracilis (legs, sacral-lumbar: medial) + fasciculus cuneatus (arms, cervical-thoracic: lateral)",
      "Synapse in nucleus gracilis/cuneatus (caudal medulla)",
      "Internal arcuate fibers CROSS to contralateral medial lemniscus",
      "Ascend through brainstem in medial lemniscus → VPL thalamus",
      "Thalamocortical projection → primary somatosensory cortex (S1)",
    ],
    crossingLevel: "Caudal medulla (internal arcuate fibers)",
    clinicalTestMethod: "Tuning fork (128 Hz) on bony prominences for vibration; joint position sense at great toe and fingers; Romberg test (proprioceptive dependence)",
  },
  {
    id: "spinothalamic",
    name: "Lateral Spinothalamic Tract",
    modalities: ["Pain", "Temperature"],
    course: [
      "Peripheral receptor → dorsal root ganglion",
      "Enter spinal cord → synapse in dorsal horn (substantia gelatinosa, laminae I-V)",
      "Second-order neurons CROSS within 1-2 segments via anterior white commissure",
      "Ascend CONTRALATERALLY in lateral spinothalamic tract",
      "Through brainstem → VPL thalamus",
      "Thalamocortical projection → S1 and insular cortex",
    ],
    crossingLevel: "Spinal cord (1-2 segments above entry, via anterior white commissure)",
    clinicalTestMethod: "Pinprick (not sharp enough to break skin) and temperature (cold tuning fork or warm/cold tubes)",
  },
  {
    id: "trigeminal-sensory",
    name: "Trigeminal Sensory Pathways",
    modalities: ["Facial pain/temperature", "Facial touch/proprioception"],
    course: [
      "Face → trigeminal ganglion (Gasserian ganglion in Meckel's cave)",
      "Pain/temperature → descend in spinal tract of V → spinal nucleus of V (extends to C2)",
      "Touch/proprioception → principal sensory nucleus (pons)",
      "Second-order neurons cross → trigeminothalamic tract → VPM thalamus",
      "Thalamocortical projection → S1 face area",
    ],
    crossingLevel: "Brainstem (after synapse in sensory nuclei)",
    clinicalTestMethod: "Light touch and pinprick in V1, V2, V3 divisions bilaterally; corneal reflex (V1 afferent)",
  },
];

export const dermatomes: Dermatome[] = [
  { level: "C2", landmark: "Occiput", clinicalTest: "Sensation over posterior scalp", root: "C2", myotomePartner: "Neck flexion/extension", reflexPartner: null },
  { level: "C3", landmark: "Supraclavicular fossa", clinicalTest: "Sensation above the clavicle", root: "C3", myotomePartner: "Neck lateral flexion", reflexPartner: null },
  { level: "C4", landmark: "Top of acromioclavicular joint", clinicalTest: "Sensation over top of shoulder", root: "C4", myotomePartner: "Shoulder shrug (with CN XI)", reflexPartner: null },
  { level: "C5", landmark: "Lateral antecubital fossa", clinicalTest: "Lateral elbow crease", root: "C5", myotomePartner: "Elbow flexion (biceps), shoulder abduction (deltoid)", reflexPartner: "Biceps reflex (C5-C6)" },
  { level: "C6", landmark: "Thumb", clinicalTest: "Dorsum of thumb and radial forearm", root: "C6", myotomePartner: "Wrist extension (extensor carpi radialis)", reflexPartner: "Brachioradialis reflex (C5-C6)" },
  { level: "C7", landmark: "Middle finger", clinicalTest: "Tip of middle finger", root: "C7", myotomePartner: "Elbow extension (triceps), wrist flexion", reflexPartner: "Triceps reflex (C7-C8)" },
  { level: "C8", landmark: "Little finger", clinicalTest: "Ulnar border of hand and little finger", root: "C8", myotomePartner: "Finger flexion, grip strength", reflexPartner: null },
  { level: "T1", landmark: "Medial elbow", clinicalTest: "Medial forearm above the elbow", root: "T1", myotomePartner: "Finger abduction (interossei)", reflexPartner: null },
  { level: "T4", landmark: "Nipple line", clinicalTest: "Nipple level", root: "T4", myotomePartner: "N/A (intercostals)", reflexPartner: null },
  { level: "T6", landmark: "Xiphoid", clinicalTest: "Xiphoid process level", root: "T6", myotomePartner: "N/A (upper abdominals)", reflexPartner: null },
  { level: "T10", landmark: "Umbilicus", clinicalTest: "Umbilicus level", root: "T10", myotomePartner: "N/A (lower abdominals)", reflexPartner: "Beevor sign: umbilicus moves up with sit-up if T10-T12 weak" },
  { level: "T12", landmark: "Inguinal ligament", clinicalTest: "Just above inguinal crease", root: "T12", myotomePartner: "N/A (lower abdominals)", reflexPartner: null },
  { level: "L1", landmark: "Inguinal region", clinicalTest: "Inguinal crease", root: "L1", myotomePartner: "Hip flexion (iliopsoas)", reflexPartner: "Cremasteric reflex (L1-L2)" },
  { level: "L2", landmark: "Anterior thigh", clinicalTest: "Mid-anterior thigh", root: "L2", myotomePartner: "Hip flexion (iliopsoas)", reflexPartner: null },
  { level: "L3", landmark: "Medial knee", clinicalTest: "Medial femoral condyle", root: "L3", myotomePartner: "Knee extension (quadriceps)", reflexPartner: "Knee jerk (L3-L4)" },
  { level: "L4", landmark: "Medial malleolus", clinicalTest: "Medial ankle", root: "L4", myotomePartner: "Ankle dorsiflexion (tibialis anterior)", reflexPartner: "Knee jerk (L3-L4)" },
  { level: "L5", landmark: "Dorsum of foot / great toe", clinicalTest: "Web space between great toe and 2nd toe", root: "L5", myotomePartner: "Great toe extension (EHL), ankle dorsiflexion", reflexPartner: null },
  { level: "S1", landmark: "Lateral foot / little toe", clinicalTest: "Lateral border of foot", root: "S1", myotomePartner: "Ankle plantarflexion (gastrocnemius), hip extension", reflexPartner: "Ankle jerk (S1-S2)" },
  { level: "S2-S4", landmark: "Perianal", clinicalTest: "Perianal sensation (saddle area)", root: "S2-S4", myotomePartner: "Bladder, bowel, sexual function", reflexPartner: "Anal wink (S2-S4), bulbocavernosus" },
];

export const sensoryLesionLevels: SensoryLesionLevel[] = [
  {
    id: "peripheral-nerve",
    label: "Peripheral Nerve",
    anatomicalLevel: "Named peripheral nerve (mononeuropathy)",
    description: "All modalities lost in the specific nerve territory. Sensory + motor in the same distribution.",
    category: "peripheral",
  },
  {
    id: "polyneuropathy",
    label: "Polyneuropathy (Length-Dependent)",
    anatomicalLevel: "Distal peripheral nerves (longest fibers first)",
    description: "Stocking-glove pattern. Small fibers (pain/temperature) or large fibers (proprioception/vibration) may be preferentially affected.",
    category: "peripheral",
  },
  {
    id: "dorsal-root",
    label: "Dorsal Root / Dorsal Root Ganglion",
    anatomicalLevel: "Spinal nerve root (radiculopathy) or ganglion (ganglionopathy)",
    description: "Dermatomal pattern. Pain is prominent in radiculopathy. Ganglionopathy (dorsal root ganglion) produces non-length-dependent sensory ataxia.",
    category: "peripheral",
  },
  {
    id: "cord-hemisection",
    label: "Spinal Cord Hemisection (Brown-Séquard)",
    anatomicalLevel: "Lateral half of spinal cord",
    description: "Ipsilateral dorsal column loss + contralateral spinothalamic loss below the lesion. Motor: ipsilateral UMN weakness.",
    category: "spinal",
  },
  {
    id: "central-cord",
    label: "Central Cord / Syringomyelia",
    anatomicalLevel: "Central spinal cord (anterior white commissure)",
    description: "Dissociated sensory loss: pain/temperature lost bilaterally (cape distribution), proprioception preserved. Crossing spinothalamic fibers are disrupted.",
    category: "spinal",
  },
  {
    id: "posterior-cord",
    label: "Posterior Cord Syndrome",
    anatomicalLevel: "Dorsal columns of spinal cord",
    description: "Loss of proprioception and vibration below the lesion. Pain and temperature preserved. Sensory ataxia (positive Romberg).",
    category: "spinal",
  },
  {
    id: "anterior-cord",
    label: "Anterior Cord Syndrome",
    anatomicalLevel: "Anterior 2/3 of spinal cord (anterior spinal artery territory)",
    description: "Bilateral motor weakness + pain/temperature loss below the lesion. Dorsal columns SPARED (proprioception preserved).",
    category: "spinal",
  },
  {
    id: "lateral-medulla",
    label: "Lateral Medulla (Wallenberg)",
    anatomicalLevel: "Lateral medullary tegmentum",
    description: "Ipsilateral face pain/temperature loss (spinal V) + contralateral body pain/temperature loss (spinothalamic). The classic crossed sensory pattern.",
    category: "brainstem",
  },
  {
    id: "thalamic",
    label: "Thalamic Sensory Stroke",
    anatomicalLevel: "Ventral posterolateral (VPL) / ventral posteromedial (VPM) thalamus",
    description: "Complete contralateral hemisensory loss (all modalities). May develop thalamic pain syndrome (Dejerine-Roussy): spontaneous burning pain weeks later.",
    category: "thalamic",
  },
  {
    id: "cortical-sensory",
    label: "Cortical Sensory Loss",
    anatomicalLevel: "Primary somatosensory cortex (postcentral gyrus) or parietal association cortex",
    description: "Contralateral loss of discriminative sensation (stereognosis, graphesthesia, two-point) with preserved primary modalities. Cortical sensory loss = a 'higher' deficit.",
    category: "cortical",
  },
];

export const sensoryPresets: SensoryPreset[] = [
  {
    id: "stocking-glove",
    label: "Diabetic Polyneuropathy",
    description: "Length-dependent small fiber neuropathy with stocking-glove pain/temperature loss",
    lesionId: "polyneuropathy",
    clinicalVignette: "A 62-year-old diabetic with burning feet for 2 years, worse at night. Numbness to pinprick up to mid-calf bilaterally. Vibration is reduced at the toes but normal at the ankles. Ankle jerks are absent.",
  },
  {
    id: "brown-sequard",
    label: "Brown-Séquard Syndrome",
    description: "Spinal cord hemisection: ipsilateral proprioception loss + contralateral pain/temperature loss",
    lesionId: "cord-hemisection",
    clinicalVignette: "A 30-year-old with a stab wound at T8: right leg weakness with hyperreflexia, right leg loss of proprioception and vibration, and left leg loss of pain and temperature below the umbilicus.",
  },
  {
    id: "syringomyelia",
    label: "Syringomyelia",
    description: "Central cord syrinx: bilateral cape-distribution pain/temperature loss with preserved proprioception",
    lesionId: "central-cord",
    clinicalVignette: "A 35-year-old with bilateral hand burns they didn't feel. Exam shows loss of pain and temperature sensation in a 'cape' distribution (shoulders, arms, upper trunk) but preserved light touch and proprioception. Hand intrinsic wasting bilaterally.",
  },
  {
    id: "tabes-dorsalis",
    label: "Tabes Dorsalis",
    description: "Posterior column degeneration: sensory ataxia, lightning pains, Argyll Robertson pupils",
    lesionId: "posterior-cord",
    clinicalVignette: "A 55-year-old with progressive unsteadiness worse in the dark. Lightning pains in the legs. Romberg positive. Absent ankle and knee jerks. Pupils are small, irregular, and accommodate but do not react to light.",
  },
  {
    id: "anterior-spinal",
    label: "Anterior Spinal Artery Syndrome",
    description: "Anterior cord infarction: bilateral weakness + pain/temperature loss, spared proprioception",
    lesionId: "anterior-cord",
    clinicalVignette: "A 70-year-old after aortic surgery develops sudden bilateral leg weakness and loss of pain sensation. Proprioception and vibration are preserved. A T10 sensory level to pinprick is found.",
  },
  {
    id: "wallenberg-sensory",
    label: "Wallenberg (Crossed Sensory)",
    description: "Lateral medulla: ipsilateral face + contralateral body pain/temperature loss",
    lesionId: "lateral-medulla",
    clinicalVignette: "A 58-year-old with sudden vertigo and dysphagia. Left face loses pain/temperature (spinal V nucleus), right body loses pain/temperature (spinothalamic tract). Proprioception is intact throughout.",
  },
  {
    id: "thalamic-pain",
    label: "Thalamic Pain Syndrome",
    description: "Thalamic stroke followed by contralateral burning dysesthesia (Dejerine-Roussy)",
    lesionId: "thalamic",
    clinicalVignette: "A 65-year-old had a small right thalamic stroke 3 weeks ago. Initially had left hemisensory loss. Now develops severe burning pain in the left hand and foot, triggered by light touch. Allodynia and hyperpathia on exam.",
  },
  {
    id: "cortical-parietal",
    label: "Cortical Sensory Loss",
    description: "Parietal lesion: loss of discriminative sensation with preserved primary modalities",
    lesionId: "cortical-sensory",
    clinicalVignette: "A 60-year-old with a right parietal stroke. Left-sided pinprick and temperature are intact, but she cannot identify objects placed in the left hand (astereognosis) or numbers drawn on the left palm (agraphesthesia). Two-point discrimination is impaired on the left.",
  },
  {
    id: "c6-radiculopathy",
    label: "C6 Radiculopathy",
    description: "Nerve root compression: dermatomal numbness with myotomal weakness",
    lesionId: "dorsal-root",
    clinicalVignette: "A 48-year-old with neck pain radiating to the right thumb and radial forearm. Numbness in the C6 dermatome. Weak wrist extension. Diminished brachioradialis reflex. Pain worsens with neck extension and rotation.",
  },
];

export function simulateSensoryLesion(lesionId: string): SensoryLesionResult {
  const level = sensoryLesionLevels.find((l) => l.id === lesionId);
  if (!level) {
    return simulateSensoryLesion("polyneuropathy");
  }

  const findings: SensoryFinding[] = [];
  let pattern = "";
  let distribution = "";
  let spared: string[] = [];
  let keyDist: string[] = [];
  let correlate = "";

  switch (level.id) {
    case "peripheral-nerve":
      findings.push(
        { modality: "Pain/Temperature", status: "lost", territory: "Named nerve territory", explanation: "All fiber types travel together in a peripheral nerve." },
        { modality: "Proprioception/Vibration", status: "lost", territory: "Named nerve territory", explanation: "Large fibers are in the same nerve trunk." },
        { modality: "Light Touch", status: "lost", territory: "Named nerve territory", explanation: "All modalities lost in the nerve distribution." },
      );
      pattern = "All modalities lost in a single nerve distribution";
      distribution = "Named nerve territory (e.g., median, ulnar, peroneal)";
      spared = ["All sensation outside the nerve territory"];
      keyDist = [
        "Nerve territory ≠ dermatome — nerves and roots have different maps",
        "Motor involvement in the same nerve helps confirm the localization",
      ];
      correlate = "Carpal tunnel (median), ulnar neuropathy (elbow), peroneal palsy (fibular head)";
      break;

    case "polyneuropathy":
      findings.push(
        { modality: "Pain/Temperature", status: "lost", territory: "Stocking-glove (distal > proximal)", explanation: "Longest fibers degenerate first (length-dependent). Small fibers (Aδ, C) carry pain/temperature." },
        { modality: "Proprioception/Vibration", status: "diminished", territory: "Distal (toes > fingers)", explanation: "Large fibers are affected later in small fiber neuropathy, or first in large fiber neuropathy." },
        { modality: "Light Touch", status: "diminished", territory: "Stocking-glove", explanation: "Variably affected depending on fiber type involvement." },
      );
      pattern = "Stocking-glove distribution (distal symmetric)";
      distribution = "Length-dependent: feet first, then hands as disease progresses";
      spared = ["Proximal sensation (initially)", "Facial sensation"];
      keyDist = [
        "Small fiber neuropathy: pain/temperature loss, burning feet, normal NCS",
        "Large fiber neuropathy: proprioception/vibration loss, sensory ataxia, abnormal NCS",
        "Mixed: both modalities affected — most common",
      ];
      correlate = "Diabetes, alcohol, B12 deficiency, CIDP, amyloidosis";
      break;

    case "dorsal-root":
      findings.push(
        { modality: "Pain/Temperature", status: "lost", territory: "Dermatomal strip", explanation: "All modalities enter through the dorsal root — dermatomal pattern." },
        { modality: "Proprioception/Vibration", status: "lost", territory: "Same dermatome", explanation: "Large fibers travel in the same root." },
        { modality: "Pain (radicular)", status: "lost", territory: "Shooting pain in dermatome", explanation: "Root irritation produces lancinating dermatomal pain — often the chief complaint." },
      );
      pattern = "Dermatomal distribution (single root or adjacent roots)";
      distribution = "Band-like sensory loss following a dermatome ± motor weakness in the myotome";
      spared = ["Sensation outside the affected dermatome(s)"];
      keyDist = [
        "Dermatomal pain with sensory loss = radiculopathy",
        "Non-length-dependent sensory ataxia = ganglionopathy (dorsal root ganglion — paraneoplastic, Sjögren)",
      ];
      correlate = "Disc herniation, foraminal stenosis, herpes zoster, paraneoplastic ganglionopathy";
      break;

    case "cord-hemisection":
      findings.push(
        { modality: "Proprioception/Vibration", status: "lost", territory: "IPSILATERAL below the lesion", explanation: "Dorsal columns are UNCROSSED in the cord — ipsilateral loss." },
        { modality: "Pain/Temperature", status: "lost", territory: "CONTRALATERAL below the lesion (1-2 levels down)", explanation: "Spinothalamic tract has ALREADY CROSSED — contralateral loss." },
        { modality: "Motor (UMN)", status: "lost", territory: "IPSILATERAL below the lesion", explanation: "Corticospinal tract has ALREADY CROSSED at the pyramids — ipsilateral weakness." },
      );
      pattern = "Dissociated: ipsilateral dorsal column + contralateral spinothalamic";
      distribution = "Below the level of the lesion, different sides for different modalities";
      spared = ["Contralateral proprioception", "Ipsilateral pain/temperature"];
      keyDist = [
        "The key: each tract crosses at a DIFFERENT level. Motor and proprioception = same side. Pain/temperature = opposite side.",
        "Band of ipsilateral all-modality loss at the lesion level (posterior root entry zone)",
      ];
      correlate = "Penetrating trauma, MS, extramedullary tumor, radiation myelopathy";
      break;

    case "central-cord":
      findings.push(
        { modality: "Pain/Temperature", status: "lost", territory: "BILATERAL, cape/suspended distribution", explanation: "Crossing spinothalamic fibers in the anterior white commissure are destroyed by the central lesion." },
        { modality: "Proprioception/Vibration", status: "preserved", territory: "Intact (dorsal columns are peripheral, not central)", explanation: "Dorsal columns run at the posterior periphery of the cord, away from the central syrinx." },
        { modality: "Motor (if expanded)", status: "diminished", territory: "Hands > arms (central gray expansion)", explanation: "If syrinx expands into anterior horns: LMN hand weakness with wasting." },
      );
      pattern = "Dissociated: pain/temperature lost, proprioception/vibration preserved";
      distribution = "Cape or suspended distribution (arms and upper trunk, sparing legs and face)";
      spared = ["Proprioception and vibration (dorsal columns)", "Sacral segments (laminated peripherally in spinothalamic tract)"];
      keyDist = [
        "Bilateral pain/temperature loss + preserved proprioception = central cord process",
        "Cape distribution = cervical/upper thoracic syrinx",
        "Associated with Chiari malformation (ask about headaches with cough/Valsalva)",
      ];
      correlate = "Syringomyelia (with Chiari I), post-traumatic syrinx, intramedullary tumor";
      break;

    case "posterior-cord":
      findings.push(
        { modality: "Proprioception/Vibration", status: "lost", territory: "Below the lesion, bilateral", explanation: "Both dorsal columns are damaged. Vibration and joint position sense are abolished." },
        { modality: "Pain/Temperature", status: "preserved", territory: "Intact (spinothalamic tract is anterolateral)", explanation: "The anterolateral cord is spared — pain and temperature are normal." },
        { modality: "Discriminative touch", status: "lost", territory: "Below the lesion", explanation: "Two-point discrimination and stereognosis require dorsal column integrity." },
      );
      pattern = "Proprioceptive loss with preserved pain/temperature";
      distribution = "Below the level of the lesion, bilateral";
      spared = ["Pain and temperature (spinothalamic tract)", "Motor strength (corticospinal tract)"];
      keyDist = [
        "Positive Romberg test: patient sways/falls with eyes closed (visual compensation removed)",
        "Sensory ataxia: wide-based gait, stamping feet, watching the ground",
        "Pseudoathetosis: writhing movements of fingers when eyes are closed (deafferented hands)",
      ];
      correlate = "Tabes dorsalis (tertiary syphilis), B12 deficiency (subacute combined degeneration), Friedreich ataxia, MS";
      break;

    case "anterior-cord":
      findings.push(
        { modality: "Pain/Temperature", status: "lost", territory: "Bilateral below the lesion", explanation: "Both spinothalamic tracts are in the anterolateral cord (anterior spinal artery territory)." },
        { modality: "Motor (UMN)", status: "lost", territory: "Bilateral below the lesion", explanation: "Both corticospinal tracts are in the lateral cord (anterior spinal artery territory)." },
        { modality: "Proprioception/Vibration", status: "preserved", territory: "INTACT (dorsal columns have separate blood supply)", explanation: "Posterior spinal arteries supply the dorsal columns independently." },
      );
      pattern = "Motor + pain/temperature loss, SPARED proprioception";
      distribution = "Bilateral below the vascular level";
      spared = ["Proprioception and vibration (posterior spinal artery territory)"];
      keyDist = [
        "The hallmark of anterior cord syndrome is spared proprioception — 'the back of the cord works'",
        "Anterior spinal artery supplies anterior 2/3 of cord",
        "Classic after aortic surgery (cross-clamp ischemia) or aortic dissection",
      ];
      correlate = "Aortic surgery complication, aortic dissection, anterior spinal artery thrombosis, severe hypotension";
      break;

    case "lateral-medulla":
      findings.push(
        { modality: "Pain/Temperature (face)", status: "lost", territory: "IPSILATERAL face", explanation: "Spinal nucleus and tract of CN V are in the lateral medulla — damaged on the side of the lesion." },
        { modality: "Pain/Temperature (body)", status: "lost", territory: "CONTRALATERAL body", explanation: "Lateral spinothalamic tract has already crossed — carries contralateral body pain/temperature." },
        { modality: "Proprioception/Vibration", status: "preserved", territory: "Intact (medial lemniscus is medial, not lateral)", explanation: "Medial lemniscus runs in the medial medulla, spared in a lateral lesion." },
      );
      pattern = "CROSSED: ipsilateral face + contralateral body pain/temperature loss";
      distribution = "Face (ipsilateral) + body (contralateral) — the crossing pattern is pathognomonic";
      spared = ["Proprioception and vibration (medial lemniscus)", "Motor strength (corticospinal tract is ventral/medial)"];
      keyDist = [
        "Crossed sensory loss (face vs. body on different sides) = lateral brainstem until proven otherwise",
        "This is Wallenberg syndrome — the most important brainstem syndrome to recognize",
        "No motor weakness (corticospinal tract is medial/ventral, not lateral)",
      ];
      correlate = "PICA/vertebral artery occlusion, vertebral artery dissection";
      break;

    case "thalamic":
      findings.push(
        { modality: "All modalities", status: "lost", territory: "CONTRALATERAL hemibody (face + arm + leg)", explanation: "VPL and VPM thalamic nuclei are the relay for all somatosensory information to cortex." },
        { modality: "Thalamic pain (delayed)", status: "lost", territory: "Contralateral hemibody — burning, lancinating", explanation: "Dejerine-Roussy syndrome: weeks after thalamic stroke, spontaneous pain with allodynia develops from aberrant thalamic reorganization." },
      );
      pattern = "Complete contralateral hemisensory loss (all modalities)";
      distribution = "Face, arm, and leg on the contralateral side";
      spared = ["Motor strength (unless thalamocapsular extension)"];
      keyDist = [
        "Pure sensory stroke (no motor deficit) = thalamic lacune",
        "Thalamic pain syndrome (Dejerine-Roussy) appears weeks later — allodynia, hyperpathia, spontaneous burning",
        "Small thalamic strokes can be missed if sensory exam is cursory",
      ];
      correlate = "Thalamogeniculate artery occlusion (lacunar stroke), thalamic hemorrhage";
      break;

    case "cortical-sensory":
      findings.push(
        { modality: "Stereognosis", status: "lost", territory: "Contralateral hand", explanation: "Cortical sensory processing integrates primary modalities into object recognition." },
        { modality: "Graphesthesia", status: "lost", territory: "Contralateral hand/body", explanation: "Recognizing numbers/letters drawn on skin requires parietal cortical processing." },
        { modality: "Two-point discrimination", status: "lost", territory: "Contralateral hand", explanation: "Spatial resolution requires cortical columnar processing in S1." },
        { modality: "Pain/Temperature", status: "preserved", territory: "Intact", explanation: "Primary modalities reach cortex but cortical interpretation of spatial/discriminative features fails." },
        { modality: "Proprioception (basic)", status: "preserved", territory: "Intact (or mildly reduced)", explanation: "Basic joint position sense may be preserved; complex proprioceptive tasks fail." },
      );
      pattern = "Loss of discriminative sensation with preserved primary modalities";
      distribution = "Contralateral, following the somatotopic map of the parietal cortex";
      spared = ["Primary modalities (pain, temperature, basic touch, basic proprioception)"];
      keyDist = [
        "The cortical exam tests what the cortex DOES with sensory input, not just whether input arrives",
        "Astereognosis + agraphesthesia + impaired two-point = CORTICAL sensory loss, not peripheral or spinal",
        "Sensory extinction (bilateral simultaneous stimulation) is a parietal cortical sign",
      ];
      correlate = "Parietal cortex stroke (MCA territory), parietal lobe tumor, parietal MS plaque";
      break;
  }

  return {
    lesion: level,
    findings,
    pattern,
    distribution,
    sparedModalities: spared,
    keyDistinctions: keyDist,
    clinicalCorrelate: correlate,
    explanation: {
      mechanism: level.description,
      whatToNotice: [
        `This is a ${level.category}-level lesion at ${level.anatomicalLevel}.`,
        pattern,
        `Key spared modalities: ${spared.join("; ") || "none"}.`,
      ],
      localizationLogic: [
        "Step 1: Which modalities are affected? (pain/temp vs. proprioception/vibration vs. discriminative)",
        "Step 2: What is the distribution? (nerve, dermatome, stocking-glove, hemibody, suspended/cape, crossed)",
        "Step 3: Are motor signs present? If so, UMN or LMN?",
        "Step 4: Does the sensory pattern match a known tract or syndrome?",
      ],
    },
  };
}
