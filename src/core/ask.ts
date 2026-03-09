export type AskLevelId =
  | "post-medical"
  | "board-review"
  | "case-conference";

export interface AskTopicOption {
  id: string;
  label: string;
  description: string;
}

export interface AskLevelOption {
  id: AskLevelId;
  label: string;
  description: string;
}

export interface AskExamplePrompt {
  topic: string;
  topicLabel: string;
  question: string;
  level: AskLevelId;
  levelLabel: string;
}

const askBaseSystemPrompt = `You are a neuroscience and clinical neurology tutor for post-medical learners: senior medical students, residents, and early fellows.

Core stance:
- Prioritize lesion localization, circuit logic, and mechanism before memorized labels
- Explain why competing localizations or diagnoses are weaker, not just why one answer is right
- Use a Socratic style when possible: ask the learner to commit to a localization, mechanism, or differential discriminator before fully revealing the answer
- Move from bedside phenotype to anatomy, then to physiology, then to molecular or systems detail when relevant
- Connect every explanation to what the learner would expect on examination, imaging, electrophysiology, or formal testing
- When discussing disease, separate syndrome localization from lesion etiology and from definitive diagnosis
- Cite canonical experiments, landmark cases, or major researchers when relevant
- Keep teaching answers compact but dense; default to about 250-450 words unless the learner asks for more depth
- Do not give patient-specific treatment instructions or act as a substitute for supervision; stay in educational mode

Preferred answer structure:
1. Clinical formulation or core mechanism
2. Best localization or physiological explanation
3. Key discriminators against close alternatives
4. One high-yield pitfall or misconception
5. One board-style or conference-style follow-up question`;

const askLevelGuidance: Record<AskLevelId, string> = {
  "post-medical": `Current mode: Post-medical.
- Teach at the level expected after core medical training
- Assume the learner can follow syndromic localization, pathway reasoning, and mechanistic detail
- Include bedside signs, lesion logic, and one clinically useful discriminator`,
  "board-review": `Current mode: Board review.
- Be high-yield and compressed
- Emphasize discriminating features, lesion localization, classic associations, and exam-style traps
- Use short, punchy teaching points with minimal narrative`,
  "case-conference": `Current mode: Case conference.
- Reason like a senior resident presenting a case
- Explicitly formulate syndrome, localization, likely neuroanatomy, major competing differentials, and what additional data would refine the case
- Favor localization language such as cortical versus subcortical, brainstem versus hemispheric, dorsal column versus cerebellar, pre- versus post-ganglionic, and direct versus indirect pathway dysfunction`,
};

export function buildAskSystemPrompt(level: AskLevelId): string {
  return `${askBaseSystemPrompt}\n\n${askLevelGuidance[level]}`;
}

