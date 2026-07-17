import type { HeadacheClinicalCase } from "~/core/cases";

export const headacheCases: HeadacheClinicalCase[] = [
  {
    id: "sudden-worst-headache",
    title: "Sudden 'worst headache of my life' during exertion",
    oneLiner:
      "A 44-year-old develops instantaneous, maximal-intensity headache while lifting weights, with neck stiffness on exam.",
    chiefComplaint:
      "It felt like someone hit me in the back of the head. It was the worst pain I've ever had, and it was full-blown within seconds.",
    history:
      "Onset during a heavy deadlift. Pain reached maximal intensity almost immediately. Brief loss of awareness reported by a gym partner. No prior history of similar headaches. No fever.",
    syndromeFrame:
      "Thunderclap onset (seconds to maximal intensity) plus exertional trigger plus transient loss of awareness is the classic subarachnoid hemorrhage presentation until proven otherwise - this pattern, not the pain severity alone, is what demands urgent neuroimaging and, if CT is negative, further workup.",
    examFindings: [
      "Neck stiffness (nuchal rigidity) on exam",
      "Photophobia",
      "No focal motor or sensory deficit",
      "Alert but appears distressed",
      "Blood pressure mildly elevated",
    ],
    prompt:
      "Why does the speed of onset matter more than the severity of pain here, and what does the exertional trigger add to your concern?",
    hints: [
      "Compare time-to-maximal-intensity here with how migraine or tension-type headaches typically build.",
      "Think about what structural event an exertional/Valsalva trigger with sudden severe head pain classically produces.",
    ],
    localizationCues: [
      "Seconds-to-maximal-intensity onset points to a vascular/structural event, not a primary headache disorder.",
      "Nuchal rigidity suggests meningeal irritation, consistent with subarachnoid blood.",
    ],
    differentialTraps: [
      "Do not label this 'a bad migraine' because the patient has had headaches before - the onset pattern here is categorically different from a prior stereotyped pattern.",
      "A normal neurologic exam does not exclude subarachnoid hemorrhage; the onset pattern alone is enough to mandate urgent imaging.",
    ],
    nextDataRequests: [
      "Non-contrast CT head immediately",
      "If CT negative and clinical suspicion remains, lumbar puncture (looking for xanthochromia) or CT angiography per local protocol",
      "Blood pressure management and neurosurgical consultation if hemorrhage confirmed",
    ],
    teachingPoints: [
      "Time-to-maximal-intensity, not pain severity, is the single most important historical discriminator for thunderclap headache.",
      "Exertional or Valsalva-associated onset raises concern specifically for subarachnoid hemorrhage and reversible cerebral vasoconstriction syndrome.",
      "A first severe headache in a patient without a prior headache history should never be assumed to be a primary headache disorder.",
    ],
    followUpModules: ["brain-atlas", "ask"],
    expectedPresetId: "thunderclap-red-flag",
    startingPresetId: "migraine-without-aura",
  },
  {
    id: "visual-aura-before-headache",
    title: "Zigzag lights before a one-sided throbbing headache",
    oneLiner:
      "A 27-year-old reports a slowly expanding shimmering zigzag pattern in her vision for 25 minutes, followed by a right-sided throbbing headache with light sensitivity.",
    chiefComplaint:
      "I see these shimmering zigzag lines that slowly spread across my vision, and then about 20 minutes later I get this awful throbbing headache on one side.",
    history:
      "Episodes recur roughly monthly, always with the same visual pattern preceding the headache. Visual symptoms last 20 to 30 minutes and gradually enlarge before resolving completely. Headache follows within an hour, right-sided, throbbing, worse with activity, with nausea and photophobia. No headache-free visual episodes. Family history of similar episodes in her mother.",
    syndromeFrame:
      "A visual aura that gradually marches and expands over 20 to 30 minutes, is fully reversible, and is followed by a typical migrainous headache is migraine with aura - the gradual, positive, fully-reversible nature of the visual phenomenon is what separates this from a vascular event like TIA or ocular pathology.",
    examFindings: [
      "Normal visual acuity and visual fields between episodes",
      "Normal fundoscopic exam",
      "No focal neurologic deficit",
      "Normal cranial nerve exam",
    ],
    prompt:
      "What features of this visual phenomenon argue for migraine aura over a TIA, and why does the stereotyped, recurring pattern matter?",
    hints: [
      "Consider the timeline: how fast did the visual symptom appear, and did it grow or spread?",
      "Positive phenomena (shimmering, zigzag lines) versus negative phenomena (a blank or missing area) point in different directions.",
    ],
    localizationCues: [
      "A gradually marching, expanding positive visual phenomenon over 20 to 30 minutes is characteristic of cortical spreading depression, not embolic occlusion.",
      "Full, complete resolution of the visual symptom before headache onset supports a functional (spreading depression) rather than ischemic process.",
    ],
    differentialTraps: [
      "Do not dismiss recurrent stereotyped visual auras as anxiety or eye strain without considering migraine.",
      "Do not assume every visual aura needs an urgent stroke workup - the gradual march and positive quality, plus a stereotyped recurring pattern, are reassuring, though a first-ever aura or one that behaves differently deserves more scrutiny.",
    ],
    nextDataRequests: [
      "Detailed headache diary to confirm the stereotyped pattern",
      "Ophthalmologic exam if this is a new or atypical visual symptom",
      "Vascular risk factor assessment if the pattern changes or red flags emerge",
    ],
    teachingPoints: [
      "Migraine aura is defined by gradual onset (5 to 60 minutes), positive phenomena, and full reversibility - all three matter, not just the visual symptom itself.",
      "A stereotyped, recurring aura pattern with a family history is reassuring for migraine, but any change in pattern should prompt reassessment.",
      "Aura can occur with or without a subsequent headache, and either presentation is still classified as migraine aura.",
    ],
    followUpModules: ["vision", "visual-field", "ask"],
    expectedPresetId: "migraine-with-aura",
    startingPresetId: "migraine-without-aura",
  },
  {
    id: "nightly-eye-pain-with-tearing",
    title: "Nightly excruciating eye pain with tearing and restlessness",
    oneLiner:
      "A 38-year-old man reports three weeks of nightly, severe one-sided eye pain lasting about 45 minutes, with tearing and a droopy eyelid, during which he paces the room.",
    chiefComplaint:
      "It's always the same eye, always around 2am, and it's so bad I can't sit still - I have to get up and pace or I feel like I'll lose my mind.",
    history:
      "Nightly attacks for three weeks, always right-sided, periorbital, lasting 30 to 60 minutes, resolving spontaneously. During attacks: right eye tearing, redness, and a droopy eyelid, plus nasal congestion on the right. No visual aura. No significant nausea. Between attacks he feels entirely normal. A similar bout occurred about a year ago, also lasting several weeks, then resolved completely for months.",
    syndromeFrame:
      "Strictly unilateral, brief, severe periorbital attacks with ipsilateral autonomic signs (tearing, ptosis, nasal congestion), a restless or agitated behavior pattern, and circadian clustering with a prior remitting-relapsing bout is the classic presentation of episodic cluster headache - a trigeminal autonomic cephalalgia, not migraine.",
    examFindings: [
      "Mild right ptosis and miosis interictally (partial Horner-like findings can persist between attacks in some patients)",
      "Normal visual acuity and visual fields",
      "No focal motor or sensory deficit",
      "Normal extraocular movements",
    ],
    prompt:
      "What combination of features here points to a trigeminal autonomic cephalalgia rather than migraine, and why does the patient's behavior during the attack matter?",
    hints: [
      "Compare the attack duration and the presence of ipsilateral autonomic signs to what you'd expect from migraine.",
      "Think about what a patient does during a migraine attack versus what this patient is doing.",
    ],
    localizationCues: [
      "Ipsilateral autonomic signs (tearing, ptosis, nasal congestion) localize to trigeminal-autonomic reflex activation, not a purely cortical process.",
      "The circadian, clustering pattern implicates hypothalamic involvement in triggering the bouts.",
    ],
    differentialTraps: [
      "Do not label this migraine because it is severe and one-sided - the short duration, ipsilateral autonomic signs, and restlessness argue strongly against migraine.",
      "Do not mistake the interictal ptosis/miosis for a new structural lesion without correlating it to the classic cluster pattern; however, a first presentation like this still warrants imaging to exclude a structural mimic before settling on the diagnosis.",
    ],
    nextDataRequests: [
      "MRI brain (with attention to the pituitary/cavernous sinus region) to exclude a structural mimic, especially given interictal findings",
      "Headache diary to confirm clustering pattern and circadian timing",
      "Consider a high-flow oxygen trial for acute attacks, which is classically effective in cluster headache",
    ],
    teachingPoints: [
      "Cluster headache attacks are short (15 to 180 minutes) compared to migraine's hours, which is one of the most useful timing discriminators.",
      "Ipsilateral autonomic signs plus restlessness or agitation during the attack are the behavioral and exam hallmarks of trigeminal autonomic cephalalgias.",
      "A structural mimic should be excluded on first presentation of a trigeminal autonomic cephalalgia pattern, even when the history is classic.",
    ],
    followUpModules: ["cranial-nerves", "sleep", "ask"],
    expectedPresetId: "cluster-headache",
    startingPresetId: "migraine-with-aura",
  },
];
