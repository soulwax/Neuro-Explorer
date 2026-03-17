/**
 * Sleep Architecture Simulator
 *
 * Generates sleep hypnograms with realistic stage cycling,
 * EEG characteristics per stage, and clinical sleep disorder presets.
 */

export type SleepStage = "wake" | "N1" | "N2" | "N3" | "REM";

export interface SleepParams {
  /** Total recording time (hours) */
  totalTime: number;
  /** Sleep onset latency (minutes) */
  sleepOnsetLatency: number;
  /** REM latency from sleep onset (minutes) */
  remLatency: number;
  /** Fraction of sleep as slow-wave sleep (0–0.4) */
  swsFraction: number;
  /** Fraction of sleep as REM (0–0.4) */
  remFraction: number;
  /** Sleep efficiency (fraction of time in bed actually asleep, 0.5–1.0) */
  sleepEfficiency: number;
  /** Number of awakenings per night */
  awakenings: number;
  /** NREM cycle length (minutes) — typically 90 */
  cycleLength: number;
  /** Random seed for reproducibility */
  seed: number;
}

export interface SleepParamDefinition {
  key: keyof SleepParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface HypnogramPoint {
  /** Time from lights-out (minutes) */
  minute: number;
  stage: SleepStage;
  stageNumeric: number; // wake=5, REM=4, N1=3, N2=2, N3=1 (for plotting)
}

export interface SleepStageInfo {
  stage: SleepStage;
  label: string;
  eegPattern: string;
  frequency: string;
  amplitude: string;
  keyFeatures: string[];
  clinicalSignificance: string;
}

export interface SleepResult {
  params: SleepParams;
  hypnogram: HypnogramPoint[];
  stagePercentages: Record<SleepStage, number>;
  totalSleepTime: number; // minutes
  sleepEfficiency: number;
  sleepOnsetLatency: number;
  remLatency: number;
  numberOfCycles: number;
  waso: number; // wake after sleep onset (minutes)
  stageInfo: SleepStageInfo[];
  explanation: {
    model: string;
    normalArchitecture: string[];
    whatToNotice: string[];
    clinicalCorrelates: string[];
  };
}

export interface SleepPreset {
  id: string;
  label: string;
  description: string;
  params: Partial<SleepParams>;
  clinicalNotes: string[];
}

export const defaultSleepParams: SleepParams = {
  totalTime: 8,
  sleepOnsetLatency: 15,
  remLatency: 90,
  swsFraction: 0.2,
  remFraction: 0.22,
  sleepEfficiency: 0.9,
  awakenings: 2,
  cycleLength: 90,
  seed: 42,
};

export const sleepParamDefinitions: SleepParamDefinition[] = [
  {
    key: "totalTime",
    label: "Recording Time",
    unit: "hours",
    step: 0.5,
    min: 4,
    max: 12,
  },
  {
    key: "sleepOnsetLatency",
    label: "Sleep Onset Latency",
    unit: "min",
    step: 5,
    min: 0,
    max: 120,
  },
  {
    key: "remLatency",
    label: "REM Latency",
    unit: "min",
    step: 5,
    min: 10,
    max: 180,
  },
  {
    key: "swsFraction",
    label: "Slow-Wave Sleep Fraction",
    step: 0.02,
    min: 0,
    max: 0.4,
  },
  {
    key: "remFraction",
    label: "REM Fraction",
    step: 0.02,
    min: 0,
    max: 0.4,
  },
  {
    key: "sleepEfficiency",
    label: "Sleep Efficiency",
    step: 0.05,
    min: 0.5,
    max: 1.0,
  },
  {
    key: "awakenings",
    label: "Awakenings",
    step: 1,
    min: 0,
    max: 20,
  },
  {
    key: "cycleLength",
    label: "Cycle Length",
    unit: "min",
    step: 5,
    min: 60,
    max: 120,
  },
  {
    key: "seed",
    label: "Random Seed",
    step: 1,
    min: 1,
    max: 999,
  },
];

export const sleepPresets: SleepPreset[] = [
  {
    id: "normal-young",
    label: "Normal Young Adult",
    description:
      "Healthy 25-year-old: efficient sleep, good SWS, normal REM latency (~90 min)",
    params: {
      sleepOnsetLatency: 12,
      remLatency: 90,
      swsFraction: 0.22,
      remFraction: 0.23,
      sleepEfficiency: 0.93,
      awakenings: 1,
    },
    clinicalNotes: [
      "SWS predominates in the first third of the night",
      "REM periods lengthen toward morning",
      "4-5 complete NREM-REM cycles expected",
    ],
  },
  {
    id: "normal-elderly",
    label: "Normal Elderly",
    description:
      "Healthy 75-year-old: reduced SWS, more awakenings, lower efficiency",
    params: {
      sleepOnsetLatency: 25,
      remLatency: 85,
      swsFraction: 0.08,
      remFraction: 0.18,
      sleepEfficiency: 0.78,
      awakenings: 6,
    },
    clinicalNotes: [
      "Age-related decline in SWS is normal, not pathological",
      "Increased WASO (wake after sleep onset) is expected",
      "REM fraction decreases slightly but is relatively preserved",
    ],
  },
  {
    id: "narcolepsy",
    label: "Narcolepsy Type 1",
    description:
      "Dramatically shortened REM latency (sleep-onset REM periods), fragmented nocturnal sleep",
    params: {
      sleepOnsetLatency: 5,
      remLatency: 15,
      swsFraction: 0.15,
      remFraction: 0.28,
      sleepEfficiency: 0.75,
      awakenings: 8,
    },
    clinicalNotes: [
      "REM latency <15 min (SOREMPs) is the PSG hallmark",
      "Cataplexy is pathognomonic for Type 1 (orexin/hypocretin deficient)",
      "Nocturnal sleep is fragmented despite excessive daytime sleepiness",
      "MSLT shows mean sleep latency <8 min with ≥2 SOREMPs",
    ],
  },
  {
    id: "osa-severe",
    label: "Severe OSA",
    description:
      "Obstructive sleep apnea: fragmented architecture, reduced SWS and REM, frequent arousals",
    params: {
      sleepOnsetLatency: 8,
      remLatency: 120,
      swsFraction: 0.06,
      remFraction: 0.12,
      sleepEfficiency: 0.7,
      awakenings: 15,
    },
    clinicalNotes: [
      "Repetitive apneas cause cortical arousals that fragment sleep",
      "SWS and REM are both suppressed by recurrent arousals",
      "REM-predominant OSA: apneas worsen in REM due to atonia",
      "AHI >30/hr defines severe OSA",
    ],
  },
  {
    id: "depression",
    label: "Major Depression",
    description:
      "Shortened REM latency, increased REM density, reduced SWS, early morning awakening",
    params: {
      sleepOnsetLatency: 30,
      remLatency: 45,
      swsFraction: 0.1,
      remFraction: 0.28,
      sleepEfficiency: 0.75,
      awakenings: 4,
      totalTime: 6,
    },
    clinicalNotes: [
      "Shortened REM latency is a biological marker of depression",
      "Increased REM percentage and REM density (more eye movements per REM epoch)",
      "Reduced SWS and early morning awakening are classic features",
      "Sleep deprivation (especially REM deprivation) has acute antidepressant effects",
    ],
  },
  {
    id: "insomnia",
    label: "Chronic Insomnia",
    description:
      "Prolonged sleep onset, low efficiency, increased stage N1, frequent transitions",
    params: {
      sleepOnsetLatency: 55,
      remLatency: 100,
      swsFraction: 0.14,
      remFraction: 0.18,
      sleepEfficiency: 0.65,
      awakenings: 5,
    },
    clinicalNotes: [
      "SOL >30 min and/or SE <85% define insomnia on PSG",
      "Increased N1 and transitions reflect hyperarousal",
      "Paradoxical insomnia: subjective complaint exceeds objective findings",
      "CBT-I is first-line treatment, not hypnotics",
    ],
  },
  {
    id: "rem-behavior",
    label: "REM Sleep Behavior Disorder",
    description:
      "Normal architecture except loss of REM atonia — acts out dreams, alpha-synuclein prodrome",
    params: {
      sleepOnsetLatency: 15,
      remLatency: 85,
      swsFraction: 0.18,
      remFraction: 0.22,
      sleepEfficiency: 0.85,
      awakenings: 3,
    },
    clinicalNotes: [
      "PSG shows REM without atonia (RSWA) — EMG activity during REM",
      "Dream enactment behavior: punching, kicking, running during REM",
      ">80% of idiopathic RBD convert to alpha-synucleinopathy (PD, DLB, MSA) within 10-15 years",
      "RBD is the strongest prodromal marker for Parkinson disease",
    ],
  },
  {
    id: "fatal-insomnia",
    label: "Fatal Familial Insomnia",
    description:
      "Prion disease destroying thalamic sleep nuclei: progressive total insomnia, absent SWS and spindles",
    params: {
      sleepOnsetLatency: 90,
      remLatency: 30,
      swsFraction: 0.0,
      remFraction: 0.08,
      sleepEfficiency: 0.3,
      awakenings: 20,
      totalTime: 8,
    },
    clinicalNotes: [
      "Selective thalamic (anterior + dorsomedial) degeneration",
      "Complete loss of sleep spindles and SWS",
      "Autonomic storms, myoclonus, and progressive cognitive decline",
      "Demonstrates the critical role of thalamus in generating sleep architecture",
    ],
  },
];

export const sleepStageInfo: SleepStageInfo[] = [
  {
    stage: "wake",
    label: "Wake",
    eegPattern: "Low amplitude, mixed frequency; posterior alpha rhythm when eyes closed",
    frequency: "Alpha (8–13 Hz) with eyes closed; beta (>13 Hz) with eyes open",
    amplitude: "Low (10–30 µV)",
    keyFeatures: [
      "Posterior dominant alpha rhythm attenuates with eye opening",
      "Eye blinks and rapid eye movements",
      "High chin EMG tone",
    ],
    clinicalSignificance:
      "Excessive wake in a sleep study (low sleep efficiency) suggests insomnia or environmental disruption.",
  },
  {
    stage: "N1",
    label: "Stage N1 (Light Sleep)",
    eegPattern: "Theta waves, vertex sharp waves, slow eye movements",
    frequency: "Theta (4–7 Hz)",
    amplitude: "Low–medium (30–50 µV)",
    keyFeatures: [
      "Alpha dropout — posterior alpha rhythm disappears",
      "Vertex sharp transients (central Cz maximal)",
      "Slow rolling eye movements",
      "Hypnic jerks may occur at the N1 transition",
    ],
    clinicalSignificance:
      "Prolonged or excessive N1 indicates fragmented sleep. MSLT uses N1 for sleep onset scoring.",
  },
  {
    stage: "N2",
    label: "Stage N2 (Established Sleep)",
    eegPattern: "Sleep spindles (12–14 Hz bursts) and K-complexes on a theta background",
    frequency: "Theta with spindle bursts (12–14 Hz, 0.5–2 s duration)",
    amplitude: "Medium (50–75 µV; K-complexes >75 µV)",
    keyFeatures: [
      "Sleep spindles: thalamocortical 12–14 Hz oscillations, >0.5 s",
      "K-complexes: sharp negative wave followed by positive component, >0.5 s",
      "K-complexes can be evoked by auditory stimuli",
      "N2 comprises ~50% of total sleep in normal adults",
    ],
    clinicalSignificance:
      "Spindle absence suggests thalamic pathology. K-complexes represent cortical arousal gating.",
  },
  {
    stage: "N3",
    label: "Stage N3 (Slow-Wave Sleep / Deep Sleep)",
    eegPattern: "High-amplitude delta waves (≥75 µV, 0.5–2 Hz) in >20% of epoch",
    frequency: "Delta (0.5–2 Hz)",
    amplitude: "High (75–200+ µV)",
    keyFeatures: [
      "Frontal predominance of delta waves",
      "Very difficult to arouse — high arousal threshold",
      "Predominates in the first third of the night",
      "Growth hormone secretion peaks during SWS",
      "Decreases with age (most dramatic change in sleep across lifespan)",
    ],
    clinicalSignificance:
      "SWS is critical for memory consolidation, immune function, and metabolic clearance (glymphatic system). Reduced SWS correlates with cognitive decline.",
  },
  {
    stage: "REM",
    label: "REM Sleep",
    eegPattern: "Low amplitude, mixed frequency (similar to wake); sawtooth waves",
    frequency: "Mixed (theta, beta); sawtooth waves at 2–6 Hz",
    amplitude: "Low (10–30 µV)",
    keyFeatures: [
      "Rapid eye movements (conjugate, irregular bursts)",
      "Skeletal muscle atonia (except diaphragm and extraocular muscles)",
      "Sawtooth waves (frontocentral, 2–6 Hz) preceding eye movement bursts",
      "Heart rate and breathing are irregular",
      "Dreaming occurs predominantly in REM",
      "REM periods lengthen across the night (longest near morning)",
    ],
    clinicalSignificance:
      "REM latency <15 min: narcolepsy or depression. REM without atonia: RBD (alpha-synuclein prodrome). REM suppression: most antidepressants.",
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sanitizeSleepParams(params: SleepParams): SleepParams {
  return {
    totalTime: clamp(params.totalTime, 4, 12),
    sleepOnsetLatency: clamp(params.sleepOnsetLatency, 0, 120),
    remLatency: clamp(params.remLatency, 10, 180),
    swsFraction: clamp(params.swsFraction, 0, 0.4),
    remFraction: clamp(params.remFraction, 0, 0.4),
    sleepEfficiency: clamp(params.sleepEfficiency, 0.3, 1.0),
    awakenings: clamp(Math.round(params.awakenings), 0, 20),
    cycleLength: clamp(params.cycleLength, 60, 120),
    seed: Math.round(clamp(params.seed, 1, 999)),
  };
}

export function simulateSleep(input: SleepParams): SleepResult {
  const params = sanitizeSleepParams(input);
  const {
    totalTime,
    sleepOnsetLatency,
    remLatency,
    swsFraction,
    remFraction,
    sleepEfficiency,
    awakenings,
    cycleLength,
    seed,
  } = params;

  const rand = mulberry32(seed);
  const totalMinutes = totalTime * 60;
  const hypnogram: HypnogramPoint[] = [];

  // Helper to push a stage for a range of minutes
  function pushStage(start: number, end: number, stage: SleepStage) {
    const numericMap: Record<SleepStage, number> = {
      wake: 5,
      REM: 4,
      N1: 3,
      N2: 2,
      N3: 1,
    };
    for (let m = Math.round(start); m < Math.round(end) && m < totalMinutes; m++) {
      hypnogram.push({
        minute: m,
        stage,
        stageNumeric: numericMap[stage],
      });
    }
  }

  // Phase 1: Wake before sleep onset
  pushStage(0, Math.min(sleepOnsetLatency, totalMinutes), "wake");

  if (sleepOnsetLatency >= totalMinutes) {
    // Never falls asleep
    return buildResult(params, hypnogram, totalMinutes);
  }

  const sleepStart = sleepOnsetLatency;
  const availableSleepTime = (totalMinutes - sleepStart) * sleepEfficiency;
  const numberOfCycles = Math.max(
    1,
    Math.round(availableSleepTime / cycleLength),
  );

  // Distribute SWS and REM across cycles
  // SWS is front-loaded, REM is back-loaded
  const swsTotalMin = availableSleepTime * swsFraction;
  const remTotalMin = availableSleepTime * remFraction;
  const n2TotalMin =
    availableSleepTime - swsTotalMin - remTotalMin - numberOfCycles * 5; // 5 min N1 per cycle

  // Per-cycle SWS: decreasing across the night
  const swsPerCycle: number[] = [];
  const remPerCycle: number[] = [];
  let swsWeightSum = 0;
  let remWeightSum = 0;
  for (let c = 0; c < numberOfCycles; c++) {
    const swsW = Math.max(0, numberOfCycles - c);
    const remW = c + 1;
    swsPerCycle.push(swsW);
    remPerCycle.push(remW);
    swsWeightSum += swsW;
    remWeightSum += remW;
  }

  // Normalize
  for (let c = 0; c < numberOfCycles; c++) {
    swsPerCycle[c] = swsWeightSum > 0
      ? (swsPerCycle[c]! / swsWeightSum) * swsTotalMin
      : 0;
    remPerCycle[c] = remWeightSum > 0
      ? (remPerCycle[c]! / remWeightSum) * remTotalMin
      : 0;
  }

  // Distribute awakenings randomly across cycles (but not the first)
  const wakeMinutes = new Set<number>();
  const wasoTarget = (totalMinutes - sleepStart) * (1 - sleepEfficiency);
  const wasoPerAwakening = awakenings > 0 ? wasoTarget / awakenings : 0;

  const awakeningCycles: number[] = [];
  for (let i = 0; i < awakenings; i++) {
    const cycle = Math.min(
      numberOfCycles - 1,
      Math.floor(rand() * numberOfCycles),
    );
    awakeningCycles.push(cycle);
  }

  // Build hypnogram cycle by cycle
  let currentMin = sleepStart;

  for (let c = 0; c < numberOfCycles; c++) {
    if (currentMin >= totalMinutes) break;

    const swsDur = swsPerCycle[c]!;
    const remDur = remPerCycle[c]!;
    const n1Dur = 5 + rand() * 3; // 5-8 min N1
    const n2Dur = Math.max(
      5,
      cycleLength - n1Dur - swsDur - remDur,
    );

    // N1 transition
    const n1End = Math.min(currentMin + n1Dur, totalMinutes);
    pushStage(currentMin, n1End, "N1");
    currentMin = n1End;

    // N2
    const n2End = Math.min(currentMin + n2Dur * 0.6, totalMinutes);
    pushStage(currentMin, n2End, "N2");
    currentMin = n2End;

    // N3 (SWS) — skip or reduce in later cycles
    if (swsDur > 1) {
      const n3End = Math.min(currentMin + swsDur, totalMinutes);
      pushStage(currentMin, n3End, "N3");
      currentMin = n3End;
    }

    // N2 again (ascending from N3)
    const n2bEnd = Math.min(currentMin + n2Dur * 0.4, totalMinutes);
    pushStage(currentMin, n2bEnd, "N2");
    currentMin = n2bEnd;

    // REM — only if past REM latency from sleep onset
    const timeSinceSleepOnset = currentMin - sleepStart;
    if (timeSinceSleepOnset >= remLatency && remDur > 1) {
      const remEnd = Math.min(currentMin + remDur, totalMinutes);
      pushStage(currentMin, remEnd, "REM");
      currentMin = remEnd;
    } else if (remDur > 1) {
      // Before REM latency, replace REM with N2
      const n2cEnd = Math.min(currentMin + remDur, totalMinutes);
      pushStage(currentMin, n2cEnd, "N2");
      currentMin = n2cEnd;
    }

    // Awakening in this cycle?
    const awakCount = awakeningCycles.filter((ac) => ac === c).length;
    if (awakCount > 0 && currentMin < totalMinutes) {
      const wakeDur = Math.max(1, wasoPerAwakening * awakCount);
      const wakeEnd = Math.min(currentMin + wakeDur, totalMinutes);
      pushStage(currentMin, wakeEnd, "wake");
      currentMin = wakeEnd;
    }
  }

  // Fill remaining time
  if (currentMin < totalMinutes) {
    pushStage(currentMin, totalMinutes, "wake");
  }

  return buildResult(params, hypnogram, totalMinutes);
}

function buildResult(
  params: SleepParams,
  hypnogram: HypnogramPoint[],
  totalMinutes: number,
): SleepResult {
  // Compute stage percentages
  const counts: Record<SleepStage, number> = {
    wake: 0,
    N1: 0,
    N2: 0,
    N3: 0,
    REM: 0,
  };
  for (const point of hypnogram) {
    counts[point.stage]++;
  }

  const totalSleepTime = totalMinutes - counts.wake;
  const percentages: Record<SleepStage, number> = {
    wake: 0,
    N1: 0,
    N2: 0,
    N3: 0,
    REM: 0,
  };
  for (const stage of Object.keys(counts) as SleepStage[]) {
    percentages[stage] =
      totalMinutes > 0
        ? Math.round((counts[stage] / totalMinutes) * 1000) / 10
        : 0;
  }

  // Find actual REM latency
  const sleepStart = params.sleepOnsetLatency;
  let actualRemLatency = 0;
  for (const point of hypnogram) {
    if (point.minute >= sleepStart && point.stage === "REM") {
      actualRemLatency = point.minute - sleepStart;
      break;
    }
  }

  // Count cycles (N3→REM or N2→REM transitions)
  let numberOfCycles = 0;
  for (let i = 1; i < hypnogram.length; i++) {
    if (
      hypnogram[i]!.stage === "REM" &&
      hypnogram[i - 1]!.stage !== "REM" &&
      hypnogram[i - 1]!.stage !== "wake"
    ) {
      numberOfCycles++;
    }
  }

  // WASO
  let waso = 0;
  let pastSleepOnset = false;
  for (const point of hypnogram) {
    if (!pastSleepOnset && point.stage !== "wake") {
      pastSleepOnset = true;
    }
    if (pastSleepOnset && point.stage === "wake") {
      waso++;
    }
  }

  const actualEfficiency =
    totalMinutes > 0 ? Math.round((totalSleepTime / totalMinutes) * 100) / 100 : 0;

  return {
    params,
    hypnogram,
    stagePercentages: percentages,
    totalSleepTime,
    sleepEfficiency: actualEfficiency,
    sleepOnsetLatency: params.sleepOnsetLatency,
    remLatency: actualRemLatency,
    numberOfCycles,
    waso,
    stageInfo: sleepStageInfo,
    explanation: {
      model: "Cyclic alternating sleep architecture model",
      normalArchitecture: [
        "Normal adult sleep cycles through NREM (N1→N2→N3) and REM in ~90-minute cycles, 4-5 per night.",
        "SWS (N3) predominates in the first third of the night — this is when growth hormone peaks.",
        "REM periods lengthen across the night — the longest REM period is typically just before waking.",
        "N2 comprises ~50% of total sleep time, N3 ~20%, REM ~22%, N1 ~5%.",
        "Sleep efficiency >85% is considered normal. SOL <30 min is normal.",
      ],
      whatToNotice: [
        `Total sleep time: ${totalSleepTime} min (${(totalSleepTime / 60).toFixed(1)} hours).`,
        `Sleep efficiency: ${(actualEfficiency * 100).toFixed(0)}%${actualEfficiency < 0.85 ? " (reduced)" : " (normal)"}.`,
        actualRemLatency > 0
          ? `REM latency: ${actualRemLatency} min${actualRemLatency < 30 ? " (SHORT — consider narcolepsy or depression)" : actualRemLatency > 120 ? " (prolonged)" : " (normal range)"}.`
          : "No REM detected in this recording.",
        `${numberOfCycles} NREM-REM cycles detected.`,
        `WASO: ${waso} min${waso > 30 ? " (elevated — sleep fragmentation)" : ""}.`,
      ],
      clinicalCorrelates: [
        "Short REM latency (<15 min): narcolepsy (SOREMPs), depression, medication withdrawal",
        "Reduced SWS: aging (normal), depression, OSA, fibromyalgia, chronic pain",
        "Increased awakenings: OSA, PLMS, pain, anxiety, environmental factors",
        "Low sleep efficiency: insomnia (psychophysiologic, paradoxical), poor sleep hygiene",
        "REM without atonia: REM sleep behavior disorder → alpha-synucleinopathy prodrome",
      ],
    },
  };
}
