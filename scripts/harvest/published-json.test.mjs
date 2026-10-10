import { describe, expect, it } from 'vitest'
import { stringifyPublishedLoot } from './published-json.mjs'
import { compactLootPools, expandLootPools } from './loot-pools.mjs'

describe('published loot serialization', () => {
  it('keeps numeric arrays inline without changing data', () => {
    const data = { lootPools: { '1': [10, 20, 30], '2': [] }, tags: ['a', 'b'] }
    const text = stringifyPublishedLoot(data)
    expect(text).toContain('[10,20,30]')
    expect(JSON.parse(text)).toEqual(data)
  })
  it('reduces line count versus default pretty printing and preserves eligibility', () => {
    const data = { schemaVersion: 1, instances: { '1': { encounters: { '2': { difficulties: {
      '16': { baselineItemIds: [10, 20, 30], specializations: { '62': [10, 20, 30], '63': [10, 20, 30] } },
    } } } } } }
    const compact = compactLootPools(data)
    const published = stringifyPublishedLoot(compact)
    expect(published.split('\n').length).toBeLessThan(JSON.stringify(compact, null, 2).split('\n').length)
    expect(expandLootPools(JSON.parse(published))).toEqual(data)
  })
})
