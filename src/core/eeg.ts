/* ------------------------------------------------------------------ */
/*  EEG / Neural Oscillations – pure simulation engine                */
/* ------------------------------------------------------------------ */

export const eegChannelNames = [
  'Fp1', 'Fp2',
  'F7', 'F3', 'Fz', 'F4', 'F8',
  'T3', 'C3', 'Cz', 'C4', 'T4',
  'T5', 'P3', 'Pz', 'P4', 'T6',
  'O1', 'O2',
] as const;

export type EEGChannelName = (typeof eegChannelNames)[number];

export type EEGBand = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export const eegBands: Record<EEGBand, { lo: number; hi: number; label: string }> = {
  delta: { lo: 0.5, hi: 4, label: 'Delta (0.5–4 Hz)' },
  theta: { lo: 4, hi: 8, label: 'Theta (4–8 Hz)' },
  alpha: { lo: 8, hi: 13, label: 'Alpha (8–13 Hz)' },
  beta:  { lo: 13, hi: 30, label: 'Beta (13–30 Hz)' },
  gamma: { lo: 30, hi: 50, label: 'Gamma (30–50 Hz)' },
};

/* ---- Spatial weighting: each channel's relative gain per band ---- */

type BandWeights = Record<EEGBand, number>;

/**
 * Approximate topographic distribution of normal awake EEG power.
 * Values are relative amplitude multipliers (not absolute µV).
 */
const channelBandWeights: Record<EEGChannelName, BandWeights> = {
  // Frontal polar – low-amplitude mixed, muscle artifact territory
  Fp1: { delta: 0.3, theta: 0.25, alpha: 0.15, beta: 0.5, gamma: 0.2 },
  Fp2: { delta: 0.3, theta: 0.25, alpha: 0.15, beta: 0.5, gamma: 0.2 },
  // Lateral frontal
  F7:  { delta: 0.3, theta: 0.35, alpha: 0.2, beta: 0.4, gamma: 0.15 },
  F3:  { delta: 0.25, theta: 0.3, alpha: 0.25, beta: 0.45, gamma: 0.15 },
  Fz:  { delta: 0.25, theta: 0.3, alpha: 0.25, beta: 0.5, gamma: 0.15 },
  F4:  { delta: 0.25, theta: 0.3, alpha: 0.25, beta: 0.45, gamma: 0.15 },
  F8:  { delta: 0.3, theta: 0.35, alpha: 0.2, beta: 0.4, gamma: 0.15 },
  // Temporal
  T3:  { delta: 0.35, theta: 0.4, alpha: 0.2, beta: 0.3, gamma: 0.1 },
  T4:  { delta: 0.35, theta: 0.4, alpha: 0.2, beta: 0.3, gamma: 0.1 },
  T5:  { delta: 0.3, theta: 0.35, alpha: 0.5, beta: 0.2, gamma: 0.1 },
  T6:  { delta: 0.3, theta: 0.35, alpha: 0.5, beta: 0.2, gamma: 0.1 },
  // Central
  C3:  { delta: 0.2, theta: 0.25, alpha: 0.35, beta: 0.45, gamma: 0.15 },
  Cz:  { delta: 0.2, theta: 0.25, alpha: 0.3, beta: 0.45, gamma: 0.15 },
  C4:  { delta: 0.2, theta: 0.25, alpha: 0.35, beta: 0.45, gamma: 0.15 },
  // Parietal
  P3:  { delta: 0.2, theta: 0.25, alpha: 0.7, beta: 0.3, gamma: 0.1 },
  Pz:  { delta: 0.2, theta: 0.25, alpha: 0.65, beta: 0.3, gamma: 0.1 },
  P4:  { delta: 0.2, theta: 0.25, alpha: 0.7, beta: 0.3, gamma: 0.1 },
  // Occipital – alpha dominant territory
  O1:  { delta: 0.2, theta: 0.2, alpha: 1.0, beta: 0.2, gamma: 0.08 },
  O2:  { delta: 0.2, theta: 0.2, alpha: 1.0, beta: 0.2, gamma: 0.08 },
};

/* ---- Parameters ---- */

