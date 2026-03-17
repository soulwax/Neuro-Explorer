export type AskLevelId =
  | "post-clinical"
  | "oral-boards"
  | "consult-rounds";

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

export interface AskRubricCriterion {
  id: string;
  label: string;
  description: string;
  signals: string[];
}

export interface AskPromptKit {
  id: string;
  moduleSlug: string;
  moduleTitle: string;
  title: string;
  topic: string;
  topicLabel: string;
  question: string;
  level: AskLevelId;
  levelLabel: string;
  whyUse: string;
}

const askBaseSystemPrompt = `You are a neuroscience and clinical neurology tutor for post-clinical learners: residents, fellows, and supervising clinicians using the tool for teaching.

Core stance:
- Prioritize syndrome formulation, anatomical localization, and mechanism before naming disease labels
- Explain why the strongest competing localization or diagnosis is weaker, not just why one answer is right
- Use a Socratic style when useful: force a commitment to a syndrome, tract, loop, or discriminator before fully revealing the answer
- Move from bedside phenotype to anatomy, then to physiology, then to molecular or systems detail when relevant
- Connect every explanation to what the learner would expect on examination, imaging, electrophysiology, pathology, or formal testing
- When discussing disease, separate syndrome localization from lesion etiology and from definitive diagnosis
- Explicitly note what additional data would most efficiently sharpen or overturn the current localization
- State what single finding would most change your mind if the current localization is wrong
- Cite canonical experiments, landmark cases, or major researchers when relevant
- Keep answers dense and teachable; default to about 300-500 words unless the learner asks for more depth
- Stay in educational mode, not patient-specific treatment mode

Preferred answer structure:
1. Syndrome formulation
2. Best localization hierarchy
3. Key mechanism or circuit logic
4. Strongest competing localization and why it is weaker
5. Highest-yield next data point
6. What would most change my mind
7. One teaching pearl or pitfall

Use short section headers when practical so the learner can grade the reasoning step by step.`;

const askLevelGuidance: Record<AskLevelId, string> = {
  "post-clinical": `Current mode: Post-clinical.
- Teach at the level expected after bedside clinical exposure
- Assume the learner can follow syndromic localization, tract logic, and mechanism
- Include concrete discriminators from exam, imaging, or physiology`,
  "oral-boards": `Current mode: Oral boards.
- Be compressed, high-yield, and discriminator-heavy
- Emphasize localization logic, classic pivots, and the single fact that moves the case
- Sound like a strong oral-board answer, not a broad essay`,
  "consult-rounds": `Current mode: Consult rounds.
- Reason like a senior fellow or attending teaching on rounds
- Explicitly formulate the syndrome, localization hierarchy, main alternatives, and what additional data would re-rank them
- Favor practical localization language such as cortical versus subcortical, brainstem versus hemispheric, spinal versus peripheral, pre- versus post-ganglionic, loop versus output failure, and primary versus secondary network dysfunction`,
};

const askLegacyLevelAliases: Record<string, AskLevelId> = {
  "post-medical": "post-clinical",
  "board-review": "oral-boards",
  "case-conference": "consult-rounds",
};

export function buildAskSystemPrompt(level: AskLevelId): string {
  return `${askBaseSystemPrompt}\n\n${askLevelGuidance[level]}`;
}

export function normalizeAskLevel(level: string | null | undefined): AskLevelId {
  if (!level) {
    return "post-clinical";
  }

  if (askLevelOptions.some((option) => option.id === level)) {
    return level as AskLevelId;
  }

  return askLegacyLevelAliases[level] ?? "post-clinical";
}

