import { describe, expect, it } from 'vitest';
import { atlasOverlays, atlasRegions, getAtlasOverlay } from '../src/core/brain-atlas';

describe('brain atlas teaching layer', () => {
	it('keeps every overlay wired to valid atlas regions', () => {
		const regionIds = new Set(atlasRegions.map((region) => region.id));

		for (const overlay of atlasOverlays) {
			expect(regionIds.has(overlay.compareRegionId)).toBe(true);
			for (const item of overlay.regions) {
				expect(regionIds.has(item.regionId)).toBe(true);
			}
		}
	});

	it('allows overlays to be retrieved by id', () => {
		expect(getAtlasOverlay('middle-cerebral-territory')?.title).toContain('Middle cerebral');
		expect(getAtlasOverlay('brainstem-crossed-tracts')?.category).toBe('brainstem');
	});
});
