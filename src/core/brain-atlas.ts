export type AtlasChapterId = 'functions' | 'interlinks';
export type AtlasCategoryId = 'cortex' | 'limbic' | 'subcortical' | 'hindbrain';
export type AtlasOverlayCategoryId = 'vascular' | 'visual-system' | 'brainstem' | 'loop';

export interface AtlasChapter {
	id: AtlasChapterId;
	title: string;
	summary: string;
}

export interface AtlasCategory {
	id: AtlasCategoryId;
	name: string;
	color: string;
}

export interface AtlasInterlink {
	target: string;
	label: string;
	description: string;
}

export interface AtlasRegion {
	id: string;
	name: string;
	shortLabel: string;
	category: AtlasCategoryId;
	lobe: string;
	x: number;
	y: number;
	chapter1: {
		summary: string;
		functions: string[];
		signatureTasks: string[];
		clinicalLink: string;
	};
	chapter2: {
		role: string;
		systems: string[];
		interlinks: AtlasInterlink[];
	};
}

export interface AtlasResult {
	title: string;
	chapters: AtlasChapter[];
	categories: AtlasCategory[];
	regions: AtlasRegion[];
	overlays: AtlasOverlay[];
	networkNotes: string[];
}

export interface AtlasOverlayRegion {
	regionId: string;
	emphasis: 'primary' | 'supporting';
	label: string;
	reason: string;
}

export interface AtlasOverlay {
	id: string;
	category: AtlasOverlayCategoryId;
	title: string;
	summary: string;
	clinicalFrame: string;
	weakerAlternative: string;
	whyAlternativeWeaker: string;
	decisiveNextData: string[];
	compareRegionId: string;
	linkedModules: string[];
	regions: AtlasOverlayRegion[];
}

export const atlasChapters: AtlasChapter[] = [
	{
		id: 'functions',
		title: 'Chapter 1: Regional Functions',
		summary: 'Start with specialization: what each major brain region is best known for when examined on its own.',
	},
	{
		id: 'interlinks',
		title: 'Chapter 2: Interlinks and Circuits',
		summary: 'Then switch to integration: how loops, relays, and feedback between regions create real behavior.',
	},
];

export const atlasCategories: AtlasCategory[] = [
	{ id: 'cortex', name: 'Cortex', color: '#67d3ff' },
	{ id: 'limbic', name: 'Limbic', color: '#ffd58a' },
	{ id: 'subcortical', name: 'Subcortical', color: '#ff9f7a' },
	{ id: 'hindbrain', name: 'Hindbrain', color: '#63d6a3' },
];

