/**
 * Motor Pathway Explorer
 *
 * Interactive corticospinal tract model with UMN vs LMN lesion patterns,
 * crossed findings at brainstem levels, and clinical sign generation.
 */

export interface MotorSign {
  name: string;
  value: string;
  explanation: string;
}

export interface MotorLesionResult {
  lesion: MotorLesionLevel;
  ipsilateral: MotorSign[];
  contralateral: MotorSign[];
  bilateral: MotorSign[];
  classification: "UMN" | "LMN" | "mixed" | "NMJ" | "myopathic";
  distribution: string;
  acuteVsChronic: { acute: string; chronic: string };
  redFlags: string[];
  explanation: {
    pathway: string;
    mechanism: string;
    whatToNotice: string[];
    keyDistinctions: string[];
  };
}

export interface MotorLesionLevel {
  id: string;
  label: string;
  anatomicalLevel: string;
  description: string;
  crossedAt: string;
  category: "UMN" | "LMN" | "mixed" | "NMJ" | "myopathic";
}

export interface MotorPathwayPreset {
  id: string;
  label: string;
  description: string;
  lesionId: string;
  clinicalVignette: string;
}

export const motorLesionLevels: MotorLesionLevel[] = [
  {
    id: "motor-cortex",
    label: "Motor Cortex",
    anatomicalLevel: "Precentral gyrus (Brodmann area 4)",
    description:
      "Upper motor neuron cell bodies in layer V. Lesions produce contralateral weakness with a somatotopic pattern (face/arm > leg for MCA territory).",
    crossedAt: "Pyramidal decussation (caudal medulla)",
    category: "UMN",
  },
  {
    id: "internal-capsule",
    label: "Internal Capsule",
    anatomicalLevel: "Posterior limb of internal capsule",
    description:
      "Dense packing of corticospinal fibers. Small lacunar strokes here produce dense contralateral hemiparesis ('pure motor stroke').",
    crossedAt: "Pyramidal decussation (caudal medulla)",
    category: "UMN",
  },
  {
    id: "cerebral-peduncle",
    label: "Cerebral Peduncle",
    anatomicalLevel: "Midbrain (crus cerebri)",
    description:
      "Corticospinal tract in the basis pedunculi. Lesion can produce contralateral hemiparesis ± ipsilateral CN III palsy (Weber syndrome).",
    crossedAt: "Pyramidal decussation (caudal medulla)",
    category: "UMN",
  },
  {
    id: "basilar-pons",
    label: "Basilar Pons",
    anatomicalLevel: "Ventral pons",
    description:
      "Corticospinal fibers dispersed among pontine nuclei. Lesions produce contralateral hemiparesis ± ipsilateral CN VI or VII palsy.",
    crossedAt: "Pyramidal decussation (caudal medulla)",
    category: "UMN",
  },
  {
    id: "medullary-pyramid",
    label: "Medullary Pyramid",
    anatomicalLevel: "Ventral medulla, above decussation",
    description:
      "Corticospinal tract re-concentrates before crossing. Lesion produces contralateral hemiparesis ± ipsilateral CN XII palsy.",
    crossedAt: "Pyramidal decussation (caudal medulla)",
    category: "UMN",
  },
  {
    id: "pyramidal-decussation",
    label: "Pyramidal Decussation",
    anatomicalLevel: "Cervicomedullary junction",
    description:
      "The crossing point. Lesions here produce 'cruciate hemiplegia': ipsilateral arm + contralateral leg weakness (or vice versa) depending on lesion location within the decussation.",
    crossedAt: "This IS the crossing",
    category: "UMN",
  },
  {
    id: "lateral-corticospinal",
    label: "Lateral Corticospinal Tract",
    anatomicalLevel: "Spinal cord lateral funiculus",
    description:
      "Crossed tract in the lateral column. Lesion produces ipsilateral UMN weakness below the level, plus possible sensory level if dorsal columns are involved.",
    crossedAt: "Already crossed",
    category: "UMN",
  },
  {
    id: "anterior-horn",
    label: "Anterior Horn Cell",
    anatomicalLevel: "Spinal cord ventral horn (lamina IX)",
    description:
      "Lower motor neuron cell body. Destruction produces ipsilateral segmental weakness with fasciculations, atrophy, and areflexia at that myotome.",
    crossedAt: "N/A — LMN",
    category: "LMN",
  },
  {
    id: "ventral-root",
    label: "Ventral Root / Nerve Root",
    anatomicalLevel: "Spinal nerve root (radiculopathy)",
    description:
      "Motor axons exit the cord. Root compression produces dermatomal/myotomal weakness with LMN signs at that level. Pain is common.",
    crossedAt: "N/A — LMN",
    category: "LMN",
  },
  {
    id: "peripheral-nerve",
    label: "Peripheral Nerve",
    anatomicalLevel: "Named peripheral nerve",
    description:
      "Mixed sensorimotor nerve. Damage produces weakness in a nerve-specific distribution with LMN signs plus sensory loss in the nerve territory.",
    crossedAt: "N/A — LMN",
    category: "LMN",
  },
  {
    id: "nmj",
    label: "Neuromuscular Junction",
    anatomicalLevel: "Motor end plate",
    description:
      "Postsynaptic (myasthenia gravis) or presynaptic (Lambert-Eaton) transmission failure. Fatigable weakness without sensory loss or reflex changes early.",
    crossedAt: "N/A — NMJ",
    category: "NMJ",
  },
  {
    id: "muscle",
    label: "Muscle (Myopathy)",
    anatomicalLevel: "Skeletal muscle fiber",
    description:
      "Primary muscle disease. Proximal > distal weakness, preserved reflexes early, no sensory loss, elevated CK.",
    crossedAt: "N/A — Myopathic",
    category: "myopathic",
  },
  {
    id: "als-mixed",
    label: "ALS (Mixed UMN + LMN)",
    anatomicalLevel: "Cortex + anterior horn cells",
    description:
      "Simultaneous upper and lower motor neuron degeneration. The hallmark is UMN signs (spasticity, hyperreflexia) in limbs that also show LMN signs (atrophy, fasciculations).",
    crossedAt: "Both levels",
    category: "mixed",
  },
];

