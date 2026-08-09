export const DEFAULT_LOOT_TABLE = {};

export const CLASS_LIBRARY = {
  "Death Knight": {
    color: "#C41E3A",
    armorType: "Plate",
    specs: {
      Blood: { primaryStat: "Str", secondaryPriority: ["Haste", ">", "Crit", ">", "Mast", "=", "Vers"], updatedAt: "2026-03-14" },
      Frost: { primaryStat: "Str", secondaryPriority: ["Crit", ">", "Mast", "=", "Haste", ">", "Vers"], updatedAt: "2026-08-09" },
      Unholy: { primaryStat: "Str", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-03-14" },
    },
  },
  "Demon Hunter": {
    color: "#A330C9",
    armorType: "Leather",
    specs: {
      Devourer: { primaryStat: "Agi", secondaryPriority: ["Haste", "=", "Mast", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-09" },
      Havoc: { primaryStat: "Agi", secondaryPriority: ["Crit", ">", "Mast", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-09" },
      Vengeance: { primaryStat: "Agi", secondaryPriority: ["Crit", "=", "Haste", "=", "Vers", ">", "Mast"], updatedAt: "2026-03-14" },
    },
  },
  Druid: {
    color: "#FF7C0A",
    armorType: "Leather",
    specs: {
      Balance: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", "=", "Haste", ">", "Vers"], updatedAt: "2026-03-14" },
      Feral: { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-03-14" },
      Guardian: { primaryStat: "Agi", secondaryPriority: ["Haste", ">", "Vers", ">", "Crit", ">", "Mast"], updatedAt: "2026-03-14" },
      Restoration: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Mast", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-09" },
    },
  },
  Evoker: {
    color: "#33937F",
    armorType: "Mail",
    specs: {
      Augmentation: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Haste", ">", "Mast", ">", "Vers"], updatedAt: "2026-03-14" },
      Devastation: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Haste", "=", "Mast", ">", "Vers"], updatedAt: "2026-03-14" },
      Preservation: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Haste", ">", "Crit", ">", "Vers"], updatedAt: "2026-03-14" },
    },
  },
  Hunter: {
    color: "#AAD372",
    armorType: "Mail",
    specs: {
      "Beast Mastery": { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-09" },
      Marksmanship: { primaryStat: "Agi", secondaryPriority: ["Crit", ">", "Mast", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-09" },
      Survival: { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-09" },
    },
  },
  Mage: {
    color: "#3FC7EB",
    armorType: "Cloth",
    specs: {
      Arcane: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Haste", ">", "Crit", "=", "Vers"], updatedAt: "2026-03-14" },
      Fire: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Mast", ">", "Vers", ">", "Crit"], updatedAt: "2026-03-14" },
      Frost: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-03-14" },
    },
  },
  Monk: {
    color: "#00FF98",
    armorType: "Leather",
    specs: {
      Brewmaster: { primaryStat: "Agi", secondaryPriority: ["Crit", "=", "Mast", "=", "Vers", ">", "Haste"], updatedAt: "2026-03-14" },
      Mistweaver: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Crit", ">", "Vers", ">", "Mast"], updatedAt: "2026-03-14" },
      Windwalker: { primaryStat: "Agi", secondaryPriority: ["Haste", ">", "Crit", "=", "Mast", ">", "Vers"], updatedAt: "2026-08-09" },
    },
  },
  Paladin: {
    color: "#F48CBA",
    armorType: "Plate",
    specs: {
      Holy: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", "=", "Haste", ">", "Vers"], updatedAt: "2026-03-14" },
      Protection: { primaryStat: "Str", secondaryPriority: ["Haste", ">", "Crit", ">", "Vers", "=", "Mast"], updatedAt: "2026-04-14" },
      Retribution: { primaryStat: "Str", secondaryPriority: ["Mast", ">", "Haste", ">", "Crit", ">", "Vers"], updatedAt: "2026-03-14" },
    },
  },
  Priest: {
    color: "#FFFFFF",
    armorType: "Cloth",
    specs: {
      Discipline: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Crit", ">", "Mast", ">", "Vers"], updatedAt: "2026-03-14" },
      Holy: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Mast", "=", "Vers", ">", "Haste"], updatedAt: "2026-03-14" },
      Shadow: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Mast", ">", "Crit", ">", "Vers"], updatedAt: "2026-03-14" },
    },
  },
  Rogue: {
    color: "#FFF468",
    armorType: "Leather",
    specs: {
      Assassination: { primaryStat: "Agi", secondaryPriority: ["Crit", ">", "Haste", ">", "Mast", ">", "Vers"], updatedAt: "2026-03-14" },
      Outlaw: { primaryStat: "Agi", secondaryPriority: ["Crit", "=", "Haste", ">", "Vers", ">", "Mast"], updatedAt: "2026-03-14" },
      Subtlety: { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Haste", ">", "Crit", ">", "Vers"], updatedAt: "2026-03-14" },
    },
  },
  Shaman: {
    color: "#0070DD",
    armorType: "Mail",
    specs: {
      Elemental: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", "=", "Haste", ">", "Vers"], updatedAt: "2026-03-14" },
      Enhancement: { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Crit", "=", "Haste", ">", "Vers"], updatedAt: "2026-03-14" },
      Restoration: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Mast", "=", "Vers", ">", "Haste"], updatedAt: "2026-03-24" },
    },
  },
  Warlock: {
    color: "#8788EE",
    armorType: "Cloth",
    specs: {
      Affliction: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Crit", ">", "Vers", ">", "Mast"], updatedAt: "2026-08-09" },
      Demonology: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Crit", "=", "Vers", ">", "Mast"], updatedAt: "2026-08-09" },
      Destruction: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Crit", ">", "Mast", ">", "Vers"], updatedAt: "2026-08-09" },
    },
  },
  Warrior: {
    color: "#C69B6D",
    armorType: "Plate",
    specs: {
      Arms: { primaryStat: "Str", secondaryPriority: ["Crit", ">", "Haste", ">", "Mast", ">", "Vers"], updatedAt: "2026-03-14" },
      Fury: { primaryStat: "Str", secondaryPriority: ["Mast", ">", "Haste", ">", "Crit", ">", "Vers"], updatedAt: "2026-03-14" },
      Protection: { primaryStat: "Str", secondaryPriority: ["Haste", ">", "Crit", "=", "Vers", ">", "Mast"], updatedAt: "2026-08-09" },
    },
  },
};

export const DEFAULT_SPEC_ROWS = Object.entries(CLASS_LIBRARY).flatMap(([className, classData]) =>
  Object.entries(classData.specs).map(([specName, specData]) => [`${className} - ${specName}`, [...specData.secondaryPriority]]),
);

export const SPEC_DATA_VERSION = "Season 2";
export const SPEC_DATA_UPDATED_AT = "2026-08-09";

export const SPEC_OPTIONS = ["Crit", "Haste", "Mast", "Vers"];
export const COMPARATOR_OPTIONS = [">", "="];

export const ARMOR_BY_CLASS = Object.fromEntries(
  Object.entries(CLASS_LIBRARY).map(([className, classData]) => [className, classData.armorType]),
);

export const CLASS_COLORS = Object.fromEntries(
  Object.entries(CLASS_LIBRARY).map(([className, classData]) => [className, classData.color]),
);

export const PRIMARY_STAT_BY_SPEC = Object.fromEntries(
  Object.entries(CLASS_LIBRARY).flatMap(([className, classData]) =>
    Object.entries(classData.specs).map(([specName, specData]) => [`${className} - ${specName}`, specData.primaryStat]),
  ),
);

export const SECONDARIES = ["haste", "crit", "mastery", "vers"];

export const STAT_ALIASES = {
  crit: "crit",
  "critical Strike": "crit",
  haste: "haste",
  mastery: "mastery",
  mast: "mastery",
  vers: "vers",
  verse: "vers",
  versatility: "vers",
};