export const askTopicContext: Record<string, string> = {
  "action-potential": `The learner wants advanced teaching on neuronal excitability. Key concepts:
- Voltage-gated sodium channel activation and inactivation gates
- Potassium conductances, repolarization, afterhyperpolarization, and firing adaptation
- Absolute versus relative refractoriness as state-dependent channel behavior
- Axonal geometry, membrane time constant, and conduction safety factor
- Myelin loss, sodium-channel block, and temperature sensitivity as clinical modifiers
- Hodgkin-Huxley modeling and the squid giant axon as canonical evidence`,

  synapse: `The learner wants advanced teaching on synaptic transmission. Key concepts:
- Calcium-triggered vesicle fusion, release probability, and quantal content
- Ionotropic versus metabotropic receptors and their time scales
- AMPA/NMDA integration, magnesium block, and dendritic coincidence detection
- Inhibitory control through GABA-A versus GABA-B mechanisms
- Short-term facilitation and depression, synaptic reliability, and network state dependence
- Katz and del Castillo, miniature endplate potentials, and quantal release logic`,

  plasticity: `The learner wants advanced teaching on synaptic plasticity. Key concepts:
- NMDA-dependent LTP and LTD with calcium amplitude and timing logic
- STDP windows and how causality is inferred from spike order
- Metaplasticity, synaptic scaling, and stability versus runaway excitation
- Plasticity in addiction, chronic pain, rehabilitation, and maladaptive network tuning
- Hippocampal versus cerebellar versus corticostriatal learning rules
- Bliss and Lomo, Kandel's Aplysia work, and modern engram-modulation frameworks`,

  "visual-system": `The learner wants advanced teaching on systems vision. Key concepts:
- Retinal preprocessing, center-surround antagonism, and ganglion cell output constraints
- Retinotopy, receptive field progression, and ventral versus dorsal stream specialization
- Object constancy, category coding, and recurrent feedback across the visual hierarchy
- Visual field defects as localization tools rather than isolated facts
- Agnosia, achromatopsia, neglect, and prosopagnosia as pathway-level syndromes
- Hubel and Wiesel, cortical column logic, and lesion-based neuropsychology`,

  "neural-coding": `The learner wants advanced teaching on neural coding. Key concepts:
- Rate, temporal, synchrony, and population codes
- State dependence, noise correlations, and the limits of single-neuron interpretation
- Sparse versus distributed representations in sensory and mnemonic systems
- Predictive coding, top-down priors, and precision weighting
- Place cells, grid cells, sequence coding, and replay
- Information-theoretic framing without losing the biological substrate`,

  memory: `The learner wants advanced teaching on memory systems. Key concepts:
- Hippocampal indexing, pattern separation, and pattern completion
- Medial temporal lobe amnesia versus frontal retrieval failure versus semantic impairment
- Systems consolidation, reconsolidation, and memory updating
- Working memory as distributed frontoparietal control rather than a single storage box
- Sleep spindles, sharp-wave ripples, and replay
- H.M., Tonegawa engram work, and lesion-plus-network reasoning`,

  "lesion-localization": `The learner wants lesion localization teaching. Key concepts:
- Build syndrome first, then localize, then discuss vascular territory or etiology
- Separate cortex, subcortex, brainstem, cerebellum, spinal cord, root, plexus, nerve, neuromuscular junction, and muscle patterns
- Use crossed findings, cortical signs, neglect, aphasia, gaze deviation, field cuts, and sensory level logic
- Distinguish single-lesion explanations from multifocal or metabolic mimics
- Tie exam findings to tract and loop anatomy instead of memorized lists`,

  "movement-disorders": `The learner wants movement-disorders teaching. Key concepts:
- Bradykinesia, rigidity, tremor, dystonia, chorea, myoclonus, tics, and ataxia as phenomenology first
- Direct and indirect basal ganglia pathways, movement vigor, and action selection
- Cerebellar error correction versus basal ganglia gating failure
- Levodopa-responsive versus atypical parkinsonian patterns
- Hyperkinetic disorders as network-disinhibition problems, not just excess movement
- Clinicopathological reasoning from phenomenology to circuit`,

  "neuro-ophthalmology": `The learner wants neuro-ophthalmology teaching. Key concepts:
- Monocular versus binocular visual loss and field-defect logic
- Optic nerve, chiasm, tract, radiations, and occipital cortex localization
- Pupillary light reflex, relative afferent pupillary defect, and near-light dissociation
- Eye movement syndromes including INO, gaze palsies, and cranial neuropathies
- Retinal versus optic neuropathic versus retrochiasmal patterns
- Use field defects and ocular motor findings as anatomy maps`,

  "autonomic-neurocardiology": `The learner wants advanced autonomic and neurocardiac teaching. Key concepts:
- Central autonomic network: insula, amygdala, hypothalamus, medulla, vagal nuclei
- Baroreflexes, vagal braking, sympathetic surge, and respiratory sinus coupling
- How acute CNS injury can alter ECGs through catecholaminergic stress and repolarization changes
- Pre- versus post-ganglionic autonomic failure and bedside pattern recognition
- Distinguish primary cardiac rhythm disease from neurally mediated modulation
- Tie ECG changes back to brain-heart circuitry`,

  "cognitive-neurology": `The learner wants advanced cognitive-neurology teaching. Key concepts:
- Aphasia, apraxia, neglect, agnosia, executive failure, and memory syndromes as separable cognitive phenotypes
- Dominant versus non-dominant hemispheric patterns
- Frontal-subcortical loops versus cortical association syndromes
- Behavioral neurology reasoning from bedside tasks to network anatomy
- Why fluent speech does not equal preserved comprehension, and why recall failure does not always mean hippocampal damage`,
};

