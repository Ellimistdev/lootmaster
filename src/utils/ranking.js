import { classify as classifyStandardItem } from "./lootLogic";

export function classify(spec, item) {
  if (item.stats.length !== 1) return classifyStandardItem(spec, item);

  const [onlyStat] = item.stats;
  if (!spec.top1Tier.has(onlyStat)) return classifyStandardItem(spec, item);

  const isSoleTopPriority = spec.top1Tier.size === 1;

  return {
    tier: "S",
    rank: isSoleTopPriority ? 0.25 : 0.5,
    reason: isSoleTopPriority
      ? "Single-stat item matches this spec's sole highest-priority stat."
      : "Single-stat item matches this spec's highest-priority tie group.",
  };
}
