import { CLASS_LIBRARY } from "./constants";

export const SEASON_2_SPEC_PRIORITIES = {
  "Warlock - Affliction": ["Haste", ">", "Crit", ">", "Vers", ">", "Mast"],
  "Warlock - Demonology": ["Haste", ">", "Crit", "=", "Vers", ">", "Mast"],
  "Warlock - Destruction": ["Haste", ">", "Crit", ">", "Mast", ">", "Vers"],
  "Demon Hunter - Devourer": ["Haste", "=", "Mast", ">", "Crit", ">", "Vers"],
  "Demon Hunter - Havoc": ["Crit", ">", "Mast", ">", "Haste", ">", "Vers"],
  "Druid - Restoration": ["Haste", ">", "Mast", ">", "Crit", ">", "Vers"],
  "Monk - Windwalker": ["Haste", ">", "Crit", "=", "Mast", ">", "Vers"],
  "Hunter - Beast Mastery": ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"],
  "Hunter - Marksmanship": ["Crit", ">", "Mast", ">", "Haste", ">", "Vers"],
  "Hunter - Survival": ["Mast", ">", "Crit", ">", "Haste", ">", "Vers"],
  "Death Knight - Frost": ["Crit", ">", "Mast", "=", "Haste", ">", "Vers"],
  "Warrior - Protection": ["Haste", ">", "Crit", "=", "Vers", ">", "Mast"],
};

const BASE_SPEC_UPDATED_AT = "2026-03-14";

export const SPEC_UPDATED_AT = Object.fromEntries(
  Object.entries(CLASS_LIBRARY).flatMap(([className, classData]) =>
    Object.keys(classData.specs).map((specName) => [`${className} - ${specName}`, BASE_SPEC_UPDATED_AT]),
  ),
);

// Preserve known post-baseline updates from repository history.
SPEC_UPDATED_AT["Paladin - Protection"] = "2026-04-14";
SPEC_UPDATED_AT["Shaman - Restoration"] = "2026-03-24";

Object.keys(SEASON_2_SPEC_PRIORITIES).forEach((fullSpecName) => {
  SPEC_UPDATED_AT[fullSpecName] = "2026-08-09";
});
