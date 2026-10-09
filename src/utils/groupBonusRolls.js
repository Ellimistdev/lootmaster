// Pools are defined by all fields used by the addon to distinguish reward contexts.
// An unresolved denominator must never be presented as completion percentage.
export function groupBonusRolls(rolls, poolDefinitions = {}) {
  const groups = new Map();
  for (const roll of rolls) {
    const key = [roll.currency, roll.source, roll.context, roll.keyLevel, roll.specId].join(":");
    if (!groups.has(key)) groups.set(key, { key, currency: roll.currency, source: roll.source, context: roll.context, keyLevel: roll.keyLevel, specId: roll.specId, rolls: [] });
    groups.get(key).rolls.push(roll);
  }
  return [...groups.values()].map((group) => {
    const definition = poolDefinitions[group.key] ?? null;
    const awardedIds = [...new Set(group.rolls.map((roll) => roll.itemId))];
    const eligibleIds = definition?.itemIds ?? null;
    const obtainedIds = eligibleIds ? awardedIds.filter((id) => eligibleIds.includes(id)) : awardedIds;
    return {
      ...group, name: definition?.name ?? null, awardedIds, obtainedIds,
      rollCount: group.rolls.length,
      totalEligible: eligibleIds?.length ?? null,
      completion: eligibleIds?.length ? obtainedIds.length / eligibleIds.length : null,
    };
  });
}
