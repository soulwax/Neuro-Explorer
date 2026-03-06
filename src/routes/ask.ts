import type { AiClient } from '../ai/client';

/**
 * Neuroscience Socratic Tutor
 *
 * Uses an LLM with a carefully crafted system prompt to act as
 * a neuroscience tutor. Supports specific topic areas with
 * tailored context to keep the LLM grounded and accurate.
 */

const SYSTEM_PROMPT = `You are a neuroscience tutor for undergraduate students. Your goal is to build intuition, not just deliver facts.

Rules:
- Use the Socratic method: ask guiding questions before revealing answers
- Always connect concepts to concrete examples (what would a patient experience? what experiment demonstrated this?)
- When explaining a mechanism, start from what the student can observe (behavior) and work inward (circuits, cells, molecules)
- Correct misconceptions directly but kindly
- Use analogies to everyday experience, but flag where the analogy breaks down
- If asked about AI/ML concepts, draw explicit parallels to the biological inspiration
- Keep responses focused and under 300 words unless the student asks for depth
- Cite key experiments or researchers when relevant (Hodgkin & Huxley, Hubel & Wiesel, Kandel, etc.)`;

const TOPIC_CONTEXT: Record<string, string> = {
	'action-potential': `The student wants to learn about action potentials. Key concepts to cover:
- Resting potential (-70mV) maintained by Na+/K+ ATPase
- Depolarization when voltage-gated Na+ channels open
- The all-or-nothing principle and threshold (~-55mV)
- Repolarization via delayed K+ channel opening
- Refractory periods (absolute vs relative)
- Saltatory conduction along myelinated axons
- Hodgkin-Huxley model (1952) from squid giant axon experiments`,

	synapse: `The student wants to learn about synaptic transmission. Key concepts:
- Chemical vs electrical synapses
- Vesicle release triggered by Ca2+ influx
- Neurotransmitter binding to postsynaptic receptors (ionotropic vs metabotropic)
- Excitatory (glutamate/AMPA/NMDA) vs inhibitory (GABA) transmission
- Synaptic integration: spatial and temporal summation
- Dale's principle and its modern nuances
- Quantal release and the work of Katz & del Castillo`,

	plasticity: `The student wants to learn about synaptic plasticity. Key concepts:
- Hebb's rule: "neurons that fire together wire together" (1949)
- Long-term potentiation (LTP): Bliss & Lomo, 1973
- NMDA receptor as coincidence detector (requires both glutamate AND depolarization)
- Long-term depression (LTD)
- Spike-timing dependent plasticity (STDP): precise timing matters
- Homeostatic plasticity (synaptic scaling)
- Connection to learning and memory (Kandel's work on Aplysia)`,

	'visual-system': `The student wants to learn about the visual system. Key concepts:
- Retinal processing: photoreceptors -> bipolar cells -> ganglion cells
- ON-center/OFF-surround receptive fields
- Retinotopic mapping to V1
- Hubel & Wiesel's Nobel Prize work on orientation selectivity
- Ventral ("what") vs dorsal ("where") streams
- Face recognition in fusiform face area
- Visual illusions as windows into processing mechanisms`,

	'neural-coding': `The student wants to learn about neural coding. Key concepts:
- Rate coding vs temporal coding
- Population coding and ensemble representations
- Sparse coding in sensory cortex
- Place cells (O'Keefe) and grid cells (Moser & Moser) - Nobel Prize 2014
- Predictive coding and the free energy principle (Friston)
- The binding problem: how does the brain unify features?
- Information theory applied to neural signals (Shannon entropy in spike trains)`,

	memory: `The student wants to learn about memory systems. Key concepts:
- Patient H.M. and the discovery of hippocampal memory systems
- Declarative (explicit) vs procedural (implicit) memory
- Hippocampal consolidation and systems consolidation theory
- Working memory and prefrontal cortex
- Engram cells: modern search for the memory trace (Tonegawa lab)
- Reconsolidation: memories become labile when reactivated
- Sleep's role in memory consolidation (sharp-wave ripples, spindles)`,
};

const AVAILABLE_TOPICS = Object.keys(TOPIC_CONTEXT);

interface AskResponse {
	response?: string;
	[key: string]: unknown;
}

export async function handleAsk(request: Request, ai: AiClient): Promise<Response> {
	const url = new URL(request.url);
	const topic = url.searchParams.get('topic');
	let question = url.searchParams.get('q');

	// Support POST body for longer questions
	if (request.method === 'POST') {
		try {
			const body = (await request.json()) as { q?: string; question?: string; topic?: string };
			question = body.q ?? body.question ?? question;
		} catch {
			// ignore parse errors, use query params
		}
	}

	if (!question) {
		return new Response(
			JSON.stringify(
				{
					usage: 'GET /ask?q=<question>&topic=<optional_topic>',
					topics: AVAILABLE_TOPICS,
					examples: [
						'/ask?q=Why cant neurons fire during the refractory period?&topic=action-potential',
						'/ask?q=How does the NMDA receptor act as a coincidence detector?&topic=plasticity',
						'/ask?q=What did patient HM teach us about memory?&topic=memory',
						'/ask?q=How is a convolutional neural network like the visual cortex?&topic=visual-system',
					],
				},
				null,
				2
			),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	}

	const topicContext = topic && TOPIC_CONTEXT[topic] ? `\n\nContext for this topic:\n${TOPIC_CONTEXT[topic]}` : '';

	const messages = [
		{ role: 'system', content: SYSTEM_PROMPT + topicContext },
		{ role: 'user', content: question },
	];

	try {
		const response = (await ai.run('@cf/meta/llama-3.1-8b-instruct', { messages })) as AskResponse | string;
		const answer = typeof response === 'string' ? response : response.response ?? JSON.stringify(response);

		return new Response(
			JSON.stringify(
				{
					topic: topic ?? 'general',
					question,
					answer,
				},
				null,
				2
			),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown AI error';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
