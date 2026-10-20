import { describe, expect, it } from "vitest";
import { resolveBonusRollPools } from "./resolveBonusRollPools";
import { groupBonusRolls } from "./groupBonusRolls";
const roll = { currency: 3418, source: 278284, context: 5, keyLevel: 4, specId: 257, itemId: 10 };
const data = { schemaVersion: 2, lootPools: { "1": [10, 20], "2": [10, 30] }, instances: {
  "100": { name: "Dungeon", encounters: { "200": { name: "Boss", dungeonEncounterId: 278284,
    difficulties: { "23": { name: "Mythic", specializations: { "257": "1" } } } } } },
} };
describe("SimC encounter pool resolution", () => {
  it("resolves a source and lists remaining spec-eligible items", () => {
    const [pool] = resolveBonusRollPools(groupBonusRolls([roll, roll]), data);
    expect(pool.name).toBe("Boss");
    expect(pool.encounterDifficultyId).toBe("23");
    expect(pool.rollCount).toBe(2);
    expect(pool.obtainedIds).toEqual([10]);
    expect(pool.missingIds).toEqual([20]);
    expect(pool.completion).toBe(0.5);
  });
  it("does not invent completion when difficulties disagree", () => {
    const variant = structuredClone(data);
    variant.instances["100"].encounters["200"].difficulties["16"] = { name: "Other", specializations: { "257": "2" } };
    expect(resolveBonusRollPools(groupBonusRolls([roll]), variant)[0].completion).toBeNull();
  });
  it("keeps Heroic and Mythic raid pools separate regardless of reward keyLevel", () => {
    const raid = { schemaVersion: 2, lootPools: { "1": [10, 20], "2": [10, 30] }, instances: {
      "1317": { name: "Raid", encounters: { "274708": { name: "Nymrissa", dungeonEncounterId: 274708,
        difficulties: {
          "15": { name: "Heroic", specializations: { "257": "1" } },
          "16": { name: "Mythic", specializations: { "257": "2" } },
        },
      } } },
    } };
    const heroic = { ...roll, source: 274708, context: 5, keyLevel: 4 };
    const mythic = { ...roll, source: 274708, context: 6, keyLevel: 1 };
    const [h, m] = resolveBonusRollPools(groupBonusRolls([heroic, mythic]), raid);
    expect(h.encounterDifficultyId).toBe("15");
    expect(h.missingIds).toEqual([20]);
    expect(h.rewardKeyLevel).toBe(4);
    expect(m.encounterDifficultyId).toBe("16");
    expect(m.missingIds).toEqual([30]);
    expect(m.rewardKeyLevel).toBe(1);
  });
  it("does not invent completion for an unknown pool", () => {
    expect(resolveBonusRollPools(groupBonusRolls([roll]), { instances: {} })[0].completion).toBeNull();
  });
});
