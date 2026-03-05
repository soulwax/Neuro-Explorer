import { handleNeuron } from './routes/neuron';
import { handleVision } from './routes/vision';
import { handleAsk } from './routes/ask';
import { handlePlasticity } from './routes/plasticity';
import { handleUI } from './ui';

export interface Env {
	AI: Ai;
}

const ROUTES: Record<string, string> = {
	'/neuron': 'Leaky Integrate-and-Fire neuron simulation. Params: tau, threshold, inputCurrent, duration, restingPotential, resetPotential, refractoryPeriod, dt',
	'/vision': 'Image classification via ResNet-50, mapped to the ventral visual stream (V1 -> V2 -> V4 -> IT -> PFC). Param: url=<image_url>',
	'/ask': 'Socratic neuroscience tutor. Params: q=<question>, topic=<action-potential|synapse|plasticity|visual-system|neural-coding|memory>',
	'/plasticity': 'Spike-Timing Dependent Plasticity (STDP) simulation. Params: deltaT, pairCount, aPlus, aMinus, tauPlus, tauMinus, initialWeight',
};

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		switch (true) {
			case path === '/neuron':
				return handleNeuron(request);
			case path === '/vision':
				return handleVision(request, env);
			case path === '/ask':
				return handleAsk(request, env);
			case path === '/plasticity':
				return handlePlasticity(request);
			case path === '/routes':
				return new Response(
					JSON.stringify(
						{
							name: 'Neuro Explorer',
							description: 'An interactive API for learning neuroscience through AI and simulation',
							routes: ROUTES,
						},
						null,
						2
					),
					{ headers: { 'Content-Type': 'application/json' } }
				);
			default:
				return handleUI(request);
		}
	},
} satisfies ExportedHandler<Env>;