export const motorPathwayPresets: MotorPathwayPreset[] = [
  {
    id: "mca-stroke",
    label: "MCA Stroke",
    description:
      "Middle cerebral artery territory infarct: contralateral face and arm > leg weakness with UMN signs",
    lesionId: "motor-cortex",
    clinicalVignette:
      "A 68-year-old with sudden right face and arm weakness, sparing the leg. Speech is slurred. Right arm drifts within 2 seconds.",
  },
  {
    id: "lacunar-capsule",
    label: "Lacunar Pure Motor",
    description:
      "Small vessel disease in posterior limb: dense contralateral hemiparesis without cortical signs",
    lesionId: "internal-capsule",
    clinicalVignette:
      "A 72-year-old hypertensive presents with equally dense left face, arm, and leg weakness. No neglect, no aphasia, no sensory loss.",
  },
  {
    id: "weber-syndrome",
    label: "Weber Syndrome",
    description:
      "Midbrain lesion: ipsilateral CN III palsy + contralateral hemiparesis",
    lesionId: "cerebral-peduncle",
    clinicalVignette:
      "A patient develops a dilated left pupil and ptosis with right-sided hemiparesis. The eye is 'down and out' on the left.",
  },
  {
    id: "brown-sequard",
    label: "Brown-Séquard",
    description:
      "Spinal cord hemisection: ipsilateral UMN weakness + contralateral spinothalamic loss",
    lesionId: "lateral-corticospinal",
    clinicalVignette:
      "Stab wound at T8: ipsilateral leg weakness with UMN signs and contralateral loss of pain/temperature below the level.",
  },
  {
    id: "c5-radiculopathy",
    label: "C5 Radiculopathy",
    description:
      "Nerve root compression: deltoid and biceps weakness with LMN signs at C5 myotome",
    lesionId: "ventral-root",
    clinicalVignette:
      "A 45-year-old with neck pain radiating to the lateral shoulder. Biceps reflex is diminished. Deltoid and biceps are weak.",
  },
  {
    id: "median-neuropathy",
    label: "Carpal Tunnel Syndrome",
    description:
      "Median nerve compression at wrist: thenar weakness + sensory loss in median territory",
    lesionId: "peripheral-nerve",
    clinicalVignette:
      "Nocturnal hand numbness in thumb, index, and middle fingers. Thenar eminence is wasted. Grip strength is reduced.",
  },
  {
    id: "myasthenia",
    label: "Myasthenia Gravis",
    description:
      "Postsynaptic NMJ antibodies: fatigable ptosis, diplopia, proximal weakness",
    lesionId: "nmj",
    clinicalVignette:
      "A 30-year-old woman with ptosis that worsens by evening. Diplopia with sustained upgaze. No sensory complaints.",
  },
  {
    id: "polymyositis",
    label: "Polymyositis",
    description:
      "Inflammatory myopathy: proximal weakness, elevated CK, no sensory involvement",
    lesionId: "muscle",
    clinicalVignette:
      "A 55-year-old with difficulty climbing stairs and rising from a chair. CK is 5000. Reflexes are normal. No numbness.",
  },
  {
    id: "als",
    label: "ALS",
    description:
      "Mixed UMN + LMN: brisk reflexes in atrophied, fasciculating limbs",
    lesionId: "als-mixed",
    clinicalVignette:
      "A 60-year-old with progressive right hand weakness and wasting. Fasciculations in the biceps. Reflexes are paradoxically brisk throughout.",
  },
];

