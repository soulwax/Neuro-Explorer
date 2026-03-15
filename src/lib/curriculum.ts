export interface CurriculumModule {
  slug: string;
  title: string;
  trainingStage: string;
  learningGoals: string[];
  advancedObjectives: string[];
  prerequisites: string[];
  linkedModules: string[];
  commonMisconceptions: string[];
}

export const curriculumModules: CurriculumModule[] = [
  {
    slug: "brain-atlas",
    title: "Brain Atlas",
    trainingStage: "Post-clinical anatomical convergence",
    learningGoals: [
      "Localize neurological syndromes to major brain systems",
      "Understand why loops and distributed systems matter more than isolated structures",
    ],
    advancedObjectives: [
      "Separate vascular-territory, visual-stream, loop, and brainstem long-tract explanations before naming a disease.",
      "Reject weaker competing localizations using exam asymmetry, cortical signs, negative findings, and network logic.",
    ],
    prerequisites: ["Basic neuroanatomy"],
    linkedModules: ["retina", "visual-field", "vision", "dopamine", "ecg", "ask"],
    commonMisconceptions: [
      "One symptom always equals one structure.",
      "Naming a vascular territory is the same as proving the localization.",
    ],
  },
  {
    slug: "neuron",
    title: "Neuron Simulation",
    trainingStage: "Advanced cellular physiology",
    learningGoals: [
      "Understand membrane time constants and threshold behavior",
      "Connect ion-channel behavior to excitability",
    ],
    advancedObjectives: [
      "Explain refractoriness as state-dependent channel availability rather than a memorized pause.",
      "Relate altered excitability to demyelination, sodium-channel block, and conduction failure.",
    ],
    prerequisites: ["Basic action potential physiology"],
    linkedModules: ["plasticity", "ecg"],
    commonMisconceptions: [
      "Bigger input always means immediate spiking.",
      "Threshold is fixed and context-free.",
    ],
  },
  {
    slug: "retina",
    title: "Retinal Receptive Field Lab",
    trainingStage: "Post-clinical neuro-ophthalmic triage",
    learningGoals: [
      "Explain center-surround antagonism",
      "Predict how stimulus size and position change retinal output",
      "Separate retinal, optic-disc, and optic-nerve patterns before escalating to cortex",
    ],
    advancedObjectives: [
      "Connect retinal preprocessing to later cortical constraints instead of treating the retina as a passive camera.",
      "Use central scotoma, blind-spot enlargement, arcuate loss, and curtain-like deficits as prechiasmal localization tools.",
    ],
    prerequisites: ["Basic visual pathway knowledge"],
    linkedModules: ["visual-field", "vision", "brain-atlas", "ask"],
    commonMisconceptions: [
      "Ganglion cells respond to brightness alone.",
      "Large stimuli always create stronger responses.",
      "Any visual complaint should be localized to cortex before the eye and optic nerve are excluded.",
    ],
  },
  {
    slug: "visual-field",
    title: "Visual Field Localizer",
    trainingStage: "Consult-level visual localization",
    learningGoals: [
      "Distinguish monocular, chiasmal, retrochiasmal, and attentional visual syndromes",
      "Use field geometry to rank lesion location before naming disease",
    ],
    advancedObjectives: [
      "Separate true field loss from neglect and extinction using bedside logic rather than labels.",
      "Use congruity, quadrant pattern, and macular sparing to rank retrochiasmal lesions by posterior depth.",
    ],
    prerequisites: ["Basic visual pathway knowledge", "Retinal organization"],
    linkedModules: ["retina", "vision", "brain-atlas", "ask"],
    commonMisconceptions: [
      "Any left-sided miss is a hemianopia.",
      "Visual localization ends once you say retrochiasmal.",
    ],
  },
  {
    slug: "plasticity",
    title: "Synaptic Plasticity",
    trainingStage: "Mechanistic learning theory",
    learningGoals: [
      "Interpret timing-dependent changes in synaptic strength",
      "Relate timing rules to learning and maladaptation",
    ],
    advancedObjectives: [
      "Compare Hebbian potentiation, LTD, metaplasticity, and homeostatic scaling in one framework.",
      "Map plasticity rules onto addiction, chronic pain, recovery, and maladaptive network stabilization.",
    ],
    prerequisites: ["Action potentials", "Synaptic transmission"],
    linkedModules: ["neuron", "dopamine"],
    commonMisconceptions: [
      "Any repeated firing strengthens a synapse.",
      "Plasticity is always beneficial.",
    ],
  },
  {
    slug: "dopamine",
    title: "Dopamine Prediction Error Lab",
    trainingStage: "Computational clinical neuroscience",
    learningGoals: [
      "Understand reward prediction error",
      "Connect dopamine signals to action selection and habit learning",
    ],
    advancedObjectives: [
      "Distinguish reward prediction error from hedonic tone, salience, and movement vigor.",
      "Relate reinforcement-learning abstractions to basal ganglia loops and movement-disorder phenomenology.",
    ],
    prerequisites: ["Basic reinforcement learning concepts"],
    linkedModules: ["plasticity", "brain-atlas"],
    commonMisconceptions: [
      "Dopamine only means pleasure.",
      "Prediction error and reward size are identical.",
    ],
  },
  {
    slug: "vision",
    title: "Visual Cortex",
    trainingStage: "Consult-level cortical vision reasoning",
    learningGoals: [
      "Understand hierarchical visual processing",
      "Map perception to ventral, dorsal, and attention-network failures",
    ],
    advancedObjectives: [
      "Use visual syndromes such as agnosia, achromatopsia, field cuts, optic ataxia, simultanagnosia, and neglect as localization tools.",
      "Connect recurrent cortical processing to category stability, attention, predictive coding, and the single next datum that should settle a visual localization consult.",
    ],
    prerequisites: ["Retinal organization", "Visual field logic"],
    linkedModules: ["retina", "visual-field", "brain-atlas", "ask"],
    commonMisconceptions: [
      "Vision is computed in one cortical area.",
      "Classification and localization are the same process.",
      "All high-order visual complaints belong to ventral stream rather than dorsal or attention networks.",
    ],
  },
  {
    slug: "ask",
    title: "Neuro Tutor",
    trainingStage: "Cross-module consult reasoning rubric",
    learningGoals: [
      "Practice verbal reasoning and explanation across the whole app",
      "Strengthen mechanism-based clinical thinking with explicit reversal logic",
    ],
    advancedObjectives: [
      "Move from bedside phenotype to syndrome, localization hierarchy, mechanism, competing alternative, and decisive next data without collapsing the steps.",
      "Practice case-conference style reasoning with explicit rejection of weaker alternatives and a concrete statement of what would change your mind.",
    ],
    prerequisites: [],
    linkedModules: ["retina", "visual-field", "vision", "brain-atlas", "ecg", "dopamine"],
    commonMisconceptions: [
      "Fluent explanation equals correct localization.",
      "A single buzzword proves understanding.",
    ],
  },
  {
    slug: "ecg",
    title: "12-Lead ECG Explorer",
    trainingStage: "Neurocritical brain-heart interpretation",
    learningGoals: [
      "Relate autonomic tone to surface rhythm changes",
      "Interpret ECGs through a brain-heart physiology lens",
      "Recognize when the strip is expressing central autonomic injury rather than primary cardiac disease",
    ],
    advancedObjectives: [
      "Separate primary conduction disease from centrally mediated autonomic modulation.",
      "Relate neurogenic sympathetic surge, vagal braking, brainstem dysautonomia, and pressure-linked crisis states to ECG pattern shifts without overcalling ischemia or fixed conduction disease.",
    ],
    prerequisites: ["Basic cardiac conduction"],
    linkedModules: ["brain-atlas", "neuron", "ask"],
    commonMisconceptions: [
      "All rhythm changes are primary cardiac pathology.",
      "Autonomic effects are invisible on the ECG.",
    ],
  },
  {
    slug: "eeg",
    title: "EEG & Neural Oscillations",
    trainingStage: "Consult-level neurophysiology interpretation",
    learningGoals: [
      "Identify normal EEG rhythms and their topographic distribution across the 10-20 system",
      "Recognize epileptiform discharges and distinguish them from normal sharp transients and artifacts",
      "Use EEG patterns to grade encephalopathy and assess cortical function",
    ],
    advancedObjectives: [
      "Separate epileptiform from non-epileptiform sharps using morphology, field, aftergoing slow wave, and clinical context.",
      "Use background continuity, reactivity, and dominant frequency to grade encephalopathy severity and distinguish metabolic from structural causes.",
      "Interpret patterns on the ictal-interictal continuum (LPDs, GPDs, LRDA) using the ACNS standardized terminology.",
    ],
    prerequisites: ["Basic neuroanatomy", "Action potential physiology"],
    linkedModules: ["neuron", "brain-atlas", "ecg", "ask"],
    commonMisconceptions: [
      "Any sharp waveform on EEG is a seizure.",
      "A normal interictal EEG rules out epilepsy.",
      "Triphasic waves are specific to hepatic encephalopathy.",
      "Burst suppression always means brain death.",
    ],
  },
  {
    slug: "grid-cell",
    title: "Grid Cell Navigator",
    trainingStage: "Network navigation coding",
    learningGoals: [
      "Understand spatial firing fields",
      "Relate navigation coding to entorhinal function",
    ],
    advancedObjectives: [
      "Explain how path integration, theta timing, and entorhinal coding interact rather than treating grid fields as static pictures.",
      "Connect entorhinal dysfunction to memory, navigation failure, and medial temporal network breakdown.",
    ],
    prerequisites: ["Basic spatial navigation concepts"],
    linkedModules: ["brain-atlas", "ask"],
    commonMisconceptions: [
      "Navigation is only hippocampal.",
      "Grid patterns require explicit landmarks at all times.",
    ],
  },
  {
    slug: "action-potential",
    title: "Action Potential (Hodgkin-Huxley)",
    trainingStage: "Advanced biophysics and pharmacology",
    learningGoals: [
      "Understand the ionic basis of the action potential through the Hodgkin-Huxley model",
      "Explain how Na+ activation, inactivation, and K+ delayed rectification produce the spike waveform",
      "Predict the effects of pharmacological blockade (TTX, TEA, local anesthetics) on excitability",
    ],
    advancedObjectives: [
      "Connect gating variable kinetics (m, h, n) to the biophysical phases of the action potential.",
      "Relate channel blockade to clinical scenarios: local anesthesia, tetrodotoxin poisoning, and demyelination.",
      "Explain why the LIF model in the Neuron module is an abstraction of these dynamics and when the abstraction breaks down.",
    ],
    prerequisites: ["Basic action potential physiology", "Ion channel concepts"],
    linkedModules: ["neuron", "plasticity", "motor-pathway", "eeg"],
    commonMisconceptions: [
      "The action potential is caused by Na+ alone — K+ is equally essential for repolarization.",
      "Threshold is a fixed voltage — it depends on the state of h gates (inactivation).",
      "TTX and lidocaine are identical — they block from different sides of the channel.",
    ],
  },
  {
    slug: "motor-pathway",
    title: "Motor Pathway Explorer",
    trainingStage: "Clinical motor system localization",
    learningGoals: [
      "Distinguish UMN from LMN signs at the bedside",
      "Localize motor lesions along the corticospinal tract from cortex to muscle",
      "Recognize brainstem crossed findings as definitive localizers",
    ],
    advancedObjectives: [
      "Use the distribution and pattern of weakness (face/arm vs. leg, proximal vs. distal) to narrow localization before imaging.",
      "Explain why mixed UMN+LMN signs (ALS) cannot be produced by a single focal lesion.",
      "Differentiate acute UMN presentations (flaccid shock phase) from established UMN patterns (spasticity).",
    ],
    prerequisites: ["Basic neuroanatomy", "Brain Atlas module"],
    linkedModules: ["brain-atlas", "action-potential", "neuron", "ask"],
    commonMisconceptions: [
      "UMN always means spastic — acute UMN lesions are initially flaccid.",
      "Fasciculations always mean ALS — benign fasciculations are common.",
      "Forehead involvement in facial weakness is a minor detail — it is the key UMN vs. LMN distinction.",
    ],
  },
  {
    slug: "sleep",
    title: "Sleep Architecture",
    trainingStage: "Clinical sleep medicine fundamentals",
    learningGoals: [
      "Understand normal NREM-REM cycling and its evolution across the night",
      "Identify EEG markers of each sleep stage (spindles, K-complexes, delta, sawtooth waves)",
      "Recognize pathological sleep architecture patterns in narcolepsy, OSA, depression, and RBD",
    ],
    advancedObjectives: [
      "Interpret a hypnogram to identify disordered sleep architecture and generate a differential diagnosis.",
      "Explain why REM sleep behavior disorder is the strongest prodromal marker for alpha-synucleinopathies.",
      "Connect sleep stage physiology to clinical phenomena: SWS to growth hormone, REM to dreaming, spindles to memory consolidation.",
    ],
    prerequisites: ["EEG module basics", "Basic neuroanatomy"],
    linkedModules: ["eeg", "brain-atlas", "dopamine", "motor-pathway", "ask"],
    commonMisconceptions: [
      "Deep sleep = REM — actually N3 (slow-wave) is the deepest NREM stage; REM is 'paradoxical' sleep.",
      "Everyone needs exactly 8 hours — sleep need varies from 6-9 hours in healthy adults.",
      "Dreaming only occurs in REM — NREM dreaming exists but is less vivid.",
      "RBD is just nightmares — it is a neurodegenerative prodrome requiring follow-up.",
    ],
  },
];

export function getCurriculumModule(slug: string) {
  return curriculumModules.find((module) => module.slug === slug);
}
