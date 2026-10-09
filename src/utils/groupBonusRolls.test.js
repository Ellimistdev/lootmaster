import { describe, expect, it } from "vitest";
import { groupBonusRolls } from "./groupBonusRolls";
const item = { currency:3418, source:278284, context:5, keyLevel:4, specId:257, itemId:268265 };
describe("groupBonusRolls", () => {
  it("preserves duplicate rolls but deduplicates collection", () => {
    const [pool] = groupBonusRolls([item,item], { "3418:278284:5:4:257": {name:"Test",itemIds:[268265,271092]} });
    expect(pool.rollCount).toBe(2);
    expect(pool.obtainedIds).toEqual([268265]);
    expect(pool.completion).toBe(0.5);
  });
  it("does not invent completion for unknown pools", () => {
    expect(groupBonusRolls([item])[0].completion).toBeNull();
  });
  it("separates specialization and context", () => {
    expect(groupBonusRolls([item,{...item,specId:258},{...item,context:6}])).toHaveLength(3);
  });
});
