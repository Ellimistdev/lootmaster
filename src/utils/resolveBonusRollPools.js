// Resolve SimC bonus-roll records against published Encounter Journal pools.
// Never infer a completion denominator from an ambiguous source or difficulty.
export function resolveBonusRollPools(groups, dataset) {
  if (!dataset?.instances) return groups
  const pools = dataset.lootPools || {}
  const entries = []
  for (const [instanceId, instance] of Object.entries(dataset.instances)) {
    for (const [encounterId, encounter] of Object.entries(instance.encounters || {})) {
      for (const [difficultyId, difficulty] of Object.entries(encounter.difficulties || {})) {
        entries.push({ instanceId, instance, encounterId, encounter, difficultyId, difficulty })
      }
    }
  }
  const RAID_CONTEXT_DIFFICULTIES = { 5: '15', 6: '16' }
  return groups.map((group) => {
    const awarded = [...new Set(group.rolls.map((roll) => roll.itemId))]
    const raidDifficulty = RAID_CONTEXT_DIFFICULTIES[group.context] ?? null
    const candidates = entries.flatMap((entry) => {
      // For known raid contexts, never mix Heroic and Mythic eligibility.
      // keyLevel describes a reward variant, not the encounter difficulty.
      if (raidDifficulty && entry.difficultyId !== raidDifficulty) return []
      const { difficulty } = entry
      const raw = difficulty.specializations?.[String(group.specId)]
      if (raw == null) return []
      const itemIds = Array.isArray(raw) ? raw : pools[String(raw)]
      if (!Array.isArray(itemIds)) return []
      if (!awarded.every((id) => itemIds.includes(id))) return []
      const sourceMatches = Number(group.source) === Number(entry.encounterId) ||
        Number(group.source) === Number(entry.encounter.dungeonEncounterId)
      return [{ ...entry, itemIds, sourceMatches }]
    })
    // Source IDs are not guaranteed to use Encounter Journal IDs. If the
    // source is unknown, only use item membership when it identifies exactly
    // one encounter; never guess between multiple bosses.
    const matched = candidates.filter((candidate) => candidate.sourceMatches)
    const possible = matched.length ? matched : candidates
    const encounters = new Set(possible.map((candidate) => candidate.instanceId + ':' + candidate.encounterId))
    if (encounters.size !== 1) return { ...group, resolution: possible.length ? 'ambiguous' : 'unresolved' }
    // Multiple difficulties are safe only when they produce identical pools.
    const signatures = new Set(possible.map((candidate) => JSON.stringify([...candidate.itemIds].sort((a,b) => a-b))))
    if (signatures.size !== 1) return { ...group, resolution: 'difficulty-ambiguous' }
    const match = possible[0]
    const eligibleIds = [...new Set(match.itemIds)].sort((a,b) => a-b)
    const obtainedIds = awarded.filter((id) => eligibleIds.includes(id))
    const missingIds = eligibleIds.filter((id) => !obtainedIds.includes(id))
    return {
      ...group, resolution: matched.length ? 'source' : 'item-inferred',
      encounterDifficultyId: match.difficultyId,
      rewardKeyLevel: group.keyLevel,
      name: match.encounter.name, instanceName: match.instance.name,
      difficultyName: possible.length === 1 ? match.difficulty.name : 'Multiple difficulties (identical pool)',
      eligibleIds, obtainedIds, missingIds, totalEligible: eligibleIds.length,
      completion: eligibleIds.length ? obtainedIds.length / eligibleIds.length : null,
    }
  })
}
