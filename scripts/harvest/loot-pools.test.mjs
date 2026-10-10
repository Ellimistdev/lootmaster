import { describe, it, expect } from 'vitest'
import { compactLootPools, expandLootPools } from './loot-pools.mjs'

const sample = {
  schemaVersion: 1, source: 'wow-encounter-journal',
  items: { '10': { name: 'Test' } },
  instances: {
    '1': { name: 'Raid', encounters: {
      '2': { name: 'Boss', difficulties: {
        '16': { name: 'Mythic', baselineItemIds: [10, 20], specializations: {
          '62': [10, 20], '63': [20, 10], '64': [], '65': [],
        } },
        '15': { name: 'Heroic', baselineItemIds: [10, 20], specializations: { '62': [10] } },
      } },
    } },
  },
}

describe('public loot pool deduplication', () => {
  it('shares identical sets across specs and difficulties, including empty pools', () => {
    const compact = compactLootPools(sample)
    const mythic = compact.instances['1'].encounters['2'].difficulties['16']
    const heroic = compact.instances['1'].encounters['2'].difficulties['15']
    expect(compact.schemaVersion).toBe(2)
    expect(Object.keys(compact.lootPools)).toHaveLength(3)
    expect(mythic.specializations['62']).toBe(mythic.specializations['63'])
    expect(mythic.baselinePool).toBe(heroic.baselinePool)
    expect(mythic.specializations['64']).toBe(mythic.specializations['65'])
    expect(compact.items).toEqual(sample.items)
  })

  it('round trips every item list and leaves v1 data untouched', () => {
    const expanded = expandLootPools(compactLootPools(sample))
    expect(expanded).toEqual({
      ...sample,
      instances: {
        '1': { ...sample.instances['1'], encounters: {
          '2': { ...sample.instances['1'].encounters['2'], difficulties: {
            '16': { ...sample.instances['1'].encounters['2'].difficulties['16'],
              specializations: { '62': [10, 20], '63': [10, 20], '64': [], '65': [] } },
            '15': sample.instances['1'].encounters['2'].difficulties['15'],
          } },
        } },
      },
    })
    expect(expandLootPools(sample)).toBe(sample)
  })

  it('rejects unknown pool references instead of treating them as empty', () => {
    const compact = compactLootPools(sample)
    compact.instances['1'].encounters['2'].difficulties['16'].specializations['62'] = 'missing'
    expect(() => expandLootPools(compact)).toThrow('Unknown loot pool')
  })
})
