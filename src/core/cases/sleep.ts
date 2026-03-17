import type { SleepClinicalCase } from "~/core/cases";

export const sleepCases: SleepClinicalCase[] = [
  {
    id: "excessive-daytime-sleepiness",
    title: "Irresistible sleep attacks with cataplexy",
    oneLiner:
      "A 22-year-old medical student falls asleep during clinic and collapses when laughing.",
    chiefComplaint:
      "I can't stay awake during the day. When I laugh hard, my knees buckle and I drop things.",
    history:
      "Excessive daytime sleepiness since age 16. Sleep attacks are irresistible. Cataplexy (sudden loss of muscle tone triggered by emotion) began at age 18. Also reports sleep paralysis and hypnagogic hallucinations. Nocturnal sleep is disrupted with frequent awakenings.",
    syndromeFrame:
      "This is narcolepsy type 1. The tetrad is: excessive daytime sleepiness, cataplexy, sleep paralysis, and hypnagogic hallucinations — all representing inappropriate intrusions of REM sleep phenomena into wakefulness.",
    examFindings: [
      "MSLT: mean sleep latency 4 minutes with 3 SOREMPs",
      "Nocturnal PSG: REM latency 8 minutes, fragmented sleep",
      "Normal neurological examination between episodes",
      "CSF orexin/hypocretin-1 < 110 pg/mL (diagnostic)",
    ],
    prompt:
      "Why is short REM latency the PSG hallmark, and how does orexin deficiency explain all four symptoms?",
    hints: [
      "Orexin stabilizes the sleep-wake switch. Without it, boundaries between states become unstable.",
      "Cataplexy = REM atonia intruding into wakefulness. Sleep paralysis = REM atonia persisting into wakefulness.",
    ],
    localizationCues: [
      "The pathology is in the lateral hypothalamus (orexin-producing neurons).",
      "This is a neurochemical disorder, not structural — neuroimaging is normal.",
    ],
    differentialTraps: [
      "Do not diagnose narcolepsy without confirming short REM latency on MSLT/PSG.",
      "Do not confuse with OSA, which also causes daytime sleepiness but has different PSG findings.",
      "Type 2 narcolepsy lacks cataplexy and has normal orexin levels.",
    ],
    nextDataRequests: [
      "MSLT with preceding overnight PSG (to exclude sleep deprivation/OSA)",
      "CSF orexin-1 level",
      "HLA-DQB1*06:02 (associated but not diagnostic)",
    ],
    teachingPoints: [
      "Narcolepsy type 1 = orexin/hypocretin deficiency → unstable sleep-wake boundaries → REM intrusions.",
      "The sleep architecture shows dramatically short REM latency because the REM-suppressing function of orexin is absent.",
    ],
    followUpModules: ["eeg", "brain-atlas", "ask"],
    expectedPresetId: "narcolepsy",
    startingPresetId: "normal-young",
  },
  {
    id: "snoring-apneas-sleepiness",
    title: "Witnessed apneas with daytime somnolence",
    oneLiner:
      "A 55-year-old obese man's wife reports he stops breathing for 30 seconds repeatedly during sleep.",
    chiefComplaint:
      "I'm always tired. My wife says I snore like a freight train and sometimes stop breathing.",
    history:
      "BMI 38. Hypertension. Morning headaches. Nocturia. Non-refreshing sleep despite 8 hours in bed. Epworth Sleepiness Scale 16/24.",
    syndromeFrame:
      "This is obstructive sleep apnea. Repetitive upper airway collapse during sleep causes cyclic desaturation, cortical arousals, and fragmented sleep architecture.",
    examFindings: [
      "PSG: AHI 45/hr (severe), nadir SpO2 72%",
      "Sleep architecture: reduced SWS and REM, frequent arousals",
      "Sleep efficiency 68%",
      "Most events in supine position and during REM",
    ],
    prompt:
      "How does OSA fragment sleep architecture, and why is REM sleep particularly affected?",
    hints: [
      "Each apnea ends with a cortical arousal that resets the sleep cycle.",
      "REM atonia worsens airway collapse because the pharyngeal dilator muscles are also atonic.",
    ],
    localizationCues: [
      "The primary pathology is anatomical (upper airway) plus neuromuscular (pharyngeal dilator tone).",
      "The sleep architecture disruption is secondary to mechanical airway obstruction.",
    ],
    differentialTraps: [
      "Do not attribute daytime sleepiness to depression without screening for OSA.",
      "Do not assume a normal BMI excludes OSA — retrognathia and craniofacial anatomy matter.",
    ],
    nextDataRequests: [
      "Full attended polysomnography with respiratory scoring",
      "CPAP titration study",
      "Cardiovascular risk assessment (OSA increases stroke/MI risk)",
    ],
    teachingPoints: [
      "OSA destroys sleep architecture through repetitive arousals. The hypnogram shows inability to maintain deeper stages.",
      "REM-predominant OSA occurs because REM atonia reduces pharyngeal muscle tone further, making the airway more collapsible.",
    ],
    followUpModules: ["eeg", "ecg", "ask"],
    expectedPresetId: "osa-severe",
    startingPresetId: "normal-young",
  },
  {
    id: "dream-enactment",
    title: "Violent dream enactment injuring the bed partner",
    oneLiner:
      "A 68-year-old man punches his wife during sleep while dreaming of fighting off an intruder.",
    chiefComplaint:
      "My husband punches and kicks in his sleep. He fell out of bed last week while 'running' in a dream.",
    history:
      "Dream enactment for 3 years, worsening. Dreams are vivid and violent. Patient is unaware until woken. Reduced sense of smell for 5 years. Mild constipation.",
    syndromeFrame:
      "This is REM sleep behavior disorder (RBD). Loss of normal REM atonia allows motor output of dream content. The critical clinical implication: idiopathic RBD converts to alpha-synucleinopathy (PD, DLB, MSA) in >80% of cases within 10-15 years.",
    examFindings: [
      "PSG: REM without atonia (RSWA) on chin and limb EMG during REM",
      "Sleep architecture otherwise relatively preserved",
      "Mild anosmia on scratch-and-sniff testing",
      "Subtle bradykinesia on finger tapping (subclinical)",
    ],
    prompt:
      "Why is RBD considered a prodromal synucleinopathy, and what does REM atonia loss tell us about brainstem pathology?",
    hints: [
      "REM atonia is generated by pontine circuits (sublaterodorsal nucleus) that project to spinal inhibitory interneurons.",
      "Alpha-synuclein pathology in Parkinson disease starts in the lower brainstem and olfactory system before reaching the substantia nigra.",
    ],
    localizationCues: [
      "REM atonia circuits are in the pons and medulla — earliest sites of synuclein deposition.",
      "Anosmia + RBD + constipation = prodromal Parkinson disease (Braak stages 1-2).",
    ],
    differentialTraps: [
      "Do not dismiss dream enactment as 'just nightmares' in an elderly patient.",
      "Do not diagnose PTSD-related sleep disturbance without checking REM EMG on PSG.",
    ],
    nextDataRequests: [
      "Video-PSG with expanded EMG montage (chin + all limbs)",
      "Olfactory testing (UPSIT)",
      "DAT-SPECT scan if concern for early parkinsonism",
    ],
    teachingPoints: [
      "RBD is the strongest known prodromal marker for Parkinson disease, DLB, and MSA.",
      "The sleep architecture module shows that RBD preserves overall sleep structure but specifically loses the atonia of REM — a brainstem-level failure.",
    ],
    followUpModules: ["brain-atlas", "dopamine", "motor-pathway", "ask"],
    expectedPresetId: "rem-behavior",
    startingPresetId: "normal-elderly",
  },
];
