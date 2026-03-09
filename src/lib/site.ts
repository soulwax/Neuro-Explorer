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
  { href: "/grid-cell", label: "Grid Cell" },
  { href: "/ecg", label: "ECG" },
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
      "Explore major regions, trace interlinked circuits, and work through conference-style localization cases with explicit differential traps.",
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
      "Explore linked receptive-field heatmaps, size tuning, and position scans in one typed interface.",
    badge: "Perception",
    href: "/retina",
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
      "Classify images through the internal Next.js API while mapping the result onto the ventral visual stream.",
    badge: "Cloudflare AI",
    href: "/vision",
  },
  {
    slug: "ask",
    title: "Neuro Tutor",
    description:
      "Interrogate lesion localization, movement disorders, neuro-ophthalmology, and mechanism with a post-medical AI tutor.",
    badge: "Cloudflare AI",
    href: "/ask",
  },
  {
    slug: "ecg",
    title: "12-Lead ECG Explorer",
    description:
      "Study ECGs through a neurocardiac lens with autonomic presets, annotated rhythm strips, and a 3D activation map.",
    badge: "Clinical",
    href: "/ecg",
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
