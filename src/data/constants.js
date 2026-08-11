export const CLASS_LIBRARY = {
  "Death Knight": {
    color: "#C41E3A",
    armorType: "Plate",
    specs: {
      Blood: { primaryStat: "Str", secondaryPriority: ["Haste", ">", "Crit", ">", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
      Frost: { primaryStat: "Str", secondaryPriority: ["Crit", ">", "Haste", "=", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
      Unholy: { primaryStat: "Str", secondaryPriority: ["Crit", ">", "Mast", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  "Demon Hunter": {
    color: "#A330C9",
    armorType: "Leather",
    specs: {
      Devourer: { primaryStat: "Agi", secondaryPriority: ["Haste", "=", "Mast", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
      Havoc: { primaryStat: "Agi", secondaryPriority: ["Crit", ">", "Mast", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
      Vengeance: { primaryStat: "Agi", secondaryPriority: ["Haste", ">", "Vers", "=", "Crit", ">", "Mast"], updatedAt: "2026-08-11" },
    },
  },
  Druid: {
    color: "#FF7C0A",
    armorType: "Leather",
    specs: {
      Balance: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Mast", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
      Feral: { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Haste", "=", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
      Guardian: { primaryStat: "Agi", secondaryPriority: ["Haste", ">", "Vers", ">", "Crit", ">", "Mast"], updatedAt: "2026-08-11" },
      Restoration: { primaryStat: "Int", secondaryPriority: ["Haste", "=", "Mast", ">", "Vers", ">", "Crit"], updatedAt: "2026-08-11" },
    },
  },
  Evoker: {
    color: "#33937F",
    armorType: "Mail",
    specs: {
      Augmentation: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", "=", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
      Devastation: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Haste", "=", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
      Preservation: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Hunter: {
    color: "#AAD372",
    armorType: "Mail",
    specs: {
      "Beast Mastery": { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Haste", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
      Marksmanship: { primaryStat: "Agi", secondaryPriority: ["Crit", ">", "Mast", ">", "Vers", ">", "Haste"], updatedAt: "2026-08-11" },
      Survival: { primaryStat: "Agi", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Mage: {
    color: "#3FC7EB",
    armorType: "Cloth",
    specs: {
      Arcane: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Crit", ">", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
      Fire: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Mast", ">", "Vers", ">", "Crit"], updatedAt: "2026-08-11" },
      Frost: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Monk: {
    color: "#00FF98",
    armorType: "Leather",
    specs: {
      Brewmaster: { primaryStat: "Agi", secondaryPriority: ["Crit", "=", "Vers", "=", "Mast", ">", "Haste"], updatedAt: "2026-08-11" },
      Mistweaver: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Crit", ">", "Vers", "=", "Mast"], updatedAt: "2026-08-11" },
      Windwalker: { primaryStat: "Agi", secondaryPriority: ["Haste", ">", "Crit", ">", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Paladin: {
    color: "#F48CBA",
    armorType: "Plate",
    specs: {
      Holy: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Haste", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
      Protection: { primaryStat: "Str", secondaryPriority: ["Haste", ">", "Crit", ">", "Vers", "=", "Mast"], updatedAt: "2026-08-11" },
      Retribution: { primaryStat: "Str", secondaryPriority: ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Priest: {
    color: "#FFFFFF",
    armorType: "Cloth",
    specs: {
      Discipline: { primaryStat: "Int", secondaryPriority: ["Haste", ">", "Mast", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
      Holy: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Mast", "=", "Vers", ">", "Haste"], updatedAt: "2026-08-11" },
      Shadow: { primaryStat: "Int", secondaryPriority: ["Mast", "=", "Haste", "=", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Rogue: {
    color: "#FFF468",
    armorType: "Leather",
    specs: {
      Assassination: { primaryStat: "Agi", secondaryPriority: ["Crit", "=", "Haste", ">", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
      Outlaw: { primaryStat: "Agi", secondaryPriority: ["Crit", ">", "Haste", ">", "Vers", ">", "Mast"], updatedAt: "2026-08-11" },
      Subtlety: { primaryStat: "Agi", secondaryPriority: ["Haste", ">", "Mast", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Shaman: {
    color: "#0070DD",
    armorType: "Mail",
    specs: {
      Elemental: { primaryStat: "Int", secondaryPriority: ["Mast", ">", "Crit", "=", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
      Enhancement: { primaryStat: "Agi", secondaryPriority: ["Mast", "=", "Haste", ">", "Crit", ">", "Vers"], updatedAt: "2026-08-11" },
      Restoration: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Vers", "=", "Haste", "=", "Mast"], updatedAt: "2026-08-11" },
    },
  },
  Warlock: {
    color: "#8788EE",
    armorType: "Cloth",
    specs: {
      Affliction: { primaryStat: "Int", secondaryPriority: ["Haste", "=", "Crit", ">", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
      Demonology: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Mast", "=", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
      Destruction: { primaryStat: "Int", secondaryPriority: ["Crit", ">", "Mast", "=", "Haste", ">", "Vers"], updatedAt: "2026-08-11" },
    },
  },
  Warrior: {
    color: "#C69B6D",
    armorType: "Plate",
    specs: {
      Arms: { primaryStat: "Str", secondaryPriority: ["Crit", ">", "Haste", ">", "Mast", ">", "Vers"], updatedAt: "2026-08-11" },
      Fury: { primaryStat: "Str", secondaryPriority: ["Mast", ">", "Haste", ">", "Vers", ">", "Crit"], updatedAt: "2026-08-11" },
      Protection: { primaryStat: "Str", secondaryPriority: ["Haste", ">", "Crit", "=", "Vers", ">", "Mast"], updatedAt: "2026-08-11" },
    },
  },
};

export const DEFAULT_SPEC_ROWS = Object.entries(CLASS_LIBRARY).flatMap(([className, classData]) =>
  Object.entries(classData.specs).map(([specName, specData]) => [`${className} - ${specName}`, [...specData.secondaryPriority]]),
);

export const SPEC_DATA_VERSION = "Season 2";
export const SPEC_DATA_UPDATED_AT = "2026-08-11";

export const LARIAS_GUIDE_URL = "https://docs.google.com/spreadsheets/d/1e2BKxoWEM-aQGpMyqecN8vFkL9iGrTerFr_NXXwJpi0/edit?gid=1180855124#gid=1180855124";

const TANK_SPECS = new Set([
  "Death Knight - Blood",
  "Demon Hunter - Vengeance",
  "Druid - Guardian",
  "Monk - Brewmaster",
  "Paladin - Protection",
  "Warrior - Protection",
]);

const HEALER_SPECS = new Set([
  "Druid - Restoration",
  "Evoker - Preservation",
  "Monk - Mistweaver",
  "Paladin - Holy",
  "Priest - Discipline",
  "Priest - Holy",
  "Shaman - Restoration",
]);

const slugify = (value) => value.toLowerCase().replace(/\s+/g, "-");

const wowheadGuideUrl = (className, specName, fullName) => {
  const rolePage = TANK_SPECS.has(fullName)
    ? "overview-pve-tank"
    : HEALER_SPECS.has(fullName)
      ? "overview-pve-healer"
      : "stat-priority-pve-dps";

  return `https://www.wowhead.com/guide/classes/${slugify(className)}/${slugify(specName)}/${rolePage}`;
};

const icyVeinsGuideUrl = (className, specName, fullName) => {
  const rolePage = TANK_SPECS.has(fullName)
    ? "pve-tank-stat-priority"
    : HEALER_SPECS.has(fullName)
      ? "pve-healing-stat-priority"
      : "pve-dps-stat-priority";

  return `https://www.icy-veins.com/wow/${slugify(specName)}-${slugify(className)}-${rolePage}`;
};

export const SPEC_REFERENCE_LINKS = Object.fromEntries(
  Object.entries(CLASS_LIBRARY).flatMap(([className, classData]) =>
    Object.keys(classData.specs).map((specName) => {
      const fullName = `${className} - ${specName}`;
      return [
        fullName,
        [
          { label: "Larias's Guide", url: LARIAS_GUIDE_URL },
          { label: "Wowhead", url: wowheadGuideUrl(className, specName, fullName) },
          { label: "Icy Veins", url: icyVeinsGuideUrl(className, specName, fullName) },
        ],
      ];
    }),
  ),
);

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
