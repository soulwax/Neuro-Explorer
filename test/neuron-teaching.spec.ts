import { describe, expect, it } from "vitest";
import {
  defaultNeuronParams,
  neuronPresets,
  simulateNeuron,
} from "../src/core/neuron";

describe("neuron teaching layer", () => {
  it("publishes clinically framed excitability presets", () => {
    expect(neuronPresets.map((preset) => preset.id)).toEqual(
      expect.arrayContaining([
        "quiet-reserve",
        "near-threshold",
        "hyperexcitable",
        "refractory-braked",
      ]),
    );
    expect(neuronPresets.every((preset) => preset.description.length > 30)).toBe(
      true,
    );
  });

  it("exposes summary and interpretation metrics from the deterministic model", () => {
    const result = simulateNeuron(defaultNeuronParams);

    expect(result.summary.firingPattern.length).toBeGreaterThan(5);
    expect(result.summary.excitabilityClass.length).toBeGreaterThan(8);
    expect(result.summary.steadyStateVoltage).toBeGreaterThan(
      result.params.restingPotential,
    );
    expect(Number.isFinite(result.summary.thresholdSlackMv)).toBe(true);
    expect(typeof result.summary.refractoryLimited).toBe("boolean");
    expect(result.interpretation.bedsideSignals.length).toBeGreaterThanOrEqual(
      2,
    );
    expect(result.interpretation.nextQuestions.length).toBeGreaterThanOrEqual(
      2,
    );
  });
});
