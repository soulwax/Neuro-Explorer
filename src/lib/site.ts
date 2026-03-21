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
  { href: "/neglect", label: "Neglect" },
  { href: "/aphasia", label: "Aphasia" },
  { href: "/grid-cell", label: "Grid Cell" },
  { href: "/ecg", label: "ECG" },
  { href: "/eeg", label: "EEG" },
  { href: "/plasticity", label: "Plasticity" },
  { href: "/dopamine", label: "Dopamine" },
  { href: "/vision", label: "Vision" },
  { href: "/action-potential", label: "Action Potential" },
  { href: "/motor-pathway", label: "Motor Pathway" },
  { href: "/gait", label: "Gait" },
  { href: "/cranial-nerves", label: "Cranial Nerves" },
  { href: "/stroke", label: "Stroke" },
  { href: "/dermatome", label: "Dermatomes" },
  { href: "/sleep", label: "Sleep" },
  { href: "/ask", label: "Ask" },
] as const;

export const moduleCards: ModuleCard[] = [
  {
    slug: "brain-atlas",
    title: "Brain Atlas",
    description:
      "Explore major regions, convergence overlays, and conference-style localization cases that now include medial motivation hubs, parietal attention maps, insular interoception, and salience-autonomic network reasoning.",
    badge: "Anatomy",
    href: "/brain-atlas",
  },
  {
    slug: "neuron",
    title: "Neuron Simulation",
    description:
      "Compare quiet reserve, near-threshold recruitment, regular spiking, and refractory-limited high-drive phenotypes in a clinically framed LIF lab.",
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
    slug: "neglect",
    title: "Neglect Localizer",
    description:
      "Separate viewer-centered neglect, extinction, object-centered truncation, and motor-intentional bias with an attention map, bedside-task readouts, and field-cut differentials.",
    badge: "Attention",
    href: "/neglect",
  },
  {
    slug: "aphasia",
    title: "Aphasia Syndrome Localizer",
    description:
      "Compare Broca, Wernicke, conduction, global, and transcortical aphasias through bedside language-profile splits, dominant-hemisphere network mapping, and task-level dissociations.",
    badge: "Language",
    href: "/aphasia",
  },
  {
    slug: "plasticity",
    title: "Synaptic Plasticity",
    description:
      "Compare causal potentiation, anti-causal depression, metaplastic restraint, and saturation risk with a richer STDP teaching surface.",
    badge: "Learning",
    href: "/plasticity",
  },
  {
    slug: "dopamine",
    title: "Dopamine Prediction Error Lab",
    description:
      "Compare canonical transfer, cue capture, blunted transfer, and omission-sensitive phenotypes as prediction errors shift from reward delivery toward the predictive cue.",
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
      "Use a shared consult-level reasoning rubric across lesion localization, neuro-ophthalmology, epileptology, neurovascular syndromes, and neurocardiology, now with structured scoring, confidence grading, and explicit missed-step feedback.",
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
      "Explore canonical lattices, broad low-resolution fields, noisy path integration, and compact-room remapping in a clinically framed navigation lab.",
    badge: "Navigation",
    href: "/grid-cell",
  },
  {
    slug: "action-potential",
    title: "Action Potential (Hodgkin-Huxley)",
    description:
      "Full ionic model with Na+ and K+ channel gating dynamics, pharmacological blockade (TTX, TEA), and clinical presets from normal conduction to demyelination.",
    badge: "Ion Channels",
    href: "/action-potential",
  },
  {
    slug: "motor-pathway",
    title: "Motor Pathway Explorer",
    description:
      "Corticospinal tract from cortex to muscle. Select a lesion level to see UMN vs LMN signs, brainstem crossed findings, and clinical vignettes.",
    badge: "Motor System",
    href: "/motor-pathway",
  },
  {
    slug: "gait",
    title: "Gait Pattern Localizer",
    description:
      "Compare parkinsonian, cerebellar, sensory, hemiparetic, and frontal gait phenotypes using footprint geometry, turning burden, and bedside discriminators.",
    badge: "Bedside Exam",
    href: "/gait",
  },
  {
    slug: "cranial-nerves",
    title: "Cranial Nerves Explorer",
    description:
      "All 12 cranial nerves with exam techniques, peripheral vs central lesion patterns, brainstem syndromes (Weber, Wallenberg, CPA), and clinical presets from Bell's palsy to locked-in syndrome.",
    badge: "CN Exam",
    href: "/cranial-nerves",
  },
  {
    slug: "stroke",
    title: "Stroke Vascular Territories",
    description:
      "Map symptoms to arterial territories: MCA, ACA, PCA, basilar, PICA, lacunar. Clinical vignettes with NIHSS estimates, acute management, and the localization logic that separates anterior from posterior circulation.",
    badge: "Vascular",
    href: "/stroke",
  },
  {
    slug: "dermatome",
    title: "Dermatome & Sensory Pathways",
    description:
      "Sensory localization from receptor to cortex. Dorsal columns vs spinothalamic tract anatomy, dermatome maps, and clinical syndromes from polyneuropathy to Brown-Séquard to cortical sensory loss.",
    badge: "Sensory System",
    href: "/dermatome",
  },
  {
    slug: "sleep",
    title: "Sleep Architecture",
    description:
      "Hypnogram generation with realistic stage cycling, EEG characteristics per stage, and clinical sleep disorder presets from narcolepsy to RBD.",
    badge: "Sleep Medicine",
    href: "/sleep",
  },
];
