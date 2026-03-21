export interface GaitStressors {
  start: number;
  turn: number;
  eyesClosed: number;
  dualTask: number;
}

export interface GaitPreset {
  id: string;
  label: string;
  summary: string;
  phenotype: string;
  strongestLocalization: string;
  networkFrame: string;
  cadence: number;
  stepLengthLeft: number;
  stepLengthRight: number;
  baseWidth: number;
  variability: number;
  turnSteps: number;
  initiationLoad: number;
  cueResponse: number;
  affectedSide: "left" | "right" | null;
  pattern: "parkinsonian" | "cerebellar" | "sensory-ataxic" | "hemiparetic" | "frontal";
  dominantClue: string;
  weakerAlternative: string;
  bedsideClues: string[];
  stressors: GaitStressors;
  bedsideTests: {
    label: string;
    finding: string;
    implication: string;
  }[];
  rehabCues: string[];
}

export const gaitPresets: GaitPreset[] = [
  {
    id: "parkinsonian-freezing",
    label: "Parkinsonian freezing",
    summary:
      "Short shuffling steps, reduced arm swing, and a marked start-turn burden that improves with external cueing.",
    phenotype: "Hypokinetic gait",
    strongestLocalization:
      "Basal ganglia output network with impaired automatic gait scaling and reduced brainstem locomotor drive.",
    networkFrame:
      "Stride length generation collapses more than raw strength. The patient can often step larger when the movement is externally cued, which argues for gait-scaling failure rather than pyramidal weakness.",
    cadence: 116,
    stepLengthLeft: 30,
    stepLengthRight: 32,
    baseWidth: 11,
    variability: 13,
    turnSteps: 8,
    initiationLoad: 88,
    cueResponse: 76,
    affectedSide: null,
    pattern: "parkinsonian",
    dominantClue:
      "Turning and gait initiation are much worse than seated leg power testing would predict.",
    weakerAlternative:
      "A pure frontal gait-apraxia syndrome is weaker when rhythmic cueing reliably expands stride length and the base stays narrow rather than broad.",
    bedsideClues: [
      "Reduced arm swing and en bloc turning.",
      "Step size is too small for the requested pace.",
      "Doorways and turns provoke freezing more than straight walking does.",
    ],
    stressors: {
      start: 92,
      turn: 95,
      eyesClosed: 26,
      dualTask: 82,
    },
    bedsideTests: [
      {
        label: "Straight walk with cueing",
        finding: "Auditory or visual cues enlarge step length.",
        implication: "Supports gait scaling failure rather than fixed weakness.",
      },
      {
        label: "Pull test and turn",
        finding: "Postural recovery is delayed and turns fragment into many small steps.",
        implication: "Highlights axial control failure and freezing susceptibility.",
      },
      {
        label: "Dual-task walking",
        finding: "Conversation sharply shortens steps and worsens freezing.",
        implication: "Shows dependence on attentional compensation for automatic gait.",
      },
    ],
    rehabCues: [
      "Use external rhythm, floor stripes, or counting to widen steps.",
      "Break turning into deliberate quarter turns rather than one pivot.",
      "Reduce doorway clutter and cue the first step before movement starts.",
    ],
  },
  {
    id: "cerebellar-ataxic",
    label: "Cerebellar ataxic gait",
    summary:
      "Wide-base, irregular foot placement with lateral veering and high stride-to-stride variability.",
    phenotype: "Cerebellar gait",
    strongestLocalization:
      "Midline cerebellum or vestibulocerebellar network with impaired error correction and balance tuning.",
    networkFrame:
      "The problem is not low output but inconsistent correction. Each step is poorly calibrated, so the path widens, veers, and changes from stride to stride.",
    cadence: 88,
    stepLengthLeft: 46,
    stepLengthRight: 50,
    baseWidth: 28,
    variability: 42,
    turnSteps: 6,
    initiationLoad: 24,
    cueResponse: 14,
    affectedSide: null,
    pattern: "cerebellar",
    dominantClue:
      "Base width and directional veering are prominent even when visual cues are abundant.",
    weakerAlternative:
      "A sensory ataxia explanation is weaker when eye closure does not disproportionately collapse gait and limb dysmetria or ocular motor signs accompany the stance disorder.",
    bedsideClues: [
      "Irregular stride placement rather than consistently short steps.",
      "Wide base persists in open visual conditions.",
      "Tandem walking is disproportionately poor.",
    ],
    stressors: {
      start: 22,
      turn: 66,
      eyesClosed: 38,
      dualTask: 34,
    },
    bedsideTests: [
      {
        label: "Tandem gait",
        finding: "Severe instability appears early.",
        implication: "Midline cerebellar dysfunction is more likely than corticospinal weakness.",
      },
      {
        label: "Finger-nose and heel-knee-shin",
        finding: "Dysmetria and decomposition track with gait irregularity.",
        implication: "Links limb ataxia and stance failure into one cerebellar syndrome.",
      },
      {
        label: "Romberg framing",
        finding: "Instability is present with eyes open and not abolished by visual fixation.",
        implication: "Argues against a purely sensory ataxia syndrome.",
      },
    ],
    rehabCues: [
      "Stabilize the environment and increase base support rather than simply urging speed.",
      "Use trunk and proximal control cues before fine foot-placement demands.",
      "Treat turns and narrow spaces as high-risk transitions.",
    ],
  },
  {
    id: "sensory-ataxic",
    label: "Sensory ataxic gait",
    summary:
      "Broad, stamping gait that deteriorates sharply when visual feedback is removed.",
    phenotype: "Sensory ataxia",
    strongestLocalization:
      "Large-fiber peripheral neuropathy or dorsal column dysfunction with poor proprioceptive state estimation.",
    networkFrame:
      "Vision is being used as a prosthetic for lost position sense. Once visual calibration is removed, step placement becomes dramatically less reliable.",
    cadence: 82,
    stepLengthLeft: 44,
    stepLengthRight: 46,
    baseWidth: 22,
    variability: 27,
    turnSteps: 6,
    initiationLoad: 34,
    cueResponse: 8,
    affectedSide: null,
    pattern: "sensory-ataxic",
    dominantClue:
      "Eye closure is the major stressor, far more than turning or dual-tasking.",
    weakerAlternative:
      "Cerebellar ataxia is weaker when Romberg is strongly positive and proprioceptive loss, areflexia, or vibration loss explain the gait pattern.",
    bedsideClues: [
      "Footfalls are forceful because the patient is using impact for positional feedback.",
      "Watching the feet improves confidence and step placement.",
      "Romberg is far more revealing than finger-to-nose in many cases.",
    ],
    stressors: {
      start: 34,
      turn: 48,
      eyesClosed: 96,
      dualTask: 28,
    },
    bedsideTests: [
      {
        label: "Romberg test",
        finding: "Balance worsens dramatically with eyes closed.",
        implication: "Classic bedside sign of proprioceptive dependence.",
      },
      {
        label: "Vibration and joint position sense",
        finding: "Distal large-fiber sensory loss parallels gait instability.",
        implication: "Localizes the syndrome away from cerebellar output.",
      },
      {
        label: "Heel walking in the dark hallway simulation",
        finding: "Confidence collapses when visual compensation is reduced.",
        implication: "Shows dependence on visual substitution for lost proprioception.",
      },
    ],
    rehabCues: [
      "Optimize lighting and visual anchors before asking for speed.",
      "Train deliberate foot placement with external reference points.",
      "Address sensory aids, footwear, and fall-proofing before endurance goals.",
    ],
  },
  {
    id: "hemiparetic-circumduction",
    label: "Hemiparetic circumduction",
    summary:
      "Asymmetric gait with one long rigid arc, reduced knee flexion, and clear side-to-side stride inequality.",
    phenotype: "Pyramidal hemiparetic gait",
    strongestLocalization:
      "Contralateral corticospinal tract injury, often hemispheric or capsular stroke.",
    networkFrame:
      "The gait asymmetry reflects an output problem: weakness, spastic synergy, and poor selective flexion make the affected limb clear the floor by circumduction instead of normal swing.",
    cadence: 90,
    stepLengthLeft: 28,
    stepLengthRight: 54,
    baseWidth: 16,
    variability: 16,
    turnSteps: 7,
    initiationLoad: 30,
    cueResponse: 18,
    affectedSide: "left",
    pattern: "hemiparetic",
    dominantClue:
      "The affected leg clears the floor through circumduction rather than through normal knee flexion and ankle dorsiflexion.",
    weakerAlternative:
      "A basal ganglia gait is weaker when asymmetry is extreme, tone is velocity-dependent, and circumduction mirrors a focal corticospinal syndrome.",
    bedsideClues: [
      "Arm posture on the affected side often mirrors the leg asymmetry.",
      "Stride asymmetry is larger than base-width change.",
      "Spastic catch, hyperreflexia, or Babinski completes the pyramidal picture.",
    ],
    stressors: {
      start: 28,
      turn: 58,
      eyesClosed: 22,
      dualTask: 36,
    },
    bedsideTests: [
      {
        label: "Rapid alternating foot taps",
        finding: "Affected side is slow and fractionated.",
        implication: "Supports corticospinal output failure over a pure gait-programming problem.",
      },
      {
        label: "Observe swing phase",
        finding: "The affected limb arcs outward to clear the floor.",
        implication: "Classic circumduction from poor selective flexion.",
      },
      {
        label: "Arm and face exam",
        finding: "Associated pyramidal signs often travel with gait asymmetry.",
        implication: "Links gait pattern back to a hemispheric stroke syndrome.",
      },
    ],
    rehabCues: [
      "Target selective flexion and toe clearance rather than only speed.",
      "Train turns separately because circumduction becomes riskier in rotation.",
      "Pair gait work with upper-limb positioning and balance recovery practice.",
    ],
  },
  {
    id: "frontal-apraxic",
    label: "Frontal gait apraxia",
    summary:
      "Magnetic, short-stepped gait with major initiation difficulty and poor automatic stepping despite relatively preserved seated strength.",
    phenotype: "Higher-level gait disorder",
    strongestLocalization:
      "Medial frontal or frontal-subcortical gait network dysfunction, including normal-pressure hydrocephalus or bifrontal vascular injury.",
    networkFrame:
      "The legs are capable of moving, but the brain cannot scale, sequence, and release the gait program effectively, especially at initiation.",
    cadence: 74,
    stepLengthLeft: 24,
    stepLengthRight: 26,
    baseWidth: 24,
    variability: 22,
    turnSteps: 10,
    initiationLoad: 96,
    cueResponse: 18,
    affectedSide: null,
    pattern: "frontal",
    dominantClue:
      "Start hesitation is out of proportion to formal leg strength, and the feet seem stuck to the floor.",
    weakerAlternative:
      "Parkinsonism is weaker when the base is broader, cueing helps little, and frontal cognitive or urinary features cluster with the gait disorder.",
    bedsideClues: [
      "Feet appear glued down at gait initiation.",
      "Turning fragments into many steps without classic narrow-base shuffling.",
      "Chair rise and seated leg testing can look much better than walking.",
    ],
    stressors: {
      start: 98,
      turn: 80,
      eyesClosed: 14,
      dualTask: 62,
    },
    bedsideTests: [
      {
        label: "Start command",
        finding: "The first step is disproportionately delayed.",
        implication: "Classic release failure of a higher-level gait program.",
      },
      {
        label: "Seated versus standing leg testing",
        finding: "Formal strength exceeds walking performance.",
        implication: "Argues against a primary corticospinal weakness syndrome.",
      },
      {
        label: "Frontal features screen",
        finding: "Dysexecutive signs, urinary urgency, or magnetic turning may cluster with the gait pattern.",
        implication: "Supports a frontal-subcortical network disorder.",
      },
    ],
    rehabCues: [
      "Use clear step-initiation rituals and external targets rather than relying on spontaneous start.",
      "Simplify turns and environmental transitions before adding speed.",
      "Pair gait treatment with cognitive and continence context when the syndrome suggests NPH or frontal disease.",
    ],
  },
];
