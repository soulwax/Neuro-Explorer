/**
 * Cranial Nerves Explorer
 *
 * All 12 cranial nerves with exam techniques, lesion patterns,
 * brainstem localization, and clinical syndrome generation.
 */

export interface CranialNerve {
  number: number;
  numeral: string;
  name: string;
  type: "sensory" | "motor" | "mixed";
  nuclei: string[];
  brainstemLevel: "midbrain" | "pons" | "medulla" | "forebrain";
  foramen: string;
  functions: string[];
  examTechnique: string[];
  normalFinding: string;
  peripheralLesion: CranialNerveLesionPattern;
  centralLesion: CranialNerveLesionPattern | null;
  clinicalPearls: string[];
}

export interface CranialNerveLesionPattern {
  label: string;
  signs: string[];
  mechanism: string;
  commonCauses: string[];
}

export interface CranialNerveSyndrome {
  id: string;
  label: string;
  description: string;
  location: string;
  affectedNerves: number[];
  signs: string[];
  mechanism: string;
  differentialClues: string[];
  emergencyFeatures: string[];
}

export interface CranialNervePreset {
  id: string;
  label: string;
  description: string;
  selectedNerve: number | null;
  syndromeId: string | null;
  clinicalVignette: string;
}

export const cranialNerves: CranialNerve[] = [
  {
    number: 1,
    numeral: "I",
    name: "Olfactory",
    type: "sensory",
    nuclei: ["Olfactory bulb", "Olfactory cortex (piriform)"],
    brainstemLevel: "forebrain",
    foramen: "Cribriform plate",
    functions: ["Smell (conscious olfaction)"],
    examTechnique: [
      "Test each nostril separately with non-trigeminal stimuli (coffee, vanilla, cinnamon)",
      "Avoid ammonia or menthol — these stimulate CN V, not CN I",
      "UPSIT (scratch-and-sniff) for quantitative testing",
    ],
    normalFinding: "Bilateral identification of familiar odors",
    peripheralLesion: {
      label: "Anosmia (peripheral)",
      signs: [
        "Unilateral or bilateral loss of smell",
        "Taste often reported as diminished (flavor = smell + taste)",
      ],
      mechanism:
        "Shearing of olfactory filaments at the cribriform plate, or mucosal damage",
      commonCauses: [
        "Head trauma (anterior fossa fracture)",
        "Viral upper respiratory infection",
        "Nasal polyps / chronic sinusitis",
        "Aging (presbyosmia)",
      ],
    },
    centralLesion: {
      label: "Anosmia (central)",
      signs: [
        "Anosmia with preserved trigeminal chemesthesis",
        "May have olfactory hallucinations (uncinate seizures) with temporal lobe lesions",
      ],
      mechanism: "Damage to olfactory cortex or its connections",
      commonCauses: [
        "Olfactory groove meningioma (Foster Kennedy syndrome)",
        "Temporal lobe epilepsy (olfactory aura)",
        "Neurodegenerative disease (PD, AD — earliest sign)",
      ],
    },
    clinicalPearls: [
      "Anosmia + ipsilateral optic atrophy + contralateral papilledema = Foster Kennedy syndrome (olfactory groove mass)",
      "Anosmia is the strongest prodromal marker for Parkinson disease (with RBD and constipation)",
      "Patients often describe smell loss as taste loss — always clarify",
    ],
  },
  {
    number: 2,
    numeral: "II",
    name: "Optic",
    type: "sensory",
    nuclei: [
      "Retinal ganglion cells",
      "Lateral geniculate nucleus",
      "Superior colliculus",
    ],
    brainstemLevel: "forebrain",
    foramen: "Optic canal",
    functions: ["Vision", "Pupillary light reflex (afferent limb)"],
    examTechnique: [
      "Visual acuity (Snellen chart or near card)",
      "Visual fields by confrontation (each eye separately)",
      "Color vision (Ishihara plates or red desaturation)",
      "Pupillary responses: direct, consensual, RAPD (swinging flashlight test)",
      "Fundoscopy: disc margins, cup-to-disc ratio, vessel caliber",
    ],
    normalFinding:
      "Corrected acuity ≥20/20, full fields, brisk symmetric pupils, normal fundi",
    peripheralLesion: {
      label: "Optic neuropathy",
      signs: [
        "Decreased acuity in the affected eye",
        "Relative afferent pupillary defect (RAPD / Marcus Gunn pupil)",
        "Color desaturation (red appears washed out)",
        "Visual field defect (central scotoma, altitudinal, arcuate)",
      ],
      mechanism:
        "Damage to the optic nerve before the chiasm — affects one eye only",
      commonCauses: [
        "Optic neuritis (MS, NMOSD)",
        "Ischemic optic neuropathy (anterior or posterior)",
        "Compression (meningioma, pituitary adenoma)",
        "Glaucoma (chronic optic neuropathy)",
      ],
    },
    centralLesion: {
      label: "Chiasmal / retrochiasmal",
      signs: [
        "Bitemporal hemianopia (chiasm)",
        "Homonymous hemianopia (optic tract / LGN / radiation / cortex)",
        "No RAPD with cortical lesions",
      ],
      mechanism:
        "Crossing fibers at the chiasm or post-chiasmal pathway damage",
      commonCauses: [
        "Pituitary adenoma (chiasmal compression)",
        "Stroke (PCA territory for occipital)",
        "Mass lesion along the optic radiation",
      ],
    },
    clinicalPearls: [
      "RAPD is the single most important pupil finding — it proves optic nerve disease on the affected side",
      "An RAPD cannot be caused by cataract, refractive error, or corneal opacity alone",
      "Red desaturation is more sensitive than Snellen acuity for early optic neuropathy",
    ],
  },
  {
    number: 3,
    numeral: "III",
    name: "Oculomotor",
    type: "motor",
    nuclei: [
      "Oculomotor nucleus (midbrain)",
      "Edinger-Westphal nucleus (parasympathetic)",
    ],
    brainstemLevel: "midbrain",
    foramen: "Superior orbital fissure",
    functions: [
      "Elevate, depress, adduct the eye (SR, IR, MR, IO)",
      "Elevate the eyelid (levator palpebrae)",
      "Constrict the pupil (parasympathetic via ciliary ganglion)",
      "Accommodation",
    ],
    examTechnique: [
      "Observe for ptosis at rest",
      "Test eye movements in H-pattern (6 cardinal positions)",
      "Check pupil size and reactivity",
      "Look for 'down and out' position (unopposed SO + LR)",
    ],
    normalFinding:
      "Full eye movements, symmetric lid position, equal round reactive pupils",
    peripheralLesion: {
      label: "CN III palsy (complete)",
      signs: [
        "Ptosis (levator palpebrae paralysis)",
        "Eye 'down and out' (unopposed LR + SO action)",
        "Dilated pupil (parasympathetic fibers on surface of nerve)",
        "Loss of accommodation",
      ],
      mechanism:
        "Peripheral nerve compression or ischemia — pupil involvement depends on mechanism",
      commonCauses: [
        "Posterior communicating artery aneurysm (PUPIL-INVOLVING = emergency)",
        "Diabetic microvascular ischemia (PUPIL-SPARING, painful, resolves in months)",
        "Uncal herniation (ipsilateral dilated pupil = neurosurgical emergency)",
        "Cavernous sinus lesion (multiple CN involvement)",
      ],
    },
    centralLesion: {
      label: "Nuclear / fascicular CN III",
      signs: [
        "May have contralateral SR weakness (SR subnucleus innervates contralateral SR)",
        "Bilateral ptosis possible (single midline levator subnucleus)",
        "Often combined with contralateral hemiparesis (Weber syndrome)",
      ],
      mechanism: "Midbrain nuclear or fascicular damage",
      commonCauses: [
        "Midbrain stroke",
        "Midbrain hemorrhage",
        "Demyelination",
      ],
    },
    clinicalPearls: [
      "PUPIL-INVOLVING CN III palsy = posterior communicating artery aneurysm until proven otherwise (CT angiography STAT)",
      "Parasympathetic fibers travel on the OUTSIDE of the nerve — compression affects pupil first, ischemia spares it",
      "Weber syndrome = ipsilateral CN III + contralateral hemiparesis = midbrain localization",
    ],
  },
  {
    number: 4,
    numeral: "IV",
    name: "Trochlear",
    type: "motor",
    nuclei: ["Trochlear nucleus (dorsal midbrain)"],
    brainstemLevel: "midbrain",
    foramen: "Superior orbital fissure",
    functions: [
      "Intort and depress the eye (superior oblique)",
      "Primarily depresses the eye when adducted",
    ],
    examTechnique: [
      "Test downward gaze in adduction (look down and in)",
      "Head tilt test (Bielschowsky): vertical diplopia worsens with head tilt toward the affected side",
      "Look for compensatory head tilt AWAY from the lesion",
    ],
    normalFinding: "Full downgaze in adduction, no head tilt",
    peripheralLesion: {
      label: "CN IV palsy",
      signs: [
        "Vertical diplopia, worst looking down and toward the nose",
        "Hypertropia of the affected eye (especially in adduction)",
        "Compensatory contralateral head tilt",
        "Difficulty reading or descending stairs",
      ],
      mechanism:
        "The longest and thinnest CN with dorsal exit — uniquely vulnerable to trauma",
      commonCauses: [
        "Head trauma (most common cause — bilateral CN IV palsy pathognomonic for dorsal midbrain contusion)",
        "Microvascular ischemia (diabetes, hypertension)",
        "Congenital (decompensated longstanding strabismus — look at old photos)",
      ],
    },
    centralLesion: null,
    clinicalPearls: [
      "CN IV is the only cranial nerve that exits DORSALLY and CROSSES completely — the right CN IV nucleus innervates the left superior oblique",
      "Bilateral CN IV palsy after head trauma = dorsal midbrain contusion until proven otherwise",
      "A compensatory head tilt visible in childhood photos suggests congenital CN IV palsy, not a new lesion",
    ],
  },
  {
    number: 5,
    numeral: "V",
    name: "Trigeminal",
    type: "mixed",
    nuclei: [
      "Mesencephalic nucleus (proprioception)",
      "Principal sensory nucleus (touch, pons)",
      "Spinal nucleus of V (pain/temperature, medulla → C2)",
      "Motor nucleus of V (mastication, pons)",
    ],
    brainstemLevel: "pons",
    foramen: "V1: superior orbital fissure; V2: foramen rotundum; V3: foramen ovale",
    functions: [
      "Facial sensation in 3 divisions (V1 ophthalmic, V2 maxillary, V3 mandibular)",
      "Muscles of mastication (temporalis, masseter, pterygoids)",
      "Corneal reflex (afferent limb)",
      "Jaw jerk reflex",
    ],
    examTechnique: [
      "Light touch and pinprick in all 3 divisions bilaterally",
      "Corneal reflex: cotton wisp to cornea → bilateral blink",
      "Jaw opening: observe for deviation (pterygoids)",
      "Jaw clench: palpate masseter and temporalis",
      "Jaw jerk: tap chin with mouth slightly open",
    ],
    normalFinding:
      "Symmetric sensation in all 3 divisions, brisk corneal reflex, strong symmetric jaw clench, normal jaw jerk",
    peripheralLesion: {
      label: "Trigeminal neuropathy",
      signs: [
        "Numbness in one or more divisions",
        "Absent corneal reflex (V1 involvement)",
        "Jaw deviation toward the weak side on opening (pterygoid weakness)",
        "Trigeminal neuralgia: lancinating pain in V2/V3 distribution",
      ],
      mechanism: "Peripheral nerve, ganglion, or root damage",
      commonCauses: [
        "Trigeminal neuralgia (vascular compression at root entry zone)",
        "CPA tumor (acoustic neuroma, meningioma)",
        "Cavernous sinus lesion (V1 ± V2 with CN III, IV, VI)",
        "Herpes zoster ophthalmicus (V1)",
      ],
    },
    centralLesion: {
      label: "Nuclear / tract lesion",
      signs: [
        "Onion-skin pattern (perioral sparing, peripheral face affected) with spinal nucleus lesions",
        "'Cape' distribution pain/temperature loss with syringobulbia",
        "Dissociated sensory loss: pain/temperature vs. light touch split",
      ],
      mechanism:
        "The spinal nucleus extends from pons to C2 — lesions produce characteristic patterns",
      commonCauses: [
        "Lateral medullary syndrome (Wallenberg) — ipsilateral facial pain/temperature loss",
        "Syringobulbia",
        "Brainstem MS plaque",
      ],
    },
    clinicalPearls: [
      "An absent corneal reflex is the earliest sign of CN V neuropathy and CPA lesions",
      "The jaw deviates toward the WEAK side (weak pterygoid cannot push mandible to the opposite side)",
      "Trigeminal neuralgia in a young patient should raise suspicion for MS (demyelinating plaque at root entry zone)",
    ],
  },
  {
    number: 6,
    numeral: "VI",
    name: "Abducens",
    type: "motor",
    nuclei: ["Abducens nucleus (caudal pons, floor of 4th ventricle)"],
    brainstemLevel: "pons",
    foramen: "Superior orbital fissure",
    functions: ["Abduct the eye (lateral rectus)"],
    examTechnique: [
      "Test lateral gaze (abduction) in each eye separately",
      "Horizontal diplopia maximal at distance and looking toward the affected side",
      "Esotropia (inward deviation) at rest if complete palsy",
    ],
    normalFinding: "Full abduction bilaterally",
    peripheralLesion: {
      label: "CN VI palsy",
      signs: [
        "Failure to abduct the eye (cannot look laterally)",
        "Horizontal diplopia worse at distance",
        "Esotropia (convergent strabismus)",
        "Head turn TOWARD the affected side (compensatory)",
      ],
      mechanism:
        "Longest intracranial course of any CN — vulnerable to raised ICP, trauma, and infiltration",
      commonCauses: [
        "Raised intracranial pressure (FALSE LOCALIZING SIGN — stretched over petrous apex)",
        "Microvascular ischemia (diabetes)",
        "Pontine stroke or tumor",
        "Trauma (petrous bone fracture)",
        "Cavernous sinus disease",
      ],
    },
    centralLesion: {
      label: "Nuclear CN VI (pontine)",
      signs: [
        "Ipsilateral lateral gaze palsy (cannot abduct OR adduct via MLF connections)",
        "Often with ipsilateral CN VII palsy (fascicle loops around CN VI nucleus)",
        "One-and-a-half syndrome: ipsilateral gaze palsy + contralateral INO",
      ],
      mechanism:
        "CN VI nucleus contains both abducens motoneurons AND interneurons for contralateral medial rectus (via MLF)",
      commonCauses: [
        "Pontine stroke",
        "MS plaque",
        "Pontine glioma",
      ],
    },
    clinicalPearls: [
      "CN VI palsy is the most common FALSE LOCALIZING SIGN — bilateral CN VI palsies in a headache patient = raised ICP until proven otherwise",
      "CN VI nucleus lesion ≠ CN VI nerve lesion — nuclear lesion causes full lateral gaze palsy, not just abduction failure",
      "Millard-Gubler syndrome = ipsilateral CN VI + CN VII palsy + contralateral hemiparesis = ventral pons",
    ],
  },
  {
    number: 7,
    numeral: "VII",
    name: "Facial",
    type: "mixed",
    nuclei: [
      "Facial motor nucleus (pons)",
      "Superior salivatory nucleus (parasympathetic)",
      "Nucleus of solitary tract (taste)",
    ],
    brainstemLevel: "pons",
    foramen: "Internal acoustic meatus → stylomastoid foramen",
    functions: [
      "Facial expression muscles (frontalis, orbicularis oculi, orbicularis oris, etc.)",
      "Taste: anterior 2/3 of tongue (via chorda tympani)",
      "Lacrimation and salivation (submandibular, sublingual glands)",
      "Stapedius muscle (dampens loud sounds)",
    ],
    examTechnique: [
      "Raise eyebrows (frontalis) — KEY UMN vs. LMN test",
      "Close eyes tightly (orbicularis oculi) — test strength",
      "Smile / show teeth (orbicularis oris, zygomaticus)",
      "Puff cheeks",
      "Taste testing if indicated (sweet/salty/sour on anterior tongue)",
    ],
    normalFinding:
      "Symmetric facial movements including forehead, full eye closure, symmetric smile",
    peripheralLesion: {
      label: "LMN facial palsy (Bell's palsy pattern)",
      signs: [
        "ENTIRE HALF OF FACE weak (forehead INCLUDED)",
        "Cannot wrinkle forehead on affected side",
        "Incomplete eye closure (lagophthalmos) — risk of corneal exposure",
        "May have: hyperacusis (stapedius), loss of taste anterior 2/3 tongue, dry eye",
      ],
      mechanism:
        "LMN damage affects all ipsilateral facial muscles because all fibers converge in one nerve trunk",
      commonCauses: [
        "Bell's palsy (idiopathic, likely HSV reactivation — most common cause)",
        "Ramsay Hunt syndrome (VZV — vesicles in ear canal, worse prognosis)",
        "CPA tumor (acoustic neuroma — gradual onset, not sudden)",
        "Lyme disease (can be bilateral!)",
        "Parotid tumor or surgery",
      ],
    },
    centralLesion: {
      label: "UMN facial palsy (supranuclear)",
      signs: [
        "LOWER FACE ONLY weak (forehead SPARED)",
        "Can still wrinkle forehead and close eyes",
        "Emotional facial movements may be preserved (or vice versa — dissociation)",
      ],
      mechanism:
        "Upper face receives BILATERAL corticobulbar input; lower face receives only CONTRALATERAL input",
      commonCauses: [
        "Stroke (MCA territory)",
        "Mass lesion",
        "Forehead sparing is the key — distinguishes from Bell's palsy",
      ],
    },
    clinicalPearls: [
      "FOREHEAD SPARING = UMN = stroke workup. FOREHEAD INVOLVED = LMN = Bell's palsy workup. This is the #1 CN exam distinction.",
      "Bell's palsy is a diagnosis of EXCLUSION — check for vesicles (Ramsay Hunt), bilateral involvement (Lyme, GBS, sarcoid), and gradual onset (tumor)",
      "Eye protection is critical in LMN palsy — inability to close the eye causes corneal desiccation",
    ],
  },
  {
    number: 8,
    numeral: "VIII",
    name: "Vestibulocochlear",
    type: "sensory",
    nuclei: [
      "Cochlear nuclei (hearing)",
      "Vestibular nuclei (balance)",
    ],
    brainstemLevel: "pons",
    foramen: "Internal acoustic meatus",
    functions: ["Hearing (cochlear division)", "Balance and spatial orientation (vestibular division)"],
    examTechnique: [
      "Finger rub or whispered voice test at each ear",
      "Weber test: tuning fork on vertex — lateralizes to conductive loss or away from sensorineural loss",
      "Rinne test: air vs. bone conduction — AC > BC is normal",
      "Head impulse test (vestibular): rapid head turn, watch for corrective saccade",
      "Dix-Hallpike maneuver for BPPV",
    ],
    normalFinding:
      "Symmetric hearing to finger rub, Weber midline, Rinne AC > BC bilaterally, negative head impulse test",
    peripheralLesion: {
      label: "CN VIII lesion (peripheral vestibular/cochlear)",
      signs: [
        "Sensorineural hearing loss (Rinne: AC > BC but both reduced; Weber lateralizes to good ear)",
        "Peripheral vertigo: severe spinning, horizontal-torsional nystagmus, positive head impulse, nausea, worsened by position",
        "Tinnitus (cochlear involvement)",
      ],
      mechanism:
        "Damage to cochlear or vestibular division of CN VIII or their end organs",
      commonCauses: [
        "Vestibular neuritis (acute vertigo, spared hearing)",
        "BPPV (positional, otolith debris in semicircular canal)",
        "Acoustic neuroma / vestibular schwannoma (gradual hearing loss + imbalance)",
        "Ménière disease (episodic vertigo + hearing loss + tinnitus + aural fullness)",
      ],
    },
    centralLesion: {
      label: "Central vestibular syndrome",
      signs: [
        "Direction-changing nystagmus or purely vertical/torsional nystagmus",
        "Negative head impulse test (peripheral pathways intact)",
        "Skew deviation (vertical misalignment of eyes)",
        "Other brainstem signs (diplopia, dysarthria, dysphagia, weakness)",
      ],
      mechanism: "Brainstem or cerebellar vestibular pathway damage",
      commonCauses: [
        "Posterior fossa stroke (PICA, AICA)",
        "MS plaque in brainstem",
        "Cerebellar hemorrhage (EMERGENCY — can cause brainstem compression)",
      ],
    },
    clinicalPearls: [
      "HINTS exam (Head Impulse, Nystagmus, Test of Skew) in acute vertigo: 2/3 central features = stroke until proven otherwise",
      "A NEGATIVE head impulse test in acute vertigo is DANGEROUS — it suggests the peripheral pathway is intact and the problem is central",
      "Acoustic neuroma: gradual unilateral hearing loss + imbalance + absent corneal reflex (CN V compression at CPA)",
    ],
  },
  {
    number: 9,
    numeral: "IX",
    name: "Glossopharyngeal",
    type: "mixed",
    nuclei: [
      "Nucleus ambiguus (motor — stylopharyngeus)",
      "Inferior salivatory nucleus (parasympathetic — parotid)",
      "Nucleus of solitary tract (taste posterior 1/3 tongue)",
      "Spinal nucleus of V (sensation from ear, pharynx)",
    ],
    brainstemLevel: "medulla",
    foramen: "Jugular foramen",
    functions: [
      "Pharyngeal sensation and gag reflex (afferent limb)",
      "Taste: posterior 1/3 of tongue",
      "Stylopharyngeus muscle (elevates pharynx during swallowing)",
      "Carotid body/sinus (chemoreception and baroreception)",
      "Parotid gland secretion",
    ],
    examTechnique: [
      "Gag reflex: touch posterior pharyngeal wall — CN IX is afferent, CN X is efferent",
      "Taste on posterior 1/3 of tongue (rarely tested in isolation)",
      "Usually tested alongside CN X (bulbar function)",
    ],
    normalFinding: "Symmetric gag reflex, intact pharyngeal sensation",
    peripheralLesion: {
      label: "CN IX palsy",
      signs: [
        "Loss of gag reflex on affected side (afferent limb)",
        "Loss of taste on posterior 1/3 of tongue",
        "Minimal dysphagia (stylopharyngeus only)",
        "Glossopharyngeal neuralgia: severe lancinating pain in throat/ear triggered by swallowing",
      ],
      mechanism: "Damage at jugular foramen or along nerve course",
      commonCauses: [
        "Jugular foramen syndrome (tumor, glomus jugulare)",
        "Glossopharyngeal neuralgia",
        "Rarely isolated — usually involves CN X and XI (jugular foramen neighbors)",
      ],
    },
    centralLesion: null,
    clinicalPearls: [
      "CN IX is rarely affected in isolation — consider jugular foramen syndrome (IX + X + XI together)",
      "Glossopharyngeal neuralgia can cause syncope via carotid sinus reflex (pain → bradycardia → syncope)",
      "The gag reflex is an unreliable test — absent in ~20% of normal adults, present in patients with dysphagia",
    ],
  },
  {
    number: 10,
    numeral: "X",
    name: "Vagus",
    type: "mixed",
    nuclei: [
      "Nucleus ambiguus (pharyngeal and laryngeal motor)",
      "Dorsal motor nucleus (parasympathetic — thoracoabdominal viscera)",
      "Nucleus of solitary tract (visceral sensation)",
      "Spinal nucleus of V (ear canal sensation)",
    ],
    brainstemLevel: "medulla",
    foramen: "Jugular foramen",
    functions: [
      "Pharyngeal muscles (swallowing, palate elevation)",
      "Laryngeal muscles (phonation — via recurrent laryngeal nerve)",
      "Parasympathetic innervation of heart, lungs, and GI tract to splenic flexure",
      "Sensation from ear canal (Arnold nerve — cough reflex)",
    ],
    examTechnique: [
      "Say 'Ahhh': observe uvula — deviates AWAY from the lesion (weak side cannot elevate)",
      "Gag reflex: CN X is the efferent limb",
      "Voice quality: hoarseness suggests recurrent laryngeal nerve palsy",
      "Cough strength and swallow function",
    ],
    normalFinding:
      "Uvula midline on phonation, symmetric palatal elevation, strong voice and cough",
    peripheralLesion: {
      label: "CN X / recurrent laryngeal palsy",
      signs: [
        "Uvula deviates AWAY from the lesion on phonation",
        "Hoarseness (vocal cord paralysis)",
        "Dysphagia and nasal regurgitation (palatal weakness)",
        "Absent gag reflex on affected side (efferent limb)",
        "Bovine cough (loss of glottic closure)",
      ],
      mechanism:
        "The left recurrent laryngeal nerve loops under the aortic arch — long course makes it vulnerable",
      commonCauses: [
        "Left recurrent laryngeal nerve palsy: lung cancer (Pancoast tumor), aortic aneurysm, thyroid surgery, mediastinal lymphadenopathy",
        "Jugular foramen lesion (with CN IX and XI)",
        "Surgical injury (thyroidectomy, carotid endarterectomy)",
      ],
    },
    centralLesion: {
      label: "Nucleus ambiguus lesion (lateral medullary syndrome)",
      signs: [
        "Ipsilateral palatal/pharyngeal weakness",
        "Combined with ipsilateral Horner, CN V pain/temperature loss, cerebellar ataxia",
        "Contralateral body pain/temperature loss",
      ],
      mechanism:
        "Lateral medullary infarction (PICA territory) damages nucleus ambiguus",
      commonCauses: [
        "Wallenberg syndrome (lateral medullary stroke — most classic brainstem syndrome)",
        "Vertebral artery dissection",
      ],
    },
    clinicalPearls: [
      "The uvula deviates AWAY from the lesion (toward the strong side) — opposite to the tongue (CN XII)",
      "Left recurrent laryngeal nerve palsy: think chest pathology first (lung, aorta, mediastinum)",
      "Wallenberg syndrome is the classic constellation: ipsilateral Horner + CN V + CN IX/X + cerebellum + contralateral spinothalamic loss",
    ],
  },
  {
    number: 11,
    numeral: "XI",
    name: "Accessory (Spinal Accessory)",
    type: "motor",
    nuclei: [
      "Spinal accessory nucleus (C1-C5 ventral horn)",
    ],
    brainstemLevel: "medulla",
    foramen: "Jugular foramen",
    functions: [
      "Sternocleidomastoid (SCM) — turns head to OPPOSITE side",
      "Upper trapezius — shoulder shrug",
    ],
    examTechnique: [
      "Turn head against resistance: tests SCM on the OPPOSITE side (right SCM turns head LEFT)",
      "Shrug shoulders against resistance: tests ipsilateral trapezius",
      "Inspect for asymmetric shoulder droop or trapezius wasting",
    ],
    normalFinding: "Strong symmetric head turning and shoulder shrug",
    peripheralLesion: {
      label: "CN XI palsy",
      signs: [
        "Weakness turning head AWAY from the lesion (SCM weak on lesion side)",
        "Shoulder drop and inability to shrug on lesion side (trapezius)",
        "Scapular winging (lower trapezius component)",
      ],
      mechanism:
        "The spinal root ascends through the foramen magnum then exits via jugular foramen — unique path",
      commonCauses: [
        "Surgical injury (posterior triangle of neck — lymph node biopsy)",
        "Jugular foramen syndrome (with IX and X)",
        "Trauma to posterior triangle",
      ],
    },
    centralLesion: null,
    clinicalPearls: [
      "SCM turns the head to the OPPOSITE side — this is the most commonly confused lateralization in CN exam",
      "A right CN XI lesion weakens the right SCM, which means weakness turning the head to the LEFT",
      "Post-surgical CN XI palsy (lymph node biopsy in posterior triangle) is the most common iatrogenic CN injury",
    ],
  },
  {
    number: 12,
    numeral: "XII",
    name: "Hypoglossal",
    type: "motor",
    nuclei: ["Hypoglossal nucleus (medulla, floor of 4th ventricle)"],
    brainstemLevel: "medulla",
    foramen: "Hypoglossal canal",
    functions: ["All intrinsic and most extrinsic tongue muscles (except palatoglossus = CN X)"],
    examTechnique: [
      "Inspect tongue at rest for fasciculations and atrophy",
      "Protrude tongue: deviates toward the WEAK side (genioglossus pushes tongue out and contralaterally)",
      "Test tongue strength by pushing against cheek on each side",
      "Rapid tongue movements (la-la-la)",
    ],
    normalFinding:
      "Midline protrusion, no fasciculations or atrophy, full strength and rapid movements",
    peripheralLesion: {
      label: "LMN CN XII palsy",
      signs: [
        "Tongue deviates TOWARD the lesion on protrusion",
        "Ipsilateral tongue atrophy and fasciculations",
        "Dysarthria (lingual sounds: 'la', 'ta', 'da')",
      ],
      mechanism: "LMN damage causes denervation of ipsilateral tongue muscles",
      commonCauses: [
        "Medullary lesion (often with contralateral hemiparesis = medial medullary syndrome)",
        "Hypoglossal canal tumor (meningioma, schwannoma)",
        "Carotid dissection or endarterectomy",
        "ALS (bilateral tongue fasciculations = bulbar involvement)",
      ],
    },
    centralLesion: {
      label: "UMN CN XII (supranuclear)",
      signs: [
        "Tongue deviates AWAY from the cortical lesion (contralateral to the hemisphere lesion)",
        "No atrophy or fasciculations",
        "Spastic tongue (slow, clumsy movements)",
      ],
      mechanism:
        "Corticobulbar fibers are predominantly crossed for CN XII — a left hemisphere lesion weakens the right tongue",
      commonCauses: [
        "Stroke (typically with hemiparesis — part of UMN syndrome)",
        "Pseudobulbar palsy (bilateral UMN lesions → spastic dysarthria, dysphagia, emotional lability)",
      ],
    },
    clinicalPearls: [
      "The tongue deviates toward the LESION in LMN palsy, AWAY from the cortical lesion in UMN palsy",
      "This is OPPOSITE to the uvula (CN X) which deviates AWAY from the lesion",
      "Bilateral tongue fasciculations + atrophy = ALS bulbar involvement — this carries the worst prognosis",
    ],
  },
];

