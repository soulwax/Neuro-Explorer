import { describe, expect, it } from "vitest";
import {
  defaultGridCellParams,
  gridCellPresets,
  simulateGridCell,
} from "../src/core/grid-cell";

describe("grid-cell teaching layer", () => {
  it("publishes navigation presets for the richer teaching frames", () => {
    expect(gridCellPresets.map((preset) => preset.id)).toEqual(
      expect.arrayContaining([
        "canonical-lattice",
        "broad-fields",
        "noisy-explorer",
        "compact-room",
      ]),
    );
    expect(gridCellPresets.every((preset) => preset.caution.length > 20)).toBe(
      true,
    );
  });

  it("exposes summary and interpretation metrics from the shared simulator", () => {
    const result = simulateGridCell(defaultGridCellParams);

    expect(result.summary.totalDistanceCm).toBeGreaterThan(0);
    expect(result.summary.peakToMeanRatio).toBeGreaterThan(1);
    expect(result.summary.navigationRegime.length).toBeGreaterThan(8);
    expect(result.summary.thetaState.length).toBeGreaterThan(8);
    expect(result.interpretation.behaviorSignals.length).toBeGreaterThanOrEqual(
      2,
    );
    expect(result.interpretation.nextQuestions.length).toBeGreaterThanOrEqual(
      2,
    );
  });
});