export interface EEGParams {
  durationSec: number;
  samplingRate: number;
  /** Amplitude scale for each band (µV) */
  deltaAmp: number;
  thetaAmp: number;
  alphaAmp: number;
  betaAmp: number;
  gammaAmp: number;
  /** Alpha reactivity: fraction of alpha suppressed (0 = eyes closed, 1 = eyes open full suppression) */
  alphaReactivity: number;
  /** Focal slowing region */
  focalSlowing: 'none' | 'left-temporal' | 'right-temporal' | 'left-frontal' | 'right-frontal';
  focalSlowingStrength: number;
  /** Epileptiform pattern */
  epileptiform: 'none' | 'left-temporal-spikes' | 'right-temporal-spikes' | 'generalized-spike-wave' | 'burst-suppression';
  epileptiformRate: number;
  /** Asymmetry index: -1 = left suppressed, 0 = symmetric, +1 = right suppressed */
  asymmetry: number;
  /** Noise floor (µV) */
  noise: number;
  /** Muscle artifact (µV, frontal-weighted) */
  muscleArtifact: number;
  /** Random seed for reproducibility */
  seed: number;
}

export interface EEGParamDefinition {
  key: keyof EEGParams;
  label: string;
  unit?: string;
  step: number;
  min: number;
  max: number;
}

export interface EEGControlGroup {
  id: string;
  label: string;
  description: string;
  keys: ReadonlyArray<keyof EEGParams>;
}

export interface EEGPreset {
  id: string;
  label: string;
  description: string;
  clinicalContext: string;
  params: EEGParams;
}

export interface EEGPoint {
  t: number;
  uv: number;
}

export interface EEGBandPower {
  band: EEGBand;
  power: number;
}

export interface EEGChannelResult {
  channel: EEGChannelName;
  timeSeries: EEGPoint[];
  bandPowers: EEGBandPower[];
}

export interface EEGResult {
  params: EEGParams;
  channels: EEGChannelResult[];
  dominantFrequency: number;
  dominantBand: EEGBand;
  interpretation: {
    pattern: string;
    notes: string[];
  };
}

/* ---- Defaults ---- */

export const defaultEEGParams: EEGParams = {
  durationSec: 4,
  samplingRate: 256,
  deltaAmp: 20,
  thetaAmp: 10,
  alphaAmp: 40,
  betaAmp: 8,
  gammaAmp: 3,
  alphaReactivity: 0,
  focalSlowing: 'none',
  focalSlowingStrength: 0.5,
  epileptiform: 'none',
  epileptiformRate: 0.4,
  asymmetry: 0,
  noise: 3,
  muscleArtifact: 0,
  seed: 42,
};

export const eegParamDefinitions: EEGParamDefinition[] = [
  { key: 'durationSec', label: 'Duration', unit: 's', step: 1, min: 1, max: 10 },
  { key: 'samplingRate', label: 'Sampling Rate', unit: 'Hz', step: 64, min: 128, max: 512 },
  { key: 'deltaAmp', label: 'Delta Amplitude', unit: 'µV', step: 2, min: 0, max: 200 },
  { key: 'thetaAmp', label: 'Theta Amplitude', unit: 'µV', step: 2, min: 0, max: 100 },
  { key: 'alphaAmp', label: 'Alpha Amplitude', unit: 'µV', step: 2, min: 0, max: 100 },
  { key: 'betaAmp', label: 'Beta Amplitude', unit: 'µV', step: 1, min: 0, max: 50 },
  { key: 'gammaAmp', label: 'Gamma Amplitude', unit: 'µV', step: 1, min: 0, max: 30 },
  { key: 'alphaReactivity', label: 'Alpha Reactivity', step: 0.1, min: 0, max: 1 },
  { key: 'focalSlowingStrength', label: 'Focal Slowing', step: 0.1, min: 0, max: 1 },
  { key: 'epileptiformRate', label: 'Epileptiform Rate', step: 0.05, min: 0, max: 1 },
  { key: 'asymmetry', label: 'Asymmetry (L−R)', step: 0.05, min: -1, max: 1 },
  { key: 'noise', label: 'Noise', unit: 'µV', step: 0.5, min: 0, max: 20 },
  { key: 'muscleArtifact', label: 'Muscle Artifact', unit: 'µV', step: 1, min: 0, max: 30 },
  { key: 'seed', label: 'Random Seed', step: 1, min: 1, max: 9999 },
];

