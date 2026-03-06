import { handleAsk } from './routes/ask.js';
import { handleBrainAtlas } from './routes/brain-atlas.js';
import { handleDopamine } from './routes/dopamine.js';
import { handleECG } from './routes/ecg.js';
import { handleGridCell } from './routes/grid-cell.js';
import { handleNeuron } from './routes/neuron.js';
import { handlePlasticity } from './routes/plasticity.js';
import { handleRetina } from './routes/retina.js';
import { handleVision } from './routes/vision.js';
import { handleUI } from './ui.js';
import type { AiClient } from './ai/client.js';

const ROUTES: Record<string, string> = {
	'/neuron':
		'Leaky Integrate-and-Fire neuron simulation. Params: tau, threshold, inputCurrent, duration, restingPotential, resetPotential, refractoryPeriod, dt',
	'/vision': 'Image classification via ResNet-50, mapped to the ventral visual stream (V1 -> V2 -> V4 -> IT -> PFC). Param: url=<image_url>',
	'/brain-atlas': 'Interactive brain atlas with Chapter 1 on regional functions and Chapter 2 on interlinked circuits.',
	'/ask': 'Socratic neuroscience tutor. Params: q=<question>, topic=<action-potential|synapse|plasticity|visual-system|neural-coding|memory>',
	'/plasticity': 'Spike-Timing Dependent Plasticity (STDP) simulation. Params: deltaT, pairCount, aPlus, aMinus, tauPlus, tauMinus, initialWeight',
	'/ecg':
		'12-lead ECG simulator with tweakable heart rate, axis, intervals, amplitudes, ST shift, noise, rhythm variability, and 3D activation-vector data.',
	'/grid-cell':
		'Entorhinal grid-cell simulator with spatial firing fields, navigation path, and rate-map controls. Params: arenaSize, durationSec, speed, spacing, orientation, phaseX, phaseY, sharpness, maxRate, thetaMod, turnNoise',
	'/dopamine':
		'Dopamine reward-prediction error simulator. Params: durationMs, dtMs, trialCount, cueTime, rewardTime, rewardSize, learningRate, discount, traceDecay, omissionTrial',
	'/retina':
		'Retinal receptive field simulator. Params: gridSize, centerSigma, surroundSigma, surroundStrength, stimulusType, stimulusRadius, annulusWidth, stimulusX, stimulusY, contrast',
};

export interface AppEnv {
	ai: AiClient;
}

export function normalizeRoutePath(pathname: string): string {
	let normalized = pathname.replace(/\/+$/, '') || '/';
	if (normalized === '/api') {
		return '/';
	}
	if (normalized.startsWith('/api/')) {
		normalized = normalized.slice(4) || '/';
	}
	return normalized;
}

export async function handleRequest(request: Request, env: AppEnv): Promise<Response> {
	const url = new URL(request.url);
	const path = normalizeRoutePath(url.pathname);

	switch (path) {
		case '/neuron':
			return handleNeuron(request);
		case '/vision':
			return handleVision(request, env.ai);
		case '/brain-atlas':
			return handleBrainAtlas();
		case '/ask':
			return handleAsk(request, env.ai);
		case '/plasticity':
			return handlePlasticity(request);
		case '/ecg':
			return handleECG(request);
		case '/grid-cell':
			return handleGridCell(request);
		case '/dopamine':
			return handleDopamine(request);
		case '/retina':
			return handleRetina(request);
		case '/routes':
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
			return handleUI(request, path);
	}
}
