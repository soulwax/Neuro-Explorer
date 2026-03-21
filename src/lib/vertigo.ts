export interface VertigoTask {
  label: string;
  finding: string;
  implication: string;
}

export interface VertigoPreset {
  id: string;
  label: string;
  frame: string;
  summary: string;
  lesionRegion:
    | "posterior-canal"
    | "labyrinth"
    | "vestibular-nerve"
    | "brainstem-cerebellum"
    | "multisensory-network";
  tracePattern:
    | "peripheral-sawtooth"
    | "central-switch"
    | "burst-decay"
    | "migraine-variable"
    | "hydropic-fluctuation";
  strongestLocalization: string;
  networkFrame: string;
  dominantClue: string;
  weakerAlternative: string;
  headImpulse: string;
  nystagmus: string;
  skew: string;
  hintsScope: string;
  durationLabel: string;
  durationHours: number;
  recurrenceLabel: string;
  triggerContext: string;
  hearingContext: string;
  fixationSuppression: number;
  centralRisk: number;
  gaitBurden: number;
  hearingShift: number;
  gazeLeft: number;
  gazePrimary: number;
  gazeRight: number;
  provocationRest: number;
  provocationHeadTurn: number;
  provocationPositional: number;
  provocationVisualMotion: number;
  bedsideTasks: VertigoTask[];
  rehabSupports: string[];
  teachingPearl: string;
}