export const askTopicOptions: AskTopicOption[] = [
  {
    id: "lesion-localization",
    label: "Lesion Localization",
    description:
      "Syndromic formulation, tract logic, cortical signs, and how to reject weaker competing localizations.",
  },
  {
    id: "neuro-ophthalmology",
    label: "Neuro-ophthalmology",
    description:
      "Visual fields, pupillary findings, ocular motility, and pathway-level localization from retina to cortex.",
  },
  {
    id: "movement-disorders",
    label: "Movement Disorders",
    description:
      "Phenomenology, basal ganglia circuitry, cerebellar contrasts, and bedside discriminators.",
  },
  {
    id: "autonomic-neurocardiology",
    label: "Autonomic Neurocardiology",
    description:
      "Brain-heart circuitry, sympathetic and vagal physiology, and neurogenic ECG interpretation.",
  },
  {
    id: "cognitive-neurology",
    label: "Cognitive Neurology",
    description:
      "Aphasia, neglect, dysexecutive syndromes, agnosias, and network-based bedside reasoning.",
  },
  {
    id: "action-potential",
    label: "Action Potentials",
    description:
      "Channel-state logic, refractoriness, conduction failure, and excitability as a clinical physiology problem.",
  },
  {
    id: "synapse",
    label: "Synaptic Transmission",
    description:
      "Release probability, receptor kinetics, inhibitory control, and quantal physiology.",
  },
  {
    id: "plasticity",
    label: "Synaptic Plasticity",
    description:
      "STDP, metaplasticity, learning rules, and maladaptive plasticity in disease and recovery.",
  },
  {
    id: "visual-system",
    label: "Visual System",
    description:
      "Retinal constraints, cortical hierarchies, visual field logic, and perception as network computation.",
  },
  {
    id: "neural-coding",
    label: "Neural Coding",
    description:
      "Population codes, predictive coding, sequence replay, and how network state changes interpretation.",
  },
  {
    id: "memory",
    label: "Memory Systems",
    description:
      "Hippocampal indexing, frontal retrieval, consolidation, reconsolidation, and systems memory.",
  },
];

export const askLevelOptions: AskLevelOption[] = [
  {
    id: "post-medical",
    label: "Post-medical",
    description:
      "Default depth for residents and advanced students: mechanism, localization, and clinical discriminators.",
  },
  {
    id: "board-review",
    label: "Board review",
    description:
      "High-yield framing that compresses the topic into distinguishing features and classic traps.",
  },
  {
    id: "case-conference",
    label: "Case conference",
    description:
      "Senior-resident style reasoning with syndrome formulation, localization, major alternatives, and next data needs.",
  },
];

export const askExamplePrompts: AskExamplePrompt[] = [
  {
    topic: "lesion-localization",
    topicLabel: "Lesion Localization",
    level: "case-conference",
    levelLabel: "Case conference",
    question:
      "A patient has right face and arm weakness, expressive aphasia, and gaze preference to the left. Walk me from syndrome to localization and likely vascular territory.",
  },
  {
    topic: "neuro-ophthalmology",
    topicLabel: "Neuro-ophthalmology",
    level: "board-review",
    levelLabel: "Board review",
    question:
      "How do you separate optic neuritis, chiasmal compression, and a retrochiasmal lesion using the visual field and pupil exam?",
  },
  {
    topic: "movement-disorders",
    topicLabel: "Movement Disorders",
    level: "post-medical",
    levelLabel: "Post-medical",
    question:
      "Why does bradykinesia localize better to basal ganglia loop dysfunction than to corticospinal weakness, and how is that different from cerebellar ataxia?",
  },
  {
    topic: "autonomic-neurocardiology",
    topicLabel: "Autonomic Neurocardiology",
    level: "post-medical",
    levelLabel: "Post-medical",
    question:
      "How can acute sympathetic surge after subarachnoid hemorrhage distort ECG interpretation without primary ischemic heart disease?",
  },
  {
    topic: "memory",
    topicLabel: "Memory Systems",
    level: "case-conference",
    levelLabel: "Case conference",
    question:
      "A patient recalls remote autobiographical details but cannot retain new episodes after a hypoxic event. Compare hippocampal indexing failure with frontal retrieval failure.",
  },
];

export const askAvailableTopics = askTopicOptions.map((topic) => topic.id);
export const askAvailableLevels = askLevelOptions.map((level) => level.id);
