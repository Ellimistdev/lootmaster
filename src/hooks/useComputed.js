import { useMemo } from "react";
import { DEFAULT_LOOT_TABLE } from "../data/constants";
import {
  buildEffectiveSpecRows,
  classify,
  flattenBossLoot,
  groupTier,
  parseManualItems,
  parseSpecs,
  specCanUseItem,
  specRowsToText,
} from "../utils/lootLogic";

export function useComputed(manualItemsText, specOverrides, query, bossFilter) {
  return useMemo(() => {
    const defaultItems = flattenBossLoot(DEFAULT_LOOT_TABLE).filter((i) => i.slot !== "Trinket");
    const manualItems = parseManualItems(manualItemsText);
    const items = [...manualItems, ...defaultItems];

    const effectiveRows = buildEffectiveSpecRows(specOverrides);
    const specs = parseSpecs(specRowsToText(effectiveRows));

    const ranked = items.map((item) => {
      const entries = item.error
        ? []
        : specs
            .filter((s) => !s.error)
            .filter((s) => specCanUseItem(s, item))
            .map((spec) => ({ spec, result: classify(spec, item) }));

      return {
        item,
        s: groupTier(entries, "S"),
        a: groupTier(entries, "A"),
        trash: groupTier(entries, "Trash"),
        detail: entries.sort((x, y) => {
          const tierOrder = { S: 0, A: 1, Trash: 2 };
          return (
            tierOrder[x.result.tier] - tierOrder[y.result.tier] ||
            x.result.rank - y.result.rank ||
            x.spec.short.localeCompare(y.spec.short)
          );
        }),
      };
    });

    const bossOptions = [...new Set(
      ranked
        .map((r) => r.item.boss)
        .filter((boss) => boss && boss !== "Manual Additions"),
    )].sort((a, b) => a.localeCompare(b));

    const filteredByBoss = bossFilter === "All bosses"
      ? ranked
      : ranked.filter((r) => r.item.source === "manual" || r.item.boss === bossFilter);

    const q = query.trim().toLowerCase();
    const filteredRanked = q
      ? filteredByBoss.filter((r) =>
          [r.item.name, r.item.slot, r.item.type, r.item.primary, r.item.boss, ...r.item.stats]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : filteredByBoss;

    return {
      items,
      specs,
      ranked: filteredRanked,
      defaultItemCount: defaultItems.length,
      manualItemCount: manualItems.length,
      overrideCount: Object.keys(specOverrides).length,
      effectiveRows,
      bossOptions,
    };
  }, [manualItemsText, specOverrides, query, bossFilter]);
}
