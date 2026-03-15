import { describe, expect, it } from "vitest";
import {
  classify,
  flattenBossLoot,
  normStat,
  parseManualItems,
  parsePrimaryOptions,
  parsePriority,
  parseSpecs,
  specCanUseItem,
  specCanUseWeapon,
  weaponCategory,
} from "./lootLogic";

describe("loot logic helpers", () => {
  it("normalizes stat aliases", () => {
    expect(normStat("Mast")).toBe("mastery");
    expect(normStat("versatility")).toBe("vers");
    expect(normStat("Crit")).toBe("crit");
  });

  it("parses primary stat options", () => {
    expect(parsePrimaryOptions("Agi/Int")).toEqual(["agi", "int"]);
    expect(parsePrimaryOptions("int/str ")).toEqual(["int", "str"]);
    expect(parsePrimaryOptions(null)).toEqual([]);
  });

  it("parses top priority stats from a priority string", () => {
    const parsed = parsePriority("Crit = Haste > Vers > Mast");

    expect(parsed.top1).toBe("crit");
    expect(parsed.top2).toBe("haste");
    expect(parsed.top1Tier.has("crit")).toBe(true);
    expect(parsed.top1Tier.has("haste")).toBe(true);
  });

  it("flattens boss loot and keeps normalized secondaries", () => {
    const table = {
      BossA: [
        { item: "Item 1", slot: "Ring", type: "Ring", primary: null, stat1: "Crit", stat2: "Mast" },
      ],
    };

    const rows = flattenBossLoot(table);

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Item 1");
    expect(rows[0].stats).toEqual(["crit", "mastery"]);
  });

  it("returns parse errors for malformed manual item rows", () => {
    const rows = parseManualItems("OnlyName");
    expect(rows).toHaveLength(1);
    expect(rows[0].error).toMatch(/Expected at least 4 tab-separated fields/i);
  });
});

describe("spec and item compatibility", () => {
  it("filters out items with mismatched primary stat", () => {
    const [spec] = parseSpecs("Mage - Fire\tInt > Crit > Haste > Vers");

    const intItem = {
      slot: "Chest",
      type: "Cloth",
      primary: "Int",
      stats: ["crit", "haste"],
      error: null,
    };

    const agiItem = {
      slot: "Chest",
      type: "Cloth",
      primary: "Agi",
      stats: ["crit", "haste"],
      error: null,
    };

    expect(specCanUseItem(spec, intItem)).toBe(true);
    expect(specCanUseItem(spec, agiItem)).toBe(false);
  });

  it("applies armor type restrictions for armor slots", () => {
    const [spec] = parseSpecs("Mage - Fire\tInt > Crit > Haste > Vers");

    const clothHead = {
      slot: "Head",
      type: "Cloth",
      primary: "Int",
      stats: ["crit", "haste"],
      error: null,
    };

    const plateHead = {
      slot: "Head",
      type: "Plate",
      primary: "Int",
      stats: ["crit", "haste"],
      error: null,
    };

    expect(specCanUseItem(spec, clothHead)).toBe(true);
    expect(specCanUseItem(spec, plateHead)).toBe(false);
  });

  it("categorizes warglaives based on primary options", () => {
    expect(weaponCategory({ type: "Warglaive", primary: "Int" })).toBe("int-warglaive");
    expect(weaponCategory({ type: "Warglaive", primary: "Agi" })).toBe("warglaive");
  });

  it("limits int-warglaive use to Demon Hunter - Devourer", () => {
    const devourer = { full: "Demon Hunter - Devourer", className: "Demon Hunter" };
    const havoc = { full: "Demon Hunter - Havoc", className: "Demon Hunter" };

    expect(specCanUseWeapon(devourer, "int-warglaive")).toBe(true);
    expect(specCanUseWeapon(havoc, "int-warglaive")).toBe(false);
  });
});

describe("classification", () => {
  it("marks top-tier tie items as S with rank 0.5", () => {
    const spec = {
      top1: "crit",
      top2: "haste",
      top1Tier: new Set(["crit", "haste"]),
    };
    const item = { stats: ["crit", "haste"], big: "crit" };

    const result = classify(spec, item);

    expect(result.tier).toBe("S");
    expect(result.rank).toBe(0.5);
  });

  it("marks non-matching items as Trash", () => {
    const spec = {
      top1: "crit",
      top2: "haste",
      top1Tier: new Set(["crit"]),
    };
    const item = { stats: ["vers", "mastery"], big: "vers" };

    const result = classify(spec, item);

    expect(result.tier).toBe("Trash");
    expect(result.rank).toBe(999);
  });
});