function generateUMNSigns(
  level: MotorLesionLevel,
): { ipsi: MotorSign[]; contra: MotorSign[]; bilateral: MotorSign[] } {
  const isAboveDecussation = [
    "motor-cortex",
    "internal-capsule",
    "cerebral-peduncle",
    "basilar-pons",
    "medullary-pyramid",
  ].includes(level.id);

  const signs: MotorSign[] = [
    {
      name: "Tone",
      value: "Spastic (velocity-dependent, clasp-knife)",
      explanation:
        "Loss of descending inhibition on spinal stretch reflex circuits produces velocity-dependent hypertonia.",
    },
    {
      name: "Reflexes",
      value: "Hyperreflexic",
      explanation:
        "Disinhibited spinal motoneurons respond excessively to Ia afferent input.",
    },
    {
      name: "Babinski sign",
      value: "Upgoing plantar (extensor)",
      explanation:
        "Loss of corticospinal input unmasks the primitive flexion withdrawal reflex.",
    },
    {
      name: "Atrophy",
      value: "Minimal (disuse only)",
      explanation:
        "The LMN is intact, so trophic support to muscle is preserved. Only prolonged disuse causes mild wasting.",
    },
    {
      name: "Fasciculations",
      value: "Absent",
      explanation:
        "Fasciculations require LMN instability. UMN lesions produce spasticity, not denervation.",
    },
    {
      name: "Weakness pattern",
      value:
        level.id === "motor-cortex"
          ? "Contralateral, somatotopic (face/arm > leg in MCA)"
          : level.id === "internal-capsule"
            ? "Contralateral, dense and equal (face = arm = leg)"
            : "Contralateral hemiparesis",
      explanation:
        "Corticospinal fibers are somatotopically organized. Capsular lesions are dense because fibers are packed; cortical lesions follow vascular territory.",
    },
  ];

  if (isAboveDecussation) {
    return { ipsi: [], contra: signs, bilateral: [] };
  }

  if (level.id === "pyramidal-decussation") {
    return {
      ipsi: [],
      contra: [],
      bilateral: [
        {
          name: "Pattern",
          value: "Cruciate — ipsilateral arm + contralateral leg (or reverse)",
          explanation:
            "Fibers for upper and lower limbs cross at slightly different positions within the decussation.",
        },
        ...signs.slice(0, 3),
      ],
    };
  }

  // Below decussation — ipsilateral
  return { ipsi: signs, contra: [], bilateral: [] };
}

