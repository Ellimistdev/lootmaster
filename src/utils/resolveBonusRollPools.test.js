import { describe, expect, it } from "vitest";
import { resolveBonusRollPools } from "./resolveBonusRollPools";
import { groupBonusRolls } from "./groupBonusRolls";
const roll = { currency: 3418, source: 278284, context: 5, keyLevel: 4, specId: 257, itemId: 10 };
const data = { schemaVersion: 2, items: Object.fromEntries([10, 20, 30].map((id) => [id, { isEquipment: true }])), lootPools: { "1": [10, 20], "2": [10, 30] }, instances: {
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
    const raid = { schemaVersion: 2, items: Object.fromEntries([10, 20, 30].map((id) => [id, { isEquipment: true }])), lootPools: { "1": [10, 20], "2": [10, 30] }, instances: {
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
    expect(h.eligibilityDifficultyId).toBe("16");
    expect(h.missingIds).toEqual([30]);
    expect(h.rewardKeyLevel).toBe(4);
    expect(m.encounterDifficultyId).toBe("16");
    expect(m.missingIds).toEqual([30]);
    expect(m.rewardKeyLevel).toBe(1);
  });
  it("excludes decor, cosmetics and pets from the completion denominator", () => {
    const variant = structuredClone(data);
    variant.lootPools["1"] = [10, 20, 30, 40, 50];
    variant.items["30"] = { itemCategory: "housing-decor", isEquipment: false };
    variant.items["40"] = { isPet: true, isEquipment: false };
    variant.items["50"] = { isCosmetic: true, isEquipment: false };
    const [pool] = resolveBonusRollPools(groupBonusRolls([roll]), variant);
    expect(pool.eligibleIds).toEqual([10, 20]);
    expect(pool.missingIds).toEqual([20]);
  });
  it("identifies a known source even when the reward ID differs, without claiming completion", () => {
    const variant = structuredClone(data);
    const [pool] = resolveBonusRollPools(groupBonusRolls([{ ...roll, itemId: 99 }]), variant);
    expect(pool.name).toBe("Boss");
    expect(pool.resolution).toBe("reward-variant-mismatch");
    expect(pool.completion).toBeNull();
  });
  it("filters equippable cosmetics identified by tooltip text", () => {
    const variant = structuredClone(data);
    variant.lootPools["1"] = [10, 20, 99];
    variant.items["99"] = { isEquipment: true, itemClassID: 4, equipLocation: "INVTYPE_HEAD",
      tooltipLines: [{ leftText: "Soulcoiler's Rush'kah" }, { rightText: "Cosmetic", leftText: "Head" },
        { leftText: "Use: Add this appearance to your Warband collection." }] };
    const [pool] = resolveBonusRollPools(groupBonusRolls([roll]), variant);
    expect(pool.eligibleIds).toEqual([10, 20]);
  });
  it("infers Heroic from matching item names on Mythic and maps the reward variant", () => {
    const variant = { schemaVersion: 2, lootPools: { "1": [100, 200], "2": [101, 201] },
      items: { "100": { name: "Cincture", isEquipment: true },
        "101": { name: "Cincture", isEquipment: true },
        "200": { name: "Other", isEquipment: true },
        "201": { name: "Other", isEquipment: true } },
      instances: { "1": { name: "Raid", encounters: { "500": { name: "Nymrissa",
        difficulties: { "15": { name: "Heroic", specializations: { "257": "1" } },
          "16": { name: "Mythic", specializations: { "257": "2" } } } } } } } };
    const [pool] = resolveBonusRollPools(groupBonusRolls([
      { ...roll, source: 274708, context: 5, keyLevel: 1, itemId: 101 },
    ]), variant);
    expect(pool.name).toBe("Nymrissa");
    expect(pool.encounterDifficultyId).toBe("15");
    expect(pool.eligibilityDifficultyId).toBe("16");
    expect(pool.obtainedIds).toEqual([101]);
    expect(pool.missingIds).toEqual([201]);
  });
  it("resolves Heroic from a Mythic reward sharing the same SimC source", () => {
    const variant = { schemaVersion: 2, lootPools: { "1": [100, 200], "2": [101, 201] },
      items: { "100": { name: "Cincture", isEquipment: true },
        "101": { name: "Cincture", isEquipment: true },
        "200": { name: "Other", isEquipment: true },
        "201": { name: "Other", isEquipment: true } },
      instances: { "1": { name: "Raid", encounters: { "500": { name: "Nymrissa",
        difficulties: { "15": { name: "Heroic", specializations: { "257": "1" } },
          "16": { name: "Mythic", specializations: { "257": "2" } } } } } } } };
    const groups = groupBonusRolls([
      { ...roll, source: 274708, context: 5, keyLevel: 1, itemId: 999 },
      { ...roll, source: 274708, context: 6, keyLevel: 1, itemId: 101 },
    ]);
    const [heroic] = resolveBonusRollPools(groups, variant);
    expect(heroic.name).toBe("Nymrissa");
    expect(heroic.difficultyName).toBe("Heroic");
    expect(heroic.resolution).toBe("reward-variant-mismatch");
    expect(heroic.totalEligible).toBeNull();
  });
  it("resolves item names from harvested tooltip titles", () => {
    const variant = structuredClone(data);
    variant.items["10"] = { isEquipment: true, tooltipLines: [{ type: 22, leftText: "Shared Item" }] };
    variant.items["99"] = { isEquipment: true, tooltipLines: [{ type: 22, leftText: "Shared Item" }] };
    const [pool] = resolveBonusRollPools(groupBonusRolls([{ ...roll, source: 999, itemId: 99 }]), variant);
    expect(pool.name).toBe("Boss");
    expect(pool.obtainedIds).toEqual([10]);
  });
  it("reuses an encounter identified by Mythic rewards for an unresolved Heroic group", () => {
    const fixture = { lootPools: { "1": [10, 20] }, items: {
      "10": { isEquipment: true }, "20": { isEquipment: true },
    }, instances: { "1": { name: "Raid", encounters: { "500": {
      name: "Nymrissa", difficulties: { "16": {
        name: "Mythic", specializations: { "257": "1" },
      } },
    } } } } };
    const groups = groupBonusRolls([
      { ...roll, source: 274708, context: 5, itemId: 999 },
      { ...roll, source: 274708, context: 6, itemId: 10 },
    ]);
    const [heroic, mythic] = resolveBonusRollPools(groups, fixture);
    expect(heroic.name).toBe("Nymrissa");
    expect(heroic.resolution).toBe("reward-variant-mismatch");
    expect(heroic.completion).toBeNull();
    expect(mythic.name).toBe("Nymrissa");
    expect(mythic.completion).toBe(0.5);
  });
  it("combines key levels within a context but keeps Heroic and Mythic progress separate", () => {
    const raid = { schemaVersion: 2, lootPools: { "1": [10, 20, 30] },
      items: Object.fromEntries([10, 20, 30].map((id) => [id, { isEquipment: true }])),
      instances: { "1": { name: "Raid", encounters: { "500": { name: "Boss",
        dungeonEncounterId: 274708, difficulties: { "16": {
          name: "Mythic", specializations: { "257": "1" },
        } } } } } } };
    const groups = groupBonusRolls([
      { ...roll, source: 274708, context: 5, keyLevel: 1, itemId: 10 },
      { ...roll, source: 274708, context: 5, keyLevel: 4, itemId: 20 },
      { ...roll, source: 274708, context: 6, keyLevel: 6, itemId: 10 },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].keyLevels).toEqual([1, 4]);
    const [heroic, mythic] = resolveBonusRollPools(groups, raid);
    expect(heroic.difficultyName).toBe("Heroic");
    expect(heroic.eligibilityDifficultyId).toBe("16");
    expect(heroic.obtainedIds).toEqual([10, 20]);
    expect(heroic.missingIds).toEqual([30]);
    expect(mythic.difficultyName).toBe("Mythic");
    expect(mythic.obtainedIds).toEqual([10]);
    expect(mythic.missingIds).toEqual([20, 30]);
  });
  it("does not invent completion for an unknown pool", () => {
    expect(resolveBonusRollPools(groupBonusRolls([roll]), { instances: {} })[0].completion).toBeNull();
  });
});
