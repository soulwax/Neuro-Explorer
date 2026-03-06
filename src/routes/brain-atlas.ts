interface BrainAtlasChapter {
	id: 'functions' | 'interlinks';
	title: string;
	summary: string;
}

interface BrainAtlasCategory {
	id: 'cortex' | 'limbic' | 'subcortical' | 'hindbrain';
	name: string;
	color: string;
}

interface BrainInterlink {
	target: string;
	label: string;
	description: string;
}

interface BrainRegion {
	id: string;
	name: string;
	shortLabel: string;
	category: BrainAtlasCategory['id'];
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
		interlinks: BrainInterlink[];
	};
}

interface BrainAtlasResult {
	title: string;
	chapters: BrainAtlasChapter[];
	categories: BrainAtlasCategory[];
	regions: BrainRegion[];
	networkNotes: string[];
}

const CHAPTERS: BrainAtlasChapter[] = [
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

const CATEGORIES: BrainAtlasCategory[] = [
	{ id: 'cortex', name: 'Cortex', color: '#4fc3f7' },
	{ id: 'limbic', name: 'Limbic', color: '#ffd166' },
	{ id: 'subcortical', name: 'Subcortical', color: '#ff8a65' },
	{ id: 'hindbrain', name: 'Hindbrain', color: '#00e676' },
];

const REGIONS: BrainRegion[] = [
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
				{ target: 'thalamus', label: 'Thalamocortical relay', description: 'Mediodorsal thalamus helps stabilize task-relevant representations.' },
				{ target: 'basalGanglia', label: 'Action gating', description: 'Corticostriatal loops decide which plans are released or withheld.' },
				{ target: 'hippocampus', label: 'Memory-guided planning', description: 'Episodic context helps select future actions and strategies.' },
				{ target: 'amygdala', label: 'Emotion regulation', description: 'Affective salience can bias prefrontal choices or be damped by control.' },
				{ target: 'motor', label: 'Goal to action', description: 'Abstract plans are converted into specific motor sets.' },
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
				{ target: 'somatosensory', label: 'Sensorimotor loop', description: 'Continuous sensory feedback updates movement as it unfolds.' },
				{ target: 'basalGanglia', label: 'Action selection', description: 'Basal ganglia bias which motor programs should start or stop.' },
				{ target: 'cerebellum', label: 'Error correction', description: 'The cerebellum compares intended with actual movement and refines timing.' },
				{ target: 'thalamus', label: 'Final relay', description: 'Motor thalamus funnels basal ganglia and cerebellar output back to cortex.' },
				{ target: 'brainstem', label: 'Descending execution', description: 'Brainstem nuclei carry posture and autonomic components of movement.' },
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
				{ target: 'thalamus', label: 'Sensory gateway', description: 'Ventral posterior thalamus relays filtered somatic input to cortex.' },
				{ target: 'motor', label: 'Online correction', description: 'Accurate movement depends on a current estimate of body position.' },
				{ target: 'prefrontal', label: 'Task relevance', description: 'Executive systems decide which body signals matter right now.' },
				{ target: 'occipital', label: 'Spatial fusion', description: 'Visual and somatic coordinates combine for reaching and navigation.' },
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
				{ target: 'occipital', label: 'Ventral stream', description: 'Visual information flows forward from early vision to object identity.' },
				{ target: 'hippocampus', label: 'Encoding loop', description: 'Experiences are linked to episodic memory traces.' },
				{ target: 'amygdala', label: 'Emotional tagging', description: 'Emotionally salient events gain stronger mnemonic weight.' },
				{ target: 'prefrontal', label: 'Meaning to action', description: 'Semantic and contextual information informs goals and decisions.' },
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
				{ target: 'thalamus', label: 'LGN relay', description: 'The lateral geniculate nucleus gates and structures incoming retinal signals.' },
				{ target: 'temporal', label: 'What pathway', description: 'Object identity and semantic recognition emerge downstream.' },
				{ target: 'somatosensory', label: 'Where pathway', description: 'Visual space aligns with body-centered coordinates for action.' },
				{ target: 'prefrontal', label: 'Attentional biasing', description: 'Task demands shape what visual features are amplified.' },
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
				{ target: 'prefrontal', label: 'Prospection loop', description: 'Stored episodes are used to simulate possible futures.' },
				{ target: 'temporal', label: 'Encoding interface', description: 'Perceptual content is converted into relational memories.' },
				{ target: 'amygdala', label: 'Emotional memory', description: 'Arousal changes which episodes are strongly retained.' },
				{ target: 'thalamus', label: 'Circuit relay', description: 'Anterior thalamic links support contextual recall and navigation.' },
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
				{ target: 'prefrontal', label: 'Control-vs-salience', description: 'Emotion can bias choices or be regulated by frontal control.' },
				{ target: 'hippocampus', label: 'Emotional context', description: 'Salient events are embedded more strongly into episodic memory.' },
				{ target: 'thalamus', label: 'Rapid orienting', description: 'Thalamic relays contribute to quick detection of relevant cues.' },
				{ target: 'brainstem', label: 'Autonomic output', description: 'Arousal and defensive responses recruit visceral and reflexive systems.' },
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
				{ target: 'prefrontal', label: 'Executive relay', description: 'Mediodorsal nuclei stabilize working-memory and control signals.' },
				{ target: 'somatosensory', label: 'Body-signal gateway', description: 'Somatic input reaches cortex through ventral posterior nuclei.' },
				{ target: 'occipital', label: 'Visual relay', description: 'The LGN structures visual input before cortex.' },
				{ target: 'motor', label: 'Motor return path', description: 'Cerebellar and basal ganglia outputs return to cortex via motor thalamus.' },
				{ target: 'hippocampus', label: 'Memory circuit relay', description: 'Anterior thalamus contributes to contextual memory circuits.' },
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
				{ target: 'prefrontal', label: 'Cognitive gating', description: 'Frontostriatal loops help select rules, strategies, and task sets.' },
				{ target: 'motor', label: 'Motor gating', description: 'Competing motor programs are facilitated or suppressed.' },
				{ target: 'thalamus', label: 'Loop closure', description: 'Outputs return to cortex through thalamic relay nuclei.' },
				{ target: 'brainstem', label: 'Vigor and posture', description: 'Subcortical output shapes posture, orienting, and movement readiness.' },
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
				{ target: 'motor', label: 'Precision loop', description: 'Cerebellar output sharpens the timing and smoothness of motor cortex commands.' },
				{ target: 'thalamus', label: 'Return relay', description: 'Corrective output reaches cortex through motor thalamus.' },
				{ target: 'brainstem', label: 'Posture and balance', description: 'Vestibular and reticular nuclei help stabilize the body in motion.' },
				{ target: 'prefrontal', label: 'Cognitive timing', description: 'Cerebellar predictions may also support sequencing and timing in cognition.' },
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
				{ target: 'thalamus', label: 'Arousal broadcast', description: 'Brainstem state systems influence thalamic gating and cortical wakefulness.' },
				{ target: 'amygdala', label: 'Visceral emotion', description: 'Threat and salience are translated into autonomic responses.' },
				{ target: 'cerebellum', label: 'Balance loop', description: 'Vestibular and postural information are exchanged continuously.' },
				{ target: 'motor', label: 'Descending pathways', description: 'Brainstem nuclei shape posture, orienting, and locomotor tone.' },
				{ target: 'basalGanglia', label: 'Subcortical output', description: 'Movement readiness and vigor partly depend on brainstem targets.' },
			],
		},
	},
];

const NETWORK_NOTES = [
	'Most brain communication is recurrent rather than one-way: cortex sends down, subcortex sends back, and both reshape each other.',
	'Hub regions such as the thalamus and prefrontal cortex matter because they coordinate timing and routing, not because they work alone.',
	'Clinical syndromes often reflect broken loops rather than isolated damage to a single named structure.',
];

export function handleBrainAtlas(): Response {
	const result: BrainAtlasResult = {
		title: 'Brain Atlas',
		chapters: CHAPTERS,
		categories: CATEGORIES,
		regions: REGIONS,
		networkNotes: NETWORK_NOTES,
	};

	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
