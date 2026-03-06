export interface ModuleCard {
  slug: string;
  title: string;
  description: string;
  status: "migrated" | "legacy";
  href?: string;
}

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/brain-atlas", label: "Brain Atlas" },
  { href: "/neuron", label: "Neuron" },
  { href: "/retina", label: "Retina" },
  { href: "/plasticity", label: "Plasticity" },
  { href: "/dopamine", label: "Dopamine" },
] as const;

export const moduleCards: ModuleCard[] = [
  {
    slug: "brain-atlas",
    title: "Brain Atlas",
    description:
      "Migrated to App Router as the first typed React slice. Explore major regions in Chapter 1, then switch to Chapter 2 for interlinked circuits.",
    status: "migrated",
    href: "/brain-atlas",
  },
  {
    slug: "neuron",
    title: "Neuron Simulation",
    description:
      "Migrated to App Router as a live local-compute module. Tune the LIF parameters and see the membrane trace update without the old fetch-plus-template cycle.",
    status: "migrated",
    href: "/neuron",
  },
  {
    slug: "retina",
    title: "Retinal Receptive Field Lab",
    description:
      "Migrated to App Router with linked heatmaps and tuning curves. It demonstrates the richer interactive pattern for deterministic neuroscience modules.",
    status: "migrated",
    href: "/retina",
  },
  {
    slug: "plasticity",
    title: "Synaptic Plasticity",
    description:
      "Migrated to App Router as a local learning module. Explore causal versus non-causal spike timing with a typed STDP curve and weight-evolution view.",
    status: "migrated",
    href: "/plasticity",
  },
  {
    slug: "dopamine",
    title: "Dopamine Prediction Error Lab",
    description:
      "Migrated to App Router as a deterministic reinforcement-learning module. Watch prediction errors shift from reward delivery to the predictive cue as learning unfolds.",
    status: "migrated",
    href: "/dopamine",
  },
  {
    slug: "vision",
    title: "Visual Cortex",
    description:
      "Still on the legacy runtime for now. This is a good next migration target because it is mostly a data-driven explainer page.",
    status: "legacy",
  },
  {
    slug: "ecg",
    title: "12-Lead ECG Explorer",
    description:
      "Still on the legacy runtime. It will benefit from typed components because the current UI is a large inline SVG/JS template.",
    status: "legacy",
  },
  {
    slug: "grid-cell",
    title: "Grid Cell Navigator",
    description:
      "Still on the legacy runtime. It is deterministic and portable, but the arena-path and heatmap rendering make it a larger stable-first migration slice.",
    status: "legacy",
  },
];
