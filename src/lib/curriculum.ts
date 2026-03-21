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
      "Recognize when motivation, salience, autonomic control, and body-space mapping require network rather than single-structure reasoning",
    ],
    advancedObjectives: [
      "Separate vascular-territory, visual-stream, loop, and brainstem long-tract explanations before naming a disease.",
      "Reject weaker competing localizations using exam asymmetry, cortical signs, negative findings, and network logic.",
      "Use anterior cingulate, insular, hypothalamic, and parietal-association findings to distinguish motivational arrest, autonomic salience syndromes, and spatial-attention failures from simpler relay lesions.",
    ],
    prerequisites: ["Basic neuroanatomy"],
    linkedModules: ["retina", "visual-field", "vision", "dopamine", "ecg", "stroke", "ask"],
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
      "Distinguish subthreshold reserve, recruitable output, and refractory-limited firing as different physiological regimes",
    ],
    advancedObjectives: [
      "Explain refractoriness as state-dependent channel availability rather than a memorized pause.",
      "Relate altered excitability to demyelination, sodium-channel block, and conduction failure.",
      "Use threshold slack, steady-state drive, and refractory occupancy to explain why two neurons with similar traces can still have different recruitment bottlenecks.",
    ],
    prerequisites: ["Basic action potential physiology"],
    linkedModules: ["action-potential", "plasticity", "eeg", "ecg", "ask"],
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
    slug: "neglect",
    title: "Neglect Localizer",
    trainingStage: "Consult-level spatial-attention localization",
    learningGoals: [
      "Separate hemispatial neglect from homonymous field loss and primary sensory deficits",
      "Recognize extinction, viewer-centered neglect, object-centered neglect, and motor-intentional bias as different failure modes",
      "Use cancellation, bisection, copying, and bilateral stimulation as localization tools",
    ],
    advancedObjectives: [
      "Localize neglect to right-lateralized attention networks before naming stroke, tumor, or degenerative etiologies.",
      "Explain why bilateral competition unmasks extinction better than single-item testing alone.",
      "Separate egocentric from allocentric neglect by asking whether errors track body-centered or object-centered coordinates.",
    ],
    prerequisites: ["Brain Atlas module", "Visual field logic"],
    linkedModules: ["visual-field", "vision", "brain-atlas", "stroke", "ask"],
    commonMisconceptions: [
      "Neglect is just a visual field cut with a different name.",
      "Any left-sided miss localizes to occipital cortex.",
      "A normal single-item confrontation test excludes neglect.",
    ],
  },
  {
    slug: "aphasia",
    title: "Aphasia Syndrome Localizer",
    trainingStage: "Consult-level dominant-hemisphere language localization",
    learningGoals: [
      "Separate fluent from nonfluent aphasia at the bedside",
      "Use comprehension, repetition, naming, reading, and writing to classify aphasia syndromes",
      "Map aphasia patterns onto dominant perisylvian, disconnection, and watershed language networks",
    ],
    advancedObjectives: [
      "Explain why repetition is the quickest bedside pivot between core perisylvian and transcortical aphasia patterns.",
      "Separate aphasia from dysarthria, delirium, and neglect-driven communication failure by checking meaning, grammar, and task dissociations.",
      "Use language profile splits to localize inferior frontal, posterior temporal, arcuate, and watershed lesions before naming etiology.",
    ],
    prerequisites: ["Brain Atlas module", "Stroke module"],
    linkedModules: ["brain-atlas", "stroke", "neglect", "ask"],
    commonMisconceptions: [
      "Fluent speech means preserved comprehension.",
      "Nonfluent speech always means dysarthria rather than aphasia.",
      "Naming failure alone is enough to classify the aphasia syndrome.",
    ],
  },
  {
    slug: "plasticity",
    title: "Synaptic Plasticity",
    trainingStage: "Mechanistic learning theory",
    learningGoals: [
      "Interpret timing-dependent changes in synaptic strength",
      "Relate timing rules to learning and maladaptation",
      "Distinguish strengthening, weakening, stability bias, and saturation as separate plasticity outcomes",
    ],
    advancedObjectives: [
      "Compare Hebbian potentiation, LTD, metaplasticity, and homeostatic scaling in one framework.",
      "Map plasticity rules onto addiction, chronic pain, recovery, and maladaptive network stabilization.",
      "Separate causal timing, amplitude asymmetry, and saturation pressure instead of collapsing them into one vague 'Hebbian' label.",
    ],
    prerequisites: ["Action potentials", "Synaptic transmission"],
    linkedModules: ["neuron", "dopamine", "ask"],
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
      "Understand reward prediction error across cue, reward, and omission conditions",
      "Connect dopamine-like signals to action selection, cue capture, and habit learning",
    ],
    advancedObjectives: [
      "Distinguish reward prediction error from hedonic tone, salience, and movement vigor.",
      "Compare canonical transfer, cue capture, blunted transfer, and brittle omission sensitivity without over-reading the model as a disease simulator.",
      "Relate reinforcement-learning abstractions to basal ganglia loops and movement-disorder phenomenology.",
    ],
    prerequisites: ["Basic reinforcement learning concepts"],
    linkedModules: ["plasticity", "brain-atlas", "ask"],
    commonMisconceptions: [
      "Dopamine only means pleasure.",
      "Prediction error and reward size are identical.",
      "A larger cue response proves a patient is feeling more pleasure rather than learning stronger prediction.",
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
    trainingStage: "Cross-module consult reasoning with explicit scoring",
    learningGoals: [
      "Practice verbal reasoning and explanation across the whole app",
      "Strengthen mechanism-based clinical thinking with explicit reversal logic",
      "See which reasoning step is strongest, weakest, and least certain after each tutor response",
    ],
    advancedObjectives: [
      "Move from bedside phenotype to syndrome, localization hierarchy, mechanism, competing alternative, and decisive next data without collapsing the steps.",
      "Practice case-conference style reasoning with explicit rejection of weaker alternatives and a concrete statement of what would change your mind.",
      "Use structured rubric scores, confidence grading, and missed-signal feedback to tighten the next iteration of the same question.",
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
      "Recognize how theta state, sampling quality, and field sharpness change the usefulness of a spatial code",
    ],
    advancedObjectives: [
      "Explain how path integration, theta timing, and entorhinal coding interact rather than treating grid fields as static pictures.",
      "Connect entorhinal dysfunction to memory, navigation failure, and medial temporal network breakdown.",
      "Separate a degraded lattice from degraded exploration by comparing turn noise, coverage, boundary bias, and field contrast.",
    ],
    prerequisites: ["Basic spatial navigation concepts"],
    linkedModules: ["brain-atlas", "sleep", "ask"],
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
    slug: "gait",
    title: "Gait Pattern Localizer",
    trainingStage: "Bedside gait localization",
    learningGoals: [
      "Recognize parkinsonian, cerebellar, sensory, hemiparetic, and frontal gait phenotypes",
      "Use step geometry, turning burden, and cue response to rank localization",
      "Connect gait pattern to motor, sensory, basal ganglia, cerebellar, and frontal networks",
    ],
    advancedObjectives: [
      "Separate gait-scaling failure from weakness, balance calibration failure, and proprioceptive dependence.",
      "Explain why turning, dual-tasking, and eye closure are high-yield stress tests rather than generic add-ons.",
      "Use associated bedside findings such as arm swing, Romberg, pyramidal signs, or frontal release features to re-rank the gait differential quickly.",
    ],
    prerequisites: ["Motor Pathway module", "Brain Atlas module"],
    linkedModules: ["motor-pathway", "brain-atlas", "stroke", "dopamine", "ask"],
    commonMisconceptions: [
      "All shuffling gait is Parkinson disease.",
      "Wide-based gait always means cerebellum.",
      "If leg strength is full seated, gait cannot localize to the brain.",
    ],
  },
  {
    slug: "vertigo",
    title: "Vertigo & Vestibular Localizer",
    trainingStage: "Bedside vestibular localization",
    learningGoals: [
      "Separate continuous acute vestibular syndrome from brief triggered positional vertigo and recurrent episodic vestibular syndromes",
      "Use timing, triggers, hearing clues, gait burden, and eye-movement findings to rank peripheral versus central localization",
      "Know when HINTS is appropriate and when Dix-Hallpike or cochlear history is the higher-yield discriminator",
    ],
    advancedObjectives: [
      "Explain why a normal head impulse in acute continuous vertigo can be more dangerous than an abnormal one.",
      "Use nystagmus direction, skew deviation, truncal ataxia, and hearing involvement to separate labyrinth, vestibular-nerve, brainstem-cerebellar, and multisensory network syndromes.",
      "Teach students to localize vertigo from time course and trigger structure before they anchor on disease labels.",
    ],
    prerequisites: ["Cranial Nerves module", "Stroke module"],
    linkedModules: ["cranial-nerves", "stroke", "gait", "brain-atlas", "ask"],
    commonMisconceptions: [
      "All vertigo is either BPPV or anxiety.",
      "HINTS should be applied to every dizzy patient regardless of timing pattern.",
      "Hearing symptoms are secondary details rather than major localization clues.",
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
  {
    slug: "cranial-nerves",
    title: "Cranial Nerves Explorer",
    trainingStage: "Clinical neurological examination",
    learningGoals: [
      "Systematically examine all 12 cranial nerves at the bedside",
      "Distinguish peripheral from central lesion patterns for each nerve",
      "Recognize brainstem syndromes by their cranial nerve combinations",
    ],
    advancedObjectives: [
      "Use the specific CN involved to identify the brainstem level (III = midbrain, VI/VII = pons, IX/X/XII = medulla).",
      "Differentiate pupil-involving from pupil-sparing CN III palsy and the emergency implications.",
      "Apply the HINTS exam in acute vertigo to distinguish peripheral from central vestibular syndromes.",
    ],
    prerequisites: ["Basic neuroanatomy", "Brain Atlas module"],
    linkedModules: ["brain-atlas", "motor-pathway", "stroke", "visual-field", "ask"],
    commonMisconceptions: [
      "Bell's palsy always means stroke — check the forehead first.",
      "CN VI palsy always localizes to the pons — it can be a false localizing sign from raised ICP.",
      "The gag reflex is reliable — it is absent in ~20% of normal adults.",
    ],
  },
  {
    slug: "stroke",
    title: "Stroke Vascular Territories",
    trainingStage: "Acute neurovascular localization",
    learningGoals: [
      "Map stroke symptoms to specific arterial territories",
      "Distinguish anterior from posterior circulation syndromes",
      "Recognize stroke mimics and the importance of time-to-treatment",
    ],
    advancedObjectives: [
      "Use the presence or absence of cortical signs to differentiate cortical from subcortical (lacunar) stroke.",
      "Identify large vessel occlusion patterns amenable to thrombectomy.",
      "Recognize posterior circulation stroke presentations that are commonly missed (PCA hemianopia, Wallenberg, locked-in).",
    ],
    prerequisites: ["Brain Atlas module", "Motor Pathway module", "Cranial Nerves module"],
    linkedModules: ["brain-atlas", "motor-pathway", "cranial-nerves", "visual-field", "ecg", "ask"],
    commonMisconceptions: [
      "All strokes cause weakness — PCA strokes often present with isolated visual field loss.",
      "Lacunar strokes are always benign — they can cause dense hemiplegia.",
      "Posterior circulation strokes are rare — they account for ~20% of all ischemic strokes.",
    ],
  },
  {
    slug: "dermatome",
    title: "Dermatome & Sensory Pathways",
    trainingStage: "Sensory system localization",
    learningGoals: [
      "Distinguish dorsal column from spinothalamic tract dysfunction at the bedside",
      "Map sensory patterns to anatomical lesion levels (peripheral nerve, root, cord, brainstem, thalamus, cortex)",
      "Perform and interpret Romberg test, dermatomal mapping, and cortical sensory testing",
    ],
    advancedObjectives: [
      "Explain why Brown-Séquard produces ipsilateral proprioception loss but contralateral pain/temperature loss using tract crossing anatomy.",
      "Differentiate sensory ataxia (positive Romberg) from cerebellar ataxia (Romberg-independent).",
      "Recognize cortical sensory loss (astereognosis, agraphesthesia) as distinct from peripheral or spinal patterns.",
    ],
    prerequisites: ["Motor Pathway module", "Brain Atlas module"],
    linkedModules: ["motor-pathway", "brain-atlas", "cranial-nerves", "stroke", "action-potential", "ask"],
    commonMisconceptions: [
      "Numbness always means a peripheral nerve problem — spinal, brainstem, thalamic, and cortical lesions all cause numbness.",
      "The Romberg test detects cerebellar disease — it detects proprioceptive loss.",
      "Dissociated sensory loss is rare — it is common and highly localizing (cord, brainstem).",
    ],
  },
];

export function getCurriculumModule(slug: string) {
  return curriculumModules.find((module) => module.slug === slug);
}
