import { describe, expect, it } from 'vitest';
import { getHeadachePreset, headachePresets } from '../src/core/headache';
import { headacheCases } from '../src/core/cases/headache';
import { getCurriculumModule } from '../src/lib/curriculum';

describe('headache teaching layer', () => {
	it('keeps every case wired to valid presets', () => {
		const presetIds = new Set(headachePresets.map((preset) => preset.id));

		for (const clinicalCase of headacheCases) {
			expect(presetIds.has(clinicalCase.expectedPresetId)).toBe(true);
			expect(presetIds.has(clinicalCase.startingPresetId)).toBe(true);
		}
	});

	it('allows presets to be retrieved by id', () => {
		expect(getHeadachePreset('migraine-with-aura')?.label).toContain('Migraine with aura');
		expect(getHeadachePreset('cluster-headache')?.autonomicFeatures).toBeGreaterThan(80);
		expect(getHeadachePreset('thunderclap-red-flag')?.redFlagScore).toBeGreaterThan(90);
		expect(getHeadachePreset('does-not-exist')).toBeUndefined();
	});

	it('registers the module in the curriculum', () => {
		const module = getCurriculumModule('headache');

		expect(module?.title).toContain('Headache');
		expect(module?.linkedModules).toContain('ask');
	});

	it('gives every case a title, prompt, and at least one hint', () => {
		for (const clinicalCase of headacheCases) {
			expect(clinicalCase.title.length).toBeGreaterThan(0);
			expect(clinicalCase.prompt.length).toBeGreaterThan(0);
			expect(clinicalCase.hints.length).toBeGreaterThan(0);
		}
	});
});
