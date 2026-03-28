import { describe, expect, it } from "vitest";
import {
  basalGangliaPresets,
  defaultBasalGangliaParams,
  simulateBasalGanglia,
} from "../src/core/basal-ganglia";
import { getCurriculumModule } from "../src/lib/curriculum";
import { moduleCards } from "../src/lib/site";

describe("basal ganglia teaching layer", () => {
  it("publishes movement-disorder presets across hypokinetic and hyperkinetic states", () => {
    expect(basalGangliaPresets.map((preset) => preset.id)).toEqual(
      expect.arrayContaining([
        "balanced-selection",
        "parkinson-off",
        "dopamine-on",
        "freezing-overbrake",
        "peak-dose-dyskinesia",
        "indirect-collapse",
      ]),
    );
    expect(
      basalGangliaPresets.every((preset) => preset.bedsideClues.length >= 3),
    ).toBe(true);
    expect(
      basalGangliaPresets.every((preset) => preset.caution.length > 20),
    ).toBe(true);
  });

  it("derives gate and movement summaries from the deterministic loop model", () => {
    const baseline = simulateBasalGanglia(defaultBasalGangliaParams);
    const parkinsonOff = simulateBasalGanglia(
      basalGangliaPresets.find((preset) => preset.id === "parkinson-off")!
        .params,
    );
    const dyskinesia = simulateBasalGanglia(
      basalGangliaPresets.find(
        (preset) => preset.id === "peak-dose-dyskinesia",
      )!.params,
    );

    expect(baseline.metrics.thalamicRelease).toBeGreaterThan(35);
    expect(baseline.metrics.selectionStability).toBeGreaterThan(45);
    expect(parkinsonOff.metrics.pallidalBrake).toBeGreaterThan(
      baseline.metrics.pallidalBrake,
    );
    expect(parkinsonOff.metrics.movementVigor).toBeLessThan(
      baseline.metrics.movementVigor,
    );
    expect(parkinsonOff.metrics.cueLeverage).toBeGreaterThan(40);
    expect(dyskinesia.metrics.dyskinesiaRisk).toBeGreaterThan(55);
    expect(dyskinesia.interpretation.headline.length).toBeGreaterThan(10);
  });

  it("wires the module into curriculum and site metadata", () => {
    const curriculum = getCurriculumModule("basal-ganglia");

    expect(curriculum?.linkedModules).toEqual(
      expect.arrayContaining(["dopamine", "gait", "ask"]),
    );
    expect(
      moduleCards.some((card) => card.slug === "basal-ganglia"),
    ).toBe(true);
  });
});
