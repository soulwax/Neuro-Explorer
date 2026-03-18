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
		expect(data.routes['/brain-atlas']).toContain('salience-autonomic');
		expect(data.routes['/neuron']).toContain('Leaky Integrate-and-Fire neuron simulation');
		expect(data.routes['/neuron']).toContain('quiet reserve');
		expect(data.routes['/plasticity']).toContain('Spike-Timing Dependent Plasticity (STDP) simulation');
		expect(data.routes['/plasticity']).toContain('metaplastic restraint');
		expect(data.routes['/ecg']).toContain('12-lead neurocardiac ECG lab');
		expect(data.routes['/grid-cell']).toContain('Entorhinal grid-cell simulator');
		expect(data.routes['/grid-cell']).toContain('noisy path integration');
		expect(data.routes['/dopamine']).toContain('reward-prediction error simulator');
		expect(data.routes['/dopamine']).toContain('cue capture');
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
			score_scale: Array<{ score: number }>;
			prompt_kits: Array<{ moduleSlug: string }>;
		};
		expect(data.usage).toContain('/api/ask');
		expect(data.topic_options.some((topic) => topic.id === 'neurovascular-localization')).toBe(true);
		expect(data.level_options.some((level) => level.id === 'consult-rounds')).toBe(true);
		expect(data.example_prompts.some((example) => example.topic === 'epileptology')).toBe(true);
		expect(data.example_prompts.some((example) => example.level === 'oral-boards')).toBe(true);
		expect(data.reasoning_rubric.some((criterion) => criterion.id === 'reversal')).toBe(true);
		expect(data.score_scale.some((entry) => entry.score === 4)).toBe(true);
		expect(data.prompt_kits.some((kit) => kit.moduleSlug === 'ecg')).toBe(true);
	});

	it('normalizes legacy ask level aliases and requests structured ask scoring', async () => {
		let capturedModel = '';
		let capturedInput: unknown;

		const response = await handleApiRequest(
			request('/api/ask?q=localize%20this&level=case-conference'),
			{
				ai: {
					async run(model, input) {
						capturedModel = model;
						capturedInput = input;
						return {
							response: {
								answer: 'ok',
								evaluation: {
									overallScore: 20,
									overallVerdict: 'Strong consult-style reasoning with a few remaining omissions.',
									confidenceLabel: 'moderate',
									confidenceReason: 'The prompt does not fully constrain the strongest competing localization.',
									strengths: ['Names the syndrome first.', 'Ranks the localization hierarchy explicitly.'],
									gaps: ['Could reject the rival diagnosis more sharply.', 'Needs a crisper reversal trigger.'],
									nextStep: 'Ask which finding would most strongly push the case out of the brainstem.',
									changeMindFinding: 'A cortical sign such as aphasia or neglect.',
									criterionScores: [
										{ id: 'syndrome', score: 4, feedback: 'Clear syndrome first.', strongestSignal: 'Defines what is failing.', missedSignals: [] },
										{ id: 'hierarchy', score: 4, feedback: 'Ranks the strongest levels.', strongestSignal: 'Best-fit level comes first.', missedSignals: [] },
										{ id: 'mechanism', score: 4, feedback: 'Connects signs to tract logic.', strongestSignal: 'Named tract and circuit logic.', missedSignals: [] },
										{ id: 'alternative', score: 3, feedback: 'Names a real rival frame.', strongestSignal: 'Uses negative findings.', missedSignals: ['Decisive mismatch with the observed signs'] },
										{ id: 'next-data', score: 3, feedback: 'Asks for a decisive next step.', strongestSignal: 'Explains why the next test matters.', missedSignals: ['How it would change the differential'] },
										{ id: 'reversal', score: 2, feedback: 'Mentions what would change the frame.', strongestSignal: 'Offers a disconfirming finding.', missedSignals: ['A new localization if that finding appears'] },
									],
								},
							},
						};
					},
				},
			}
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			level: string;
			answer: string;
			evaluation: {
				scoreAvailable: boolean;
				overallScore: number | null;
				criterionScores: Array<{ id: string; score: number | null }>;
			};
			reasoning_rubric: Array<{ id: string }>;
		};
		const askInput = capturedInput as {
			response_format?: { type?: string; json_schema?: unknown };
		};

		expect(capturedModel).toBe('@cf/meta/llama-3.1-8b-instruct');
		expect(askInput.response_format?.type).toBe('json_schema');
		expect(askInput.response_format?.json_schema).toBeTruthy();
		expect(data.level).toBe('consult-rounds');
		expect(data.answer).toBe('ok');
		expect(data.evaluation.scoreAvailable).toBe(true);
		expect(data.evaluation.overallScore).toBe(20);
		expect(data.evaluation.criterionScores.find((criterion) => criterion.id === 'reversal')?.score).toBe(2);
		expect(data.reasoning_rubric.some((criterion) => criterion.id === 'next-data')).toBe(true);
	});

	it('falls back to answer-only mode when structured scoring cannot be satisfied', async () => {
		let callCount = 0;

		const response = await handleApiRequest(
			request('/api/ask?q=localize%20this'),
			{
				ai: {
					async run() {
						callCount += 1;
						if (callCount === 1) {
							throw new Error("JSON Mode couldn't be met");
						}

						return { response: 'fallback answer' };
					},
				},
			}
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			answer: string;
			evaluation: {
				scoreAvailable: boolean;
				overallScore: number | null;
				confidenceReason: string;
				criterionScores: Array<{ score: number | null }>;
			};
		};

		expect(callCount).toBe(2);
		expect(data.answer).toBe('fallback answer');
		expect(data.evaluation.scoreAvailable).toBe(false);
		expect(data.evaluation.overallScore).toBeNull();
		expect(data.evaluation.confidenceReason).toContain("JSON Mode couldn't be met");
		expect(data.evaluation.criterionScores).toHaveLength(6);
		expect(data.evaluation.criterionScores.every((criterion) => criterion.score === null)).toBe(true);
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
			summary: {
				coveragePct: number;
				totalDistanceCm: number;
				navigationRegime: string;
				thetaState: string;
			};
			interpretation: { headline: string; behaviorSignals: string[] };
		};
		expect(data.path.length).toBeGreaterThan(100);
		expect(data.spikes.length).toBeGreaterThan(0);
		expect(data.rateMap.length).toBe(24);
		expect(data.summary.coveragePct).toBeGreaterThan(5);
		expect(data.summary.totalDistanceCm).toBeGreaterThan(0);
		expect(data.summary.navigationRegime.length).toBeGreaterThan(8);
		expect(data.summary.thetaState.length).toBeGreaterThan(8);
		expect(data.interpretation.headline.length).toBeGreaterThan(10);
		expect(data.interpretation.behaviorSignals.length).toBeGreaterThanOrEqual(2);
	});

	it('returns neuron phenotype metrics beyond the raw spike trace', async () => {
		const response = await handleApiRequest(
			request('/api/neuron?inputCurrent=2.6&threshold=-58&duration=140'),
			{ ai: inertAiClient }
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			spikeTimes: number[];
			summary: {
				firingPattern: string;
				excitabilityClass: string;
				steadyStateVoltage: number;
				thresholdSlackMv: number;
				refractoryLimited: boolean;
			};
			interpretation: {
				headline: string;
				bedsideSignals: string[];
			};
		};
		expect(data.spikeTimes.length).toBeGreaterThan(0);
		expect(data.summary.firingPattern.length).toBeGreaterThan(5);
		expect(data.summary.excitabilityClass.length).toBeGreaterThan(8);
		expect(Number.isFinite(data.summary.steadyStateVoltage)).toBe(true);
		expect(Number.isFinite(data.summary.thresholdSlackMv)).toBe(true);
		expect(typeof data.summary.refractoryLimited).toBe('boolean');
		expect(data.interpretation.headline.length).toBeGreaterThan(10);
		expect(data.interpretation.bedsideSignals.length).toBeGreaterThanOrEqual(2);
	});

	it('returns plasticity phenotype metrics beyond the raw STDP window', async () => {
		const response = await handleApiRequest(
			request('/api/plasticity?deltaT=-14&pairCount=90&aMinus=0.011&initialWeight=0.7'),
			{ ai: inertAiClient }
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			finalWeight: number;
			summary: {
				totalWeightChange: number;
				windowBias: number;
				saturationState: string;
				learningRegime: string;
			};
			interpretation: {
				headline: string;
				differentialTraps: string[];
			};
		};
		expect(Number.isFinite(data.finalWeight)).toBe(true);
		expect(Number.isFinite(data.summary.totalWeightChange)).toBe(true);
		expect(Number.isFinite(data.summary.windowBias)).toBe(true);
		expect(['floor', 'midrange', 'ceiling']).toContain(data.summary.saturationState);
		expect(data.summary.learningRegime.length).toBeGreaterThan(8);
		expect(data.interpretation.headline.length).toBeGreaterThan(10);
		expect(data.interpretation.differentialTraps.length).toBeGreaterThanOrEqual(2);
	});

	it('shows cueward shift and omission dip in dopamine learning', async () => {
		const response = await handleApiRequest(
			request('/api/dopamine?trialCount=24&omissionTrial=20'),
			{ ai: inertAiClient }
		);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			snapshots: Array<{ label: string }>;
			snapshotMetrics: Array<{
				label: string;
				rewardDelivered: boolean;
				cuePeak: number;
			}>;
			learningCurve: Array<{ cueError: number; rewardError: number }>;
			summary: {
				omissionDip: number;
				cueRewardRatio: number;
				learningRegime: string;
			};
			interpretation: {
				headline: string;
				behaviorSignals: string[];
			};
		};
		expect(data.snapshots.length).toBeGreaterThanOrEqual(4);
		expect(data.snapshotMetrics.length).toBeGreaterThanOrEqual(4);
		expect(data.snapshotMetrics.some((metric) => metric.rewardDelivered === false)).toBe(true);
		expect(data.snapshotMetrics.some((metric) => metric.cuePeak > 0)).toBe(true);
		expect(data.learningCurve[data.learningCurve.length - 1]!.cueError).toBeGreaterThan(0);
		expect(data.summary.omissionDip).toBeLessThan(0);
		expect(data.summary.cueRewardRatio).toBeGreaterThan(0);
		expect(data.summary.learningRegime.length).toBeGreaterThan(8);
		expect(data.interpretation.headline.length).toBeGreaterThan(10);
		expect(data.interpretation.behaviorSignals.length).toBeGreaterThanOrEqual(2);
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
		expect(data.regions.length).toBeGreaterThan(12);
		const thalamus = data.regions.find((region) => region.id === 'thalamus');
		expect(thalamus?.chapter1.functions.length).toBeGreaterThan(2);
		expect(thalamus?.chapter2.interlinks.some((link) => link.target === 'prefrontal')).toBe(true);
		expect(data.regions.some((region) => region.id === 'insula')).toBe(true);
		expect(data.regions.some((region) => region.id === 'anteriorCingulate')).toBe(true);
		expect(data.regions.some((region) => region.id === 'parietalAssociation')).toBe(true);
		expect(data.regions.some((region) => region.id === 'hypothalamus')).toBe(true);
		expect(data.overlays.some((overlay) => overlay.id === 'middle-cerebral-territory')).toBe(true);
		expect(data.overlays.some((overlay) => overlay.id === 'salience-autonomic-network')).toBe(true);
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
