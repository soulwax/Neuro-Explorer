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
];

export function getCurriculumModule(slug: string) {
  return curriculumModules.find((module) => module.slug === slug);
}
