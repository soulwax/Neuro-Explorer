import { describe, expect, it } from "vitest";
import { getCurriculumModule } from "../src/lib/curriculum";
import { moduleCards, navItems } from "../src/lib/site";

describe("AI versus biological processing teaching module", () => {
  it("is discoverable from navigation and the module catalogue", () => {
    expect(navItems.some((item) => item.href === "/ai-biology")).toBe(true);
    expect(moduleCards.find((module) => module.slug === "ai-biology")?.href).toBe("/ai-biology");
  });

  it("teaches both shared abstractions and mechanistic differences", () => {
    const module = getCurriculumModule("ai-biology");
    expect(module?.learningGoals.join(" ")).toMatch(/weighted integration/i);
    expect(module?.advancedObjectives.join(" ")).toMatch(/credit assignment/i);
    expect(module?.commonMisconceptions.join(" ")).toMatch(/Backpropagation/i);
  });
});
