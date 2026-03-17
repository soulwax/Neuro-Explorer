import { describe, expect, it } from 'vitest';
import { ecgCases } from '../src/core/cases/ecg';
import { ecgConsultFrames, ecgPresets, getEcgPreset } from '../src/core/ecg';

describe('ecg teaching layer', () => {
	it('keeps every case aligned to valid consult frames', () => {
		const frameIds = new Set(ecgConsultFrames.map((frame) => frame.id));

		for (const item of ecgCases) {
			expect(frameIds.has(item.expectedConsultFrameId)).toBe(true);
			expect(frameIds.has(item.startingConsultFrameId)).toBe(true);
		}
	});

	it('keeps consult frames wired to real presets', () => {
		const presetIds = new Set(ecgPresets.map((preset) => preset.id));

		for (const frame of ecgConsultFrames) {
			expect(presetIds.has(frame.linkedPresetId)).toBe(true);
		}
	});

	it('publishes the neurocritical presets introduced for case mode', () => {
		expect(getEcgPreset('postictal-sympathetic-surge')?.label).toContain('Post-ictal');
		expect(getEcgPreset('brainstem-autonomic-instability')?.label).toContain('Brainstem');
		expect(getEcgPreset('cushing-response')?.label).toContain('Cushing');
	});
});