export const atlasRegions: AtlasRegion[] = [
	{
		id: 'prefrontal',
		name: 'Prefrontal Cortex',
		shortLabel: 'PFC',
		category: 'cortex',
		lobe: 'Frontal lobe',
		x: 88,
		y: 84,
		chapter1: {
			summary: 'Keeps goals online, suppresses distractions, and lets you plan beyond the present moment.',
			functions: ['Executive control', 'Working memory', 'Decision-making', 'Inhibitory control'],
			signatureTasks: ['Rule switching', 'Delayed-response tasks', 'Planning multi-step behavior'],
			clinicalLink: 'Damage produces dysexecutive syndrome: poor planning, impulsivity, and difficulty maintaining goals.',
		},
		chapter2: {
			role: 'Acts as a top-down control hub that biases perception, memory, emotion, and action toward current goals.',
			systems: ['Frontoparietal control network', 'Frontostriatal loops', 'Thalamocortical control loops'],
			interlinks: [
				{
					target: 'thalamus',
					label: 'Thalamocortical relay',
					description: 'Mediodorsal thalamus helps stabilize task-relevant representations.',
				},
				{
					target: 'basalGanglia',
					label: 'Action gating',
					description: 'Corticostriatal loops decide which plans are released or withheld.',
				},
				{
					target: 'hippocampus',
					label: 'Memory-guided planning',
					description: 'Episodic context helps select future actions and strategies.',
				},
				{
					target: 'amygdala',
					label: 'Emotion regulation',
					description: 'Affective salience can bias prefrontal choices or be damped by control.',
				},
				{
					target: 'motor',
					label: 'Goal to action',
					description: 'Abstract plans are converted into specific motor sets.',
				},
			],
		},
	},
	{
		id: 'anteriorCingulate',
		name: 'Anterior Cingulate Cortex',
		shortLabel: 'ACC',
		category: 'limbic',
		lobe: 'Medial frontal lobe',
		x: 118,
		y: 108,
		chapter1: {
			summary: 'Allocates effort, monitors conflict, and helps convert motivation into initiated behavior.',
			functions: ['Effort allocation', 'Conflict monitoring', 'Motivational drive', 'Pain-affect integration'],
			signatureTasks: ['Task persistence', 'Error monitoring', 'Response-conflict paradigms', 'Initiation of goal-directed output'],
			clinicalLink: 'Lesions can produce abulia, reduced spontaneous speech or movement, impaired effortful control, and flattened affective engagement.',
		},
		chapter2: {
			role: 'Acts as a bridge between salience, motivation, autonomic state, and the frontostriatal loops that decide whether behavior is actually launched.',
			systems: ['Salience network', 'Cingulo-striatal loop', 'Medial frontal control network'],
			interlinks: [
				{
					target: 'prefrontal',
					label: 'Effort to executive set',
					description: 'Conflict and effort signals help prefrontal systems decide whether a goal is worth maintaining.',
				},
				{
					target: 'basalGanglia',
					label: 'Initiation gating',
					description: 'Motivational drive influences whether frontostriatal loops release or withhold action.',
				},
				{
					target: 'insula',
					label: 'Salience coupling',
					description: 'Internal bodily urgency and external salience are integrated into one action priority signal.',
				},
				{
					target: 'amygdala',
					label: 'Affective biasing',
					description: 'Emotionally charged cues alter conflict weighting, persistence, and avoidance behavior.',
				},
				{
					target: 'hypothalamus',
					label: 'Autonomic effort state',
					description: 'Motivational demand is translated into autonomic arousal and bodily readiness.',
				},
			],
		},
	},
	{
		id: 'motor',
		name: 'Motor Cortex',
		shortLabel: 'M1',
		category: 'cortex',
		lobe: 'Frontal lobe',
		x: 138,
		y: 78,
		chapter1: {
			summary: 'Sends the descending commands that produce voluntary movement.',
			functions: ['Movement execution', 'Force scaling', 'Direction coding', 'Skilled motor output'],
			signatureTasks: ['Finger tapping', 'Reaching', 'Speech articulation support'],
			clinicalLink: 'Lesions cause weakness, clumsiness, and loss of precise voluntary control.',
		},
		chapter2: {
			role: 'Sits at the output end of a large planning-and-correction loop involving sensory cortex, cerebellum, basal ganglia, and brainstem.',
			systems: ['Corticospinal tract', 'Cortico-cerebellar loop', 'Cortico-striato-thalamo-cortical loop'],
			interlinks: [
				{
					target: 'somatosensory',
					label: 'Sensorimotor loop',
					description: 'Continuous sensory feedback updates movement as it unfolds.',
				},
				{
					target: 'basalGanglia',
					label: 'Action selection',
					description: 'Basal ganglia bias which motor programs should start or stop.',
				},
				{
					target: 'cerebellum',
					label: 'Error correction',
					description: 'The cerebellum compares intended with actual movement and refines timing.',
				},
				{
					target: 'thalamus',
					label: 'Final relay',
					description: 'Motor thalamus funnels basal ganglia and cerebellar output back to cortex.',
				},
				{
					target: 'brainstem',
					label: 'Descending execution',
					description: 'Brainstem nuclei carry posture and autonomic components of movement.',
				},
			],
		},
	},
	{
		id: 'somatosensory',
		name: 'Somatosensory Cortex',
		shortLabel: 'S1',
		category: 'cortex',
		lobe: 'Parietal lobe',
		x: 186,
		y: 82,
		chapter1: {
			summary: 'Builds touch, proprioception, and body-state maps from incoming sensory signals.',
			functions: ['Touch localization', 'Proprioception', 'Texture coding', 'Body map representation'],
			signatureTasks: ['Two-point discrimination', 'Joint-position sense', 'Object recognition by touch'],
			clinicalLink: 'Damage can produce numbness, poor localization, or sensory neglect-like deficits.',
		},
		chapter2: {
			role: 'Feeds body-state information into movement, spatial attention, and object-recognition systems.',
			systems: ['Sensorimotor network', 'Dorsal stream', 'Thalamocortical sensory relay'],
			interlinks: [
				{
					target: 'thalamus',
					label: 'Sensory gateway',
					description: 'Ventral posterior thalamus relays filtered somatic input to cortex.',
				},
				{
					target: 'motor',
					label: 'Online correction',
					description: 'Accurate movement depends on a current estimate of body position.',
				},
				{
					target: 'prefrontal',
					label: 'Task relevance',
					description: 'Executive systems decide which body signals matter right now.',
				},
				{
					target: 'occipital',
					label: 'Spatial fusion',
					description: 'Visual and somatic coordinates combine for reaching and navigation.',
				},
			],
		},
	},
	{
		id: 'parietalAssociation',
		name: 'Parietal Association Cortex',
		shortLabel: 'PAC',
		category: 'cortex',
		lobe: 'Parietal lobe',
		x: 238,
		y: 76,
		chapter1: {
			summary: 'Builds multimodal body-space maps, attentional priority maps, and the spatial frame used for reaching and awareness.',
			functions: ['Spatial attention', 'Body-space integration', 'Visuomotor transformation', 'Scene scanning'],
			signatureTasks: ['Line bisection', 'Cancellation testing', 'Visually guided reaching', 'Double simultaneous stimulation'],
			clinicalLink: 'Damage can produce neglect, extinction, optic ataxia-like misreaching, constructional difficulty, and poor awareness of one side of space.',
		},
		chapter2: {
			role: 'This is the dorsal hub where visual space, somatic coordinates, and action plans are aligned into one usable map for behavior.',
			systems: ['Dorsal attention network', 'Dorsal visual stream', 'Sensorimotor integration network'],
			interlinks: [
				{
					target: 'occipital',
					label: 'Spatial visual feed',
					description: 'Posterior visual cortex supplies the scene map that parietal systems weight and localize.',
				},
				{
					target: 'somatosensory',
					label: 'Body-position anchor',
					description: 'A body-state estimate is required before visual coordinates can guide action in space.',
				},
				{
					target: 'prefrontal',
					label: 'Attention control',
					description: 'Executive systems bias which side of space and which task-relevant signals reach awareness.',
				},
				{
					target: 'motor',
					label: 'Vision for action',
					description: 'Parietal coordinates are converted into reach targets, movement vectors, and online correction signals.',
				},
				{
					target: 'thalamus',
					label: 'Priority relay',
					description: 'Pulvinar-thalamic pathways help stabilize attention toward relevant spatial sectors.',
				},
			],
		},
	},
	{
		id: 'temporal',
		name: 'Temporal Cortex',
		shortLabel: 'TL',
		category: 'cortex',
		lobe: 'Temporal lobe',
		x: 198,
		y: 170,
		chapter1: {
			summary: 'Extracts meaning from sound and complex visual patterns and supports semantic knowledge.',
			functions: ['Auditory processing', 'Object recognition', 'Language comprehension', 'Semantic memory'],
			signatureTasks: ['Speech perception', 'Recognizing faces and objects', 'Naming and comprehension'],
			clinicalLink: 'Damage can cause aphasia, auditory deficits, or impaired recognition of objects and faces.',
		},
		chapter2: {
			role: 'Links sensation to memory and meaning by bridging perceptual cortex with hippocampal and limbic structures.',
			systems: ['Ventral stream', 'Medial temporal memory system', 'Limbic-semantic interface'],
			interlinks: [
				{
					target: 'occipital',
					label: 'Ventral stream',
					description: 'Visual information flows forward from early vision to object identity.',
				},
				{
					target: 'hippocampus',
					label: 'Encoding loop',
					description: 'Experiences are linked to episodic memory traces.',
				},
				{
					target: 'amygdala',
					label: 'Emotional tagging',
					description: 'Emotionally salient events gain stronger mnemonic weight.',
				},
				{
					target: 'prefrontal',
					label: 'Meaning to action',
					description: 'Semantic and contextual information informs goals and decisions.',
				},
			],
		},
	},
	{
		id: 'insula',
		name: 'Insula',
		shortLabel: 'INS',
		category: 'cortex',
		lobe: 'Insular cortex',
		x: 162,
		y: 138,
		chapter1: {
			summary: 'Represents internal bodily state, visceral sensation, and the salience of what the body feels right now.',
			functions: ['Interoception', 'Autonomic integration', 'Visceral sensation', 'Salience detection'],
			signatureTasks: ['Heartbeat awareness', 'Visceral discomfort localization', 'Taste and internal-state reporting', 'Rapid salience switching'],
			clinicalLink: 'Insular lesions can distort body awareness, autonomic tone, gustation, and the feeling that internal alarms are or are not relevant.',
		},
		chapter2: {
			role: 'The insula links internal bodily signals to salience, emotion, autonomic output, and attentional reorientation.',
			systems: ['Salience network', 'Central autonomic network', 'Interoceptive awareness network'],
			interlinks: [
				{
					target: 'anteriorCingulate',
					label: 'Salience core',
					description: 'Together these regions decide whether a bodily or environmental signal should seize control of the system.',
				},
				{
					target: 'amygdala',
					label: 'Affective tagging',
					description: 'Visceral sensations are emotionally colored and rapidly linked to threat or reward significance.',
				},
				{
					target: 'hypothalamus',
					label: 'Body-state regulation',
					description: 'The hypothalamus converts perceived internal need into set-point correction and endocrine-autonomic output.',
				},
				{
					target: 'brainstem',
					label: 'Autonomic expression',
					description: 'Visceral-autonomic state is broadcast into heart rate, respiration, nausea, and arousal outputs.',
				},
				{
					target: 'prefrontal',
					label: 'Conscious report',
					description: 'Internal states become deliberate appraisal, worry, or strategic control once frontal systems engage.',
				},
			],
		},
	},
	{
		id: 'occipital',
		name: 'Occipital Cortex',
		shortLabel: 'V1+',
		category: 'cortex',
		lobe: 'Occipital lobe',
		x: 276,
		y: 110,
		chapter1: {
			summary: 'Transforms retinal input into edges, orientation, motion, and increasingly structured visual features.',
			functions: ['Early visual encoding', 'Edge and orientation detection', 'Motion analysis', 'Scene construction'],
			signatureTasks: ['Detecting contrast', 'Tracking motion', 'Parsing complex scenes'],
			clinicalLink: 'Damage can produce cortical blindness, field cuts, or selective visual deficits.',
		},
		chapter2: {
			role: 'Sends vision forward into object, language, and action systems rather than acting as a standalone camera.',
			systems: ['Visual thalamocortical pathway', 'Dorsal stream', 'Ventral stream'],
			interlinks: [
				{
					target: 'thalamus',
					label: 'LGN relay',
					description: 'The lateral geniculate nucleus gates and structures incoming retinal signals before they reach cortex.',
				},
				{
					target: 'temporal',
					label: 'What pathway',
					description: 'Object identity and semantic recognition emerge downstream.',
				},
				{
					target: 'somatosensory',
					label: 'Where pathway',
					description: 'Visual space aligns with body-centered coordinates for action.',
				},
				{
					target: 'prefrontal',
					label: 'Attentional biasing',
					description: 'Task demands shape what visual features are amplified.',
				},
			],
		},
	},
	{
		id: 'hippocampus',
		name: 'Hippocampus',
		shortLabel: 'HPC',
		category: 'limbic',
		lobe: 'Medial temporal lobe',
		x: 182,
		y: 150,
		chapter1: {
			summary: 'Binds events into memories and organizes them in spatial and temporal context.',
			functions: ['Episodic memory', 'Spatial navigation', 'Context binding', 'Sequence learning'],
			signatureTasks: ['Remembering recent events', 'Navigating new places', 'Linking where and when'],
			clinicalLink: 'Damage causes anterograde amnesia and poor formation of new episodic memories.',
		},
		chapter2: {
			role: 'Bridges perception, context, and planning by broadcasting event structure to cortex and limbic systems.',
			systems: ['Papez circuit', 'Medial temporal memory system', 'Hippocampal-prefrontal loop'],
			interlinks: [
				{
					target: 'prefrontal',
					label: 'Prospection loop',
					description: 'Stored episodes are used to simulate possible futures.',
				},
				{
					target: 'temporal',
					label: 'Encoding interface',
					description: 'Perceptual content is converted into relational memories.',
				},
				{
					target: 'amygdala',
					label: 'Emotional memory',
					description: 'Arousal changes which episodes are strongly retained.',
				},
				{
					target: 'thalamus',
					label: 'Circuit relay',
					description: 'Anterior thalamic links support contextual recall and navigation.',
				},
			],
		},
	},
	{
		id: 'amygdala',
		name: 'Amygdala',
		shortLabel: 'AMY',
		category: 'limbic',
		lobe: 'Medial temporal lobe',
		x: 150,
		y: 174,
		chapter1: {
			summary: 'Rapidly assigns salience and emotional value to sensory and memory signals.',
			functions: ['Threat detection', 'Reward salience', 'Emotional learning', 'Arousal signaling'],
			signatureTasks: ['Fear conditioning', 'Emotional face processing', 'Valence learning'],
			clinicalLink: 'Dysfunction is linked to anxiety, altered fear learning, and impaired emotion recognition.',
		},
		chapter2: {
			role: 'Injects value and arousal into memory, attention, autonomic, and decision networks.',
			systems: ['Limbic salience network', 'Amygdala-prefrontal regulation loop', 'Autonomic output pathways'],
			interlinks: [
				{
					target: 'prefrontal',
					label: 'Control-vs-salience',
					description: 'Emotion can bias choices or be regulated by frontal control.',
				},
				{
					target: 'hippocampus',
					label: 'Emotional context',
					description: 'Salient events are embedded more strongly into episodic memory.',
				},
				{
					target: 'thalamus',
					label: 'Rapid orienting',
					description: 'Thalamic relays contribute to quick detection of relevant cues.',
				},
				{
					target: 'brainstem',
					label: 'Autonomic output',
					description: 'Arousal and defensive responses recruit visceral and reflexive systems.',
				},
			],
		},
	},
	{
		id: 'thalamus',
		name: 'Thalamus',
		shortLabel: 'TH',
		category: 'subcortical',
		lobe: 'Diencephalon',
		x: 182,
		y: 124,
		chapter1: {
			summary: 'Acts as a relay and state-dependent gate for sensory, motor, and cognitive traffic.',
			functions: ['Sensory relay', 'State regulation', 'Motor relay', 'Cortical synchrony'],
			signatureTasks: ['Selective attention', 'Relay of sensory streams', 'Looping signals across cortex'],
			clinicalLink: 'Lesions can disrupt consciousness, sensation, memory, or motor coordination depending on nucleus involved.',
		},
		chapter2: {
			role: 'The thalamus is less a switchboard than a recurrent hub inside many cortex-subcortex loops.',
			systems: ['Thalamocortical loops', 'Sensory relay systems', 'Motor relay systems'],
			interlinks: [
				{
					target: 'prefrontal',
					label: 'Executive relay',
					description: 'Mediodorsal nuclei stabilize working-memory and control signals.',
				},
				{
					target: 'somatosensory',
					label: 'Body-signal gateway',
					description: 'Somatic input reaches cortex through ventral posterior nuclei.',
				},
				{
					target: 'occipital',
					label: 'Visual relay',
					description: 'The LGN structures visual input before cortex.',
				},
				{
					target: 'motor',
					label: 'Motor return path',
					description: 'Cerebellar and basal ganglia outputs return to cortex via motor thalamus.',
				},
				{
					target: 'hippocampus',
					label: 'Memory circuit relay',
					description: 'Anterior thalamus contributes to contextual memory circuits.',
				},
			],
		},
	},
	{
		id: 'hypothalamus',
		name: 'Hypothalamus',
		shortLabel: 'HYP',
		category: 'subcortical',
		lobe: 'Diencephalon',
		x: 214,
		y: 146,
		chapter1: {
			summary: 'Maintains homeostasis by coordinating autonomic set points, endocrine output, circadian timing, and basic drives.',
			functions: ['Autonomic set-point control', 'Endocrine regulation', 'Hunger and thirst', 'Circadian timing'],
			signatureTasks: ['Sleep-wake regulation', 'Thermoregulation', 'Stress-axis coordination', 'Feeding and fluid balance'],
			clinicalLink: 'Lesions can produce sleep-wake disturbance, autonomic instability, appetite change, endocrine disruption, and altered drive states.',
		},
		chapter2: {
			role: 'Sits between limbic salience and body-state output, translating what matters into hormonal, autonomic, and circadian corrections.',
			systems: ['Central autonomic network', 'Hypothalamic-pituitary axis', 'Sleep-wake regulation circuits'],
			interlinks: [
				{
					target: 'insula',
					label: 'Interoceptive readout',
					description: 'Internal-state signals from cortex inform whether homeostatic set points need to be corrected.',
				},
				{
					target: 'anteriorCingulate',
					label: 'Drive and effort',
					description: 'Motivational urgency and effort are partly shaped by bodily need and arousal state.',
				},
				{
					target: 'amygdala',
					label: 'Emotional-homeostatic link',
					description: 'Threat and reward relevance are translated into stress, hunger, defensive, or reproductive body states.',
				},
				{
					target: 'brainstem',
					label: 'Autonomic broadcast',
					description: 'Hypothalamic commands are expressed through brainstem cardiovascular, respiratory, and visceral nuclei.',
				},
				{
					target: 'thalamus',
					label: 'State influence',
					description: 'Arousal and circadian state alter thalamic gating of what reaches cortex clearly.',
				},
			],
		},
	},
	{
		id: 'basalGanglia',
		name: 'Basal Ganglia',
		shortLabel: 'BG',
		category: 'subcortical',
		lobe: 'Subcortical nuclei',
		x: 146,
		y: 126,
		chapter1: {
			summary: 'Bias action selection, habit formation, movement vigor, and reinforcement learning.',
			functions: ['Action selection', 'Habit learning', 'Movement initiation', 'Reward-based updating'],
			signatureTasks: ['Choosing between actions', 'Learning habits', 'Scaling movement vigor'],
			clinicalLink: 'Disorders include Parkinsonism, chorea, impulsivity, and habit dysregulation.',
		},
		chapter2: {
			role: 'Forms gated loops with cortex and thalamus that decide which thoughts or actions should pass through.',
			systems: ['Direct and indirect pathways', 'Frontostriatal loops', 'Reinforcement learning circuits'],
			interlinks: [
				{
					target: 'prefrontal',
					label: 'Cognitive gating',
					description: 'Frontostriatal loops help select rules, strategies, and task sets.',
				},
				{
					target: 'motor',
					label: 'Motor gating',
					description: 'Competing motor programs are facilitated or suppressed.',
				},
				{
					target: 'thalamus',
					label: 'Loop closure',
					description: 'Outputs return to cortex through thalamic relay nuclei.',
				},
				{
					target: 'brainstem',
					label: 'Vigor and posture',
					description: 'Subcortical output shapes posture, orienting, and movement readiness.',
				},
			],
		},
	},
	{
		id: 'cerebellum',
		name: 'Cerebellum',
		shortLabel: 'CB',
		category: 'hindbrain',
		lobe: 'Hindbrain',
		x: 278,
		y: 204,
		chapter1: {
			summary: 'Fine-tunes timing, coordination, error correction, and skill learning.',
			functions: ['Timing', 'Coordination', 'Motor learning', 'Prediction of sensorimotor error'],
			signatureTasks: ['Smooth pursuit', 'Rapid alternating movements', 'Learning precise sequences'],
			clinicalLink: 'Damage causes ataxia, dysmetria, and poorly timed or poorly coordinated movement.',
		},
		chapter2: {
			role: 'Computes prediction errors and sends corrective signals back into cortical and brainstem motor systems.',
			systems: ['Cerebello-thalamo-cortical loop', 'Vestibulo-cerebellar system', 'Spinocerebellar feedback'],
			interlinks: [
				{
					target: 'motor',
					label: 'Precision loop',
					description: 'Cerebellar output sharpens the timing and smoothness of motor cortex commands.',
				},
				{
					target: 'thalamus',
					label: 'Return relay',
					description: 'Corrective output reaches cortex through motor thalamus.',
				},
				{
					target: 'brainstem',
					label: 'Posture and balance',
					description: 'Vestibular and postural information are exchanged continuously.',
				},
				{
					target: 'prefrontal',
					label: 'Cognitive timing',
					description: 'Cerebellar predictions may also support sequencing and timing in cognition.',
				},
			],
		},
	},
	{
		id: 'brainstem',
		name: 'Brainstem',
		shortLabel: 'BS',
		category: 'hindbrain',
		lobe: 'Brainstem',
		x: 224,
		y: 214,
		chapter1: {
			summary: 'Maintains arousal, respiration, cardiovascular control, cranial reflexes, and many descending pathways.',
			functions: ['Arousal regulation', 'Autonomic control', 'Reflexes', 'Pathway conduit'],
			signatureTasks: ['Breathing regulation', 'Sleep-wake transitions', 'Postural control'],
			clinicalLink: 'Damage can be catastrophic, affecting consciousness, breathing, swallowing, and basic survival functions.',
		},
		chapter2: {
			role: 'Provides the body-wide output layer for autonomic, postural, cranial-nerve, and ascending arousal systems.',
			systems: ['Ascending reticular activating system', 'Autonomic control pathways', 'Descending motor tracts'],
			interlinks: [
				{
					target: 'thalamus',
					label: 'Arousal broadcast',
					description: 'Brainstem state systems influence thalamic gating and cortical wakefulness.',
				},
				{
					target: 'amygdala',
					label: 'Visceral emotion',
					description: 'Threat and salience are translated into autonomic responses.',
				},
				{
					target: 'cerebellum',
					label: 'Balance loop',
					description: 'Vestibular and postural information are exchanged continuously.',
				},
				{
					target: 'motor',
					label: 'Descending pathways',
					description: 'Brainstem nuclei shape posture, orienting, and locomotor tone.',
				},
				{
					target: 'basalGanglia',
					label: 'Subcortical output',
					description: 'Movement readiness and vigor partly depend on brainstem targets.',
				},
			],
		},
	},
];

