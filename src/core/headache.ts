export interface HeadacheTask {
  label: string;
  finding: string;
  implication: string;
}

export interface HeadachePreset {
  id: string;
  label: string;
  frame: string;
  summary: string;
  mechanism: string;
  strongestLocalization: string;
  dominantClue: string;
  weakerAlternative: string;
  historyDiscriminators: string[];
  redFlagScore: number;
  intensity: number;
  durationLabel: string;
  durationHours: number;
  photophobia: number;
  phonophobia: number;
  autonomicFeatures: number;
  nauseaSeverity: number;
  bedsideTasks: HeadacheTask[];
  teachingPearl: string;
}

export const headachePresets: HeadachePreset[] = [
  {
    id: "migraine-with-aura",
    label: "Migraine with aura",
    frame:
      "Cortical spreading depression with fully reversible neurological aura",
    summary:
      "Unilateral throbbing headache preceded by a gradually evolving visual aura, typically scintillating scotoma or expanding fortification spectra, followed by photophobia, phonophobia, and nausea.",
    mechanism:
      "Cortical spreading depression - a slow wave of neuronal and glial depolarization followed by suppression - propagates across the cortex (classically occipital, producing visual aura) and is thought to activate trigeminovascular afferents, producing the headache phase.",
    strongestLocalization:
      "Occipital/visual cortex spreading depression producing a gradually marching positive visual phenomenon, not a fixed structural lesion.",
    dominantClue:
      "The aura's gradual march (5-60 minutes) and positive symptoms (scintillations, zigzag lines), not a sudden negative deficit, is what separates it from TIA.",
    weakerAlternative:
      "TIA becomes weaker when the deficit evolves gradually with positive visual phenomena rather than an abrupt negative visual field cut, and when headache and photophobia follow the aura.",
    historyDiscriminators: [
      "Aura duration 5 to 60 minutes with gradual march across the visual field",
      "Positive visual phenomena (scintillations, fortification spectra) rather than a sudden field cut",
      "Headache begins during or within 60 minutes of aura resolution",
      "Personal or family history of similar stereotyped episodes",
    ],
    redFlagScore: 15,
    intensity: 75,
    durationLabel: "4 to 72 hours untreated",
    durationHours: 24,
    photophobia: 85,
    phonophobia: 80,
    autonomicFeatures: 20,
    nauseaSeverity: 70,
    bedsideTasks: [
      {
        label: "Aura timeline",
        finding:
          "Symptoms build gradually over 5 to 60 minutes rather than appearing instantly.",
        implication:
          "A gradual march is reassuring against an acute vascular event; a sudden-onset deficit should redirect toward TIA/stroke workup.",
      },
      {
        label: "Visual phenomenology",
        finding:
          "Scintillating scotoma or fortification spectra spreading across the visual field.",
        implication:
          "Positive visual phenomena are typical of cortical spreading depression, not of an ischemic negative field cut.",
      },
      {
        label: "Headache-aura relationship",
        finding: "Headache follows the aura, usually within an hour.",
        implication:
          "An aura without any subsequent headache still counts as migraine aura but should prompt closer scrutiny if this is a first episode.",
      },
    ],
    teachingPearl:
      "A gradually marching, fully reversible positive visual phenomenon followed by headache is migraine aura until proven otherwise - but a first-ever aura after age 50, or a deficit that doesn't fully reverse, should be treated as a red flag.",
  },
  {
    id: "migraine-without-aura",
    label: "Migraine without aura",
    frame: "Recurrent unilateral throbbing headache with migrainous features",
    summary:
      "Moderate-to-severe unilateral throbbing headache lasting hours, worsened by routine physical activity, accompanied by photophobia, phonophobia, and nausea, without a preceding aura.",
    mechanism:
      "Activation and sensitization of the trigeminovascular system with meningeal vasodilation and release of vasoactive neuropeptides (e.g. CGRP), modulated by brainstem and hypothalamic pain-processing nuclei.",
    strongestLocalization:
      "Trigeminovascular system and its central modulating pathways rather than a single fixed anatomic lesion.",
    dominantClue:
      "Unilateral throbbing pain that worsens with routine activity, paired with photophobia, phonophobia, and nausea, in a patient with a stereotyped prior pattern.",
    weakerAlternative:
      "Tension-type headache becomes weaker as the pain becomes more unilateral, more throbbing, and more activity-limiting, and as nausea and photophobia become prominent rather than absent.",
    historyDiscriminators: [
      "Unilateral, throbbing quality",
      "Worsened by routine physical activity (climbing stairs, walking)",
      "Moderate to severe intensity that limits activity",
      "Associated nausea and/or photophobia and phonophobia",
      "Stereotyped recurrence pattern over months to years",
    ],
    redFlagScore: 10,
    intensity: 70,
    durationLabel: "4 to 72 hours untreated",
    durationHours: 18,
    photophobia: 75,
    phonophobia: 70,
    autonomicFeatures: 15,
    nauseaSeverity: 65,
    bedsideTasks: [
      {
        label: "Activity impact",
        finding:
          "Routine physical activity such as climbing stairs makes the pain worse.",
        implication:
          "Activity-worsening pain is a core migrainous feature that tension-type headache lacks.",
      },
      {
        label: "Associated symptom count",
        finding:
          "Nausea plus photophobia and phonophobia are present together.",
        implication:
          "The combination of GI and sensory-sensitivity features separates migraine from tension-type headache more than pain location alone.",
      },
      {
        label: "Pattern stability",
        finding: "The patient recognizes this as their usual headache pattern.",
        implication:
          "A stereotyped, recurring pattern is reassuring; a headache that has changed in character or frequency deserves red-flag screening.",
      },
    ],
    teachingPearl:
      "Migraine without aura is a clinical diagnosis built on pattern recognition - unilateral, throbbing, activity-limiting pain plus nausea or photophobia/phonophobia - not on a single defining test.",
  },
  {
    id: "tension-type",
    label: "Tension-type headache",
    frame: "Bilateral pressing headache without migrainous features",
    summary:
      "Bilateral, band-like or pressing headache of mild-to-moderate intensity, not worsened by routine activity, without significant nausea and with at most mild photophobia or phonophobia (not both).",
    mechanism:
      "Thought to involve peripheral myofascial nociception (pericranial muscle tenderness) in episodic cases and central pain-processing sensitization in chronic/frequent cases, distinct from the vascular/trigeminal mechanism of migraine.",
    strongestLocalization:
      "Diffuse pericranial myofascial and central pain-modulation pathways rather than a lateralized vascular process.",
    dominantClue:
      "Bilateral, non-throbbing, pressing quality that does not limit routine activity and lacks significant nausea.",
    weakerAlternative:
      "Migraine without aura is weaker when the pain stays bilateral and pressing rather than unilateral and throbbing, and when the patient can continue routine activity without significant nausea.",
    historyDiscriminators: [
      "Bilateral location, band-like or pressing (non-pulsatile) quality",
      "Mild to moderate intensity that does not prevent routine activity",
      "No significant nausea or vomiting",
      "At most one of photophobia or phonophobia, not both",
      "Often associated with stress or pericranial muscle tenderness",
    ],
    redFlagScore: 8,
    intensity: 40,
    durationLabel: "30 minutes to 7 days",
    durationHours: 6,
    photophobia: 25,
    phonophobia: 25,
    autonomicFeatures: 5,
    nauseaSeverity: 10,
    bedsideTasks: [
      {
        label: "Pain quality and distribution",
        finding:
          "Bilateral pressing or band-like discomfort rather than unilateral throbbing.",
        implication:
          "Bilateral, non-pulsatile pain is the single strongest feature pulling the diagnosis away from migraine.",
      },
      {
        label: "Activity tolerance",
        finding: "The patient can continue routine activity despite the headache.",
        implication:
          "Preserved function during the headache argues against migraine, which characteristically worsens with activity.",
      },
      {
        label: "Pericranial palpation",
        finding:
          "Tenderness to palpation over the frontalis, temporalis, or trapezius muscles.",
        implication:
          "Pericranial tenderness supports a myofascial contribution, though its absence does not exclude tension-type headache.",
      },
    ],
    teachingPearl:
      "Tension-type headache is defined as much by what is absent - no significant nausea, no activity limitation, no severe unilateral throbbing - as by what is present.",
  },
  {
    id: "cluster-headache",
    label: "Cluster headache",
    frame: "Trigeminal autonomic cephalalgia with strictly unilateral periorbital pain",
    summary:
      "Excruciating strictly unilateral periorbital or temporal pain lasting 15 to 180 minutes, accompanied by ipsilateral autonomic features (lacrimation, conjunctival injection, ptosis, miosis, rhinorrhea, nasal congestion), with the patient restless or agitated rather than lying still, often in clusters with circadian or nocturnal timing.",
    mechanism:
      "Hypothalamic activation (linked to the circadian pattern) driving trigeminal-autonomic reflex activation via the trigeminocervical complex and cranial parasympathetic outflow, producing the ipsilateral autonomic signs alongside severe trigeminal pain.",
    strongestLocalization:
      "Trigeminal-autonomic reflex arc with hypothalamic circadian pacemaker involvement, ipsilateral to the pain.",
    dominantClue:
      "Strictly unilateral periorbital pain with ipsilateral autonomic signs and restlessness or agitation, occurring in a clustering, often nocturnal pattern.",
    weakerAlternative:
      "Migraine becomes weaker when the attacks are much shorter (minutes, not hours), strictly unilateral and side-locked, accompanied by prominent ipsilateral autonomic signs, and the patient paces or rocks rather than seeking a dark, still room.",
    historyDiscriminators: [
      "Strictly unilateral, periorbital/temporal, always the same side within a cluster bout",
      "Duration 15 to 180 minutes per attack, untreated",
      "Ipsilateral autonomic signs: lacrimation, conjunctival injection, ptosis, miosis, rhinorrhea, or nasal congestion",
      "Restlessness or agitation during the attack rather than lying still",
      "Clustering pattern with circadian or nocturnal predominance, remission periods between bouts",
    ],
    redFlagScore: 20,
    intensity: 95,
    durationLabel: "15 to 180 minutes per attack, clustering over weeks",
    durationHours: 1,
    photophobia: 40,
    phonophobia: 35,
    autonomicFeatures: 90,
    nauseaSeverity: 30,
    bedsideTasks: [
      {
        label: "Autonomic sign check",
        finding:
          "Ipsilateral tearing, conjunctival redness, eyelid droop, or nasal congestion on the same side as the pain.",
        implication:
          "Prominent ipsilateral autonomic signs are the hallmark that separates trigeminal autonomic cephalalgias from migraine.",
      },
      {
        label: "Behavior during attack",
        finding:
          "The patient paces, rocks, or presses on the head rather than lying still in a dark room.",
        implication:
          "Restlessness during severe unilateral pain is a classic cluster-headache behavioral clue, opposite to migraine's still, quiet-room preference.",
      },
      {
        label: "Attack timing pattern",
        finding:
          "Attacks cluster over weeks with a similar time of day, often waking the patient at night.",
        implication:
          "Circadian clustering points toward hypothalamic involvement and is rarely seen in migraine or tension-type headache.",
      },
    ],
    teachingPearl:
      "When severe unilateral pain comes with ipsilateral autonomic signs and a restless, pacing patient, think trigeminal autonomic cephalalgia - cluster headache is the prototype, and its brief duration and clustering pattern are what set it apart from migraine.",
  },
  {
    id: "thunderclap-red-flag",
    label: "Thunderclap headache (secondary red flag)",
    frame:
      "Sudden maximal-intensity headache requiring urgent exclusion of subarachnoid hemorrhage and other dangerous secondary causes",
    summary:
      "Headache reaching maximal intensity within seconds to a minute - the 'worst headache of life' - framed as a subarachnoid hemorrhage mimic, with any new neurologic sign, altered consciousness, or exertional/positional trigger raising urgency further.",
    mechanism:
      "Not a single mechanism - thunderclap onset is a presentation pattern that can reflect subarachnoid hemorrhage, cerebral venous sinus thrombosis, reversible cerebral vasoconstriction syndrome, cervical artery dissection, or (after those are excluded) a primary thunderclap headache; the teaching point is the onset pattern itself, which demands urgent structural and vascular exclusion before any benign label is applied.",
    strongestLocalization:
      "No fixed localization - the pattern (sudden maximal-intensity onset) is what places this in the 'must-exclude-secondary-cause' category, not a specific anatomic site.",
    dominantClue:
      "Time-to-maximal-intensity of seconds to about a minute, described as the worst or a distinctly different headache from the patient's usual pattern.",
    weakerAlternative:
      "Migraine and other primary headaches become far weaker whenever the onset is truly abrupt (seconds, not minutes-to-hours) or the headache is described as clearly different from the patient's typical pattern - those features should not be explained away as 'just a bad migraine' until secondary causes are excluded.",
    historyDiscriminators: [
      "Time-to-maximal intensity of seconds to about a minute",
      "Description as 'the worst headache of my life' or clearly different from usual headaches",
      "New neurologic signs: neck stiffness, altered consciousness, focal deficit, seizure",
      "Onset during exertion, Valsalva, or sexual activity",
      "New headache after age 50, or in pregnancy/postpartum",
    ],
    redFlagScore: 95,
    intensity: 98,
    durationLabel: "Reaches maximal intensity within seconds to about a minute",
    durationHours: 2,
    photophobia: 50,
    phonophobia: 45,
    autonomicFeatures: 15,
    nauseaSeverity: 75,
    bedsideTasks: [
      {
        label: "Onset timing",
        finding:
          "The patient reports the pain reached its worst point within seconds to roughly a minute.",
        implication:
          "Time-to-maximal-intensity, not pain severity alone, is the discriminator that should trigger urgent secondary-headache workup.",
      },
      {
        label: "Meningismus and neuro exam",
        finding:
          "Neck stiffness, photophobia out of proportion to a typical migraine, or any new focal deficit.",
        implication:
          "Any of these substantially raises concern for subarachnoid hemorrhage or another structural cause and should not be attributed to migraine without exclusion.",
      },
      {
        label: "Trigger context",
        finding: "Onset during exertion, straining, or sexual activity.",
        implication:
          "Exertional or Valsalva-associated onset is classically associated with subarachnoid hemorrhage and reversible cerebral vasoconstriction syndrome.",
      },
    ],
    teachingPearl:
      "The single most important discriminator in headache medicine is not how severe the pain is, but how fast it got there - a headache that is maximal within seconds to a minute is a thunderclap headache until proven otherwise, regardless of how it later behaves.",
  },
];

export function getHeadachePreset(id: string): HeadachePreset | undefined {
  return headachePresets.find((preset) => preset.id === id);
}

export function redFlagTier(score: number): "low" | "moderate" | "high" {
  if (score < 35) {
    return "low";
  }

  if (score < 70) {
    return "moderate";
  }

  return "high";
}