export const eegControlGroups: EEGControlGroup[] = [
  {
    id: 'recording',
    label: 'Recording',
    description: 'Duration and sampling parameters',
    keys: ['durationSec', 'samplingRate'],
  },
  {
    id: 'bands',
    label: 'Band Amplitudes',
    description: 'Baseline power in each frequency band',
    keys: ['deltaAmp', 'thetaAmp', 'alphaAmp', 'betaAmp', 'gammaAmp'],
  },
  {
    id: 'modifiers',
    label: 'Clinical Modifiers',
    description: 'Reactivity, focal changes, and epileptiform patterns',
    keys: ['alphaReactivity', 'focalSlowingStrength', 'epileptiformRate', 'asymmetry'],
  },
  {
    id: 'artifacts',
    label: 'Artifacts & Noise',
    description: 'Background noise and muscle contamination',
    keys: ['noise', 'muscleArtifact', 'seed'],
  },
];

/* ---- Presets ---- */

export const eegPresets: EEGPreset[] = [
  {
    id: 'normal-awake',
    label: 'Normal Awake (Eyes Closed)',
    description: 'Posterior-dominant 10 Hz alpha rhythm, low-amplitude frontal beta. The healthy resting EEG.',
    clinicalContext: 'This is the reference pattern. Alpha should be symmetric, reactive, and maximal over occipital regions.',
    params: { ...defaultEEGParams },
  },
  {
    id: 'eyes-open',
    label: 'Normal Awake (Eyes Open)',
    description: 'Alpha suppression with desynchronized low-amplitude mixed activity.',
    clinicalContext: 'Alpha reactivity is a key normal finding. Failure of alpha to attenuate with eye opening (Bancaud phenomenon) can indicate posterior cortical dysfunction.',
    params: { ...defaultEEGParams, alphaReactivity: 0.85, betaAmp: 12 },
  },
  {
    id: 'drowsiness',
    label: 'Drowsiness (Stage N1)',
    description: 'Alpha dropout with increased theta. Slow lateral eye movements appear clinically but are not modeled here.',
    clinicalContext: 'Drowsiness is the most common cause of theta on a routine EEG. Do not over-read drowsy theta as pathological slowing.',
    params: { ...defaultEEGParams, alphaAmp: 12, thetaAmp: 28, betaAmp: 5 },
  },
  {
    id: 'stage-2',
    label: 'Stage N2 Sleep',
    description: 'Sleep spindles (12–14 Hz sigma bursts) and K-complexes. Vertex sharp transients.',
    clinicalContext: 'Sleep spindles are generated by thalamic reticular nucleus–thalamocortical loops. Absent spindles can indicate thalamic pathology.',
    params: { ...defaultEEGParams, alphaAmp: 5, thetaAmp: 20, deltaAmp: 35, betaAmp: 15 },
  },
  {
    id: 'deep-sleep',
    label: 'Deep Sleep (Stage N3)',
    description: 'High-amplitude delta waves (>75 µV) dominating >20% of the epoch.',
    clinicalContext: 'Slow-wave sleep reflects healthy thalamocortical oscillation. Pathological delta looks different: it is continuous, unreactive, and often asymmetric.',
    params: { ...defaultEEGParams, deltaAmp: 120, thetaAmp: 15, alphaAmp: 3, betaAmp: 2, gammaAmp: 1 },
  },
  {
    id: 'focal-temporal-slowing',
    label: 'Left Temporal Slowing',
    description: 'Focal delta/theta over the left temporal region with preserved contralateral background.',
    clinicalContext: 'Focal slowing indicates regional cortical or subcortical dysfunction. Does not distinguish tumor from stroke from infection — the pattern localizes, not the etiology.',
    params: { ...defaultEEGParams, focalSlowing: 'left-temporal', focalSlowingStrength: 0.7, deltaAmp: 25, thetaAmp: 15 },
  },
  {
    id: 'left-temporal-spikes',
    label: 'Left Temporal Spikes',
    description: 'Epileptiform sharp waves over the left temporal chain (F7-T3-T5) with phase reversal.',
    clinicalContext: 'Temporal spikes are the most common interictal epileptiform discharge in adults. Left temporal spikes with the right clinical history strongly support temporal lobe epilepsy.',
    params: { ...defaultEEGParams, epileptiform: 'left-temporal-spikes', epileptiformRate: 0.35, alphaAmp: 30, thetaAmp: 12 },
  },
  {
    id: 'generalized-spike-wave',
    label: 'Generalized 3 Hz Spike-and-Wave',
    description: 'Bilateral synchronous 3 Hz spike-wave complexes, the hallmark of absence epilepsy.',
    clinicalContext: 'Generalized 3 Hz spike-and-wave is the classic pattern of childhood absence epilepsy. The discharges are generated by thalamocortical circuits and are exquisitely sensitive to hyperventilation.',
    params: { ...defaultEEGParams, epileptiform: 'generalized-spike-wave', epileptiformRate: 0.8, alphaAmp: 10, deltaAmp: 15, thetaAmp: 8 },
  },
  {
    id: 'burst-suppression',
    label: 'Burst Suppression',
    description: 'Alternating high-amplitude bursts and periods of marked attenuation (<10 µV).',
    clinicalContext: 'Burst suppression indicates severe diffuse cortical dysfunction — anoxic injury, deep anesthesia, or severe metabolic encephalopathy. The burst-suppression ratio correlates with depth of suppression.',
    params: { ...defaultEEGParams, epileptiform: 'burst-suppression', epileptiformRate: 0.3, deltaAmp: 80, thetaAmp: 5, alphaAmp: 2, betaAmp: 2, gammaAmp: 1 },
  },
  {
    id: 'encephalopathy',
    label: 'Diffuse Encephalopathy',
    description: 'Generalized slowing with loss of the posterior dominant rhythm. Theta-delta gradient replaces alpha.',
    clinicalContext: 'The degree of background slowing roughly correlates with the severity of encephalopathy. The absence of reactivity (to stimulation) is a more ominous sign than slowing alone.',
    params: { ...defaultEEGParams, deltaAmp: 60, thetaAmp: 35, alphaAmp: 5, betaAmp: 3, gammaAmp: 1, noise: 4 },
  },
];

