import { describe, expect, it } from "vitest";
import { parsePriority } from "./lootLogic";
import { classify } from "./ranking";

describe("single-secondary-stat ranking", () => {
  const hasteOnlyItem = { stats: ["haste"], big: "haste", small: null };

  it("ranks a single stat as S when it is the spec's sole top priority", () => {
    const spec = parsePriority("Haste > Mast > Crit > Vers");
    const result = classify(spec, hasteOnlyItem);

    expect(result.tier).toBe("S");
    expect(result.rank).toBe(0.5);
  });

  it("ranks a single stat as S when it belongs to the highest-priority tie group", () => {
    const spec = parsePriority("Mast = Crit = Haste > Vers");
    const result = classify(spec, hasteOnlyItem);

    expect(result.tier).toBe("S");
    expect(result.rank).toBe(1.0);
  });

  it("ranks a sole top priority above a tied top-priority match", () => {
    const strictTop = classify(parsePriority("Haste > Mast > Crit > Vers"), hasteOnlyItem);
    const tiedTop = classify(parsePriority("Mast = Crit = Haste > Vers"), hasteOnlyItem);

    expect(strictTop.rank).toBeLessThan(tiedTop.rank);
  });

  it("keeps existing classification behavior for dual-stat items", () => {
    const spec = parsePriority("Haste > Mast > Crit > Vers");
    const result = classify(spec, { stats: ["haste", "mastery"], big: "haste", small: "mastery" });

    expect(result.tier).toBe("S");
    expect(result.rank).toBe(0.5);
  });

  it("does not promote a single stat outside the highest-priority tier", () => {
    const spec = parsePriority("Haste > Mast > Crit > Vers");
    const result = classify(spec, { stats: ["mastery"], big: "mastery", small: null });

    expect(result.tier).toBe("A");
  });
});
