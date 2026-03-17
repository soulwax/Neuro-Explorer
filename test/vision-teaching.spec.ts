import { describe, expect, it } from 'vitest';
import { visionCases } from '../src/core/cases/vision';
import {
	getVisionSyndromePreset,
	visionReadingRules,
	visionStages,
	visionSyndromePresets,
} from '../src/core/vision';

describe('vision teaching layer', () => {
	it('keeps every vision case aligned to a valid syndrome preset', () => {
		for (const item of visionCases) {
			expect(getVisionSyndromePreset(item.expectedPresetId)).toBeTruthy();
			expect(getVisionSyndromePreset(item.startingPresetId)).toBeTruthy();
		}
	});

	it('marks neglect as an attention-network syndrome', () => {
		const neglect = visionSyndromePresets.find((preset) => preset.id === 'right-parietal-neglect');
		expect(neglect?.dominantTrack).toBe('attention-network');
	});

	it('keeps optic ataxia in the dorsal stream and posterior hemianopia linked to visual fields', () => {
		const opticAtaxia = visionSyndromePresets.find((preset) => preset.id === 'optic-ataxia');
		const posteriorHemianopia = visionSyndromePresets.find((preset) => preset.id === 'posterior-hemianopia');

		expect(opticAtaxia?.dominantTrack).toBe('dorsal-stream');
		expect(posteriorHemianopia?.linkedModules).toContain('visual-field');
	});

	it('still exposes the six modeled classifier stages and reading rules', () => {
		expect(visionStages).toHaveLength(6);
		expect(visionReadingRules).toHaveLength(4);
	});
});
