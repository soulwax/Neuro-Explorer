import { describe, expect, it } from "vitest";
import { visualFieldCases } from "../src/core/cases/visual-field";
import {
  getVisualFieldPreset,
  visualFieldPresets,
} from "../src/core/visual-field";

describe("visual field localizer", () => {
  it("wires every case to valid preset ids", () => {
    for (const instructionCase of visualFieldCases) {
      expect(getVisualFieldPreset(instructionCase.expectedPresetId)).toBeTruthy();
      expect(getVisualFieldPreset(instructionCase.startingPresetId)).toBeTruthy();
    }
  });

  it("marks neglect as an attention pattern rather than a fixed field cut", () => {
    const neglect = getVisualFieldPreset("right-parietal-neglect");

    expect(neglect?.leftEye.tone).toBe("attention");
    expect(neglect?.rightEye.tone).toBe("attention");
  });

  it("includes a posterior homonymous pattern with macular sparing", () => {
    const posterior = getVisualFieldPreset("right-occipital-cortex");

    expect(posterior?.leftEye.mask).toBe("left-half-macular-sparing");
    expect(posterior?.rightEye.mask).toBe("left-half-macular-sparing");
    expect(visualFieldPresets.length).toBeGreaterThanOrEqual(7);
  });
});