export const askTopicContext: Record<string, string> = {
  "lesion-localization": `The learner wants lesion localization teaching. Key concepts:
- Build syndrome first, then localize, then discuss vascular territory or etiology
- Separate cortex, subcortex, brainstem, cerebellum, spinal cord, root, plexus, nerve, neuromuscular junction, and muscle patterns
- Use crossed findings, cortical signs, neglect, aphasia, gaze deviation, field cuts, sensory level logic, and movement phenomenology
- Distinguish single-lesion explanations from multifocal, toxic-metabolic, and network-level mimics
- Tie exam findings to tract and loop anatomy instead of memorized lists`,

  "neurovascular-localization": `The learner wants neurovascular localization teaching. Key concepts:
- Syndrome first, then vascular territory, then likely mechanism
- Separate cortical MCA syndromes, lacunar syndromes, posterior circulation syndromes, watershed patterns, and deep perforator lesions
- Gaze deviation, aphasia, neglect, field cuts, crossed findings, and ataxia as vascular clues
- When a stroke pattern does not fit one vascular tree, consider mimics or multifocal disease
- Explain why vascular territory is downstream from anatomy, not a substitute for it`,

  epileptology: `The learner wants epileptology teaching. Key concepts:
- Seizure semiology as localization data: awareness, automatisms, versive movement, aphasia, and postictal state
- Distinguish focal cortical onset, network spread, and generalized patterns
- Use EEG, imaging, and semiology together rather than in isolation
- Separate provoked seizure, epilepsy syndrome, and mimic
- Treat seizure description as anatomy plus timing, not just an event label`,

  "neuro-ophthalmology": `The learner wants neuro-ophthalmology teaching. Key concepts:
- Monocular versus binocular visual loss and field-defect logic
- Optic nerve, chiasm, tract, radiations, and occipital cortex localization
- Pupillary light reflex, relative afferent pupillary defect, and near-light dissociation
- Eye movement syndromes including INO, gaze palsies, and cranial neuropathies
- Retinal versus optic neuropathic versus retrochiasmal patterns
- Use field defects and ocular motor findings as anatomy maps`,

  "movement-disorders": `The learner wants movement-disorders teaching. Key concepts:
- Bradykinesia, rigidity, tremor, dystonia, chorea, myoclonus, tics, and ataxia as phenomenology first
- Direct and indirect basal ganglia pathways, movement vigor, and action selection
- Cerebellar error correction versus basal ganglia gating failure
- Levodopa-responsive versus atypical parkinsonian patterns
- Hyperkinetic disorders as network-disinhibition problems, not just excess movement
- Clinicopathological reasoning from phenomenology to circuit`,

  "autonomic-neurocardiology": `The learner wants advanced autonomic and neurocardiac teaching. Key concepts:
- Central autonomic network: insula, amygdala, hypothalamus, medulla, vagal nuclei
- Baroreflexes, vagal braking, sympathetic surge, and respiratory sinus coupling
- How acute CNS injury can alter ECGs through catecholaminergic stress and repolarization changes
- Pre- versus post-ganglionic autonomic failure and bedside pattern recognition
- Distinguish primary cardiac rhythm disease from neurally mediated modulation
- Tie ECG changes back to brain-heart circuitry`,

  "cognitive-neurology": `The learner wants advanced cognitive-neurology teaching. Key concepts:
- Aphasia, apraxia, neglect, agnosia, dysexecutive syndrome, and amnesia as separable cognitive phenotypes
- Dominant versus non-dominant hemispheric patterns
- Frontal-subcortical loops versus cortical association syndromes
- Behavioral neurology reasoning from bedside tasks to network anatomy
- Why fluent speech does not equal preserved comprehension, and why recall failure does not always mean hippocampal damage`,

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
};