export const atlasOverlays: AtlasOverlay[] = [
	{
		id: 'middle-cerebral-territory',
		category: 'vascular',
		title: 'Middle cerebral territory emphasis',
		summary:
			'Use this overlay when aphasia, neglect, gaze deviation, and face-arm predominant deficits travel together and the cortical syndrome feels lateral rather than medial.',
		clinicalFrame:
			'The most localizing clue is not the infarct name but the cortical package: gaze, language, neglect, face-arm sensorimotor signs, and field involvement clustering in one lateral hemispheric distribution.',
		weakerAlternative: 'Deep lacunar or isolated thalamic process',
		whyAlternativeWeaker:
			'Lacunar and deep lesions can create pure motor or sensory syndromes, but they do not usually assemble the full cortical package of gaze, language, neglect, and field phenomena.',
		decisiveNextData: [
			'Language screen, neglect testing, and gaze preference at the bedside',
			'Vascular imaging that distinguishes large-vessel cortical involvement from a deep perforator pattern',
		],
		compareRegionId: 'thalamus',
		linkedModules: ['visual-field', 'vision', 'ask'],
		regions: [
			{ regionId: 'prefrontal', emphasis: 'primary', label: 'Frontal eye and executive signs', reason: 'Explains gaze preference and executive collapse in large lateral hemispheric syndromes.' },
			{ regionId: 'motor', emphasis: 'primary', label: 'Face-arm motor output', reason: 'Captures the classic lateral sensorimotor bias.' },
			{ regionId: 'somatosensory', emphasis: 'supporting', label: 'Face-arm sensory integration', reason: 'Adds cortical sensory and neglect-adjacent findings.' },
			{ regionId: 'parietalAssociation', emphasis: 'supporting', label: 'Spatial weighting and neglect', reason: 'Lateral parietal involvement explains extinction, neglect, and scene-scanning failure that often ride with MCA syndromes.' },
			{ regionId: 'insula', emphasis: 'supporting', label: 'Autonomic and salience consequences', reason: 'Insular extension helps explain visceral alarm, autonomic lability, and the sense that the body is suddenly wrong.' },
			{ regionId: 'temporal', emphasis: 'primary', label: 'Language and semantic cortex', reason: 'Explains dominant-hemisphere aphasic patterns.' },
			{ regionId: 'occipital', emphasis: 'supporting', label: 'Field-cut neighborhood', reason: 'Posterior extension helps explain homonymous visual loss when present.' },
		],
	},
	{
		id: 'posterior-cerebral-territory',
		category: 'vascular',
		title: 'Posterior cerebral territory emphasis',
		summary:
			'Use this overlay when the syndrome is visual, mnemonic, or thalamic rather than frontolateral cortical, especially when a homonymous field cut travels with memory or higher-order visual complaints.',
		clinicalFrame:
			'Posterior territory reasoning is strongest when occipital field loss, ventral-stream symptoms, hippocampal memory vulnerability, or deep posterior thalamic features cluster together.',
		weakerAlternative: 'Anterior circulation frontal syndrome',
		whyAlternativeWeaker:
			'Anterior circulation syndromes lead with gaze, motor output, and executive-language dominance, whereas posterior territory syndromes are more visual, mnemonic, and posterior-thalamic.',
		decisiveNextData: [
			'Formal perimetry and posterior cortical visual testing',
			'Memory testing and posterior vascular imaging rather than only anterior circulation assumptions',
		],
		compareRegionId: 'prefrontal',
		linkedModules: ['retina', 'visual-field', 'vision', 'ask'],
		regions: [
			{ regionId: 'occipital', emphasis: 'primary', label: 'Retinotopic posterior cortex', reason: 'Explains homonymous field deficits and posterior cortical visual syndromes.' },
			{ regionId: 'temporal', emphasis: 'supporting', label: 'Ventral stream and semantic reach', reason: 'Captures visual recognition and higher-order perceptual consequences.' },
			{ regionId: 'hippocampus', emphasis: 'primary', label: 'Medial temporal memory system', reason: 'Accounts for posterior circulation memory phenotypes.' },
			{ regionId: 'thalamus', emphasis: 'supporting', label: 'Posterior relay hub', reason: 'Adds deep sensory and arousal consequences that often travel with posterior syndromes.' },
		],
	},
	{
		id: 'ventral-visual-stream',
		category: 'visual-system',
		title: 'Ventral visual stream',
		summary:
			'This overlay turns retina and field entry into object identity, color stability, and high-order recognition rather than stopping at V1.',
		clinicalFrame:
			'Use this when the patient can see enough to navigate or describe a stimulus, but identity, category, color, or semantic visual meaning starts to fail.',
		weakerAlternative: 'Pure dorsal visuospatial or attention-network syndrome',
		whyAlternativeWeaker:
			'Dorsal and attention syndromes distort action guidance or awareness weighting more than identity and category-specific recognition.',
		decisiveNextData: [
			'Compare face, object, word, scene, and color performance rather than using one generic visual complaint',
			'Look for preserved reaching or scene scanning to keep dorsal explanations in their place',
		],
		compareRegionId: 'somatosensory',
		linkedModules: ['retina', 'visual-field', 'vision', 'ask'],
		regions: [
			{ regionId: 'occipital', emphasis: 'primary', label: 'Early visual entry', reason: 'Retinotopic input and early feature extraction begin the stream.' },
			{ regionId: 'temporal', emphasis: 'primary', label: 'Identity and semantic visual cortex', reason: 'Higher-order object and face recognition stabilize here.' },
			{ regionId: 'thalamus', emphasis: 'supporting', label: 'LGN relay support', reason: 'The stream depends on structured thalamocortical visual entry before cortical specialization.' },
			{ regionId: 'prefrontal', emphasis: 'supporting', label: 'Decision and report layer', reason: 'Percepts are turned into task-relevant recognition and verbal report.' },
		],
	},
	{
		id: 'dorsal-vision-attention',
		category: 'visual-system',
		title: 'Dorsal visual-attention stream',
		summary:
			'This overlay links occipital visual space to parietal body-space coordinates, action guidance, and top-down attentional weighting.',
		clinicalFrame:
			'Use this when the syndrome is about reaching, scanning, scene integration, neglect, or spatial weighting rather than object identity itself.',
		weakerAlternative: 'Pure ventral object-recognition syndrome',
		whyAlternativeWeaker:
			'Ventral lesions can leave reaching and scene weighting relatively intact, while dorsal and attention lesions fail at action guidance and hemispace representation.',
		decisiveNextData: [
			'Compare object recognition with visually guided reaching and scene integration',
			'Use cancellation, line bisection, and extinction to separate neglect from field loss',
		],
		compareRegionId: 'temporal',
		linkedModules: ['visual-field', 'vision', 'brain-atlas', 'ask'],
		regions: [
			{ regionId: 'occipital', emphasis: 'primary', label: 'Visual-space entry', reason: 'Early visual encoding still anchors the spatial map.' },
			{ regionId: 'parietalAssociation', emphasis: 'primary', label: 'Spatial attention map', reason: 'Posterior parietal cortex builds the hemispace weighting and multisensory spatial map that dorsal syndromes disrupt.' },
			{ regionId: 'somatosensory', emphasis: 'supporting', label: 'Body-space alignment', reason: 'Somatic coordinates keep the parietal map anchored to the body rather than pure visual space.' },
			{ regionId: 'prefrontal', emphasis: 'supporting', label: 'Top-down attentional biasing', reason: 'Executive control reshapes which spatial signals reach awareness.' },
			{ regionId: 'motor', emphasis: 'supporting', label: 'Vision for action', reason: 'Spatial coordinates become goal-directed movement plans.' },
		],
	},
	{
		id: 'brainstem-crossed-tracts',
		category: 'brainstem',
		title: 'Crossed brainstem long-tract logic',
		summary:
			'This overlay exists for compact syndromes where cranial-nerve territory, cerebellar connections, ascending sensory tracts, and descending motor/autonomic pathways all live in the same lesion neighborhood.',
		clinicalFrame:
			'Use this when the syndrome contains crossed findings, bulbar signs, arousal or autonomic disturbance, and cerebellar imbalance in one compact package.',
		weakerAlternative: 'Single cortical map lesion',
		whyAlternativeWeaker:
			'Hemispheric cortical lesions do not usually produce the dense cranial-nerve plus contralateral long-tract mixture seen in compact brainstem syndromes.',
		decisiveNextData: [
			'Focused cranial-nerve and long-tract exam to confirm the crossed pattern',
			'Posterior circulation imaging that captures the medulla, pons, and cerebellar connections',
		],
		compareRegionId: 'cerebellum',
		linkedModules: ['ecg', 'vision', 'ask'],
		regions: [
			{ regionId: 'brainstem', emphasis: 'primary', label: 'Compact cranial and autonomic hub', reason: 'Explains crossed findings, bulbar symptoms, and state/autonomic consequences.' },
			{ regionId: 'cerebellum', emphasis: 'supporting', label: 'Posterior fossa coordination neighbor', reason: 'Accounts for ipsilateral ataxia and vestibulocerebellar spillover.' },
			{ regionId: 'motor', emphasis: 'supporting', label: 'Descending long-tract consequence', reason: 'Pyramidal and posture-related output can be captured as tract involvement.' },
			{ regionId: 'somatosensory', emphasis: 'supporting', label: 'Ascending sensory tract consequence', reason: 'Pain-temperature and body-space deficits travel through the same compact neighborhood.' },
			{ regionId: 'thalamus', emphasis: 'supporting', label: 'Ascending arousal relay', reason: 'Rostral state disruption can be understood as extension into deep relay systems.' },
		],
	},
	{
		id: 'frontostriatal-loop',
		category: 'loop',
		title: 'Frontostriatal gating loop',
		summary:
			'This overlay is the convergence layer for executive control, action selection, movement vigor, and habit gating rather than a single one-way pathway.',
		clinicalFrame:
			'Use this when dysexecutive syndrome, bradykinesia, or impaired internal action release suggests a loop disorder more than an isolated cortical output lesion.',
		weakerAlternative: 'Pure corticospinal weakness',
		whyAlternativeWeaker:
			'Loop disorders distort initiation, selection, scaling, and control even when raw corticospinal output is relatively intact.',
		decisiveNextData: [
			'Compare internally generated versus externally cued actions',
			'Look for executive and reward-gating signs that travel with the movement problem',
		],
		compareRegionId: 'motor',
		linkedModules: ['dopamine', 'ecg', 'ask'],
		regions: [
			{ regionId: 'prefrontal', emphasis: 'primary', label: 'Executive set and goal selection', reason: 'Control signals define what should be gated into action.' },
			{ regionId: 'anteriorCingulate', emphasis: 'supporting', label: 'Effort and initiation drive', reason: 'Motivation and conflict monitoring influence whether the loop actually releases behavior.' },
			{ regionId: 'basalGanglia', emphasis: 'primary', label: 'Action gating core', reason: 'Competing motor and cognitive programs are released or suppressed here.' },
			{ regionId: 'thalamus', emphasis: 'supporting', label: 'Loop return relay', reason: 'Selected signals re-enter cortex through thalamic relay.' },
			{ regionId: 'motor', emphasis: 'supporting', label: 'Final motor expression', reason: 'The output looks weak only if you forget the upstream gating layer.' },
		],
	},
	{
		id: 'salience-autonomic-network',
		category: 'loop',
		title: 'Salience-autonomic network',
		summary:
			'This overlay captures the circuitry that decides a bodily or environmental signal is urgent enough to seize attention, change autonomic tone, and redirect behavior.',
		clinicalFrame:
			'Use this when interoceptive alarm, autonomic lability, nausea, visceral discomfort, abulia, or stress-linked body-state shifts travel with the neurological syndrome.',
		weakerAlternative: 'Pure relay or corticospinal syndrome',
		whyAlternativeWeaker:
			'Relay and motor syndromes can change sensation or output, but they do not usually assemble visceral salience, autonomic swings, motivational arrest, and body-state misreading into one circuit explanation.',
		decisiveNextData: [
			'Ask whether the problem is weakness or whether the patient says the body suddenly feels wrong, unsafe, or effortless to engage',
			'Look for paired autonomic readouts such as heart-rate variability, blood-pressure swings, sweating, nausea, or interoceptive misreporting',
		],
		compareRegionId: 'thalamus',
		linkedModules: ['ecg', 'stroke', 'ask'],
		regions: [
			{ regionId: 'insula', emphasis: 'primary', label: 'Interoceptive salience hub', reason: 'The insula reads the internal body and flags whether a signal deserves immediate attention.' },
			{ regionId: 'anteriorCingulate', emphasis: 'primary', label: 'Effort and urgency allocation', reason: 'Anterior cingulate translates salience into persistence, alarm, and initiated behavior.' },
			{ regionId: 'amygdala', emphasis: 'supporting', label: 'Emotional tagging', reason: 'Threat and reward relevance rapidly bias which body-state changes feel urgent.' },
			{ regionId: 'hypothalamus', emphasis: 'primary', label: 'Set-point controller', reason: 'Homeostatic and endocrine corrections are issued here once the system decides something matters.' },
			{ regionId: 'brainstem', emphasis: 'supporting', label: 'Autonomic expression', reason: 'Visceral consequences reach heart rate, blood pressure, respiration, and nausea through brainstem output.' },
			{ regionId: 'prefrontal', emphasis: 'supporting', label: 'Conscious appraisal', reason: 'Frontal systems decide whether salience becomes deliberate worry, strategy, or controlled response.' },
		],
	},
];

export const atlasNetworkNotes = [
	'Most brain communication is recurrent rather than one-way: cortex sends down, subcortex sends back, and both reshape each other.',
	'Hub regions such as the thalamus and prefrontal cortex matter because they coordinate timing and routing, not because they work alone.',
	'Clinical syndromes often reflect broken loops rather than isolated damage to a single named structure.',
	'Salience and autonomic symptoms localize best when you can connect interoception, motivation, and body-state output in one network instead of splitting them into separate complaints.',
];

export const atlasTitle = 'Brain Atlas';

export function getAtlasOverlay(overlayId: string) {
	return atlasOverlays.find((overlay) => overlay.id === overlayId);
}

export function createBrainAtlasResult(): AtlasResult {
	return {
		title: atlasTitle,
		chapters: atlasChapters,
		categories: atlasCategories,
		regions: atlasRegions,
		overlays: atlasOverlays,
		networkNotes: atlasNetworkNotes,
	};
}
