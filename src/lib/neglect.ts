export interface NeglectTask {
  label: string;
  finding: string;
  implication: string;
}

export interface NeglectPreset {
  id: string;
  label: string;
  summary: string;
  strongestLocalization: string;
  networkFrame: string;
  referenceFrame: "egocentric" | "allocentric" | "extinction-dominant" | "motor-intentional";
  spaceBias: number;
  objectBias: number;
  extinctionLoad: number;
  leftTargetHits: number;
  centerTargetHits: number;
  rightTargetHits: number;
  bisectionShiftPct: number;
  singleLeftDetection: number;
  singleRightDetection: number;
  bilateralBothDetection: number;
  bilateralLeftDetection: number;
  dominantClue: string;
  weakerAlternative: string;
  differentiators: string[];
  tasks: NeglectTask[];
  rehabSupports: string[];
  teachingPearl: string;
}

export const neglectPresets: NeglectPreset[] = [
  {
    id: "classic-right-parietal",
    label: "Classic right parietal neglect",
    summary:
      "Dense left hemispatial neglect with rightward exploration bias, left extinction, and a large line-bisection shift.",
    strongestLocalization:
      "Right inferior parietal lobule and temporoparietal junction within the ventral attention network.",
    networkFrame:
      "The right-lateralized attention network normally surveys both hemispaces. When it fails, intact left-hemisphere orienting is no longer balanced and search collapses rightward.",
    referenceFrame: "egocentric",
    spaceBias: 0.76,
    objectBias: 0.18,
    extinctionLoad: 0.82,
    leftTargetHits: 1,
    centerTargetHits: 4,
    rightTargetHits: 6,
    bisectionShiftPct: 18,
    singleLeftDetection: 78,
    singleRightDetection: 100,
    bilateralBothDetection: 24,
    bilateralLeftDetection: 12,
    dominantClue:
      "Left-sided misses persist even when primary strength and elementary vision look relatively preserved.",
    weakerAlternative:
      "A pure left homonymous hemianopia is weaker because neglect also distorts search strategy, extinction, copying, and awareness rather than just removing left visual input.",
    differentiators: [
      "Cancellation starts on the right edge and never fully sweeps left.",
      "Double simultaneous stimulation worsens left awareness far more than single-item testing.",
      "Clock drawing and scene copying are spatially imbalanced rather than uniformly degraded.",
    ],
    tasks: [
      {
        label: "Star cancellation",
        finding: "Leftmost targets are skipped despite adequate time and intact rightward search.",
        implication: "Points to exploratory-attention failure rather than isolated acuity loss.",
      },
      {
        label: "Line bisection",
        finding: "Marked midpoint is shifted well to the right of center.",
        implication: "Captures egocentric spatial bias quickly at the bedside.",
      },
      {
        label: "Double simultaneous stimulation",
        finding: "Left touch is detected alone but disappears when the right side is stimulated simultaneously.",
        implication: "Supports extinction layered on top of neglect rather than a dense primary sensory deficit.",
      },
    ],
    rehabSupports: [
      "Anchor all reading and search tasks to a bright left-edge cue.",
      "Train deliberate leftward scanning before increasing task speed.",
      "Orient meals, call bells, and teaching prompts into the neglected hemispace on purpose.",
    ],
    teachingPearl:
      "Neglect is a disorder of spatial attention and internal scene construction, not just a bad visual field.",
  },
  {
    id: "extinction-dominant",
    label: "Extinction-dominant neglect",
    summary:
      "Single-item awareness is fairly preserved, but bilateral competition causes the left side to drop out.",
    strongestLocalization:
      "Right temporoparietal junction or broader ventral attention network dysfunction with mild spontaneous neglect.",
    networkFrame:
      "Competing bilateral inputs overload the damaged attention network, so the left stimulus is suppressed when the right stimulus is present.",
    referenceFrame: "extinction-dominant",
    spaceBias: 0.28,
    objectBias: 0.06,
    extinctionLoad: 0.9,
    leftTargetHits: 5,
    centerTargetHits: 6,
    rightTargetHits: 6,
    bisectionShiftPct: 6,
    singleLeftDetection: 94,
    singleRightDetection: 100,
    bilateralBothDetection: 36,
    bilateralLeftDetection: 18,
    dominantClue:
      "The patient can find left stimuli when they are presented alone but loses them during bilateral competition.",
    weakerAlternative:
      "A dense visual field cut is weaker because isolated left targets remain visible and the failure is highly competition-dependent.",
    differentiators: [
      "Confrontation fields alone can look deceptively normal.",
      "Bilateral tactile or visual stimulation unmasks the syndrome immediately.",
      "Spontaneous copying may be near-normal until the scene becomes cluttered.",
    ],
    tasks: [
      {
        label: "Visual extinction test",
        finding: "Left finger count is correct alone but missed when the examiner wiggles both hands.",
        implication: "Classic competition-sensitive neglect signature.",
      },
      {
        label: "Cancellation under clutter",
        finding: "Performance worsens only after distractors are added.",
        implication: "Separates attentional load failure from a fixed sensory hole.",
      },
      {
        label: "Scene description",
        finding: "Major objects are named, but left-sided details disappear once the scene grows busy.",
        implication: "Shows capacity failure of spatial selection rather than pure naming difficulty.",
      },
    ],
    rehabSupports: [
      "Simplify the scene before asking for bilateral scanning.",
      "Use serial single-target practice before cluttered arrays.",
      "Teach caregivers to pause, recenter, and then add competing information gradually.",
    ],
    teachingPearl:
      "Mild neglect often hides inside extinction, so bilateral testing matters more than casual single-item confrontation.",
  },
  {
    id: "allocentric",
    label: "Allocentric neglect",
    summary:
      "The left side of each object is lost even when the object itself sits on the right side of space.",
    strongestLocalization:
      "Right posterior temporal or parieto-occipital association cortex with object-centered spatial coding failure.",
    networkFrame:
      "Spatial coding is tied to the object itself rather than to body-centered coordinates, so each item loses its left side regardless of where it appears in the room.",
    referenceFrame: "allocentric",
    spaceBias: 0.18,
    objectBias: 0.84,
    extinctionLoad: 0.32,
    leftTargetHits: 4,
    centerTargetHits: 5,
    rightTargetHits: 6,
    bisectionShiftPct: 4,
    singleLeftDetection: 90,
    singleRightDetection: 100,
    bilateralBothDetection: 72,
    bilateralLeftDetection: 66,
    dominantClue:
      "Words, clocks, and drawings lose their left halves even when the patient is already looking rightward.",
    weakerAlternative:
      "A pure egocentric neglect syndrome is weaker because errors follow object-side rather than viewer-side coordinates.",
    differentiators: [
      "Reading errors drop left letters from individual words.",
      "Copying distorts the left side of each object, not just the left side of the page.",
      "Bisection bias can be small despite obvious object-level asymmetry.",
    ],
    tasks: [
      {
        label: "Clock copying",
        finding: "Numbers cluster on the right side of the clock face and left-sided object detail is omitted.",
        implication: "Shows object-centered failure better than simple cancellation does.",
      },
      {
        label: "Word reading",
        finding: "Initial letters are dropped from words placed in intact right hemispace.",
        implication: "Supports allocentric spatial loss rather than global aphasia or hemianopia.",
      },
      {
        label: "Complex figure copy",
        finding: "Each item loses left detail even when overall page exploration seems adequate.",
        implication: "Separates viewer-centered from object-centered neglect.",
      },
    ],
    rehabSupports: [
      "Use object-by-object verbal cueing rather than only page-level scanning cues.",
      "Chunk reading and copying tasks into smaller units with explicit left-edge anchors on each item.",
      "Check labels, medication packets, and forms for left-sided truncation errors.",
    ],
    teachingPearl:
      "Not all neglect is page-left versus page-right. Some syndromes are built around object coordinates instead.",
  },
  {
    id: "motor-intentional",
    label: "Motor-intentional neglect",
    summary:
      "The patient can acknowledge the left side when cued, but spontaneous leftward initiation and reach are dramatically reduced.",
    strongestLocalization:
      "Right frontal eye field or medial frontal-premotor attention network with directional hypokinesia.",
    networkFrame:
      "Attention is partially available, but voluntary orienting into left hemispace is under-initiated, so search and reaching fail before sensory awareness completely collapses.",
    referenceFrame: "motor-intentional",
    spaceBias: 0.56,
    objectBias: 0.12,
    extinctionLoad: 0.46,
    leftTargetHits: 3,
    centerTargetHits: 5,
    rightTargetHits: 6,
    bisectionShiftPct: 10,
    singleLeftDetection: 86,
    singleRightDetection: 100,
    bilateralBothDetection: 54,
    bilateralLeftDetection: 38,
    dominantClue:
      "Prompting improves awareness, but self-generated leftward search and reach remain slow or absent.",
    weakerAlternative:
      "A pure visual neglect syndrome is weaker because intentional leftward action is disproportionately impaired even after the target is acknowledged.",
    differentiators: [
      "Leftward saccades are under-initiated more than leftward perception is lost.",
      "Reaching or wheelchair navigation veers right unless actively corrected.",
      "External cueing helps more than it would in a dense sensory loss.",
    ],
    tasks: [
      {
        label: "Self-initiated search",
        finding: "Left scanning is sparse until the examiner explicitly cues a leftward anchor.",
        implication: "Suggests directional hypokinesia layered onto attentional bias.",
      },
      {
        label: "Reaching task",
        finding: "Targets on the left are seen but reached only after hesitation or curved trajectories.",
        implication: "Shows motor-intentional bias rather than complete unawareness.",
      },
      {
        label: "Wheelchair or hallway navigation",
        finding: "The patient drifts into the right-sided lane of travel and clips the left environment.",
        implication: "Functional version of reduced leftward motor initiation.",
      },
    ],
    rehabSupports: [
      "Use strong leftward cueing before movement begins, not just after an error appears.",
      "Practice goal-directed leftward reaches with high-contrast anchors.",
      "Build left-start routines into transfers, reading, and mobility training.",
    ],
    teachingPearl:
      "Neglect can be an orienting problem, a representational problem, a sensory-competition problem, or a movement-initiation problem, and the bedside tasks should expose which layer is failing.",
  },
];