export const askTopicOptions: AskTopicOption[] = [
  {
    id: "lesion-localization",
    label: "Lesion Localization",
    description:
      "Syndromic formulation, tract logic, cortical signs, and how to reject weaker competing localizations.",
  },
  {
    id: "neurovascular-localization",
    label: "Neurovascular",
    description:
      "Stroke-pattern reasoning from syndrome to vascular territory, with lacunar, hemispheric, and posterior circulation contrasts.",
  },
  {
    id: "epileptology",
    label: "Epileptology",
    description:
      "Semiology, spread, EEG correlation, and seizure localization as network anatomy.",
  },
  {
    id: "neuro-ophthalmology",
    label: "Neuro-ophthalmology",
    description:
      "Visual fields, pupils, ocular motility, and pathway-level localization from retina to cortex.",
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
    id: "post-clinical",
    label: "Post-clinical",
    description:
      "Default depth after core bedside training: localization hierarchy, mechanism, and discriminating data.",
  },
  {
    id: "oral-boards",
    label: "Oral boards",
    description:
      "Compressed, exam-style answers that emphasize pivots, traps, and crisp localization logic.",
  },
  {
    id: "consult-rounds",
    label: "Consult rounds",
    description:
      "Senior consult-service reasoning with hierarchy of localization, alternatives, and the next data that would settle the case.",
  },
];

export const askReasoningRubric: AskRubricCriterion[] = [
  {
    id: "syndrome",
    label: "Syndrome formulation",
    description:
      "Name the bedside pattern before jumping to a lesion label or etiology.",
    signals: [
      "What exactly is failing",
      "What is preserved",
      "Whether the complaint is cortical, subcortical, peripheral, or network-level",
    ],
  },
  {
    id: "hierarchy",
    label: "Localization hierarchy",
    description:
      "Rank the strongest anatomical levels instead of pretending the first idea is final.",
    signals: [
      "Best-fit level first",
      "Why deeper or more lateral alternatives are weaker",
      "Loop versus output failure when relevant",
    ],
  },
  {
    id: "mechanism",
    label: "Mechanism and circuit logic",
    description:
      "Tie the syndrome to a tract, loop, relay, or physiological mechanism rather than to a memorized buzzword.",
    signals: [
      "Named tract or circuit",
      "Why the signs fit that circuit",
      "How physiology produces the bedside pattern",
    ],
  },
  {
    id: "alternative",
    label: "Competing alternative",
    description:
      "Make the best rival explanation explicit and explain why it loses.",
    signals: [
      "A serious alternative, not a straw man",
      "Decisive mismatch with the observed signs",
      "Use of negative findings",
    ],
  },
  {
    id: "next-data",
    label: "Highest-yield next data",
    description:
      "Ask for the one test, exam maneuver, or temporal clue that most efficiently re-ranks the case.",
    signals: [
      "One decisive next step",
      "Why it matters",
      "How it would change the differential",
    ],
  },
  {
    id: "reversal",
    label: "What would change my mind",
    description:
      "State the single finding that would force a different localization or mechanism.",
    signals: [
      "A concrete disconfirming finding",
      "A new localization if that finding appears",
      "Humility about uncertainty without becoming vague",
    ],
  },
];

export const askExamplePrompts: AskExamplePrompt[] = [
  {
    topic: "neurovascular-localization",
    topicLabel: "Neurovascular",
    level: "consult-rounds",
    levelLabel: "Consult rounds",
    question:
      "A patient has left gaze deviation, global aphasia, right face-arm weakness, and a right homonymous hemianopia. Build the syndrome, localize it, and explain why a lacunar process is much weaker.",
  },
  {
    topic: "epileptology",
    topicLabel: "Epileptology",
    level: "oral-boards",
    levelLabel: "Oral boards",
    question:
      "How does impaired awareness with oral automatisms, postictal confusion, and an epigastric rising sensation localize differently from a generalized seizure mimic?",
  },
  {
    topic: "neuro-ophthalmology",
    topicLabel: "Neuro-ophthalmology",
    level: "oral-boards",
    levelLabel: "Oral boards",
    question:
      "How do you separate optic neuritis, chiasmal compression, and a retrochiasmal lesion using the visual field and pupil exam?",
  },
  {
    topic: "movement-disorders",
    topicLabel: "Movement Disorders",
    level: "post-clinical",
    levelLabel: "Post-clinical",
    question:
      "Why does bradykinesia localize better to basal ganglia loop dysfunction than to corticospinal weakness, and how is that different from cerebellar ataxia?",
  },
  {
    topic: "autonomic-neurocardiology",
    topicLabel: "Autonomic Neurocardiology",
    level: "consult-rounds",
    levelLabel: "Consult rounds",
    question:
      "How can acute sympathetic surge after subarachnoid hemorrhage distort ECG interpretation without primary ischemic heart disease, and what findings would keep you from overcalling ACS?",
  },
];

