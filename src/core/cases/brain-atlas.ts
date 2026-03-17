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
    syndromeFrame:
      "A frontal executive syndrome with impaired set maintenance, inhibitory control, and behavioral regulation, but without a primary aphasic, pyramidal, or cerebellar pattern.",
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
    nextDataRequests: [
      "Formal set-shifting or Stroop-style testing to show impaired top-down control.",
      "A careful language screen to exclude aphasia masquerading as disorganization.",
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
    id: "abulia-medial-frontal",
    title: "Alert but barely self-initiating after an ACA-pattern stroke",
    oneLiner:
      "A patient is awake and can move on command, yet almost never initiates speech, movement, or goal-directed behavior without repeated prompting.",
    chiefComplaint:
      "Family says the patient seems present but does not start conversations, meals, or movement unless someone pushes every step.",
    history:
      "Strength is largely preserved when the examiner insists, but spontaneous output is sparse. Affect is flat, responses are delayed, and the team worries about depression or aphasia.",
    syndromeFrame:
      "This is a medial frontal motivational-initiation syndrome. The key question is not whether the patient can move, but whether the circuitry that converts intention into self-generated behavior is failing.",
    examFindings: [
      "Marked reduction in spontaneous speech and movement",
      "Can generate near-full effort when strongly cued",
      "Flat affect with long response latency but without dense aphasia",
    ],
    prompt:
      "Which region best explains profound loss of self-initiation despite preserved raw strength, and why is that stronger than a pure prefrontal or corticospinal label?",
    hints: [
      "Prompted movement is stronger than self-generated movement.",
      "Think motivational drive and conflict-to-action conversion, not output weakness.",
    ],
    localizationCues: [
      "The patient can act, but the internal launch signal is weak.",
      "Spontaneous behavior collapses out of proportion to measured pyramidal strength.",
    ],
    differentialTraps: [
      "Do not call every low-output state depression without checking cued performance and neurological onset.",
      "Aphasia changes language content and form; abulia changes whether behavior is initiated at all.",
    ],
    nextDataRequests: [
      "Compare spontaneous versus externally cued speech and movement.",
      "Review medial frontal and ACA-territory imaging rather than stopping at a generic frontal label.",
    ],
    teachingPoints: [
      "Abulia often points to anterior cingulate and medial frontal circuitry more strongly than to primary motor cortex.",
      "Initiation failure is not the same thing as weakness; the patient may be able to perform when the loop is externally driven.",
    ],
    followUpModules: ["stroke", "dopamine", "ask"],
    expectedRegionId: "anteriorCingulate",
    startingRegionId: "prefrontal",
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
    syndromeFrame:
      "A dense episodic encoding syndrome with preserved language and conversation, pointing toward medial temporal memory circuitry rather than a broad attentional or aphasic disorder.",
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
    nextDataRequests: [
      "Delayed recall with cueing to separate encoding failure from retrieval failure.",
      "MRI review for medial temporal vulnerability after hypoxic injury.",
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
    syndromeFrame:
      "A hypokinetic movement syndrome centered on impaired action selection and movement scaling, not a corticospinal weakness pattern.",
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
    nextDataRequests: [
      "Look for decrement, reduced amplitude, and asymmetry on repetitive motor tasks.",
      "Compare gait initiation and spontaneous movement with externally cued movement.",
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
    syndromeFrame:
      "A cerebellar coordination syndrome with impaired error correction, dysmetria, and timing failure rather than a primary force-generation problem.",
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
    nextDataRequests: [
      "Compare performance with eyes open and closed to separate sensory from cerebellar ataxia.",
      "Check for speech and ocular motor cerebellar signs that support a broader coordination syndrome.",
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
    syndromeFrame:
      "A high-order ventral-stream recognition syndrome with preserved visual intake but impaired mapping of complex visual forms onto identity.",
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
    nextDataRequests: [
      "Test recognition across faces, objects, and words to define the category-selective pattern.",
      "Review ventral temporal imaging rather than stopping at basic acuity and field testing.",
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
    syndromeFrame:
      "A thalamic hub syndrome combining unstable arousal with unreliable sensory integration, which is harder to explain by a single cortical map lesion.",
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
    nextDataRequests: [
      "Deep imaging review for paramedian or relay-nucleus involvement.",
      "Repeated bedside attention testing to show state fluctuation rather than a fixed cortical deficit.",
    ],
    teachingPoints: [
      "The thalamus is not just a relay; it helps stabilize cortical state, attention, and multimodal information flow.",
      "Deep lesions can produce mixed arousal and sensory syndromes that are easy to misclassify as broad cortical failure.",
    ],
    followUpModules: ["brain-atlas", "vision", "ask"],
    expectedRegionId: "thalamus",
    startingRegionId: "somatosensory",
  },
  {
    id: "insula-autonomic-lability",
    title: "Visceral alarm and autonomic swings after a right hemispheric event",
    oneLiner:
      "A patient with an acute right-sided cortical stroke has nausea, palpitations, blood-pressure lability, and a striking sense that the body feels wrong.",
    chiefComplaint:
      "The patient keeps describing an internal sense of alarm and bodily discomfort even when the motor exam changes little.",
    history:
      "Telemetry shows intermittent autonomic variability, there is no prior arrhythmia history, and the neurological syndrome feels more visceral and salience-heavy than a pure motor-sensory stroke.",
    syndromeFrame:
      "This is an interoceptive-autonomic salience syndrome. The localization question is which cortical hub best links body-state awareness to autonomic output and urgency.",
    examFindings: [
      "Nausea with fluctuating heart rate and blood pressure",
      "Altered awareness of internal bodily state",
      "Subtle attentional or salience-shifting abnormality without a pure brainstem pattern",
    ],
    prompt:
      "Which region best explains paired visceral-autonomic disturbance and salience shift, and why is it stronger than an amygdala-only or brainstem-only explanation?",
    hints: [
      "The lesion has cortical flavor, but the symptoms are bodily and urgent.",
      "Think interoception plus autonomic regulation in one region.",
    ],
    localizationCues: [
      "Internal body-state misreading and autonomic lability travel together.",
      "The syndrome feels like salience circuitry has been distorted, not just a relay tract interrupted.",
    ],
    differentialTraps: [
      "Do not reduce this to anxiety or a primary cardiac problem before explaining the acute neurological context.",
      "Pure brainstem autonomic syndromes usually bring denser cranial or long-tract findings than this case does.",
    ],
    nextDataRequests: [
      "Correlate telemetry and blood-pressure swings with lesion imaging.",
      "Ask explicitly about taste, nausea, internal discomfort, and the sense that the body is not behaving normally.",
    ],
    teachingPoints: [
      "The insula is a high-yield cortical localization for interoception, visceral discomfort, and autonomic salience.",
      "Right insular involvement is often discussed when stroke syndromes seem to distort both body-state awareness and cardiovascular control.",
    ],
    followUpModules: ["ecg", "stroke", "ask"],
    expectedRegionId: "insula",
    startingRegionId: "amygdala",
  },
  {
    id: "crossed-brainstem-pattern",
    title: "Crossed findings after a posterior circulation event",
    oneLiner:
      "A patient develops hoarseness, ipsilateral facial sensory change, contralateral body pain-temperature loss, and severe gait instability.",
    chiefComplaint:
      "Swallowing feels unsafe, the voice is hoarse, and the patient is veering to one side after abrupt symptom onset.",
    history:
      "The deficits appeared suddenly, facial symptoms and body symptoms are split across sides, and there is associated vertigo with nausea.",
    syndromeFrame:
      "A crossed posterior circulation syndrome with cranial nerve-level and long-tract findings in one package, strongly favoring brainstem localization over a hemispheric cortical lesion.",
    examFindings: [
      "Ipsilateral facial sensory disturbance",
      "Contralateral body pain and temperature loss",
      "Hoarseness, dysphagia, and ipsilateral ataxia",
    ],
    prompt:
      "Which major region is the strongest localization target, and why do the crossed findings outweigh a cortical or thalamic explanation?",
    hints: [
      "When cranial nerve-type deficits and contralateral tract findings travel together, think compact anatomy.",
      "Crossed signs are classic localization anchors.",
    ],
    localizationCues: [
      "Ipsilateral facial and bulbar deficits sit beside contralateral long-tract sensory loss.",
      "The pattern compresses cranial nerve territory and ascending pathways into one lesion zone.",
    ],
    differentialTraps: [
      "Hemispheric cortical lesions do not usually generate this cranial nerve plus contralateral body split.",
      "A cerebellar lesion can produce ataxia and vertigo but not the full crossed sensory and bulbar pattern.",
    ],
    nextDataRequests: [
      "Focused cranial nerve and bulbar exam to confirm the crossed pattern at the bedside.",
      "Posterior circulation imaging that includes the lateral medullary or pontine region, depending on the exact cranial findings.",
    ],
    teachingPoints: [
      "Crossed findings remain one of the highest-yield clues for brainstem localization.",
      "Brainstem syndromes are compact because cranial nerve nuclei, long tracts, autonomic centers, and cerebellar connections lie tightly together.",
    ],
    followUpModules: ["brain-atlas", "vision", "ask"],
    expectedRegionId: "brainstem",
    startingRegionId: "thalamus",
  },
];
