export interface AphasiaDomainProfile {
  fluency: number;
  comprehension: number;
  repetition: number;
  naming: number;
  reading: number;
  writing: number;
}

export interface AphasiaBedsideTask {
  label: string;
  finding: string;
  implication: string;
}

export interface AphasiaPreset {
  id: string;
  label: string;
  summary: string;
  phenotype: string;
  lesionRegion:
    | "broca"
    | "wernicke"
    | "arcuate"
    | "perisylvian"
    | "aca-mca-border"
    | "mca-pca-border";
  strongestLocalization: string;
  networkFrame: string;
  dominantClue: string;
  weakerAlternative: string;
  fluencyTag: "nonfluent" | "fluent" | "mixed";
  auditoryLoad: number;
  repetitionSplit: number;
  profile: AphasiaDomainProfile;
  speechSample: string;
  repetitionProbe: string;
  comprehensionProbe: string;
  namingProbe: string;
  readingWriting: string;
  bedsideTasks: AphasiaBedsideTask[];
  rehabSupports: string[];
  teachingPearl: string;
}

export const aphasiaPresets: AphasiaPreset[] = [
  {
    id: "broca",
    label: "Broca aphasia",
    summary:
      "Effortful, agrammatic output with relatively preserved comprehension and disproportionately impaired repetition.",
    phenotype: "Nonfluent expressive aphasia",
    lesionRegion: "broca",
    strongestLocalization:
      "Dominant inferior frontal gyrus and adjacent anterior perisylvian language network.",
    networkFrame:
      "Language formulation and articulatory sequencing are bottlenecked, so the patient knows much more than they can efficiently convert into fluent propositional speech.",
    dominantClue:
      "Speech is sparse, effortful, and grammatically reduced, but comprehension is much better than the output pattern initially suggests.",
    weakerAlternative:
      "Dysarthria alone is weaker because the problem is not just articulation: grammar, phrase length, and spontaneous verbal generation are all reduced.",
    fluencyTag: "nonfluent",
    auditoryLoad: 28,
    repetitionSplit: 32,
    profile: {
      fluency: 18,
      comprehension: 82,
      repetition: 34,
      naming: 44,
      reading: 58,
      writing: 30,
    },
    speechSample: '"...want... water... no... hospital... home."',
    repetitionProbe:
      'Fails on "No ifs, ands, or buts" with effortful fragments and omissions.',
    comprehensionProbe:
      "Follows one- and two-step commands reasonably well, especially when syntax stays simple.",
    namingProbe:
      "Frequent word-finding pauses with preserved recognition of the target object.",
    readingWriting:
      "Reading comprehension can exceed written output; writing often mirrors the agrammatism seen in speech.",
    bedsideTasks: [
      {
        label: "Conversational sample",
        finding: "Short phrases, telegraphic grammar, and obvious effort.",
        implication: "Primary problem is language output formulation rather than a pure motor speech issue.",
      },
      {
        label: "Auditory commands",
        finding: "Simple comprehension is much better than spontaneous expression.",
        implication: "Supports dominant frontal language-network injury over global aphasia.",
      },
      {
        label: "Sentence repetition",
        finding: "Repetition collapses once phrase length and syntax increase.",
        implication: "Helps separate Broca and conduction patterns from transcortical motor aphasia.",
      },
    ],
    rehabSupports: [
      "Slow the exchange and accept multimodal output such as gesture, writing, or key words.",
      "Use yes/no checks carefully, because comprehension is better than spontaneous verbal output.",
      "Keep commands syntactically simple while preserving adult-level content.",
    ],
    teachingPearl:
      "Nonfluent does not mean unintelligent or globally confused. In Broca aphasia, the bottleneck is expressive language assembly.",
  },
  {
    id: "wernicke",
    label: "Wernicke aphasia",
    summary:
      "Fluent but empty output with severe auditory comprehension failure and poor repetition.",
    phenotype: "Fluent receptive aphasia",
    lesionRegion: "wernicke",
    strongestLocalization:
      "Dominant posterior superior temporal language cortex and adjacent temporoparietal comprehension network.",
    networkFrame:
      "Speech melody and output rate remain intact, but lexical selection and auditory language mapping are corrupted, so the patient sounds fluent without accurately grounding meaning.",
    dominantClue:
      "The patient speaks easily and at length, yet cannot reliably comprehend spoken language or monitor their own semantic errors.",
    weakerAlternative:
      "Primary psychiatric or delirious speech is weaker when the language errors are systematic, repetition is broken, and bedside comprehension testing is clearly abnormal.",
    fluencyTag: "fluent",
    auditoryLoad: 92,
    repetitionSplit: 22,
    profile: {
      fluency: 86,
      comprehension: 16,
      repetition: 22,
      naming: 28,
      reading: 24,
      writing: 34,
    },
    speechSample:
      '"Well the framble was already over there, and that is why the one with the day-room was better, you know?"',
    repetitionProbe:
      'Repeats only fragments and often substitutes or adds phonemic and semantic errors.',
    comprehensionProbe:
      "Misses even simple spoken commands once the task depends on word meaning rather than imitation.",
    namingProbe:
      "Naming is poor and paraphasic, often without awareness that the response missed the target.",
    readingWriting:
      "Reading comprehension tracks the auditory deficit; writing can remain fluent but similarly empty or paraphasic.",
    bedsideTasks: [
      {
        label: "Command following",
        finding: "Fails basic spoken instructions unless contextual cues rescue the task.",
        implication: "Strongly localizes to receptive language cortex rather than a pure expressive syndrome.",
      },
      {
        label: "Self-monitoring",
        finding: "Limited awareness of errors and poor correction.",
        implication: "Distinguishes Wernicke aphasia from conduction aphasia, where patients often hear the error and keep trying.",
      },
      {
        label: "Yes/no reliability",
        finding: "Answers are inconsistent when the content requires real comprehension.",
        implication: "Care planning must not assume fluent speech equals preserved understanding.",
      },
    ],
    rehabSupports: [
      "Use short sentences, written keywords, and concrete visual supports rather than long verbal explanations.",
      "Verify comprehension through action or selection tasks instead of relying on conversational fluency.",
      "Reduce background language load before teaching new information.",
    ],
    teachingPearl:
      "Fluency is not comprehension. Wernicke aphasia is one of the clearest reminders that speech output style and language understanding can dissociate sharply.",
  },
  {
    id: "conduction",
    label: "Conduction aphasia",
    summary:
      "Relatively fluent speech and fair comprehension with a striking repetition deficit and self-correcting phonemic errors.",
    phenotype: "Fluent aphasia with disproportionate repetition failure",
    lesionRegion: "arcuate",
    strongestLocalization:
      "Dominant arcuate fasciculus or supramarginal-perisylvian network linking comprehension to output.",
    networkFrame:
      "The patient can generate language and understand it, but the phonologic bridge between heard language and reproduced output is unstable, so repetition is much worse than conversation.",
    dominantClue:
      "The patient knows what they want to say and often hears the mistake, but cannot cleanly transmit the word or sentence through repetition.",
    weakerAlternative:
      "Broca aphasia is weaker when spontaneous speech remains fairly fluent and comprehension is relatively preserved despite a severe repetition gap.",
    fluencyTag: "fluent",
    auditoryLoad: 34,
    repetitionSplit: 88,
    profile: {
      fluency: 72,
      comprehension: 80,
      repetition: 12,
      naming: 52,
      reading: 68,
      writing: 56,
    },
    speechSample:
      '"I can tell you about the picture... the boy is... the bo- the... he is reaching, yes, reaching up."',
    repetitionProbe:
      'Marked failure on longer phrases with phonemic approximations and repeated self-corrections.',
    comprehensionProbe:
      "Single-step and many multi-step spoken commands remain relatively intact.",
    namingProbe:
      "Naming is variably impaired, with better recognition than accurate phonologic output.",
    readingWriting:
      "Reading comprehension may be decent, but oral reading and written spelling can show similar phonologic instability.",
    bedsideTasks: [
      {
        label: "Single-word versus sentence repetition",
        finding: "Sentence repetition is disproportionately worse than conversation.",
        implication: "Classic doorway into conduction aphasia.",
      },
      {
        label: "Error awareness",
        finding: "Patient repeatedly attempts to fix phonemic errors.",
        implication: "Separates conduction from Wernicke aphasia, where monitoring is often poorer.",
      },
      {
        label: "Comprehension comparison",
        finding: "Understanding outperforms repetition by a wide margin.",
        implication: "Supports a disconnection pattern rather than global receptive failure.",
      },
    ],
    rehabSupports: [
      "Give extra time for self-correction rather than immediately taking over the word.",
      "Support phonologic cueing, written backup, and shorter utterance chunks.",
      "Avoid interpreting repeated failed attempts as absent knowledge.",
    ],
    teachingPearl:
      "When repetition is far worse than comprehension and conversation, think about the bridge between language nodes, not just the nodes themselves.",
  },
  {
    id: "global",
    label: "Global aphasia",
    summary:
      "Severe impairment across fluency, comprehension, repetition, naming, reading, and writing.",
    phenotype: "Pervasive language network failure",
    lesionRegion: "perisylvian",
    strongestLocalization:
      "Large dominant perisylvian lesion, often extensive MCA territory injury involving frontal, temporal, and parietal language cortex.",
    networkFrame:
      "Both expressive and receptive language systems are broadly disrupted, so the patient cannot rely on one preserved language domain to compensate for another.",
    dominantClue:
      "The deficit is not just nonfluent speech or poor comprehension in isolation; essentially every bedside language channel is heavily impaired.",
    weakerAlternative:
      "Profound dysarthria or abulia is weaker when comprehension, naming, repetition, reading, and writing all collapse together as a language syndrome.",
    fluencyTag: "mixed",
    auditoryLoad: 96,
    repetitionSplit: 94,
    profile: {
      fluency: 8,
      comprehension: 10,
      repetition: 6,
      naming: 8,
      reading: 6,
      writing: 4,
    },
    speechSample: '"...uh... no... no..." with minimal meaningful propositional output.',
    repetitionProbe:
      "Cannot reliably repeat even simple words or fixed phrases.",
    comprehensionProbe:
      "Fails simple commands unless contextual or gestural support is overwhelming.",
    namingProbe:
      "Naming is profoundly impaired across high- and low-frequency targets.",
    readingWriting:
      "Reading and writing are severely compromised and usually add little extra information acutely.",
    bedsideTasks: [
      {
        label: "Multichannel language screen",
        finding: "Speech, comprehension, repetition, naming, reading, and writing are all severely reduced.",
        implication: "Supports a large dominant perisylvian lesion rather than one circumscribed language node.",
      },
      {
        label: "Gesture and nonverbal communication",
        finding: "May remain partially available even when formal language is devastated.",
        implication: "Crucial for immediate care planning and bedside support.",
      },
      {
        label: "Automatic speech",
        finding: "Overlearned fragments may survive slightly better than propositional language.",
        implication: "Does not undo the localization; it simply shows dissociation within a severe aphasia.",
      },
    ],
    rehabSupports: [
      "Build communication around gesture, pointing, picture choice, and yes/no scaffolding with verification.",
      "Simplify one variable at a time: short phrases, strong context, and visual supports.",
      "Teach the team not to equate limited language output with absent awareness or absent distress.",
    ],
    teachingPearl:
      "Global aphasia is a network-scale language emergency, but preserved nonverbal communication channels still matter immediately.",
  },
  {
    id: "transcortical-motor",
    label: "Transcortical motor aphasia",
    summary:
      "Markedly reduced spontaneous speech with relatively preserved comprehension and surprisingly intact repetition.",
    phenotype: "Nonfluent aphasia with spared repetition",
    lesionRegion: "aca-mca-border",
    strongestLocalization:
      "Dominant medial frontal or ACA-MCA watershed language initiation network anterior to core perisylvian cortex.",
    networkFrame:
      "The patient has trouble initiating internally generated language, but the perisylvian repetition pathway remains comparatively intact.",
    dominantClue:
      "Spontaneous output is sparse, yet repetition can be much better than expected for a nonfluent syndrome.",
    weakerAlternative:
      "Broca aphasia is weaker when repetition remains surprisingly preserved and the main deficit looks like verbal initiation rather than classic agrammatic breakdown alone.",
    fluencyTag: "nonfluent",
    auditoryLoad: 24,
    repetitionSplit: -42,
    profile: {
      fluency: 20,
      comprehension: 84,
      repetition: 76,
      naming: 46,
      reading: 62,
      writing: 38,
    },
    speechSample:
      '"...yes." "Hospital." "Need... help." with long delays before self-generated speech.',
    repetitionProbe:
      "Repeats phrases much better than spontaneous speech would predict.",
    comprehensionProbe:
      "Auditory comprehension is relatively preserved, especially for concrete commands.",
    namingProbe:
      "Naming is reduced, but cueing and repetition can partially support output.",
    readingWriting:
      "Reading comprehension is often stronger than spontaneous writing, which can be sparse and initiation-limited.",
    bedsideTasks: [
      {
        label: "Spontaneous versus prompted speech",
        finding: "Conversation stalls, but prompted repetition is disproportionately strong.",
        implication: "Classic transcortical motor dissociation.",
      },
      {
        label: "Sentence completion",
        finding: "Structured prompts unlock more output than open-ended questions do.",
        implication: "Suggests initiation failure rather than purely destroyed language form.",
      },
      {
        label: "Command following",
        finding: "Comprehension remains much better than spontaneous verbal generation.",
        implication: "Supports frontal initiation-network localization over global aphasia.",
      },
    ],
    rehabSupports: [
      "Use structured prompting, sentence stems, and initiation cues.",
      "Allow long response latencies instead of filling the silence too quickly.",
      "Lean on preserved repetition as a therapy bridge into more spontaneous output.",
    ],
    teachingPearl:
      "If repetition is strikingly preserved inside a nonfluent syndrome, think beyond Broca cortex to anterior or watershed initiation networks.",
  },
  {
    id: "transcortical-sensory",
    label: "Transcortical sensory aphasia",
    summary:
      "Fluent but poorly grounded speech with impaired comprehension and naming, yet relatively preserved repetition.",
    phenotype: "Fluent aphasia with spared repetition",
    lesionRegion: "mca-pca-border",
    strongestLocalization:
      "Dominant temporoparietal-occipital association cortex or MCA-PCA watershed zone posterior to core perisylvian repetition circuitry.",
    networkFrame:
      "The patient can echo language because the repetition loop is relatively intact, but semantic access and language grounding are impaired.",
    dominantClue:
      "Comprehension is poor, spontaneous speech may be empty or paraphasic, and repetition is paradoxically better than the rest of the language profile.",
    weakerAlternative:
      "Wernicke aphasia is weaker when repetition is preserved to a degree that does not fit a core posterior perisylvian lesion.",
    fluencyTag: "fluent",
    auditoryLoad: 86,
    repetitionSplit: -38,
    profile: {
      fluency: 78,
      comprehension: 22,
      repetition: 72,
      naming: 30,
      reading: 26,
      writing: 40,
    },
    speechSample:
      '"Yes, yes, and the little thing there is exactly the one, the one that goes..."',
    repetitionProbe:
      "Repeats phrases surprisingly well compared with spontaneous semantic accuracy.",
    comprehensionProbe:
      "Misses word meaning and multi-step commands despite preserved echoic output.",
    namingProbe:
      "Naming is poor and semantically unstable even when repetition remains strong.",
    readingWriting:
      "Reading comprehension is impaired; writing may be fluent but semantically weak or circumlocutory.",
    bedsideTasks: [
      {
        label: "Repetition-comprehension split",
        finding: "Can repeat a sentence they do not truly understand.",
        implication: "High-yield separation from Wernicke aphasia.",
      },
      {
        label: "Semantic matching",
        finding: "Word meaning tasks fail more than phonologic echo tasks.",
        implication: "Points to posterior association-semantic injury outside the core repetition loop.",
      },
      {
        label: "Naming with cues",
        finding: "Repeats the cue but still struggles to retrieve or ground the concept.",
        implication: "Supports semantic-access failure rather than a pure articulatory issue.",
      },
    ],
    rehabSupports: [
      "Do not mistake good repetition for true comprehension.",
      "Anchor language to pictures, objects, and forced-choice meaning checks.",
      "Use repetition as a scaffold, but verify semantic understanding separately.",
    ],
    teachingPearl:
      "Preserved repetition is a powerful anatomical clue: it means the core perisylvian echo pathway may be intact even when meaning is badly compromised.",
  },
];