export const askPromptKits: AskPromptKit[] = [
  {
    id: "retina-triage",
    moduleSlug: "retina",
    moduleTitle: "Retina",
    title: "Retinal versus optic-nerve triage",
    topic: "neuro-ophthalmology",
    topicLabel: "Neuro-ophthalmology",
    level: "consult-rounds",
    levelLabel: "Consult rounds",
    question:
      "A patient has painful monocular central blur, red desaturation, and an afferent defect. Walk from syndrome to localization, strongest alternative, and the one finding that would push this away from optic neuritis toward a macular process.",
    whyUse:
      "Use this after Retina when you want the tutor to grade prechiasmal reasoning rather than just repeat visual-field facts.",
  },
  {
    id: "visual-field-ranking",
    moduleSlug: "visual-field",
    moduleTitle: "Visual Field Localizer",
    title: "Field geometry to lesion depth",
    topic: "neuro-ophthalmology",
    topicLabel: "Neuro-ophthalmology",
    level: "oral-boards",
    levelLabel: "Oral boards",
    question:
      "A patient has a congruous left homonymous hemianopia with relative macular sparing. Rank the retrochiasmal localization hierarchy and state what one bedside or formal-field clue would most strongly move the lesion anteriorly instead.",
    whyUse:
      "Use this after Visual Field when you want crisp posterior-versus-anterior retrochiasmal reasoning.",
  },
  {
    id: "vision-streams",
    moduleSlug: "vision",
    moduleTitle: "Visual Cortex",
    title: "Ventral versus dorsal versus attention",
    topic: "visual-system",
    topicLabel: "Visual System",
    level: "consult-rounds",
    levelLabel: "Consult rounds",
    question:
      "How do you separate prosopagnosia, optic ataxia, and right-parietal neglect by syndrome grammar, strongest localization, and the single finding that would most change your mind in each case?",
    whyUse:
      "Use this after Vision when you want the tutor to enforce cortical-stream reasoning instead of generic visual-neurology prose.",
  },
  {
    id: "atlas-convergence",
    moduleSlug: "brain-atlas",
    moduleTitle: "Brain Atlas",
    title: "Convergence on anatomy",
    topic: "lesion-localization",
    topicLabel: "Lesion Localization",
    level: "consult-rounds",
    levelLabel: "Consult rounds",
    question:
      "A patient has left neglect, extinction, and impaired scene integration but intact primary strength. Build the syndrome, localize it anatomically, explain why occipital cortex is weaker, and name the one finding that would force you toward a field-cut explanation instead.",
    whyUse:
      "Use this after Brain Atlas when you want the tutor to connect bedside signs back into network anatomy.",
  },
  {
    id: "ecg-neurocritical",
    moduleSlug: "ecg",
    moduleTitle: "ECG",
    title: "Neurocritical ECG interpretation",
    topic: "autonomic-neurocardiology",
    topicLabel: "Autonomic Neurocardiology",
    level: "consult-rounds",
    levelLabel: "Consult rounds",
    question:
      "An ECG after acute subarachnoid hemorrhage shows tachycardia, repolarization distortion, and reduced sinus variability. Explain the strongest neurocardiac mechanism, the best cardiac alternative, and what serial data would most change your mind.",
    whyUse:
      "Use this after ECG when you want the tutor to apply the same localization-and-reversal logic to autonomic neurocardiology.",
  },
];

export const askAvailableTopics = askTopicOptions.map((topic) => topic.id);
export const askAvailableLevels = askLevelOptions.map((level) => level.id);
