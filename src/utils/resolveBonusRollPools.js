// Resolve SimC bonus-roll records against published Encounter Journal pools.
// Never infer a completion denominator from an ambiguous source or difficulty.
export function resolveBonusRollPools(groups, dataset) {
  if (!dataset?.instances) return groups
  const pools = dataset.lootPools || {}
  const items = dataset.items || {}
  const isCosmeticTooltip = (item) => (item.tooltipLines || []).some((line) =>
    /\bcosmetic\b|add this appearance to your warband collection/i.test(
      String(line?.leftText || '') + ' ' + String(line?.rightText || '')))
  const isBonusEquipment = (id) => {
    const item = items[String(id)]
    if (!item) return false
    if (item.itemCategory === 'housing-decor' || item.isHousingDecor || item.isCosmetic || item.isPet ||
      isCosmeticTooltip(item) || item.inventorySlot === 'Cosmetic' || item.itemSubClass === 'Cosmetic') return false
    if (item.isEquipment === true) return true
    if (item.isEquipment === false) return false
    return item.itemClassID === 2 || (item.itemClassID === 4 && typeof item.equipLocation === 'string' &&
      item.equipLocation.startsWith('INVTYPE_') && item.equipLocation !== 'INVTYPE_NON_EQUIP_IGNORE')
  }
  const itemName = (id) => {
    const item = items[String(id)]
    const tooltipName = item?.tooltipLines?.find((line) => line?.leftText && line.type === 22)?.leftText
    return String(item?.name || item?.itemName || tooltipName || '')
      .trim().toLocaleLowerCase()
  }
  const entries = []
  for (const [instanceId, instance] of Object.entries(dataset.instances)) {
    for (const [encounterId, encounter] of Object.entries(instance.encounters || {})) {
      for (const [difficultyId, difficulty] of Object.entries(encounter.difficulties || {})) {
        entries.push({ instanceId, instance, encounterId, encounter, difficultyId, difficulty })
      }
    }
  }
  const RAID_CONTEXT_DIFFICULTIES = { 5: '15', 6: '16' }
  const poolIds = (entry, specId) => {
    const raw = entry.difficulty.specializations?.[String(specId)]
    const ids = Array.isArray(raw) ? raw : pools[String(raw)]
    return Array.isArray(ids) ? ids.filter(isBonusEquipment) : null
  }
  const bossKey = (entry) => entry.instanceId + ':' + entry.encounterId
  const sameItem = (rewardId, candidateId) => rewardId === candidateId ||
    (itemName(rewardId) && itemName(rewardId) === itemName(candidateId))
  const matchesReward = (rewardId, ids) => ids.some((id) => sameItem(rewardId, id))
  // Source IDs may not be Encounter Journal IDs. Collect evidence from all
  // recorded rewards for the same source, including Mythic rewards that can
  // identify the boss for an otherwise unresolvable Heroic group.
  const sourceEvidence = new Map()
  for (const group of groups) {
    const key = String(group.source)
    if (!sourceEvidence.has(key)) sourceEvidence.set(key, [])
    sourceEvidence.get(key).push(...group.rolls.map((roll) => ({ id: roll.itemId, specId: roll.specId })))
  }
  const sourceBosses = new Map()
  for (const [source, rewards] of sourceEvidence) {
    const scored = new Map()
    for (const entry of entries) {
      const key = bossKey(entry)
      if (Number(source) === Number(entry.encounterId) ||
          Number(source) === Number(entry.encounter.dungeonEncounterId)) {
        scored.set(key, (scored.get(key) || 0) + 100)
      }
      for (const reward of rewards) {
        const ids = poolIds(entry, reward.specId)
        if (ids && matchesReward(reward.id, ids)) {
          const evidenceKey = key + ':' + reward.id
          // Each reward contributes only once per boss, not once per difficulty.
          if (!scored.has(evidenceKey)) {
            scored.set(evidenceKey, 1)
            scored.set(key, (scored.get(key) || 0) + 1)
          }
        }
      }
    }
    const scores = [...scored].filter(([key]) => key.split(':').length === 2)
    const highest = Math.max(0, ...scores.map(([, score]) => score))
    const winners = scores.filter(([, score]) => score === highest)
    if (highest > 0 && winners.length === 1) sourceBosses.set(source, winners[0][0])
  }
  // A confidently identified group anchors every other record with the same
  // SimC source, regardless of its context or reward variant. This avoids
  // cross-difficulty scoring ties from shared items.
  for (const group of groups) {
    const source = String(group.source)
    const awarded = [...new Set(group.rolls.map((roll) => roll.itemId))]
    const candidates = new Map()
    for (const entry of entries) {
      const ids = poolIds(entry, group.specId)
      if (!ids || !awarded.every((id) => matchesReward(id, ids))) continue
      candidates.set(bossKey(entry), entry)
    }
    if (candidates.size === 1) {
      const [key] = candidates.keys()
      if (!sourceBosses.has(source)) sourceBosses.set(source, key)
      else if (sourceBosses.get(source) !== key) sourceBosses.delete(source)
    }
  }
  return groups.map((group) => {
    const awarded = [...new Set(group.rolls.map((roll) => roll.itemId))]
    const raidDifficulty = RAID_CONTEXT_DIFFICULTIES[group.context] ?? null
    const selectedBoss = sourceBosses.get(String(group.source))
    if (!selectedBoss) return { ...group, resolution: 'unresolved' }
    // The harvest contains Mythic raid eligibility only. Heroic and Mythic
    // bonus rolls share that item pool but retain separate collection progress.
    const bossEntries = entries.filter((entry) => bossKey(entry) === selectedBoss)
    const isRaid = bossEntries.some((entry) => entry.difficultyId === '16')
    const eligibleEntries = isRaid && raidDifficulty
      ? bossEntries.filter((entry) => entry.difficultyId === '16')
      : bossEntries
    const possible = eligibleEntries.flatMap((entry) => {
      const itemIds = poolIds(entry, group.specId)
      return itemIds ? [{ ...entry, itemIds, sourceMatches:
        Number(group.source) === Number(entry.encounterId) ||
        Number(group.source) === Number(entry.encounter.dungeonEncounterId) }] : []
    })
    const matched = possible.filter((candidate) => candidate.sourceMatches)
    const encounters = new Set(possible.map((candidate) => candidate.instanceId + ':' + candidate.encounterId))
    if (encounters.size !== 1) {
      const identity = entries.find((entry) => bossKey(entry) === selectedBoss)
      return { ...group, name: identity?.encounter.name, instanceName: identity?.instance.name,
        difficultyName: raidDifficulty === '15' ? 'Heroic' : raidDifficulty === '16' ? 'Mythic' : undefined,
        resolution: possible.length ? 'ambiguous' : 'difficulty-pool-unavailable', totalEligible: null, completion: null }
    }
    // Multiple difficulties are safe only when they produce identical pools.
    const signatures = new Set(possible.map((candidate) => JSON.stringify([...candidate.itemIds].sort((a,b) => a-b))))
    if (signatures.size !== 1) return { ...group, resolution: 'difficulty-ambiguous' }
    const match = possible[0]
    const eligibleIds = [...new Set(match.itemIds)].sort((a,b) => a-b)
    // Resolve reward variants by unique item name within the chosen boss/difficulty.
    // A same-name match across difficulties identifies the encounter, but does not
    // authorize combining the Heroic and Mythic eligibility pools.
    const rewardMatches = awarded.map((id) => {
      if (eligibleIds.includes(id)) return [id, id]
      const name = itemName(id)
      const sameName = name ? eligibleIds.filter((candidateId) => itemName(candidateId) === name) : []
      return [id, sameName.length === 1 ? sameName[0] : null]
    })
    const unmatchedRewardIds = rewardMatches.filter(([, id]) => id == null).map(([id]) => id)
    // A matched encounter is not sufficient evidence that its EJ equipment
    // list exactly matches bonus-roll variants. Do not claim completion.
    if (unmatchedRewardIds.length) return { ...group, resolution: 'reward-variant-mismatch',
      name: match.encounter.name, instanceName: match.instance.name,
      difficultyName: isRaid && raidDifficulty ? (raidDifficulty === '15' ? 'Heroic' : 'Mythic') : match.difficulty.name,
      unmatchedRewardIds, totalEligible: null, completion: null }
    const obtainedIds = [...new Set(rewardMatches.map(([, id]) => id))]
    const missingIds = eligibleIds.filter((id) => !obtainedIds.includes(id))
    return {
      ...group, resolution: matched.length ? 'source' : 'item-inferred',
      encounterDifficultyId: raidDifficulty && isRaid ? raidDifficulty : match.difficultyId,
      eligibilityDifficultyId: match.difficultyId,
      rewardKeyLevel: group.keyLevel,
      name: match.encounter.name, instanceName: match.instance.name,
      difficultyName: isRaid && raidDifficulty ? (raidDifficulty === '15' ? 'Heroic' : 'Mythic') :
        (possible.length === 1 ? match.difficulty.name : 'Multiple difficulties (identical pool)'),
      eligibleIds, obtainedIds, missingIds, totalEligible: eligibleIds.length,
      completion: eligibleIds.length ? obtainedIds.length / eligibleIds.length : null,
    }
  })
}
