import { specCanUseItem } from "./lootLogic";

const TWO_H_AGI_STR_AXE_USERS = new Set([
  "Death Knight - Blood",
  "Death Knight - Unholy",
  "Paladin - Retribution",
  "Warrior - Arms",
  "Warrior - Fury",
  "Hunter - Survival",
]);

const ONE_H_AGI_STR_AXE_USERS = new Set([
  "Death Knight - Frost",
  "Paladin - Protection",
  "Warrior - Protection",
  "Shaman - Enhancement",
  "Monk - Windwalker",
  "Rogue - Outlaw",
  "Hunter - Survival",
]);

export function season2SpecCanUseItem(spec, item) {
  if (item?.slot?.toLowerCase() === "weapon" && item?.primary?.toLowerCase() === "agi/str") {
    const type = item.type.toLowerCase();
    if (type.includes("2h axe")) return TWO_H_AGI_STR_AXE_USERS.has(spec.full);
    if (type.includes("1h axe")) return ONE_H_AGI_STR_AXE_USERS.has(spec.full);
  }

  return specCanUseItem(spec, item);
}