function generateLMNSigns(level: MotorLesionLevel): {
  ipsi: MotorSign[];
  contra: MotorSign[];
  bilateral: MotorSign[];
} {
  const signs: MotorSign[] = [
    {
      name: "Tone",
      value: "Flaccid (hypotonic)",
      explanation:
        "The alpha motoneuron is damaged, so the muscle loses all neural tone.",
    },
    {
      name: "Reflexes",
      value: "Absent or diminished (areflexic/hyporeflexic)",
      explanation:
        "The efferent limb of the stretch reflex is destroyed. No contraction in response to Ia input.",
    },
    {
      name: "Babinski sign",
      value: "Absent (mute or downgoing)",
      explanation:
        "There is no UMN component. The plantar response is absent or normal flexor.",
    },
    {
      name: "Atrophy",
      value: "Prominent, early",
      explanation:
        "Denervation removes trophic signals to muscle fibers. Atrophy begins within weeks.",
    },
    {
      name: "Fasciculations",
      value: "Present",
      explanation:
        "Dying or irritable motor units fire spontaneously, producing visible muscle twitches.",
    },
    {
      name: "Weakness pattern",
      value:
        level.id === "anterior-horn"
          ? "Segmental myotome pattern"
          : level.id === "ventral-root"
            ? "Root/dermatomal distribution"
            : "Named nerve distribution",
      explanation:
        "LMN weakness follows the anatomical territory of the damaged motor unit pool.",
    },
  ];

  return { ipsi: signs, contra: [], bilateral: [] };
}

function generateNMJSigns(): {
  ipsi: MotorSign[];
  contra: MotorSign[];
  bilateral: MotorSign[];
} {
  const signs: MotorSign[] = [
    {
      name: "Tone",
      value: "Normal or mildly reduced",
      explanation:
        "The nerve and muscle are intact. Transmission failure is intermittent, so resting tone is preserved.",
    },
    {
      name: "Reflexes",
      value: "Normal (may be preserved or facilitated in Lambert-Eaton)",
      explanation:
        "The reflex arc is structurally intact. In Lambert-Eaton, reflexes may improve after exercise (post-tetanic facilitation).",
    },
    {
      name: "Fatigability",
      value: "Prominent — weakness worsens with repeated use",
      explanation:
        "Antibodies reduce available acetylcholine receptors (MG) or presynaptic calcium channels (LEMS). Repeated stimulation depletes the safety factor.",
    },
    {
      name: "Atrophy",
      value: "Absent or minimal",
      explanation: "Nerve trophic support is intact. Muscle mass is preserved.",
    },
    {
      name: "Fasciculations",
      value: "Absent",
      explanation:
        "Motor axons are normal. Fasciculations require LMN disease.",
    },
    {
      name: "Distribution",
      value: "Ocular, bulbar, proximal limb (MG); proximal limb, autonomic (LEMS)",
      explanation:
        "MG preferentially affects muscles with small motor units (eyes, face). LEMS preferentially affects proximal limbs with autonomic features.",
    },
  ];

  return { ipsi: [], contra: [], bilateral: signs };
}

function generateMyopathicSigns(): {
  ipsi: MotorSign[];
  contra: MotorSign[];
  bilateral: MotorSign[];
} {
  const signs: MotorSign[] = [
    {
      name: "Tone",
      value: "Normal or mildly reduced",
      explanation:
        "The nerve is intact. Muscle fibers are damaged but tone depends on neural input.",
    },
    {
      name: "Reflexes",
      value: "Normal early, reduced late",
      explanation:
        "Reflexes are preserved until significant muscle fiber loss removes the contractile apparatus.",
    },
    {
      name: "Atrophy",
      value: "Present (proximal predominant)",
      explanation:
        "Muscle fiber destruction causes wasting. The pattern is proximal (hip girdle, shoulder girdle) rather than distal.",
    },
    {
      name: "Fasciculations",
      value: "Absent (but myokymia possible)",
      explanation:
        "The motor nerve is normal. Fasciculations require denervation.",
    },
    {
      name: "CK level",
      value: "Elevated (often markedly)",
      explanation:
        "Damaged muscle releases creatine kinase into the blood. CK >1000 suggests active myopathy.",
    },
    {
      name: "Distribution",
      value: "Proximal > distal, symmetric, no sensory loss",
      explanation:
        "Myopathy preferentially affects proximal muscles. Hip flexors and shoulder abductors are often first affected.",
    },
  ];

  return { ipsi: [], contra: [], bilateral: signs };
}

