export interface ModuleCard {
  slug: string;
  title: string;
  description: string;
  badge: string;
  href?: string;
}

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/brain-atlas", label: "Brain Atlas" },
  { href: "/neuron", label: "Neuron" },
  { href: "/retina", label: "Retina" },
  { href: "/visual-field", label: "Visual Field" },
  { href: "/grid-cell", label: "Grid Cell" },
  { href: "/ecg", label: "ECG" },
  { href: "/eeg", label: "EEG" },
  { href: "/plasticity", label: "Plasticity" },
  { href: "/dopamine", label: "Dopamine" },
  { href: "/vision", label: "Vision" },
  { href: "/ask", label: "Ask" },
] as const;

export const moduleCards: ModuleCard[] = [
  {
    slug: "brain-atlas",
    title: "Brain Atlas",
    description:
      "Explore major regions, convergence overlays, and conference-style localization cases with vascular, visual-stream, brainstem, and loop-based rival reasoning.",
    badge: "Anatomy",
    href: "/brain-atlas",
  },
  {
    slug: "neuron",
    title: "Neuron Simulation",
    description:
      "Tune the LIF parameters and see the membrane trace update through shared local simulation code.",
    badge: "Simulation",
    href: "/neuron",
  },
  {
    slug: "retina",
    title: "Retinal Receptive Field Lab",
    description:
      "Move from center-surround physiology into prechiasmal neuro-ophthalmology with retinal, disc, and optic-nerve compare mode plus case-based triage.",
    badge: "Neuro-Ophthalmology",
    href: "/retina",
  },
  {
    slug: "visual-field",
    title: "Visual Field Localizer",
    description:
      "Work through monocular, chiasmal, retrochiasmal, and neglect-like patterns with compare mode and consult-level cases.",
    badge: "Localization",
    href: "/visual-field",
  },
  {
    slug: "plasticity",
    title: "Synaptic Plasticity",
    description:
      "Explore causal versus non-causal spike timing with a typed STDP curve and weight-evolution view.",
    badge: "Learning",
    href: "/plasticity",
  },
  {
    slug: "dopamine",
    title: "Dopamine Prediction Error Lab",
    description:
      "Watch prediction errors shift from reward delivery to the predictive cue as learning unfolds.",
    badge: "Reinforcement",
    href: "/dopamine",
  },
  {
    slug: "vision",
    title: "Visual Cortex",
    description:
      "Classify images through the internal API while working through consult-level field-entry, ventral, dorsal, and attention-network localization traps.",
    badge: "Cortical Vision",
    href: "/vision",
  },
  {
    slug: "ask",
    title: "Neuro Tutor",
    description:
      "Use a shared consult-level reasoning rubric across lesion localization, neuro-ophthalmology, epileptology, neurovascular syndromes, and neurocardiology.",
    badge: "Cloudflare AI",
    href: "/ask",
  },
  {
    slug: "ecg",
    title: "12-Lead ECG Explorer",
    description:
      "Study ECGs through a neurocritical neurocardiac lens with autonomic presets, consult frames, case mode, annotated rhythm strips, red flags, and a 3D activation map.",
    badge: "Clinical",
    href: "/ecg",
  },
  {
    slug: "eeg",
    title: "EEG & Neural Oscillations",
    description:
      "Explore 19-channel EEG with band-power analysis, clinical presets from normal alpha to burst suppression, epileptiform pattern generation, and consult-level neurophysiology cases.",
    badge: "Neurophysiology",
    href: "/eeg",
  },
  {
    slug: "grid-cell",
    title: "Grid Cell Navigator",
    description:
      "Trace arena trajectories, spike clouds, and hexagonal rate maps in a typed navigation lab driven by a shared simulator.",
    badge: "Navigation",
    href: "/grid-cell",
  },
];