/* ---- Simple seeded PRNG (mulberry32) ---- */

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianRandom(rng: () => number): number {
  const u1 = rng() || 1e-10;
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/* ---- Focal slowing channel membership ---- */

const focalGroups: Record<string, EEGChannelName[]> = {
  'left-temporal':  ['F7', 'T3', 'T5'],
  'right-temporal': ['F8', 'T4', 'T6'],
  'left-frontal':   ['Fp1', 'F3', 'F7'],
  'right-frontal':  ['Fp2', 'F4', 'F8'],
};

const leftChannels: EEGChannelName[] = ['Fp1', 'F7', 'F3', 'T3', 'C3', 'T5', 'P3', 'O1'];
const rightChannels: EEGChannelName[] = ['Fp2', 'F8', 'F4', 'T4', 'C4', 'T6', 'P4', 'O2'];

const epileptiformChannels: Record<string, EEGChannelName[]> = {
  'left-temporal-spikes':  ['F7', 'T3', 'T5'],
  'right-temporal-spikes': ['F8', 'T4', 'T6'],
};

const frontalChannels: EEGChannelName[] = ['Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8'];

/* ---- Clamp helper ---- */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/* ---- Sanitize ---- */

export function sanitizeEEGParams(params: EEGParams): EEGParams {
  return {
    durationSec: clamp(params.durationSec, 1, 10),
    samplingRate: clamp(params.samplingRate, 128, 512),
    deltaAmp: clamp(params.deltaAmp, 0, 200),
    thetaAmp: clamp(params.thetaAmp, 0, 100),
    alphaAmp: clamp(params.alphaAmp, 0, 100),
    betaAmp: clamp(params.betaAmp, 0, 50),
    gammaAmp: clamp(params.gammaAmp, 0, 30),
    alphaReactivity: clamp(params.alphaReactivity, 0, 1),
    focalSlowing: params.focalSlowing,
    focalSlowingStrength: clamp(params.focalSlowingStrength, 0, 1),
    epileptiform: params.epileptiform,
    epileptiformRate: clamp(params.epileptiformRate, 0, 1),
    asymmetry: clamp(params.asymmetry, -1, 1),
    noise: clamp(params.noise, 0, 20),
    muscleArtifact: clamp(params.muscleArtifact, 0, 30),
    seed: Math.floor(clamp(params.seed, 1, 9999)),
  };
}

/* ---- Simulation ---- */

export function simulateEEG(input: EEGParams): EEGResult {
  const params = sanitizeEEGParams(input);
  const rng = mulberry32(params.seed);
  const sampleCount = Math.floor(params.durationSec * params.samplingRate);
  const dt = 1 / params.samplingRate;

  const bandKeys: EEGBand[] = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
  const bandAmps: Record<EEGBand, number> = {
    delta: params.deltaAmp,
    theta: params.thetaAmp,
    alpha: params.alphaAmp * (1 - params.alphaReactivity),
    beta: params.betaAmp,
    gamma: params.gammaAmp,
  };

  // Pre-generate random phase offsets per channel per band
  const phaseOffsets: Record<string, Record<EEGBand, number>> = {};
  for (const ch of eegChannelNames) {
    phaseOffsets[ch] = {} as Record<EEGBand, number>;
    for (const band of bandKeys) {
      phaseOffsets[ch]![band] = rng() * 2 * Math.PI;
    }
  }

  // Pre-generate epileptiform spike times
  const spikeTimesSet = new Set<number>();
  if (params.epileptiform !== 'none' && params.epileptiform !== 'burst-suppression') {
    const avgInterval = params.samplingRate / Math.max(0.05, params.epileptiformRate);
    let nextSpike = Math.floor(rng() * avgInterval);
    while (nextSpike < sampleCount) {
      spikeTimesSet.add(nextSpike);
      // Also mark a few samples around the spike for the sharp-wave morphology
      for (let offset = 1; offset <= 3; offset++) {
        if (nextSpike + offset < sampleCount) spikeTimesSet.add(nextSpike + offset);
      }
      nextSpike += Math.floor(avgInterval * (0.6 + rng() * 0.8));
    }
  }

  // Burst suppression pattern
  let burstMask: Float64Array | null = null;
  if (params.epileptiform === 'burst-suppression') {
    burstMask = new Float64Array(sampleCount);
    const burstLenSamples = Math.floor(0.8 * params.samplingRate);  // ~800ms bursts
    const suppressLenSamples = Math.floor(2.5 * params.samplingRate); // ~2.5s suppression
    const cycleSamples = burstLenSamples + suppressLenSamples;
    const burstRatio = params.epileptiformRate; // higher = more burst, less suppression
    const adjustedBurstLen = Math.floor(cycleSamples * clamp(burstRatio, 0.1, 0.7));

    for (let i = 0; i < sampleCount; i++) {
      const posInCycle = i % cycleSamples;
      if (posInCycle < adjustedBurstLen) {
        // Smooth envelope for burst
        const env = Math.sin((Math.PI * posInCycle) / adjustedBurstLen);
        burstMask[i] = env;
      } else {
        burstMask[i] = 0.05; // near-silence during suppression
      }
    }
  }

  // Focal slowing affected channels
  const focalAffected = params.focalSlowing !== 'none'
    ? new Set(focalGroups[params.focalSlowing] ?? [])
    : new Set<EEGChannelName>();

  // Epileptiform affected channels
  const epiAffected = params.epileptiform === 'generalized-spike-wave'
    ? new Set(eegChannelNames)
    : params.epileptiform !== 'none' && params.epileptiform !== 'burst-suppression'
    ? new Set(epileptiformChannels[params.epileptiform] ?? [])
    : new Set<EEGChannelName>();

  // Build global power spectrum accumulator
  const globalBandPower: Record<EEGBand, number> = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };

  const channels: EEGChannelResult[] = eegChannelNames.map((ch) => {
    const weights = channelBandWeights[ch];
    const isLeft = leftChannels.includes(ch);
    const isRight = rightChannels.includes(ch);
    const isFocal = focalAffected.has(ch);
    const isEpi = epiAffected.has(ch);
    const isFrontal = frontalChannels.includes(ch);

    // Asymmetry multiplier
    let asymMult = 1;
    if (params.asymmetry < 0 && isLeft) asymMult = 1 + params.asymmetry; // suppress left
    if (params.asymmetry > 0 && isRight) asymMult = 1 - params.asymmetry; // suppress right

    const timeSeries: EEGPoint[] = [];
    const channelBandPowers: Record<EEGBand, number> = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };

    for (let i = 0; i < sampleCount; i++) {
      const t = i * dt;
      let value = 0;

      for (const band of bandKeys) {
        const { lo, hi } = eegBands[band];
        const centerFreq = (lo + hi) / 2;
        const phase = phaseOffsets[ch]![band]!;
        let amp = bandAmps[band] * weights[band] * asymMult;

        // Focal slowing: boost delta/theta in affected channels
        if (isFocal && (band === 'delta' || band === 'theta')) {
          amp *= 1 + params.focalSlowingStrength * 2;
        }
        if (isFocal && band === 'alpha') {
          amp *= 1 - params.focalSlowingStrength * 0.6;
        }

        // Burst suppression envelope
        if (burstMask) {
          amp *= burstMask[i]!;
        }

        // Multi-harmonic oscillator for more natural appearance
        const harmonic1 = Math.sin(2 * Math.PI * centerFreq * t + phase);
        const harmonic2 = 0.3 * Math.sin(2 * Math.PI * (centerFreq * 1.15) * t + phase * 1.7);
        const bandValue = amp * (harmonic1 + harmonic2);
        value += bandValue;
        channelBandPowers[band] += bandValue * bandValue;
      }

      // Epileptiform discharges
      if (isEpi && spikeTimesSet.has(i)) {
        const spikePhase = ((i % 4) / 3);
        let spikeAmp: number;

        if (params.epileptiform === 'generalized-spike-wave') {
          // 3 Hz spike-and-wave: spike is ~70ms, wave is ~260ms
          const cyclePos = ((t * 3) % 1);
          if (cyclePos < 0.2) {
            // Spike component
            spikeAmp = 120 * Math.sin(cyclePos / 0.2 * Math.PI);
          } else {
            // Slow wave component
            spikeAmp = -60 * Math.sin((cyclePos - 0.2) / 0.8 * Math.PI);
          }
          value += spikeAmp * params.epileptiformRate;
        } else {
          // Focal sharp wave: brief negative deflection then positive undershoot
          if (spikePhase < 0.5) {
            spikeAmp = -80 * (1 - spikePhase * 2);
          } else {
            spikeAmp = 30 * ((spikePhase - 0.5) * 2);
          }
          value += spikeAmp;
        }
      }

      // Muscle artifact (high-frequency, frontal-dominant)
      if (params.muscleArtifact > 0 && isFrontal) {
        value += params.muscleArtifact * gaussianRandom(rng) * 0.7;
      }

      // Background noise
      value += params.noise * gaussianRandom(rng);

      timeSeries.push({ t: round(t, 4), uv: round(value, 2) });
    }

    // Normalize band powers
    const bandPowers: EEGBandPower[] = bandKeys.map((band) => {
      const power = channelBandPowers[band] / sampleCount;
      globalBandPower[band] += power;
      return { band, power: round(power, 2) };
    });

    return { channel: ch, timeSeries, bandPowers };
  });

  // Determine dominant band globally
  const avgBandPower: Record<EEGBand, number> = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };
  for (const band of bandKeys) {
    avgBandPower[band] = globalBandPower[band] / eegChannelNames.length;
  }

  let dominantBand: EEGBand = 'alpha';
  let maxPower = 0;
  for (const band of bandKeys) {
    if (avgBandPower[band] > maxPower) {
      maxPower = avgBandPower[band];
      dominantBand = band;
    }
  }

  const dominantFrequency = (eegBands[dominantBand].lo + eegBands[dominantBand].hi) / 2;

  // Interpretation
  const interpretation = buildInterpretation(params, dominantBand);

  return {
    params,
    channels,
    dominantFrequency: round(dominantFrequency, 1),
    dominantBand,
    interpretation,
  };
}