function generateMixedSigns(): {
  ipsi: MotorSign[];
  contra: MotorSign[];
  bilateral: MotorSign[];
} {
  const signs: MotorSign[] = [
    {
      name: "Tone",
      value: "Mixed — spastic AND flaccid features in the same patient",
      explanation:
        "Simultaneous UMN and LMN degeneration produces the paradox of brisk reflexes in wasted limbs.",
    },
    {
      name: "Reflexes",
      value: "Hyperreflexic (UMN component) in limbs with atrophy (LMN component)",
      explanation:
        "This combination is the hallmark of ALS. Brisk reflexes in a wasted limb should trigger concern.",
    },
    {
      name: "Babinski sign",
      value: "Present (upgoing plantar)",
      explanation:
        "The UMN component is sufficient to produce an extensor plantar response.",
    },
    {
      name: "Atrophy",
      value: "Prominent with fasciculations",
      explanation:
        "LMN degeneration produces early, progressive wasting with spontaneous motor unit discharges.",
    },
    {
      name: "Fasciculations",
      value: "Widespread, including clinically strong muscles",
      explanation:
        "In ALS, fasciculations appear in muscles that are not yet clinically weak, reflecting subclinical denervation.",
    },
    {
      name: "Distribution",
      value: "Asymmetric onset, progressive spread, no sensory involvement",
      explanation:
        "ALS typically starts focally (one hand, one foot, bulbar) and spreads contiguously. Sensory sparing is a key diagnostic feature.",
    },
  ];

  return { ipsi: [], contra: [], bilateral: signs };
}

function getBrainstemCrossedFindings(
  levelId: string,
): MotorSign[] {
  const findings: Record<string, MotorSign[]> = {
    "cerebral-peduncle": [
      {
        name: "Ipsilateral CN III palsy",
        value: "Ptosis, dilated pupil, eye 'down and out'",
        explanation:
          "The oculomotor fascicles pass through the cerebral peduncle. Weber syndrome = ipsilateral III + contralateral hemiparesis.",
      },
    ],
    "basilar-pons": [
      {
        name: "Ipsilateral CN VI palsy",
        value: "Lateral gaze palsy, diplopia on lateral gaze",
        explanation:
          "CN VI nucleus/fascicle runs near the corticospinal tract in the pons. Millard-Gubler syndrome.",
      },
      {
        name: "Ipsilateral CN VII palsy (LMN type)",
        value: "Full ipsilateral facial weakness (forehead involved)",
        explanation:
          "CN VII fascicle loops around the CN VI nucleus. LMN-type facial weakness distinguishes this from supranuclear palsy.",
      },
    ],
    "medullary-pyramid": [
      {
        name: "Ipsilateral CN XII palsy",
        value: "Tongue deviates to the side of the lesion",
        explanation:
          "Hypoglossal fascicles exit near the pyramid. The tongue pushes toward the weak side.",
      },
    ],
  };

  return findings[levelId] ?? [];
}

