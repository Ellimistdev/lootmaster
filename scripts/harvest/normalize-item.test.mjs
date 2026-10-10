import { expect, test } from 'vitest'
import { normalizeItem } from './normalize-item.mjs'

test('orders secondaries by numeric value and preserves raw stats', () => {
  const item = { metadataVersion: 1, itemClassID: 4, equipLocation: 'INVTYPE_CHEST',
    stats: { ITEM_MOD_CRIT_RATING_SHORT: 126, ITEM_MOD_MASTERY_RATING_SHORT: 62,
      ITEM_MOD_INTELLECT_SHORT: 162, ITEM_MOD_STAMINA_SHORT: 3254, RESISTANCE0_NAME: 103 } }
  const result = normalizeItem(item)
  expect(result.secondaryStats).toEqual([
    { stat: 'Crit', value: 126, share: 126 / 188 },
    { stat: 'Mastery', value: 62, share: 62 / 188 },
  ])
  expect(result.secondaryStatBudget).toBe(188)
  expect(result.primaryStats).toEqual([{ stat: 'Intellect', value: 162 }])
  expect(result.stat1).toBe('Crit')
  expect(result.stat2).toBe('Mastery')
  expect(result.isEquipment).toBe(true)
  expect(result.stats).toBe(item.stats)
})

test('preserves equal stat allocations and dual-primary shields', () => {
  const result = normalizeItem({ metadataVersion: 1, itemClassID: 4, equipLocation: 'INVTYPE_SHIELD',
    stats: { ITEM_MOD_STRENGTH_SHORT: 81, ITEM_MOD_INTELLECT_SHORT: 249,
      ITEM_MOD_HASTE_RATING_SHORT: 63, ITEM_MOD_MASTERY_RATING_SHORT: 63 } })
  expect(result.secondaryStats.map(x => x.stat)).toEqual(['Haste', 'Mastery'])
  expect(result.primaryStats.length).toBe(2)
  expect(result.secondaryStatBudget).toBe(126)
  expect(result.secondaryStats.map(x => x.share)).toEqual([0.5, 0.5])
})

test('extracts sockets and effect spell IDs', () => {
  const result = normalizeItem({ metadataVersion: 1, itemClassID: 4, equipLocation: 'INVTYPE_TRINKET',
    stats: { EMPTY_SOCKET_PRISMATIC: 1, ITEM_MOD_HASTE_RATING_SHORT: 134 },
    tooltipLines: [{ type: 45, leftText: 'Equip: Call to the sea', spellID: 1295058 }] })
  expect(result.sockets).toEqual([{ type: 'Prismatic', count: 1 }])
  expect(result.effects).toEqual([{ spellID: 1295058, text: 'Equip: Call to the sea', tooltipType: 45 }])
})

test('classifies housing decor as non-equipment without discarding it', () => {
  const result = normalizeItem({ metadataVersion: 1, itemClassID: 20, itemClass: 'Housing',
    equipLocation: 'INVTYPE_NON_EQUIP_IGNORE', stats: {},
    tooltipLines: [{ type: 44, leftText: 'Use: Add this Decor to your House Chest.', spellID: 1306027 }] })
  expect(result.isEquipment).toBe(false)
  expect(result.itemCategory).toBe('housing-decor')
  expect(result.effects[0].spellID).toBe(1306027)
  expect(result.secondaryStats).toEqual([])
  expect(result.secondaryStatBudget).toBe(0)
})

test('retains old non-enriched records unchanged', () => {
  const item = { name: 'Old item', armorType: 'Mail' }
  expect(normalizeItem(item)).toEqual(item)
})

test('four-stat items use all four ratings for budget and preserve ties', () => {
  const result = normalizeItem({ metadataVersion: 1, itemClassID: 4,
    equipLocation: 'INVTYPE_FINGER', stats: {
      ITEM_MOD_CRIT_RATING_SHORT: 100, ITEM_MOD_HASTE_RATING_SHORT: 100,
      ITEM_MOD_MASTERY_RATING_SHORT: 50, ITEM_MOD_VERSATILITY: 25,
      ITEM_MOD_STAMINA_SHORT: 900, EMPTY_SOCKET_PRISMATIC: 1,
    } })
  expect(result.secondaryStatBudget).toBe(275)
  expect(result.secondaryStats.map(({ stat, value }) => [stat, value])).toEqual(
    [['Crit', 100], ['Haste', 100], ['Mastery', 50], ['Vers', 25]])
  expect(result.secondaryStats[0].share).toBe(result.secondaryStats[1].share)
  expect(result.secondaryStats.reduce((sum, stat) => sum + stat.share, 0)).toBe(1)
})

test('four equal stats each occupy one quarter of the budget', () => {
  const result = normalizeItem({ metadataVersion: 1, stats: {
    ITEM_MOD_CRIT_RATING_SHORT: 75, ITEM_MOD_HASTE_RATING_SHORT: 75,
    ITEM_MOD_MASTERY_RATING_SHORT: 75, ITEM_MOD_VERSATILITY: 75,
  } })
  expect(result.secondaryStatBudget).toBe(300)
  expect(result.secondaryStats.map(stat => stat.share)).toEqual([0.25, 0.25, 0.25, 0.25])
})

test('one-stat items get the full share; zero-budget items have no shares', () => {
  const single = normalizeItem({ metadataVersion: 1, stats: { ITEM_MOD_HASTE_RATING_SHORT: 134 } })
  expect(single.secondaryStatBudget).toBe(134)
  expect(single.secondaryStats[0].share).toBe(1)
  const empty = normalizeItem({ metadataVersion: 1, stats: { ITEM_MOD_STAMINA_SHORT: 100 } })
  expect(empty.secondaryStatBudget).toBe(0)
  expect(empty.secondaryStats).toEqual([])
})