export const vertigoPresets: VertigoPreset[] = [
  {
    id: "vestibular-neuritis",
    label: "Vestibular neuritis",
    frame: "Peripheral acute vestibular syndrome",
    summary:
      "Continuous hours-to-days vertigo with nausea, unidirectional horizontal-torsional nystagmus, an abnormal head impulse, and no meaningful cochlear symptoms.",
    lesionRegion: "vestibular-nerve",
    tracePattern: "peripheral-sawtooth",
    strongestLocalization:
      "Peripheral vestibular apparatus, usually the superior vestibular nerve on one side.",
    networkFrame:
      "One labyrinth suddenly under-fires, so the brain interprets the asymmetry as ongoing head rotation. That creates a slow-phase drift toward the injured side and quick phases away from it.",
    dominantClue:
      "A corrective saccade on head impulse plus unidirectional nystagmus and absent skew is classic peripheral acute vestibular syndrome.",
    weakerAlternative:
      "Posterior circulation stroke becomes weaker when HINTS stays peripheral and hearing is preserved, but central red flags still win if the gait is severely truncal or focal deficits appear.",
    headImpulse: "Positive to the injured side with a corrective catch-up saccade.",
    nystagmus:
      "Unidirectional horizontal-torsional nystagmus that intensifies when gazing in the fast-phase direction.",
    skew: "Absent.",
    hintsScope:
      "HINTS is appropriate here because the syndrome is continuous acute vestibular syndrome, not a brief positional spell.",
    durationLabel: "Continuous for 1 to 3 days before compensation starts easing it.",
    durationHours: 72,
    recurrenceLabel: "Usually one prolonged attack rather than many tiny bursts.",
    triggerContext:
      "Head turns worsen the illusion, but the patient is still dizzy at rest.",
    hearingContext: "Hearing is typically preserved, which separates it from cochlear syndromes.",
    fixationSuppression: 78,
    centralRisk: 16,
    gaitBurden: 58,
    hearingShift: 6,
    gazeLeft: 88,
    gazePrimary: 62,
    gazeRight: 34,
    provocationRest: 72,
    provocationHeadTurn: 92,
    provocationPositional: 34,
    provocationVisualMotion: 48,
    bedsideTasks: [
      {
        label: "HINTS exam",
        finding:
          "Positive head impulse, unidirectional nystagmus, and no skew pull the syndrome toward the ear rather than the brainstem.",
        implication:
          "This is the pattern where HINTS helps you avoid reflexively overcalling stroke in a continuously dizzy patient.",
      },
      {
        label: "Hearing screen",
        finding: "Finger rub and tuning-fork testing are usually symmetric.",
        implication:
          "Spared hearing supports vestibular neuritis over labyrinthitis or AICA territory ischemia.",
      },
      {
        label: "Gait check",
        finding:
          "The patient feels awful and may veer, but can usually still stand or walk with support.",
        implication:
          "Catastrophic truncal collapse is more worrisome for cerebellar stroke than for isolated neuritis.",
      },
    ],
    rehabSupports: [
      "Keep the first explanation simple: one inner ear is under-signaling, so the brain thinks the head is still moving.",
      "After the hyperacute phase, encourage gentle head movement and visual fixation tasks so central compensation can start.",
      "Avoid reinforcing bed rest longer than necessary once the dangerous central mimics are excluded.",
    ],
    teachingPearl:
      "A positive head impulse in acute continuous vertigo is reassuringly peripheral. A normal head impulse in the same syndrome is the dangerous result.",
  },
  {
    id: "posterior-circulation-stroke",
    label: "Posterior circulation stroke",
    frame: "Central acute vestibular syndrome",
    summary:
      "Continuous vertigo with dangerous oculomotor findings such as direction-changing gaze-evoked nystagmus, skew deviation, a normal head impulse, or severe truncal ataxia.",
    lesionRegion: "brainstem-cerebellum",
    tracePattern: "central-switch",
    strongestLocalization:
      "Posterior fossa vestibular pathways: cerebellar flocculus, nodulus, vestibular nuclei, or nearby brainstem stroke territory.",
    networkFrame:
      "The peripheral sensors still work, but the brainstem-cerebellar calibrator is damaged. That breaks gaze holding, vertical alignment, and the central interpretation of vestibular tone.",
    dominantClue:
      "Normal head impulse in a patient with continuous vertigo means the peripheral vestibular apparatus may be intact, which makes a central lesion much more dangerous and much more likely.",
    weakerAlternative:
      "Vestibular neuritis is weaker when nystagmus changes direction with gaze, skew is present, or the patient cannot sit and stand safely without a focal explanation.",
    headImpulse: "Often normal despite severe vertigo.",
    nystagmus:
      "Direction-changing gaze-evoked or vertical/torsional nystagmus rather than one fixed peripheral beat direction.",
    skew: "Present or clearly suspicious.",
    hintsScope:
      "HINTS is highest yield in exactly this syndrome: acute, continuous vertigo with spontaneous nystagmus and gait imbalance.",
    durationLabel: "Continuous from onset and dangerous even when early MRI can still miss posterior fossa infarction.",
    durationHours: 48,
    recurrenceLabel: "Persists until perfusion is restored or the infarct declares itself.",
    triggerContext:
      "Not purely positional. Symptoms remain concerning even in neutral head position.",
    hearingContext:
      "Hearing may be preserved, but AICA territory disease can also add cochlear symptoms.",
    fixationSuppression: 18,
    centralRisk: 94,
    gaitBurden: 96,
    hearingShift: 28,
    gazeLeft: 82,
    gazePrimary: 54,
    gazeRight: 86,
    provocationRest: 74,
    provocationHeadTurn: 68,
    provocationPositional: 22,
    provocationVisualMotion: 56,
    bedsideTasks: [
      {
        label: "HINTS exam",
        finding:
          "Normal head impulse, direction-changing nystagmus, or skew deviation should be treated as stroke until proven otherwise.",
        implication:
          "This bedside pattern can outrun early MRI in the first 24 to 48 hours.",
      },
      {
        label: "Truncal ataxia",
        finding: "The patient may be unable to sit or stand independently.",
        implication:
          "Severe axial collapse points toward cerebellar or brainstem pathology, not a routine peripheral neuritis picture.",
      },
      {
        label: "Focused cranial-nerve sweep",
        finding:
          "Look for diplopia, dysarthria, dysphagia, Horner syndrome, crossed sensory loss, or limb dysmetria.",
        implication:
          "Even subtle additional brainstem signs sharply strengthen the central localization.",
      },
    ],
    rehabSupports: [
      "Frame this as a stroke-localization emergency first and a dizziness complaint second.",
      "Use bedside teaching language that links each HINTS element back to anatomy: intact ear, unstable gaze-holding network, vertical alignment failure.",
      "Do not let a negative early MRI close the case if the bedside syndrome is centrally patterned.",
    ],
    teachingPearl:
      "In acute vestibular syndrome, a normal head impulse is not normal reassurance. It is often the reason the case is dangerous.",
  },
  {
    id: "posterior-canal-bppv",
    label: "Posterior canal BPPV",
    frame: "Triggered episodic vertigo",
    summary:
      "Brief, positional bursts of spinning after rolling in bed or looking upward, with latency, fatigue, and classic upbeating-torsional Dix-Hallpike nystagmus.",
    lesionRegion: "posterior-canal",
    tracePattern: "burst-decay",
    strongestLocalization:
      "Posterior semicircular canal canalithiasis within the peripheral labyrinth.",
    networkFrame:
      "Displaced otolith debris makes one canal falsely signal rotation only in certain head positions. The vestibular system is quiet between attacks, which is why the history matters as much as the eye movement.",
    dominantClue:
      "The syndrome is brief, triggered, and highly positional. The patient is usually comfortable between spells until you deliberately reproduce it.",
    weakerAlternative:
      "HINTS-style stroke reasoning is weaker because the patient does not have continuous acute vestibular syndrome. The higher-yield discriminator is a properly performed Dix-Hallpike maneuver.",
    headImpulse: "Usually normal between episodes and not the key test.",
    nystagmus:
      "Transient upbeating-torsional nystagmus after latency, with crescendo then fatigue on Dix-Hallpike.",
    skew: "Absent.",
    hintsScope:
      "HINTS is not the main tool here because the patient is not continuously dizzy between attacks.",
    durationLabel: "Seconds to under a minute once triggered.",
    durationHours: 0.02,
    recurrenceLabel: "Many brief bursts tied to bed rolls, extension, or head turns.",
    triggerContext:
      "Position change is the story: rolling in bed, lying back, or reaching upward.",
    hearingContext: "Hearing remains normal.",
    fixationSuppression: 84,
    centralRisk: 12,
    gaitBurden: 18,
    hearingShift: 4,
    gazeLeft: 12,
    gazePrimary: 6,
    gazeRight: 12,
    provocationRest: 4,
    provocationHeadTurn: 46,
    provocationPositional: 98,
    provocationVisualMotion: 22,
    bedsideTasks: [
      {
        label: "Dix-Hallpike",
        finding:
          "Latency, torsional upbeating nystagmus, and fatigue on repetition strongly support posterior canal BPPV.",
        implication:
          "This is the maneuver that settles the case more than a full stroke-style eye exam does.",
      },
      {
        label: "Between-spell exam",
        finding:
          "The patient is often nearly normal when not being positioned into the provoking plane.",
        implication:
          "That temporal dissociation is itself a localization clue toward a canal problem rather than continuous labyrinth or brainstem injury.",
      },
      {
        label: "Repositioning response",
        finding:
          "Symptoms improve after Epley-style canalith repositioning.",
        implication:
          "Therapeutic maneuver response is also mechanistic confirmation of canalithiasis.",
      },
    ],
    rehabSupports: [
      "Teach students to trust the history of brief positional bursts before over-ordering a stroke workup for every vertigo complaint.",
      "Use the provoking plane and the nystagmus direction to teach canal anatomy rather than reducing BPPV to a memorized bedside trick.",
      "After treatment, explain that recurrence can happen and that the ear is quiet between spells.",
    ],
    teachingPearl:
      "BPPV is a timing-and-trigger diagnosis first. Continuous dizziness at rest should push you away from this label.",
  },
  {
    id: "vestibular-migraine",
    label: "Vestibular migraine",
    frame: "Episodic central vestibular syndrome",
    summary:
      "Minutes-to-hours episodes of vertigo or motion intolerance with migraine features, visually triggered worsening, and a bedside exam that may look only mildly abnormal or even normal between attacks.",
    lesionRegion: "multisensory-network",
    tracePattern: "migraine-variable",
    strongestLocalization:
      "Distributed vestibular-migraine network involving brainstem, thalamic, and cortical multisensory integration rather than one single damaged ear or canal.",
    networkFrame:
      "The system becomes hypersensitive to motion, visual flow, and internal sensory conflict. Students should think network instability, not only fixed ear asymmetry.",
    dominantClue:
      "The strongest teaching clue is mismatch: the dizziness burden is real, but the exam is variable, visually loaded, and often accompanied by migraine traits rather than one stable peripheral pattern.",
    weakerAlternative:
      "Posterior stroke is weaker when the episodes recur, the exam is inconsistent between attacks, and there are no focal brainstem findings. Pure BPPV is weaker when visual motion and migraine history dominate more than Dix-Hallpike triggers do.",
    headImpulse: "Usually normal.",
    nystagmus:
      "Variable low-amplitude horizontal or torsional drift, sometimes absent outside the active episode.",
    skew: "Usually absent.",
    hintsScope:
      "HINTS is only useful if the patient is truly in continuous acute vestibular syndrome. It is not a catch-all migraine-versus-stroke shortcut.",
    durationLabel: "Typically minutes to hours, sometimes longer when migrainous sensitivity lingers.",
    durationHours: 6,
    recurrenceLabel: "Recurrent attacks separated by relatively better baseline periods.",
    triggerContext:
      "Visual motion, sleep disruption, stress, or head-motion conflict are common triggers.",
    hearingContext:
      "Hearing is usually preserved or only vaguely fluctuating, unlike a strong cochlear syndrome.",
    fixationSuppression: 48,
    centralRisk: 44,
    gaitBurden: 36,
    hearingShift: 18,
    gazeLeft: 38,
    gazePrimary: 32,
    gazeRight: 40,
    provocationRest: 34,
    provocationHeadTurn: 44,
    provocationPositional: 26,
    provocationVisualMotion: 88,
    bedsideTasks: [
      {
        label: "Migraine context",
        finding:
          "Photophobia, phonophobia, visual aura, or headache history often sharpens the syndrome more than the eye movements do.",
        implication:
          "This keeps the learner from forcing a weak ear-versus-stroke binary when the real frame is network sensitivity.",
      },
      {
        label: "Visual motion loading",
        finding:
          "Busy patterns, scrolling, supermarkets, or car rides provoke disproportionate symptoms.",
        implication:
          "Heavy visual-motion dependence is much more typical of vestibular migraine than of classic BPPV.",
      },
      {
        label: "Interictal exam",
        finding: "Between attacks, the bedside vestibular exam may be largely normal.",
        implication:
          "That variability should temper overconfidence in a fixed lesion model.",
      },
    ],
    rehabSupports: [
      "Explain that this is still a real vestibular complaint even if the exam is intermittently normal.",
      "Teach students to ask about photophobia, visual aura, headache timing, and motion-rich triggers before declaring the syndrome peripheral or psychogenic.",
      "Use environmental simplification and graded visual-motion exposure language when discussing recovery.",
    ],
    teachingPearl:
      "A visually loaded, episodic vertigo story with migraine features should make learners think multisensory network instability, not just ear debris or posterior stroke.",
  },
  {
    id: "meniere",
    label: "Meniere disease pattern",
    frame: "Episodic peripheral vertigo with cochlear load",
    summary:
      "Hours-long recurrent vertigo with fluctuating unilateral hearing loss, tinnitus, and aural fullness from inner-ear hydropic pressure instability.",
    lesionRegion: "labyrinth",
    tracePattern: "hydropic-fluctuation",
    strongestLocalization:
      "Inner-ear labyrinth with cochlear and vestibular involvement, rather than a pure vestibular-nerve syndrome.",
    networkFrame:
      "Pressure and ionic instability in the labyrinth distort both balance and hearing. The cochlear clues are therefore not side noise; they are part of the localization itself.",
    dominantClue:
      "The combination of episodic vertigo plus hearing fluctuation, tinnitus, and fullness is more localizing than any single eye-movement feature.",
    weakerAlternative:
      "Vestibular neuritis is weaker because hearing is no longer spared. Vestibular migraine is weaker when the cochlear symptoms are repetitive and clearly lateralized.",
    headImpulse:
      "Often normal between attacks, sometimes mildly peripheral-appearing during the spell.",
    nystagmus:
      "Usually unidirectional horizontal-torsional nystagmus during attacks, without central direction changes.",
    skew: "Absent.",
    hintsScope:
      "HINTS has limited value unless the patient is in a continuous acute vestibular syndrome at the time you examine them.",
    durationLabel: "Usually 20 minutes to several hours per attack.",
    durationHours: 4,
    recurrenceLabel: "Recurrent spells rather than one isolated attack.",
    triggerContext:
      "Often spontaneous rather than tightly positional, though head motion worsens the attack once it starts.",
    hearingContext:
      "Fluctuating unilateral hearing loss, tinnitus, and aural fullness are core localization clues.",
    fixationSuppression: 72,
    centralRisk: 24,
    gaitBurden: 44,
    hearingShift: 88,
    gazeLeft: 54,
    gazePrimary: 42,
    gazeRight: 30,
    provocationRest: 42,
    provocationHeadTurn: 58,
    provocationPositional: 18,
    provocationVisualMotion: 30,
    bedsideTasks: [
      {
        label: "Cochlear bedside screen",
        finding:
          "Finger-rub asymmetry or subjective muffling on the affected side supports labyrinthine rather than pure nerve imbalance.",
        implication:
          "Students should learn that hearing loss is not a side note here; it changes the localization.",
      },
      {
        label: "Attack timing",
        finding:
          "Spells last much longer than BPPV but recur more than typical neuritis.",
        implication:
          "That middle temporal band is one of the most useful pattern-recognition anchors.",
      },
      {
        label: "Aural symptoms",
        finding:
          "Tinnitus and fullness rise with the vertigo episodes.",
        implication:
          "The ear is declaring itself as the localization, not just supplying a generic dizziness symptom.",
      },
    ],
    rehabSupports: [
      "Teach learners to ask about ear fullness and hearing fluctuation every time they hear the word vertigo.",
      "Use the syndrome as a reminder that cochlear and vestibular clues can localize together to the same inner-ear process.",
      "When teaching recovery, separate the attack itself from the anticipatory motion sensitivity that can linger between spells.",
    ],
    teachingPearl:
      "Hearing symptoms rescue the localization. Vertigo plus tinnitus and fluctuating unilateral hearing loss is not just neuritis with extra complaints.",
  },
];
