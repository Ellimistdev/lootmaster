import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeItem } from './normalize-item.mjs'

test('orders secondaries by numeric value and preserves raw stats', () => {
  const item = { metadataVersion: 1, itemClassID: 4, equipLocation: 'INVTYPE_CHEST',
    stats: { ITEM_MOD_CRIT_RATING_SHORT: 126, ITEM_MOD_MASTERY_RATING_SHORT: 62,
      ITEM_MOD_INTELLECT_SHORT: 162, ITEM_MOD_STAMINA_SHORT: 3254, RESISTANCE0_NAME: 103 } }
  const result = normalizeItem(item)
  assert.deepEqual(result.secondaryStats, [{ stat: 'Crit', value: 126 }, { stat: 'Mastery', value: 62 }])
  assert.deepEqual(result.primaryStats, [{ stat: 'Intellect', value: 162 }])
  assert.equal(result.stat1, 'Crit')
  assert.equal(result.stat2, 'Mastery')
  assert.equal(result.isEquipment, true)
  assert.equal(result.stats, item.stats)
})

test('preserves equal stat allocations and dual-primary shields', () => {
  const result = normalizeItem({ metadataVersion: 1, itemClassID: 4, equipLocation: 'INVTYPE_SHIELD',
    stats: { ITEM_MOD_STRENGTH_SHORT: 81, ITEM_MOD_INTELLECT_SHORT: 249,
      ITEM_MOD_HASTE_RATING_SHORT: 63, ITEM_MOD_MASTERY_RATING_SHORT: 63 } })
  assert.deepEqual(result.secondaryStats.map(x => x.stat), ['Haste', 'Mastery'])
  assert.equal(result.primaryStats.length, 2)
})

test('extracts sockets and effect spell IDs', () => {
  const result = normalizeItem({ metadataVersion: 1, itemClassID: 4, equipLocation: 'INVTYPE_TRINKET',
    stats: { EMPTY_SOCKET_PRISMATIC: 1, ITEM_MOD_HASTE_RATING_SHORT: 134 },
    tooltipLines: [{ type: 45, leftText: 'Equip: Call to the sea', spellID: 1295058 }] })
  assert.deepEqual(result.sockets, [{ type: 'Prismatic', count: 1 }])
  assert.deepEqual(result.effects, [{ spellID: 1295058, text: 'Equip: Call to the sea', tooltipType: 45 }])
})

test('classifies housing decor as non-equipment without discarding it', () => {
  const result = normalizeItem({ metadataVersion: 1, itemClassID: 20, itemClass: 'Housing',
    equipLocation: 'INVTYPE_NON_EQUIP_IGNORE', stats: {},
    tooltipLines: [{ type: 44, leftText: 'Use: Add this Decor to your House Chest.', spellID: 1306027 }] })
  assert.equal(result.isEquipment, false)
  assert.equal(result.itemCategory, 'housing-decor')
  assert.equal(result.effects[0].spellID, 1306027)
  assert.deepEqual(result.secondaryStats, [])
})

test('retains old non-enriched records unchanged', () => {
  const item = { name: 'Old item', armorType: 'Mail' }
  assert.deepEqual(normalizeItem(item), item)
})