function buildInterpretation(params: EEGParams, dominantBand: EEGBand): { pattern: string; notes: string[] } {
  const notes: string[] = [];
  let pattern: string;

  if (params.epileptiform === 'burst-suppression') {
    pattern = 'Burst suppression pattern — severe diffuse cortical dysfunction';
    notes.push('Alternating bursts of mixed-frequency activity and periods of marked voltage attenuation.');
    notes.push('Consider: anoxic brain injury, deep anaesthesia (barbiturate, propofol), or severe metabolic derangement.');
    notes.push('The burst-suppression ratio should be trended over time; increasing suppression indicates worsening.');
  } else if (params.epileptiform === 'generalized-spike-wave') {
    pattern = 'Generalized spike-and-wave discharges — primary generalized epilepsy';
    notes.push('Bilateral synchronous ~3 Hz spike-and-wave complexes arising from a normal or near-normal background.');
    notes.push('Classic pattern for childhood/juvenile absence epilepsy. Frequency <2.5 Hz suggests Lennox-Gastaut syndrome rather than typical absence.');
    notes.push('These discharges are generated by thalamocortical circuits and can be provoked by hyperventilation.');
  } else if (params.epileptiform === 'left-temporal-spikes' || params.epileptiform === 'right-temporal-spikes') {
    const side = params.epileptiform === 'left-temporal-spikes' ? 'left' : 'right';
    pattern = `Interictal ${side} temporal epileptiform discharges`;
    notes.push(`Sharp waves and spikes over the ${side} temporal region with appropriate morphology and field.`);
    notes.push('Interictal spikes support but do not prove focal epilepsy — clinical correlation is mandatory.');
    notes.push('A single routine EEG captures interictal spikes in only ~50% of patients with epilepsy; a normal study does not rule it out.');
  } else if (params.focalSlowing !== 'none') {
    pattern = `Focal slowing over the ${params.focalSlowing.replace('-', ' ')} region`;
    notes.push('Regional delta-theta activity indicates structural or functional dysfunction in that territory.');
    notes.push('Focal slowing is non-specific: it does not distinguish tumor, infarct, infection, or postictal change.');
    notes.push('The presence of preserved background activity elsewhere makes this focal rather than diffuse.');
  } else if (dominantBand === 'delta' && params.deltaAmp > 50) {
    pattern = 'Diffuse delta slowing — encephalopathy or deep sleep';
    notes.push('Diffuse high-amplitude delta activity replaces the normal posterior dominant rhythm.');
    notes.push('If the patient is awake, this pattern indicates moderate-to-severe encephalopathy.');
    notes.push('Reactivity to external stimulation should be tested: unreactive slowing is more ominous.');
  } else if (dominantBand === 'theta') {
    pattern = 'Theta-dominant pattern — drowsiness or mild encephalopathy';
    notes.push('Theta activity may reflect normal drowsiness or early/mild encephalopathy.');
    notes.push('The clinical context determines interpretation: a drowsy patient in a warm EEG lab is not encephalopathic.');
  } else if (params.alphaReactivity > 0.5) {
    pattern = 'Desynchronized pattern — eyes open or activated state';
    notes.push('Alpha suppression with low-amplitude mixed beta-theta activity is the normal eyes-open pattern.');
    notes.push('The ability of alpha to suppress and return (reactivity) is a key marker of cortical health.');
  } else {
    pattern = 'Normal posterior dominant alpha rhythm';
    notes.push('Symmetric 8–13 Hz alpha rhythm maximal over the occipital regions with normal anterior-posterior gradient.');
    notes.push('Alpha should attenuate with eye opening (reactivity) and be symmetric between hemispheres (< 50% amplitude difference).');
    if (params.asymmetry !== 0) {
      const side = params.asymmetry < 0 ? 'left' : 'right';
      notes.push(`Mild amplitude asymmetry noted with ${side}-sided attenuation — consider structural lesion if persistent and unexplained.`);
    }
  }

  if (params.muscleArtifact > 10) {
    notes.push('Significant muscle artifact, predominantly over frontotemporal regions. Consider EMG contamination in beta-range power estimates.');
  }

  return { pattern, notes };
}

function round(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}
