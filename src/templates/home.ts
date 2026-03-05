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
  <h3>Why these four?</h3>
  <p>Each module maps an AI or computational technique to the biological system that inspired it.
  The neuron simulation shows how real cells integrate and fire.
  The vision module shows how a deep CNN mirrors your visual cortex.
  The tutor lets you interrogate these concepts with an LLM.
  The plasticity module shows how synapses learn &mdash; the biological ancestor of backpropagation.</p>
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
			path: '/ui/ask',
			name: 'Neuro Tutor',
			description: 'Ask a Socratic neuroscience tutor about action potentials, synapses, memory, plasticity, and more. Powered by Llama 3.1.',
			tags: ['LLM', 'Socratic method', 'Workers AI'],
		},
		{
			path: '/ui/plasticity',
			name: 'Synaptic Plasticity',
			description: 'Simulate spike-timing dependent plasticity (STDP). See how millisecond-precise timing between neurons determines whether synapses strengthen or weaken.',
			tags: ['STDP', 'Hebbian learning', 'interactive'],
		},
	],
};
