import { describe, expect, it } from "vitest";
import { parseSimcExport } from "./parseSimcExport";

describe("parseSimcExport", () => {
  const base = 'priest="Skelli"\nspec=holy\nregion=us\nserver=draka\n';
  it("parses six-field records without confusing context with progress", () => {
    const result = parseSimcExport(base + "# bonus_roll_items=3418:278284:5:4:268265:257/3418:278284:5:4:268265:257\n# bonus_roll_currencies=3418:0/3511:0");
    expect(result.rolls).toHaveLength(2);
    expect(result.rolls[0]).toEqual({ currency:3418, source:278284, context:5, keyLevel:4, itemId:268265, specId:257 });
    expect(result.currencies).toEqual({3418:0,3511:0});
  });
  it("handles missing rolls", () => expect(parseSimcExport(base).rolls).toEqual([]));
  it("skips malformed records", () => {
    const result = parseSimcExport(base + "# bonus_roll_items=bad/3418:278285:6:1:268248:257");
    expect(result.rolls).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
  });
  it("rejects unrelated input", () => expect(() => parseSimcExport("hello")).toThrow());
});
