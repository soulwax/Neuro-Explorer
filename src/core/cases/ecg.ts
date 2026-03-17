import type { ECGClinicalCase } from "~/core/cases";

export const ecgCases: ECGClinicalCase[] = [
  {
    id: "sah-neurocardiac-stress",
    title: "Acute SAH with a misleading fast strip",
    oneLiner:
      "A neurocritical patient develops tachycardia and repolarization distortion after subarachnoid hemorrhage.",
    chiefComplaint:
      "The bedside team worries the ECG means primary ischemic heart disease rather than the neurologic event itself.",
    history:
      "The tracing changed after the hemorrhage, the patient is adrenergic and critically ill, and the first question is whether the heart is primary or responding to the brain.",
    syndromeFrame:
      "This is a neurocardiac consult problem, not a pure waveform recognition problem. The localization question lives in the central autonomic network and sympathetic surge.",
    examFindings: [
      "Fast, relatively fixed rhythm",
      "Acute neurocritical trigger already established",
      "Repolarization changes that could tempt overcalling ACS",
    ],
    prompt:
      "Which consult frame best fits, and why is ACS by first-strip appearance alone the weaker interpretation?",
    hints: [
      "Time the ECG to the neurological event.",
      "Ask what serial data would settle the ambiguity.",
    ],
    localizationCues: [
      "The brain injury precedes the ECG distortion.",
      "Sympathetic crisis can explain rate and repolarization drift without primary coronary occlusion.",
    ],
    differentialTraps: [
      "Do not let a single ECG erase the neurological context that generated it.",
      "Do not assume catecholamine physiology excludes true cardiac disease either; that is why serial data matter.",
    ],
    nextDataRequests: [
      "Serial ECGs and biomarkers",
      "Bedside hemodynamics and neurocritical trend",
    ],
    teachingPoints: [
      "The strip is part of a brain-heart syndrome, not just a cardiology artifact.",
      "Trend matters more than a single dramatic tracing.",
    ],
    followUpModules: ["ask", "brain-atlas", "ecg"],
    expectedConsultFrameId: "neurogenic-stress-pattern",
    startingConsultFrameId: "postictal-neurocardiac-pattern",
  },
  {
    id: "postictal-surge",
    title: "Fast strip immediately after a seizure",
    oneLiner:
      "A patient arrives post-ictal with tachycardia and reduced sinus variability.",
    chiefComplaint:
      "The team wants to know whether the ECG reflects a primary arrhythmia or a post-ictal autonomic state.",
    history:
      "The tracing was captured shortly after convulsive activity, and the question is whether transient cortical-autonomic spillover explains the physiology better than primary cardiac disease.",
    syndromeFrame:
      "This is a timing-and-context neurocardiac problem. The strongest explanation should respect the seizure timeline before declaring a primary cardiac syndrome.",
    examFindings: [
      "Post-ictal timing",
      "Fast, adrenergic strip",
      "Reduced sinus variability compared with a calmer baseline",
    ],
    prompt:
      "Which consult frame best fits, and what single serial data stream would most change your mind?",
    hints: [
      "Post-event timing matters here.",
      "One tracing is almost never enough.",
    ],
    localizationCues: [
      "The change follows cortical discharge rather than preceding it.",
      "Adrenergic spillover is a parsimonious first explanation.",
    ],
    differentialTraps: [
      "Do not call transient post-ictal physiology stable heart disease without a trend.",
      "Do not assume every post-ictal tracing is benign if the serial course disagrees.",
    ],
    nextDataRequests: [
      "Repeat ECG after autonomic recovery",
      "Troponin trend and symptom context",
    ],
    teachingPoints: [
      "The tutor logic from other modules still applies: strongest fit, rival alternative, and what changes your mind.",
      "Post-ictal ECG interpretation is a timing problem as much as a waveform problem.",
    ],
    followUpModules: ["ask", "ecg"],
    expectedConsultFrameId: "postictal-neurocardiac-pattern",
    startingConsultFrameId: "neurogenic-stress-pattern",
  },
  {
    id: "brainstem-lability",
    title: "Bulbar signs with autonomic lability",
    oneLiner:
      "A patient with brainstem signs develops a strikingly labile rhythm that shifts with respiration and bedside state.",
    chiefComplaint:
      "The rhythm feels unstable, but the waveform does not behave like a single fixed conduction lesion.",
    history:
      "There are bulbar or ocular clues to a posterior fossa process, and the ECG instability seems to track central state rather than isolated cardiac structure.",
    syndromeFrame:
      "This is a medullary or pontine autonomic-network problem until proven otherwise. The task is to separate central lability from fixed nodal pathology.",
    examFindings: [
      "Brainstem signs present",
      "Rhythm lability linked to state",
      "Mixed vagal and sympathetic expression rather than one fixed direction",
    ],
    prompt:
      "Which consult frame best fits, and why is isolated intrinsic conduction disease weaker?",
    hints: [
      "Compact brainstem syndromes can reach the ECG.",
      "Ask whether the rhythm behaves structurally fixed or centrally labile.",
    ],
    localizationCues: [
      "The ECG shifts with central state.",
      "Bulbar or ocular findings make the autonomic story anatomical.",
    ],
    differentialTraps: [
      "Do not separate the strip from the posterior fossa syndrome.",
      "Do not confuse lability with randomness.",
    ],
    nextDataRequests: [
      "Trend the strip against brainstem exam findings",
      "Watch for respiratory and postural coupling",
    ],
    teachingPoints: [
      "Brainstem autonomic dysregulation can produce a surface rhythm story.",
      "The absence of a fixed conduction pattern is itself localizing.",
    ],
    followUpModules: ["brain-atlas", "ask", "ecg"],
    expectedConsultFrameId: "brainstem-dysautonomia-pattern",
    startingConsultFrameId: "fixed-autonomic-output",
  },
  {
    id: "raised-pressure-bradycardia",
    title: "Bradycardia in a rising-pressure context",
    oneLiner:
      "A neurocritical patient becomes strikingly bradycardic with stronger nodal braking as intracranial pressure concern rises.",
    chiefComplaint:
      "The team needs to know whether this slow strip is benign physiology or a warning sign from the brain.",
    history:
      "The context is deteriorating neurologically, not improving athletically. The ECG change arrives with pressure concern and bedside decline.",
    syndromeFrame:
      "This is a neurocritical warning pattern until proven otherwise. The right comparison is not athletic bradycardia, but pressure-driven central vagal recruitment.",
    examFindings: [
      "Marked bradycardia",
      "Stronger nodal braking",
      "High-risk neurological context",
    ],
    prompt:
      "Which consult frame best fits, and why is benign baseline bradycardia the weaker alternative?",
    hints: [
      "The same waveform can mean different things in different contexts.",
      "Context is part of the physiology, not decoration.",
    ],
    localizationCues: [
      "The slow rhythm emerges with neurological deterioration.",
      "Central pressure physiology explains rate and nodal delay together.",
    ],
    differentialTraps: [
      "Do not call neurocritical bradycardia athletic because the rate is low.",
      "Do not miss the urgency because the rhythm looks organized.",
    ],
    nextDataRequests: [
      "Immediate neuro exam and pressure context",
      "Trend hemodynamics and strip evolution",
    ],
    teachingPoints: [
      "Slow can be dangerous when the brain is supplying the brake.",
      "The neurological emergency can be the primary rhythm diagnosis.",
    ],
    followUpModules: ["brain-atlas", "ask", "ecg"],
    expectedConsultFrameId: "cushing-neurocritical-pattern",
    startingConsultFrameId: "vagotonic-bradycardia",
  },
];
