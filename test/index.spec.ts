import { describe, expect, it } from 'vitest';
import { handleApiRequest } from '../src/server/app';
import type { AiClient } from '../src/server/ai/client';

const inertAiClient: AiClient = {
	async run() {
		throw new Error('AI execution not expected in this test.');
	},
};

function request(path: string, init?: RequestInit) {
	return new Request(`https://example.com${path}`, init);
}

describe('Neuro Explorer API', () => {
	it('returns API route metadata', async () => {
		const response = await handleApiRequest(request('/api/routes'), {
			ai: inertAiClient,
		});

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			name: string;
			routes: Record<string, string>;
		};
		expect(data.name).toBe('Neuro Explorer');
		expect(data.routes['/ask']).toContain('clinical neurology tutor');
		expect(data.routes['/brain-atlas']).toContain('Interactive brain atlas');
		expect(data.routes['/ecg']).toContain('12-lead neurocardiac ECG lab');
		expect(data.routes['/grid-cell']).toContain('Entorhinal grid-cell simulator');
		expect(data.routes['/dopamine']).toContain('reward-prediction error simulator');
		expect(data.routes['/retina']).toContain('Retinal receptive field simulator');
	});

	it('serves bootstrap data through /api/vision', async () => {
		const response = await handleApiRequest(request('/api/vision'), {
			ai: inertAiClient,
		});

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		const data = (await response.json()) as {
			usage: string;
			ventral_stream: Array<{ corticalArea: string }>;
			sample_image_url: string;
		};
		expect(data.usage).toContain('/api/vision');
		expect(data.ventral_stream.length).toBe(6);
		expect(data.ventral_stream[0]?.corticalArea).toContain('V1');
		expect(data.sample_image_url).toContain('wikimedia.org');
	});

	it('serves bootstrap data through /api/ask', async () => {
		const response = await handleApiRequest(request('/api/ask'), {
			ai: inertAiClient,
		});

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		const data = (await response.json()) as {
			usage: string;
			topic_options: Array<{ id: string }>;
			level_options: Array<{ id: string }>;
			example_prompts: Array<{ topic: string; level: string }>;
			reasoning_rubric: Array<{ id: string }>;
			prompt_kits: Array<{ moduleSlug: string }>;
		};
		expect(data.usage).toContain('/api/ask');
		expect(data.topic_options.some((topic) => topic.id === 'neurovascular-localization')).toBe(true);
		expect(data.level_options.some((level) => level.id === 'consult-rounds')).toBe(true);
		expect(data.example_prompts.some((example) => example.topic === 'epileptology')).toBe(true);
		expect(data.example_prompts.some((example) => example.level === 'oral-boards')).toBe(true);
		expect(data.reasoning_rubric.some((criterion) => criterion.id === 'reversal')).toBe(true);
		expect(data.prompt_kits.some((kit) => kit.moduleSlug === 'ecg')).toBe(true);
	});

	it('normalizes legacy ask level aliases to the new consult-level vocabulary', async () => {
		const response = await handleApiRequest(
			request('/api/ask?q=localize%20this&level=case-conference'),
			{
				ai: {
					async run() {
						return { response: 'ok' };
					},
				},
			}
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			level: string;
			answer: string;
			reasoning_rubric: Array<{ id: string }>;
		};
		expect(data.level).toBe('consult-rounds');
		expect(data.answer).toBe('ok');
		expect(data.reasoning_rubric.some((criterion) => criterion.id === 'next-data')).toBe(true);
	});

	it('answers CORS preflight for ask and vision routes', async () => {
		const askResponse = await handleApiRequest(
			request('/api/ask', {
				method: 'OPTIONS',
				headers: {
					Origin: 'https://web.example',
					'Access-Control-Request-Method': 'POST',
				},
			}),
			{ ai: inertAiClient }
		);
		expect(askResponse.status).toBe(204);
		expect(askResponse.headers.get('Access-Control-Allow-Methods')).toContain('POST');

		const visionResponse = await handleApiRequest(
			request('/api/vision', {
				method: 'OPTIONS',
				headers: {
					Origin: 'https://web.example',
					'Access-Control-Request-Method': 'GET',
				},
			}),
			{ ai: inertAiClient }
		);
		expect(visionResponse.status).toBe(204);
		expect(visionResponse.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});

	it('returns a deterministic grid-cell map', async () => {
		const response = await handleApiRequest(
			request('/api/grid-cell?durationSec=20&arenaSize=100'),
			{ ai: inertAiClient }
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			path: Array<{ x: number; y: number; rateHz: number }>;
			spikes: Array<{ x: number; y: number }>;
			rateMap: number[][];
			summary: { coveragePct: number };
		};
		expect(data.path.length).toBeGreaterThan(100);
		expect(data.spikes.length).toBeGreaterThan(0);
		expect(data.rateMap.length).toBe(24);
		expect(data.summary.coveragePct).toBeGreaterThan(5);
	});

	it('shows cueward shift and omission dip in dopamine learning', async () => {
		const response = await handleApiRequest(
			request('/api/dopamine?trialCount=24&omissionTrial=20'),
			{ ai: inertAiClient }
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			snapshots: Array<{ label: string }>;
			learningCurve: Array<{ cueError: number; rewardError: number }>;
			summary: { omissionDip: number };
		};
		expect(data.snapshots.length).toBeGreaterThanOrEqual(3);
		expect(data.learningCurve[data.learningCurve.length - 1]!.cueError).toBeGreaterThan(0);
		expect(data.summary.omissionDip).toBeLessThan(0);
	});

	it('returns center-surround retinal tuning data', async () => {
		const response = await handleApiRequest(
			request('/api/retina?stimulusType=spot&stimulusRadius=3.5&surroundStrength=0.7'),
			{ ai: inertAiClient }
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			response: number;
			receptiveField: Array<{ value: number }>;
			sizeTuning: Array<{ x: number; value: number }>;
			positionScan: Array<{ x: number; value: number }>;
		};
		expect(Number.isFinite(data.response)).toBe(true);
		expect(data.receptiveField.length).toBeGreaterThan(100);
		expect(data.sizeTuning.length).toBeGreaterThan(8);
		expect(data.positionScan.length).toBeGreaterThan(20);
		expect(data.sizeTuning.some((point) => point.value > 0)).toBe(true);
		expect(data.sizeTuning.some((point) => point.value < 0)).toBe(true);
	});

	it('returns 3D activation data for the ECG explorer', async () => {
		const response = await handleApiRequest(
			request('/api/ecg?heartRate=84&qrsAmp=1.3&precordialRotation=12'),
			{ ai: inertAiClient }
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			leads: Record<string, Array<{ mv: number }>>;
			activation: {
				beatMs: number;
				frames: Array<{ phase: string; dominantLead: string; vector: { magnitude: number } }>;
				leadAxes: Array<{ name: string }>;
			};
			beat: {
				rhythmStripLead: string;
				intervals: { prMs: number; qrsMs: number; qtMs: number };
				landmarks: { qrsOnset: number; qrsOffset: number; tPeak: number };
			};
			neurocardiac: {
				autonomicState: string;
				vagalTone: number;
				sympatheticDrive: number;
				neurocriticalContext: string;
				hemodynamicRisk: 'low' | 'moderate' | 'high';
				notes: string[];
				consultPearls: string[];
				mimicsToAvoid: string[];
				nextData: string[];
				monitoringPriorities: string[];
				redFlags: string[];
			};
		};
		expect(data.leads.V2!.length).toBeGreaterThan(100);
		expect(data.activation.beatMs).toBeGreaterThan(500);
		expect(data.activation.frames.length).toBeGreaterThan(60);
		expect(data.activation.leadAxes.length).toBe(12);
		expect(data.activation.frames.some((frame) => frame.phase === 'QRS')).toBe(true);
		expect(data.activation.frames.some((frame) => frame.dominantLead.startsWith('V'))).toBe(true);
		expect(data.activation.frames.some((frame) => frame.vector.magnitude > 0.2)).toBe(true);
		expect(data.beat.rhythmStripLead).toBe('II');
		expect(data.beat.intervals.prMs).toBeGreaterThan(80);
		expect(data.beat.landmarks.qrsOffset).toBeGreaterThan(data.beat.landmarks.qrsOnset);
		expect(data.beat.landmarks.tPeak).toBeGreaterThan(data.beat.landmarks.qrsOffset);
		expect(data.neurocardiac.autonomicState.length).toBeGreaterThan(8);
		expect(data.neurocardiac.vagalTone).toBeGreaterThanOrEqual(0);
		expect(data.neurocardiac.sympatheticDrive).toBeGreaterThanOrEqual(0);
		expect(data.neurocardiac.neurocriticalContext.length).toBeGreaterThan(20);
		expect(['low', 'moderate', 'high']).toContain(data.neurocardiac.hemodynamicRisk);
		expect(data.neurocardiac.notes.length).toBeGreaterThanOrEqual(3);
		expect(data.neurocardiac.consultPearls.length).toBeGreaterThanOrEqual(3);
		expect(data.neurocardiac.mimicsToAvoid.length).toBeGreaterThanOrEqual(2);
		expect(data.neurocardiac.nextData.length).toBeGreaterThanOrEqual(3);
		expect(data.neurocardiac.monitoringPriorities.length).toBeGreaterThanOrEqual(3);
		expect(data.neurocardiac.redFlags.length).toBeGreaterThanOrEqual(2);
	});

	it('returns brain-atlas regions with interlinked circuits', async () => {
		const response = await handleApiRequest(request('/api/brain-atlas'), {
			ai: inertAiClient,
		});

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			chapters: Array<{ id: string }>;
			regions: Array<{
				id: string;
				chapter1: { functions: string[] };
				chapter2: { interlinks: Array<{ target: string }> };
			}>;
			overlays: Array<{ id: string; compareRegionId: string }>;
		};
		expect(data.chapters.map((chapter) => chapter.id)).toEqual(['functions', 'interlinks']);
		expect(data.regions.length).toBeGreaterThan(8);
		const thalamus = data.regions.find((region) => region.id === 'thalamus');
		expect(thalamus?.chapter1.functions.length).toBeGreaterThan(2);
		expect(thalamus?.chapter2.interlinks.some((link) => link.target === 'prefrontal')).toBe(true);
		expect(data.overlays.some((overlay) => overlay.id === 'middle-cerebral-territory')).toBe(true);
		expect(data.overlays.some((overlay) => overlay.compareRegionId === 'temporal')).toBe(true);
	});

	it('returns 404 for unknown API routes', async () => {
		const response = await handleApiRequest(request('/api/does-not-exist'), {
			ai: inertAiClient,
		});

		expect(response.status).toBe(404);
		const data = (await response.json()) as {
			error: string;
			details: { path: string };
		};
		expect(data.error).toBe('Not found');
		expect(data.details.path).toBe('/does-not-exist');
	});
});