export const cranialNerveSyndromes: CranialNerveSyndrome[] = [
  {
    id: "weber",
    label: "Weber Syndrome",
    description: "Ipsilateral CN III palsy + contralateral hemiparesis",
    location: "Ventral midbrain (cerebral peduncle)",
    affectedNerves: [3],
    signs: [
      "Ipsilateral: ptosis, dilated pupil, eye down and out (CN III)",
      "Contralateral: hemiparesis (corticospinal tract)",
    ],
    mechanism: "Midbrain infarct involving CN III fascicles and cerebral peduncle",
    differentialClues: [
      "Crossed = brainstem",
      "CN III = midbrain level",
    ],
    emergencyFeatures: ["Acute stroke presentation — thrombolysis window"],
  },
  {
    id: "wallenberg",
    label: "Wallenberg Syndrome (Lateral Medullary)",
    description: "Classic lateral medullary stroke — the most important brainstem syndrome",
    location: "Lateral medulla (PICA territory)",
    affectedNerves: [5, 9, 10],
    signs: [
      "Ipsilateral: facial pain/temperature loss (spinal V), Horner syndrome, cerebellar ataxia, palatal/pharyngeal weakness (IX, X)",
      "Contralateral: body pain/temperature loss (spinothalamic tract)",
      "Dysphagia, hoarseness, vertigo, nystagmus",
    ],
    mechanism: "Lateral medullary infarction, usually from vertebral artery occlusion or PICA",
    differentialClues: [
      "Ipsilateral face + contralateral body pain/temperature loss = lateral brainstem",
      "NO weakness (corticospinal tract is ventral, spared in lateral medullary syndrome)",
    ],
    emergencyFeatures: [
      "Vertebral artery dissection in young patients",
      "Risk of aspiration from dysphagia",
    ],
  },
  {
    id: "cavernous-sinus",
    label: "Cavernous Sinus Syndrome",
    description: "Multiple CN palsies from cavernous sinus pathology",
    location: "Cavernous sinus (parasellar)",
    affectedNerves: [3, 4, 5, 6],
    signs: [
      "Ophthalmoplegia (CN III, IV, VI — any combination)",
      "Facial numbness V1 ± V2 (but NOT V3 — V3 exits below cavernous sinus)",
      "Proptosis and chemosis (if venous congestion)",
      "Horner syndrome (sympathetic fibers travel through cavernous sinus)",
    ],
    mechanism: "Mass, thrombosis, inflammation, or infection in the cavernous sinus compresses traversing nerves",
    differentialClues: [
      "Multiple ipsilateral CN palsies affecting III, IV, V1/V2, VI = cavernous sinus",
      "V3 involvement EXCLUDES cavernous sinus (V3 exits at foramen ovale, below the sinus)",
      "Painful ophthalmoplegia = Tolosa-Hunt (idiopathic granulomatous inflammation)",
    ],
    emergencyFeatures: [
      "Cavernous sinus thrombosis (septic) from facial/sinus infection — can be fatal",
      "Pituitary apoplexy (sudden hemorrhage into pituitary adenoma)",
    ],
  },
  {
    id: "jugular-foramen",
    label: "Jugular Foramen Syndrome (Vernet)",
    description: "CN IX + X + XI palsy from jugular foramen pathology",
    location: "Jugular foramen",
    affectedNerves: [9, 10, 11],
    signs: [
      "Dysphagia and hoarseness (CN X)",
      "Absent gag reflex (CN IX afferent, CN X efferent)",
      "Shoulder weakness and SCM weakness (CN XI)",
      "Loss of taste posterior tongue (CN IX)",
    ],
    mechanism: "Mass or infiltration at the jugular foramen affecting all three nerves",
    differentialClues: [
      "IX + X + XI together = jugular foramen",
      "If XII is also involved = Collet-Sicard syndrome (XII exits nearby through hypoglossal canal)",
    ],
    emergencyFeatures: [
      "Glomus jugulare tumor (pulsatile tinnitus, mass behind tympanic membrane)",
    ],
  },
  {
    id: "cerebellopontine-angle",
    label: "Cerebellopontine Angle (CPA) Syndrome",
    description: "Progressive unilateral hearing loss, facial weakness, and trigeminal numbness",
    location: "Cerebellopontine angle cistern",
    affectedNerves: [5, 7, 8],
    signs: [
      "Unilateral sensorineural hearing loss (CN VIII — earliest)",
      "Absent corneal reflex (CN V — often first detected sign)",
      "Facial weakness (CN VII — often late)",
      "Ipsilateral cerebellar signs if large",
    ],
    mechanism: "Mass (usually vestibular schwannoma / acoustic neuroma) compressing nerves in the CPA cistern",
    differentialClues: [
      "Gradual onset distinguishes from Bell's palsy (sudden)",
      "Absent corneal reflex is the most sensitive early exam finding",
      "Audiogram shows asymmetric sensorineural loss",
    ],
    emergencyFeatures: [
      "Large CPA tumors can compress brainstem → hydrocephalus",
    ],
  },
  {
    id: "bulbar-palsy",
    label: "Bulbar Palsy (LMN)",
    description: "LMN weakness of bulbar muscles — CN IX, X, XII nuclei or nerves",
    location: "Medullary nuclei or lower cranial nerves",
    affectedNerves: [9, 10, 12],
    signs: [
      "Nasal speech, dysphagia, weak cough",
      "Tongue atrophy and fasciculations (CN XII LMN)",
      "Absent gag reflex",
      "Pooling of secretions",
    ],
    mechanism: "Lower motor neuron destruction in medullary nuclei",
    differentialClues: [
      "LMN bulbar = flaccid, atrophic, fasciculating tongue",
      "Distinguish from pseudobulbar (UMN) = spastic tongue, emotional lability, brisk jaw jerk",
    ],
    emergencyFeatures: [
      "Aspiration risk — need swallowing assessment",
      "In ALS: bulbar onset has worst prognosis (mean survival ~2 years)",
    ],
  },
];