export function simulateMotorLesion(lesionId: string): MotorLesionResult {
  const level = motorLesionLevels.find((l) => l.id === lesionId);
  if (!level) {
    const defaultLevel = motorLesionLevels[0]!;
    return simulateMotorLesion(defaultLevel.id);
  }

  let signs: {
    ipsi: MotorSign[];
    contra: MotorSign[];
    bilateral: MotorSign[];
  };

  switch (level.category) {
    case "UMN":
      signs = generateUMNSigns(level);
      break;
    case "LMN":
      signs = generateLMNSigns(level);
      break;
    case "NMJ":
      signs = generateNMJSigns();
      break;
    case "myopathic":
      signs = generateMyopathicSigns();
      break;
    case "mixed":
      signs = generateMixedSigns();
      break;
  }

  // Add brainstem crossed findings
  const crossedFindings = getBrainstemCrossedFindings(level.id);
  if (crossedFindings.length > 0) {
    signs.ipsi = [...crossedFindings, ...signs.ipsi];
  }

  const acuteVsChronic =
    level.category === "UMN"
      ? {
          acute:
            "Initially flaccid and areflexic (spinal shock if spinal; cortical shock if cerebral). Babinski may be present from the start.",
          chronic:
            "Over days to weeks, spasticity, hyperreflexia, and clonus develop as spinal circuits become disinhibited.",
        }
      : level.category === "LMN"
        ? {
            acute: "Immediate flaccidity, areflexia, and weakness in the affected territory.",
            chronic:
              "Progressive atrophy and fibrillations (EMG) develop over 2-3 weeks as denervation takes hold.",
          }
        : level.category === "NMJ"
          ? {
              acute: "Fatigable weakness that fluctuates throughout the day.",
              chronic:
                "Stable or progressive fatigable weakness. Fixed weakness in longstanding MG.",
            }
          : level.category === "myopathic"
            ? {
                acute: "Rapid symmetric proximal weakness (if inflammatory). May have myalgia.",
                chronic:
                  "Slowly progressive proximal weakness with muscle replacement by fat/fibrosis.",
              }
            : {
                acute:
                  "Focal weakness that may initially look like either UMN or LMN alone.",
                chronic:
                  "Progressive spread with simultaneous UMN and LMN features. The combination is the clue.",
              };

  const redFlags: string[] = [];
  if (level.category === "UMN") {
    redFlags.push(
      "Sudden onset suggests vascular; progressive suggests structural or degenerative.",
    );
    if (
      ["cerebral-peduncle", "basilar-pons", "medullary-pyramid"].includes(
        level.id,
      )
    ) {
      redFlags.push(
        "Crossed findings (ipsilateral cranial nerve + contralateral hemiparesis) = brainstem until proven otherwise.",
      );
    }
  }
  if (level.category === "LMN") {
    redFlags.push(
      "Fasciculations + hyperreflexia = consider ALS even if presentation looks peripheral.",
    );
  }
  if (level.category === "mixed") {
    redFlags.push(
      "UMN signs in a wasted limb: do not attribute hyperreflexia to anxiety in a fasciculating patient.",
    );
  }
  if (level.category === "NMJ") {
    redFlags.push(
      "Acute respiratory failure in MG: myasthenic crisis is a medical emergency.",
    );
  }

  return {
    lesion: level,
    ipsilateral: signs.ipsi,
    contralateral: signs.contra,
    bilateral: signs.bilateral,
    classification: level.category,
    distribution:
      level.category === "UMN"
        ? level.id === "motor-cortex"
          ? "Contralateral, somatotopic (vascular territory)"
          : level.id === "internal-capsule"
            ? "Contralateral, dense, equal distribution"
            : level.id === "lateral-corticospinal"
              ? "Ipsilateral, below the level"
              : "Contralateral hemiparesis"
        : level.category === "LMN"
          ? "Segmental/peripheral nerve territory"
          : level.category === "NMJ"
            ? "Ocular, bulbar, proximal limb (fluctuating)"
            : level.category === "myopathic"
              ? "Proximal > distal, symmetric"
              : "Asymmetric, spreading, mixed UMN+LMN",
    acuteVsChronic,
    redFlags,
    explanation: {
      pathway:
        "Motor cortex → posterior limb internal capsule → cerebral peduncle → basis pontis → medullary pyramid → pyramidal decussation → lateral corticospinal tract → anterior horn cell → ventral root → peripheral nerve → NMJ → muscle.",
      mechanism: level.description,
      whatToNotice: [
        `This is a ${level.category} lesion at the level of ${level.anatomicalLevel}.`,
        level.category === "UMN"
          ? "UMN signs: spasticity, hyperreflexia, upgoing plantar, minimal atrophy. Remember acute UMN lesions may initially appear flaccid."
          : level.category === "LMN"
            ? "LMN signs: flaccidity, areflexia, atrophy, fasciculations. These appear in the specific myotome or nerve territory."
            : level.category === "mixed"
              ? "The simultaneous presence of UMN and LMN signs in the same territory is the diagnostic key."
              : level.category === "NMJ"
                ? "NMJ: fatigable weakness, no sensory loss, no reflex changes early. Fluctuation is the hallmark."
                : "Myopathy: proximal, symmetric, no sensory loss, elevated CK. Reflexes are preserved until late.",
        "Always determine: Is the weakness UMN or LMN? What is the distribution? Is there sensory involvement?",
      ],
      keyDistinctions: [
        "UMN: spastic, hyperreflexic, Babinski+, minimal atrophy, no fasciculations",
        "LMN: flaccid, areflexic, early atrophy, fasciculations, no Babinski",
        "NMJ: fatigable, fluctuating, no sensory, normal reflexes, no atrophy early",
        "Myopathy: proximal, symmetric, no sensory, preserved reflexes, elevated CK",
        "Mixed (ALS): hyperreflexia + atrophy + fasciculations = the deadly combination",
      ],
    },
  };
}
