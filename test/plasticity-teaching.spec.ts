import { describe, expect, it } from "vitest";
import {
  defaultPlasticityParams,
  plasticityPresets,
  simulatePlasticity,
} from "../src/core/plasticity";

describe("plasticity teaching layer", () => {
  it("publishes clinically framed plasticity presets", () => {
    expect(plasticityPresets.map((preset) => preset.id)).toEqual(
      expect.arrayContaining([
        "causal-potentiation",
        "metaplastic-brake",
        "runaway-potentiation",
        "washout-depression",
      ]),
    );
    expect(
      plasticityPresets.every((preset) => preset.clinicalLens.length > 25),
    ).toBe(true);
  });

  it("exposes summary and interpretation metrics from the deterministic model", () => {
    const result = simulatePlasticity(defaultPlasticityParams);

    expect(Number.isFinite(result.summary.totalWeightChange)).toBe(true);
    expect(Number.isFinite(result.summary.windowBias)).toBe(true);
    expect(result.summary.learningRegime.length).toBeGreaterThan(8);
    expect(["floor", "midrange", "ceiling"]).toContain(
      result.summary.saturationState,
    );
    expect(result.interpretation.behaviorSignals.length).toBeGreaterThanOrEqual(
      2,
    );
    expect(result.interpretation.differentialTraps.length).toBeGreaterThanOrEqual(
      2,
    );
  });
});
