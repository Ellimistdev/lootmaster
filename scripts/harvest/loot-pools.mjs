// Shared, deterministic pool interning for all published encounter-loot datasets.
// Only arrays of item IDs are interned; metadata and source harvests stay intact.
export function compactLootPools(dataset) {
  const pools = {}
  const keys = new Map()
  const intern = (itemIds) => {
    if (!Array.isArray(itemIds)) throw new Error('Expected item ID array')
    const sorted = [...itemIds].sort((a, b) => a - b)
    const key = JSON.stringify(sorted)
    if (!keys.has(key)) {
      const id = String(keys.size + 1)
      keys.set(key, id)
      pools[id] = sorted
    }
    return keys.get(key)
  }
  const instances = {}
  for (const [instanceId, instance] of Object.entries(dataset.instances || {})) {
    const encounters = {}
    for (const [encounterId, encounter] of Object.entries(instance.encounters || {})) {
      const difficulties = {}
      for (const [difficultyId, difficulty] of Object.entries(encounter.difficulties || {})) {
        const specializations = {}
        for (const [specId, itemIds] of Object.entries(difficulty.specializations || {})) {
          specializations[specId] = intern(itemIds)
        }
        difficulties[difficultyId] = {
          ...difficulty,
          baselineItemIds: undefined,
          baselinePool: intern(difficulty.baselineItemIds),
          specializations,
        }
      }
      encounters[encounterId] = { ...encounter, difficulties }
    }
    instances[instanceId] = { ...instance, encounters }
  }
  return { ...dataset, schemaVersion: 2, lootPools: pools, instances }
}

// Convert compact v2 public datasets back to the original v1 shape.
// Also accepts existing v1 datasets to ease consumer migration.
export function expandLootPools(dataset) {
  if (dataset.schemaVersion === 1) return dataset
  if (dataset.schemaVersion !== 2 || !dataset.lootPools) throw new Error('Unsupported loot pool schema')
  const resolvePool = (id) => {
    if (!Object.hasOwn(dataset.lootPools, id)) throw new Error('Unknown loot pool: ' + id)
    return [...dataset.lootPools[id]]
  }
  const instances = {}
  for (const [instanceId, instance] of Object.entries(dataset.instances || {})) {
    const encounters = {}
    for (const [encounterId, encounter] of Object.entries(instance.encounters || {})) {
      const difficulties = {}
      for (const [difficultyId, difficulty] of Object.entries(encounter.difficulties || {})) {
        const { baselinePool, ...rest } = difficulty
        difficulties[difficultyId] = {
          ...rest,
          baselineItemIds: resolvePool(baselinePool),
          specializations: Object.fromEntries(
            Object.entries(difficulty.specializations || {}).map(([specId, pool]) => [specId, resolvePool(pool)])),
        }
      }
      encounters[encounterId] = { ...encounter, difficulties }
    }
    instances[instanceId] = { ...instance, encounters }
  }
  const { lootPools, ...rest } = dataset
  return { ...rest, schemaVersion: 1, instances }
}
