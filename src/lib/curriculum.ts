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
    trainingStage: "Post-clinical localization",
    learningGoals: [
      "Localize neurological syndromes to major brain systems",
      "Understand why loops matter more than isolated structures",
    ],
    advancedObjectives: [
      "Separate cortical, subcortical, cerebellar, and brainstem patterns before naming a disease.",
      "Reject weaker competing localizations using exam asymmetry, cortical signs, and network logic.",
    ],
    prerequisites: ["Basic neuroanatomy"],
    linkedModules: ["vision", "dopamine", "ask"],
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
    trainingStage: "Systems visual neuroscience",
    learningGoals: [
      "Explain center-surround antagonism",
      "Predict how stimulus size and position change retinal output",
    ],
    advancedObjectives: [
      "Connect retinal preprocessing to later cortical constraints instead of treating the retina as a passive camera.",
      "Use receptive-field logic to reason forward into contrast sensitivity, edge extraction, and lesion syndromes.",
    ],
    prerequisites: ["Basic visual pathway knowledge"],
    linkedModules: ["vision", "brain-atlas"],
    commonMisconceptions: [
      "Ganglion cells respond to brightness alone.",
      "Large stimuli always create stronger responses.",
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
    trainingStage: "Post-clinical visual localization",
    learningGoals: [
      "Understand hierarchical visual processing",
      "Map perception to ventral stream stages",
    ],
    advancedObjectives: [
      "Use visual syndromes such as agnosia, achromatopsia, and field cuts as localization tools.",
      "Connect recurrent cortical processing to category stability, attention, predictive coding, and what additional data should settle a visual localization consult.",
    ],
    prerequisites: ["Retinal organization"],
    linkedModules: ["retina", "brain-atlas", "ask"],
    commonMisconceptions: [
      "Vision is computed in one cortical area.",
      "Classification and localization are the same process.",
    ],
  },
  {
    slug: "ask",
    title: "Neuro Tutor",
    trainingStage: "Consult-service oral reasoning",
    learningGoals: [
      "Practice verbal reasoning and explanation",
      "Strengthen mechanism-based clinical thinking",
    ],
    advancedObjectives: [
      "Move from bedside phenotype to localization, mechanism, and differential without collapsing the steps.",
      "Practice case-conference style reasoning with explicit rejection of weaker alternatives.",
    ],
    prerequisites: [],
    linkedModules: ["brain-atlas", "vision", "dopamine"],
    commonMisconceptions: [
      "Fluent explanation equals correct localization.",
      "A single buzzword proves understanding.",
    ],
  },
  {
    slug: "ecg",
    title: "12-Lead ECG Explorer",
    trainingStage: "Consult-level neurocardiac interpretation",
    learningGoals: [
      "Relate autonomic tone to surface rhythm changes",
      "Interpret ECGs through a brain-heart physiology lens",
    ],
    advancedObjectives: [
      "Separate primary conduction disease from centrally mediated autonomic modulation.",
      "Relate neurogenic sympathetic surge, vagal braking, and blunted autonomic modulation to ECG pattern shifts without overcalling ischemia or fixed conduction disease.",
    ],
    prerequisites: ["Basic cardiac conduction"],
    linkedModules: ["neuron", "ask"],
    commonMisconceptions: [
      "All rhythm changes are primary cardiac pathology.",
      "Autonomic effects are invisible on the ECG.",
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
