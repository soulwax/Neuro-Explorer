import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Neuro Explorer worker', () => {
	it('returns API route metadata (unit style)', async () => {
		const request = new IncomingRequest('http://example.com/routes');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			name: string;
			routes: Record<string, string>;
		};
		expect(data.name).toBe('Neuro Explorer');
		expect(data.routes['/ask']).toContain('Socratic neuroscience tutor');
		expect(data.routes['/ecg']).toContain('12-lead ECG simulator');
		expect(data.routes['/grid-cell']).toContain('Entorhinal grid-cell simulator');
		expect(data.routes['/dopamine']).toContain('reward-prediction error simulator');
		expect(data.routes['/retina']).toContain('Retinal receptive field simulator');
	});

	it('serves the HTML UI shell at root (integration style)', async () => {
		const response = await SELF.fetch('https://example.com/');
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toContain('text/html');
		expect(await response.text()).toContain('Neuro Explorer');
	});

	it('returns a deterministic grid-cell map (unit style)', async () => {
		const request = new IncomingRequest('http://example.com/grid-cell?durationSec=20&arenaSize=100');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

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

	it('shows cueward shift and omission dip in dopamine learning (unit style)', async () => {
		const request = new IncomingRequest('http://example.com/dopamine?trialCount=24&omissionTrial=20');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			snapshots: Array<{ label: string }>;
			learningCurve: Array<{ cueError: number; rewardError: number }>;
			summary: { omissionDip: number };
		};
		expect(data.snapshots.length).toBeGreaterThanOrEqual(3);
		expect(data.learningCurve[data.learningCurve.length - 1].cueError).toBeGreaterThan(0);
		expect(data.summary.omissionDip).toBeLessThan(0);
	});

	it('returns center-surround retinal tuning data (unit style)', async () => {
		const request = new IncomingRequest(
			'http://example.com/retina?stimulusType=spot&stimulusRadius=3.5&surroundStrength=0.7'
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

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

	it('returns 3D activation data for the ECG explorer (unit style)', async () => {
		const request = new IncomingRequest('http://example.com/ecg?heartRate=84&qrsAmp=1.3&precordialRotation=12');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const data = (await response.json()) as {
			leads: Record<string, Array<{ mv: number }>>;
			activation: {
				beatMs: number;
				frames: Array<{ phase: string; dominantLead: string; vector: { magnitude: number } }>;
				leadAxes: Array<{ name: string }>;
			};
		};
		expect(data.leads.V2.length).toBeGreaterThan(100);
		expect(data.activation.beatMs).toBeGreaterThan(500);
		expect(data.activation.frames.length).toBeGreaterThan(60);
		expect(data.activation.leadAxes.length).toBe(12);
		expect(data.activation.frames.some((frame) => frame.phase === 'QRS')).toBe(true);
		expect(data.activation.frames.some((frame) => frame.dominantLead.startsWith('V'))).toBe(true);
		expect(data.activation.frames.some((frame) => frame.vector.magnitude > 0.2)).toBe(true);
	});
});
