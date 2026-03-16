import { describe, expect, it } from "vitest";
import {
  classify,
  parseSpecOverridesJson,
  flattenBossLoot,
  normStat,
  parseManualItems,
  parsePrimaryOptions,
  parsePriority,
  parseSpecs,
  sanitizeSpecOverrides,
  serializeSpecOverrides,
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
    expect(rows[0].name).toBe("OnlyName");
    expect(rows[0].boss).toBe("Manual Additions");
    expect(rows[0].error).toMatch(/Expected comma-separated fields/i);
  });

  it("supports optional primary stat in manual rows", () => {
    const rows = parseManualItems("Custom Wand, Weapon, Dagger, Int, Crit, Vers");

    expect(rows[0].error).toBeNull();
    expect(rows[0].primary).toBe("Int");
    expect(rows[0].stats).toEqual(["crit", "vers"]);
  });

  it("deduplicates and caps manual secondary stats to two", () => {
    const rows = parseManualItems("Custom Ring, Ring, Ring, Crit, Crit, Vers, Mastery");

    expect(rows[0].error).toBeNull();
    expect(rows[0].stats).toEqual(["crit", "vers"]);
  });

  it("supports quoted commas in manual item names", () => {
    const rows = parseManualItems('"Seal, of Echoes", Ring, Ring, Crit, Haste');

    expect(rows[0].error).toBeNull();
    expect(rows[0].name).toBe("Seal, of Echoes");
    expect(rows[0].stats).toEqual(["crit", "haste"]);
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
    expect(weaponCategory({ type: "Warglaive", primary: "Int" })).toBe("warglaive");
    expect(weaponCategory({ type: "Warglaive", primary: "Agi" })).toBe("warglaive");
  });

  it("allows warglaives for Demon Hunter specs", () => {
    const devourer = { full: "Demon Hunter - Devourer", className: "Demon Hunter" };
    const havoc = { full: "Demon Hunter - Havoc", className: "Demon Hunter" };

    expect(specCanUseWeapon(devourer, "warglaive")).toBe(true);
    expect(specCanUseWeapon(havoc, "warglaive")).toBe(true);
  });

  it("allows 1h str weapons for prot specs", () => {
    const dkFrost = { full: "Death Knight - Frost", className: "Death Knight" };
    const paladinProtection = { full: "Paladin - Protection", className: "Paladin" };
    const warriorProtection = { full: "Warrior - Protection", className: "Warrior" };

    expect(specCanUseWeapon(dkFrost, "1h-str-mace")).toBe(true);
    expect(specCanUseWeapon(paladinProtection, "1h-str-mace")).toBe(true);
    expect(specCanUseWeapon(warriorProtection, "1h-str-mace")).toBe(true);
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

describe("override maintenance helpers", () => {
  it("keeps only valid override payload entries", () => {
    const cleaned = sanitizeSpecOverrides({
      "Mage - Fire": { stats: ["Crit", "Haste", "Mast", "Vers"], comps: [">", ">", ">"] },
      "Mage - Arcane": { stats: ["Crit", "Crit", "Mast", "Vers"], comps: [">", ">", ">"] },
      "Not A Real Spec": { stats: ["Crit", "Haste", "Mast", "Vers"], comps: [">", ">", ">"] },
    });

    expect(Object.keys(cleaned)).toEqual(["Mage - Fire"]);
  });

  it("round-trips override data via JSON import/export helpers", () => {
    const input = {
      "Mage - Fire": { stats: ["Crit", "Haste", "Mast", "Vers"], comps: [">", "=", ">"] },
    };

    const exported = serializeSpecOverrides(input);
    const imported = parseSpecOverridesJson(exported);

    expect(imported).toEqual(input);
  });
});
