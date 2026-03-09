import type { BrainAtlasLocalizationCase } from "~/core/cases";

export const brainAtlasCases: BrainAtlasLocalizationCase[] = [
  {
    id: "dysexecutive-syndrome",
    title: "Planning failure after frontal injury",
    oneLiner:
      "A patient can speak and move but cannot organize multi-step tasks or suppress impulsive responses.",
    chiefComplaint:
      "Family reports severe disorganization and poor judgment after a head injury.",
    history:
      "The patient forgets goals halfway through tasks, perseverates on the wrong rule, and becomes impulsive when asked to switch plans.",
    examFindings: [
      "Poor set shifting on executive testing",
      "Marked distractibility with intact primary strength and sensation",
      "Behavioral disinhibition without aphasia or cerebellar ataxia",
    ],
    prompt:
      "Which region is the best localization target for this syndrome, and why does that region fit better than a purely motor or sensory explanation?",
    hints: [
      "Look for the region that keeps goals online and suppresses distractions.",
      "The patient has a control problem, not a weakness problem.",
    ],
    localizationCues: [
      "The dominant deficit is failure of task set maintenance and inhibition.",
      "Primary cortical outputs are largely preserved, so the problem lies upstream of execution.",
    ],
    differentialTraps: [
      "Do not mislabel slowed or chaotic behavior as primary motor weakness.",
      "Poor recall during distracted testing can be secondary to executive failure rather than pure hippocampal amnesia.",
    ],
    teachingPoints: [
      "Executive dysfunction points more strongly to prefrontal systems than to primary motor or sensory cortex.",
      "Dysexecutive syndromes often reflect disrupted top-down control over action selection, memory, and attention.",
    ],
    followUpModules: ["neuron", "dopamine", "ask"],
    expectedRegionId: "prefrontal",
    startingRegionId: "motor",
  },
  {
    id: "anterograde-amnesia",
    title: "Cannot form new episodic memories",
    oneLiner:
      "A patient repeats the same questions and cannot retain new events after a hypoxic injury.",
    chiefComplaint:
      "The patient asks where they are every few minutes despite repeated explanations.",
    history:
      "Remote memories are relatively intact, language is fluent, and attention is adequate during conversation, but new experiences are not being stored.",
    examFindings: [
      "Severe anterograde memory deficit",
      "Preserved basic language and motor function",
      "Spatial disorientation in unfamiliar settings",
    ],
    prompt:
      "Which structure best explains this pattern, and why is it stronger than a pure frontal or thalamic explanation?",
    hints: [
      "The key deficit is binding new events into context-rich memory.",
      "Think medial temporal memory circuitry.",
    ],
    localizationCues: [
      "Immediate interaction and language are intact, but new episodic traces fail to persist.",
      "Spatial disorientation and repeated questioning point toward hippocampal indexing failure.",
    ],
    differentialTraps: [
      "Frontal retrieval failure usually produces poor strategy and cue dependence rather than profound inability to encode new episodes.",
      "Global confusion or delirium would degrade attention and broad cognition, not just new episodic storage.",
    ],
    teachingPoints: [
      "Anterograde amnesia is classically associated with hippocampal injury.",
      "The hippocampus links what happened, where it happened, and when it happened into episodic traces.",
    ],
    followUpModules: ["grid-cell", "ask", "brain-atlas"],
    expectedRegionId: "hippocampus",
    startingRegionId: "thalamus",
  },
  {
    id: "parkinsonian-bradykinesia",
    title: "Slow movement with reduced spontaneity",
    oneLiner:
      "A patient has reduced movement vigor, difficulty initiating gait, and a mask-like facial expression.",
    chiefComplaint: "Movement feels effortful and slow despite preserved comprehension.",
    history:
      "The patient can generate movement when strongly cued, but self-initiated movement is reduced and gait initiation is hesitant.",
    examFindings: [
      "Bradykinesia with reduced spontaneous gesture",
      "Difficulty initiating voluntary movement",
      "No primary sensory loss or aphasia",
    ],
    prompt:
      "Which region best fits the action-selection failure here, and what loop makes it especially relevant?",
    hints: [
      "This is about gating and movement vigor more than muscle execution itself.",
      "Think cortex-thalamus-subcortex loops.",
    ],
    localizationCues: [
      "Cueing helps, which argues for impaired internally generated action selection rather than loss of corticospinal output.",
      "Reduced spontaneous movement and gait initiation implicate movement scaling and release, not just strength.",
    ],
    differentialTraps: [
      "Do not confuse bradykinesia with cerebellar incoordination or pyramidal weakness.",
      "Aphasia or neglect would suggest hemispheric cortical syndromes, not a classic basal ganglia loop pattern.",
    ],
    teachingPoints: [
      "Basal ganglia dysfunction often impairs initiation and scaling of movement rather than raw corticospinal output.",
      "Movement disorders are usually loop disorders, not isolated one-way pathway failures.",
    ],
    followUpModules: ["dopamine", "plasticity", "ask"],
    expectedRegionId: "basalGanglia",
    startingRegionId: "motor",
  },
  {
    id: "cerebellar-ataxia",
    title: "Overshoot and poor correction",
    oneLiner:
      "A patient reaches past the target and cannot smoothly correct the movement trajectory.",
    chiefComplaint: "The hand wobbles and overshoots during goal-directed movement.",
    history:
      "There is no major weakness, but timing and coordination collapse during fast or precise actions.",
    examFindings: [
      "Dysmetria on finger-nose testing",
      "Poor rapid alternating movements",
      "Broad-based unsteady gait",
    ],
    prompt:
      "Which region best localizes this error-correction problem, and what makes it different from motor cortex weakness?",
    hints: [
      "The patient can generate force but cannot calibrate timing.",
      "Think prediction and correction, not command generation.",
    ],
    localizationCues: [
      "The movement exists but the error signal is poorly corrected in flight.",
      "Rapid alternating movement failure points to timing and coordination circuitry.",
    ],
    differentialTraps: [
      "Sensory ataxia should worsen strongly when proprioceptive feedback is removed, whereas cerebellar dysmetria persists during visually guided tasks.",
      "Pure pyramidal weakness does not explain decomposition and overshoot.",
    ],
    teachingPoints: [
      "Cerebellar lesions often impair timing, coordination, and error correction rather than movement initiation.",
      "Ataxia is often a prediction problem: intended movement and actual movement stop matching.",
    ],
    followUpModules: ["neuron", "plasticity", "ask"],
    expectedRegionId: "cerebellum",
    startingRegionId: "motor",
  },
  {
    id: "prosopagnosia-pattern",
    title: "Faces feel unfamiliar despite intact vision",
    oneLiner:
      "A patient can describe a face and read words but cannot identify familiar people by sight alone.",
    chiefComplaint:
      "The patient recognizes voices immediately yet fails to identify close relatives when only shown their faces.",
    history:
      "Basic acuity is intact, object copying is adequate, and conversation is fluent, but visual identity judgments for faces are profoundly impaired.",
    examFindings: [
      "Intact primary visual function",
      "Failure to recognize familiar faces from photographs",
      "Recognition improves when voice or biographical context is provided",
    ],
    prompt:
      "Which region best fits this perceptual-semantic dissociation, and why is it better than an optic nerve or primary visual cortex explanation?",
    hints: [
      "Vision reaches the patient, but high-level identity extraction fails.",
      "Think ventral stream object-recognition systems rather than low-level visual input.",
    ],
    localizationCues: [
      "Primary visual intake is preserved, so the deficit lies beyond early retinal and occipital encoding.",
      "A category-specific recognition failure points toward higher-order temporal object representations.",
    ],
    differentialTraps: [
      "Optic neuropathy would degrade acuity, contrast, or color rather than selectively impair face identity.",
      "Primary visual cortex lesions give field defects or cortical blindness, not isolated face-recognition failure.",
    ],
    teachingPoints: [
      "Temporal ventral-stream dysfunction can dissociate perception from semantic identity despite intact low-level vision.",
      "Category-selective recognition syndromes are powerful reminders that localization often depends on what is spared as much as on what is lost.",
    ],
    followUpModules: ["vision", "brain-atlas", "ask"],
    expectedRegionId: "temporal",
    startingRegionId: "occipital",
  },
  {
    id: "thalamic-integration",
    title: "Arousal and sensory integration begin to unravel",
    oneLiner:
      "A patient is drowsy, inconsistently attentive, and reports distorted body sensation after a deep lesion.",
    chiefComplaint:
      "The patient is awake only briefly, struggles to sustain attention, and cannot reliably describe somatic stimuli.",
    history:
      "Motor output is present, language is limited by fluctuating arousal rather than aphasia, and the family reports abrupt onset after a vascular event.",
    examFindings: [
      "Fluctuating alertness",
      "Patchy contralateral sensory abnormalities with poor reliability",
      "No clear cerebellar dysmetria or primary cortical language syndrome",
    ],
    prompt:
      "Which structure best accounts for the combination of alertness instability and multimodal sensory disruption, and why is it stronger than a pure cortical explanation?",
    hints: [
      "Look for a hub that gates information flow, not just a terminal sensory map.",
      "One lesion is disturbing both state regulation and distributed relay function.",
    ],
    localizationCues: [
      "Arousal regulation and sensory relay are both disturbed in the same syndrome.",
      "The pattern behaves like a hub lesion rather than a deficit confined to one cortical modality map.",
    ],
    differentialTraps: [
      "Primary somatosensory cortex lesions should not by themselves cause striking fluctuations in wakefulness.",
      "Diffuse metabolic encephalopathy would usually produce a more global and symmetric cognitive collapse.",
    ],
    teachingPoints: [
      "The thalamus is not just a relay; it helps stabilize cortical state, attention, and multimodal information flow.",
      "Deep lesions can produce mixed arousal and sensory syndromes that are easy to misclassify as broad cortical failure.",
    ],
    followUpModules: ["brain-atlas", "vision", "ask"],
    expectedRegionId: "thalamus",
    startingRegionId: "somatosensory",
  },
];
