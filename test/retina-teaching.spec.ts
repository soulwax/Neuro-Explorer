import { describe, expect, it } from "vitest";
import { retinaCases } from "../src/core/cases/retina";
import {
  getRetinaClinicalPreset,
  retinaClinicalPresets,
  retinaLocalizationRules,
  simulateRetina,
  defaultRetinaParams,
} from "../src/core/retina";

describe("retina teaching layer", () => {
  it("keeps every retina case aligned to a valid clinical preset", () => {
    for (const item of retinaCases) {
      expect(getRetinaClinicalPreset(item.expectedPresetId)).toBeTruthy();
      expect(getRetinaClinicalPreset(item.startingPresetId)).toBeTruthy();
    }
  });

  it("includes bilateral blind-spot enlargement for papilledema", () => {
    const papilledema = retinaClinicalPresets.find(
      (preset) => preset.id === "papilledema",
    );

    expect(papilledema?.leftEye.mask).toBe("blind-spot-enlarged");
    expect(papilledema?.rightEye.mask).toBe("blind-spot-enlarged");
  });

  it("exposes summary metrics from the deterministic retina model", () => {
    const result = simulateRetina(defaultRetinaParams);

    expect(result.summary.preferredSpotRadius).toBeGreaterThan(0);
    expect(Number.isFinite(result.summary.edgeResponse)).toBe(true);
    expect(result.summary.centerMass).toBeGreaterThan(0);
    expect(result.summary.surroundMass).toBeGreaterThan(0);
  });

  it("publishes the new prechiasmal localization rules", () => {
    expect(retinaLocalizationRules).toHaveLength(5);
    expect(retinaLocalizationRules[0]).toContain("prechiasmal");
  });
});
