import type { ActionPotentialClinicalCase } from "~/core/cases";

export const actionPotentialCases: ActionPotentialClinicalCase[] = [
  {
    id: "numbness-after-dental",
    title: "Persistent numbness after dental block",
    oneLiner:
      "A patient reports prolonged numbness of the lower lip hours after a dental procedure.",
    chiefComplaint:
      "The left lower lip and chin are numb. The dental block was given 6 hours ago and has not worn off.",
    history:
      "Routine inferior alveolar nerve block with lidocaine. The tooth was extracted uneventfully, but sensation has not returned on the left side.",
    syndromeFrame:
      "This is a sodium-channel blockade story. The question is why the block persists beyond the expected pharmacokinetic window.",
    examFindings: [
      "Complete sensory loss in the left mental nerve distribution",
      "No motor weakness of jaw or face",
      "Intact corneal reflex and forehead sensation",
    ],
    prompt:
      "How does lidocaine block the action potential, and why might the block persist longer than expected?",
    hints: [
      "Think about what lidocaine does to Na+ channels specifically.",
      "Consider whether nerve injury during injection could compound the pharmacological block.",
    ],
    localizationCues: [
      "The deficit follows a single peripheral nerve distribution.",
      "Isolated sensory loss without motor involvement narrows the localization.",
    ],
    differentialTraps: [
      "Do not attribute prolonged numbness solely to a long-acting formulation without considering nerve injury.",
      "Do not forget that epinephrine-containing solutions prolong the block via local vasoconstriction.",
    ],
    nextDataRequests: [
      "Check which local anesthetic formulation was used",
      "Serial sensory exams over 24-48 hours",
      "EMG/NCS if deficit persists beyond 2 weeks",
    ],
    teachingPoints: [
      "Lidocaine blocks voltage-gated Na+ channels from the intracellular side, preventing the regenerative depolarization phase of the action potential.",
      "The Hodgkin-Huxley model shows why partial Na+ channel blockade reduces amplitude and slows conduction before complete failure.",
    ],
    followUpModules: ["neuron", "motor-pathway", "ask"],
    expectedPresetId: "local-anesthetic",
    startingPresetId: "normal-ap",
  },
  {
    id: "pufferfish-poisoning",
    title: "Ascending weakness after exotic seafood",
    oneLiner:
      "A patient develops perioral numbness and progressive weakness within 30 minutes of eating fugu.",
    chiefComplaint:
      "Tingling lips, followed by ascending numbness, then difficulty breathing.",
    history:
      "Consumed improperly prepared pufferfish at a restaurant. Symptoms progressed rapidly from perioral paresthesias to limb weakness to respiratory failure.",
    syndromeFrame:
      "This is a neurotoxin-mediated conduction block. The mechanism is Na+ channel pore blockade from the extracellular side — the same target as TTX in the Hodgkin-Huxley model.",
    examFindings: [
      "Symmetric ascending weakness",
      "Intact consciousness despite severe weakness",
      "Areflexia with preserved pupillary responses",
      "Respiratory insufficiency (vital capacity dropping)",
    ],
    prompt:
      "How does tetrodotoxin differ from local anesthetics in its mechanism, and why is consciousness preserved while weakness is severe?",
    hints: [
      "TTX blocks from outside the channel. Local anesthetics block from inside.",
      "The blood-brain barrier is relevant to why consciousness is preserved.",
    ],
    localizationCues: [
      "Ascending pattern suggests peripheral nerve involvement.",
      "Preserved consciousness with severe weakness = peripheral, not central.",
    ],
    differentialTraps: [
      "Do not confuse TTX poisoning with Guillain-Barré — the tempo (minutes vs. days) is the key distinction.",
      "Do not assume brainstem involvement just because respiratory muscles fail.",
    ],
    nextDataRequests: [
      "Forced vital capacity every 30 minutes",
      "Serum/urine toxicology for TTX",
      "Electrodiagnostic studies after stabilization",
    ],
    teachingPoints: [
      "TTX plugs the Na+ channel pore from the extracellular side. It does not cross the blood-brain barrier, sparing central neurons.",
      "The Hodgkin-Huxley model with 100% TTX block shows complete abolition of the regenerative upstroke — the action potential simply cannot fire.",
    ],
    followUpModules: ["neuron", "motor-pathway", "ask"],
    expectedPresetId: "ttx-full",
    startingPresetId: "normal-ap",
  },
  {
    id: "demyelinating-neuropathy",
    title: "Gradual distal weakness with slowed conduction",
    oneLiner:
      "A patient presents with symmetric distal weakness, areflexia, and nerve conduction velocities at 50% of normal.",
    chiefComplaint:
      "Progressive foot drop and hand clumsiness over 6 months. Stumbles on stairs.",
    history:
      "Insidious onset, symmetric, distal > proximal. Sensory symptoms (numbness) preceded motor weakness by months.",
    syndromeFrame:
      "This is a demyelinating peripheral neuropathy. The question is how myelin loss translates to conduction failure at the biophysical level.",
    examFindings: [
      "Symmetric distal weakness (foot dorsiflexion, intrinsic hand muscles)",
      "Absent ankle jerks and reduced knee jerks",
      "Stocking-glove sensory loss",
      "NCS: severely reduced conduction velocity, prolonged distal latencies, conduction block",
    ],
    prompt:
      "How does increased leak conductance in the Hodgkin-Huxley model mirror the biophysics of demyelination?",
    hints: [
      "Myelin reduces membrane capacitance and increases transverse resistance — demyelination reverses both.",
      "The 'demyelination' preset in the HH model uses increased gL.",
    ],
    localizationCues: [
      "Symmetric distal pattern = length-dependent process.",
      "Markedly slow conduction velocity (<70% of normal) = demyelinating, not axonal.",
    ],
    differentialTraps: [
      "Do not call every neuropathy axonal without checking conduction velocities.",
      "Conduction block on NCS suggests acquired demyelination (CIDP, GBS) rather than inherited (CMT).",
    ],
    nextDataRequests: [
      "Complete electrodiagnostic study with conduction block assessment",
      "CSF protein (elevated in CIDP/GBS)",
      "Genetic testing if hereditary demyelination suspected (CMT1A duplication)",
    ],
    teachingPoints: [
      "Demyelination increases membrane leak conductance — the HH model shows that increasing gL raises the current threshold for spike generation.",
      "Conduction failure in demyelination occurs because the safety factor (ratio of available current to threshold current) drops below 1 at demyelinated nodes.",
    ],
    followUpModules: ["neuron", "motor-pathway", "eeg", "ask"],
    expectedPresetId: "demyelination",
    startingPresetId: "normal-ap",
  },
];