export const cranialNervePresets: CranialNervePreset[] = [
  {
    id: "bells-palsy",
    label: "Bell's Palsy",
    description: "Acute unilateral LMN facial weakness — forehead involved",
    selectedNerve: 7,
    syndromeId: null,
    clinicalVignette:
      "A 35-year-old wakes with right-sided facial droop. Cannot wrinkle the right forehead or close the right eye. No vesicles, no other CN findings, no limb weakness.",
  },
  {
    id: "pupil-involving-cn3",
    label: "Pupil-Involving CN III",
    description: "Aneurysmal CN III compression — neurosurgical emergency",
    selectedNerve: 3,
    syndromeId: null,
    clinicalVignette:
      "A 50-year-old with sudden severe headache develops left ptosis and a dilated unreactive pupil. The eye is down and out. 'Worst headache of my life.'",
  },
  {
    id: "wallenberg-preset",
    label: "Wallenberg Syndrome",
    description: "Lateral medullary stroke — the classic brainstem syndrome",
    selectedNerve: null,
    syndromeId: "wallenberg",
    clinicalVignette:
      "A 60-year-old with sudden vertigo, dysphagia, hoarseness. Exam shows left-sided Horner, absent gag, left facial pain/temperature loss, and right body pain/temperature loss. Left cerebellar ataxia.",
  },
  {
    id: "acoustic-neuroma",
    label: "Acoustic Neuroma",
    description: "CPA mass with progressive hearing loss",
    selectedNerve: null,
    syndromeId: "cerebellopontine-angle",
    clinicalVignette:
      "A 45-year-old notices progressive left hearing loss over 2 years and unsteadiness. Right ear is normal. Left corneal reflex is absent. MRI shows a 2.5 cm CPA mass.",
  },
  {
    id: "als-bulbar",
    label: "ALS (Bulbar Onset)",
    description: "Mixed UMN + LMN bulbar signs with tongue fasciculations",
    selectedNerve: 12,
    syndromeId: "bulbar-palsy",
    clinicalVignette:
      "A 65-year-old with progressive dysarthria and dysphagia over 6 months. The tongue is atrophic with fasciculations. Jaw jerk is brisk. Limb reflexes are pathologically brisk. EMG shows widespread denervation.",
  },
  {
    id: "bilateral-cn6",
    label: "Bilateral CN VI (Raised ICP)",
    description: "False localizing sign from intracranial hypertension",
    selectedNerve: 6,
    syndromeId: null,
    clinicalVignette:
      "A 28-year-old obese woman with worsening headaches and bilateral esotropia. She cannot abduct either eye fully. Fundoscopy shows bilateral papilledema.",
  },
];

export function getCranialNerve(number: number): CranialNerve | undefined {
  return cranialNerves.find((cn) => cn.number === number);
}

export function getCranialNerveSyndrome(id: string): CranialNerveSyndrome | undefined {
  return cranialNerveSyndromes.find((s) => s.id === id);
}
