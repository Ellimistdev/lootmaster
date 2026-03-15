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

export function useComputed(manualItemsText, specOverrides, query) {
  return useMemo(() => {
    const defaultItems = flattenBossLoot(DEFAULT_LOOT_TABLE).filter((i) => i.slot !== "Trinket");
    const manualItems = parseManualItems(manualItemsText);
    const items = [...defaultItems, ...manualItems.filter((i) => !i.error || i.raw)];

    const effectiveRows = buildEffectiveSpecRows(specOverrides);
    const specs = parseSpecs(specRowsToText(effectiveRows));

    const ranked = items.filter((i) => !i.error).map((item) => {
      const entries = specs
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

    const q = query.trim().toLowerCase();
    const filteredRanked = q
      ? ranked.filter((r) =>
          [r.item.name, r.item.slot, r.item.type, r.item.primary, r.item.boss, ...r.item.stats]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : ranked;

    return {
      items,
      specs,
      ranked: filteredRanked,
      defaultItemCount: defaultItems.length,
      manualItemCount: manualItems.filter((i) => !i.error).length,
      overrideCount: Object.keys(specOverrides).length,
      effectiveRows,
    };
  }, [manualItemsText, specOverrides, query]);
}
