export const home = `
<h1>Neuro Explorer</h1>
<p class="subtitle">Learn neuroscience through interactive simulation and AI</p>

<div class="grid">
{% for r in routes %}
  <a class="card" href="{{ r.path }}">
    <h2>{{ r.name }}</h2>
    <p>{{ r.description }}</p>
    <div style="margin-top:.6rem">
    {% for t in r.tags %}
      <span class="tag">{{ t }}</span>
    {% endfor %}
    </div>
  </a>
{% endfor %}
</div>

<div class="explanation" style="margin-top:2rem">
  <h3>Why these nine?</h3>
  <p>Each module maps an AI or computational technique to the biological system that inspired it.
  The neuron simulation shows how real cells integrate and fire.
  The vision module shows how a deep CNN mirrors your visual cortex.
  The brain atlas shows that localization and integration are two sides of the same nervous system.
  The retina lab shows how center-surround antagonism extracts contrast before cortex even sees the signal.
  The grid-cell module shows how the entorhinal cortex builds a metric for space itself.
  The dopamine module shows how learning re-times reward prediction errors.
  The tutor lets you interrogate these concepts with an LLM.
  The plasticity module shows how synapses learn &mdash; the biological ancestor of backpropagation.
  The ECG explorer shows how cardiac electrophysiology projects into 12 clinical leads.</p>
</div>`;

export const homeData = {
	routes: [
		{
			path: '/ui/neuron',
			name: 'Neuron Simulation',
			description: 'Simulate a Leaky Integrate-and-Fire neuron. Tweak biophysical parameters and watch membrane potential evolve, spikes fire, and rate coding emerge.',
			tags: ['pure math', 'no AI', 'interactive'],
		},
		{
			path: '/ui/vision',
			name: 'Visual Cortex',
			description: 'Classify images with ResNet-50 and see how each network layer maps to a region of your ventral visual stream, from V1 to prefrontal cortex.',
			tags: ['ResNet-50', 'image classification', 'Workers AI'],
		},
		{
			path: '/ui/brain-atlas',
			name: 'Brain Atlas',
			description:
				'Explore major brain regions in Chapter 1, then switch to Chapter 2 to see how cortical, limbic, subcortical, and hindbrain structures interlink in recurrent circuits.',
			tags: ['neuroanatomy', 'circuits', 'interactive'],
		},
		{
			path: '/ui/retina',
			name: 'Retinal Receptive Field Lab',
			description:
				'Simulate an ON-center/OFF-surround ganglion cell, compare spots, annuli, and edges, and see how center-surround antagonism turns luminance into contrast-sensitive retinal output.',
			tags: ['retina', 'center-surround', 'interactive'],
		},
		{
			path: '/ui/grid-cell',
			name: 'Grid Cell Navigator',
			description:
				'Simulate a rodent exploring an arena and watch a medial entorhinal grid cell produce a hexagonal firing lattice with tunable spacing, orientation, phase, and theta modulation.',
			tags: ['spatial navigation', 'entorhinal cortex', 'interactive'],
		},
		{
			path: '/ui/dopamine',
			name: 'Dopamine Prediction Error Lab',
			description:
				'Model classical conditioning with temporal-difference learning and watch dopamine-like reward prediction errors shift from reward delivery to cue onset, including omission dips.',
			tags: ['reinforcement learning', 'reward prediction', 'interactive'],
		},
		{
			path: '/ui/plasticity',
			name: 'Synaptic Plasticity',
			description: 'Simulate spike-timing dependent plasticity (STDP). See how millisecond-precise timing between neurons determines whether synapses strengthen or weaken.',
			tags: ['STDP', 'Hebbian learning', 'interactive'],
		},
		{
			path: '/ui/ecg',
			name: '12-Lead ECG Explorer',
			description:
				'Generate a full 12-lead ECG, inspect a 3D cardiac activation rendering, and tweak heart rate, axis, conduction intervals, ST shift, noise, and rhythm variability to build intuition for waveform morphology.',
			tags: ['cardiac electrophysiology', '12-lead', 'interactive'],
		},
		{
			path: '/ui/ask',
			name: 'Neuro Tutor',
			description: 'Ask a Socratic neuroscience tutor about action potentials, synapses, memory, plasticity, and more. Powered by Llama 3.1.',
			tags: ['LLM', 'Socratic method', 'Workers AI'],
		},
	],
};
