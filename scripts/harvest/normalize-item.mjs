// Normalize the optional metadata collected by Lootmaster Journal Harvester v1.
// Preserve all original API fields; these derived fields are additive.
const secondaryKeys = {
  ITEM_MOD_CRIT_RATING_SHORT: 'Crit',
  ITEM_MOD_HASTE_RATING_SHORT: 'Haste',
  ITEM_MOD_MASTERY_RATING_SHORT: 'Mastery',
  ITEM_MOD_VERSATILITY: 'Vers',
  ITEM_MOD_VERSATILITY_SHORT: 'Vers',
}
const primaryKeys = {
  ITEM_MOD_STRENGTH_SHORT: 'Strength',
  ITEM_MOD_AGILITY_SHORT: 'Agility',
  ITEM_MOD_INTELLECT_SHORT: 'Intellect',
}
const socketKeys = {
  EMPTY_SOCKET_PRISMATIC: 'Prismatic',
  EMPTY_SOCKET_META: 'Meta',
  EMPTY_SOCKET_RED: 'Red',
  EMPTY_SOCKET_BLUE: 'Blue',
  EMPTY_SOCKET_YELLOW: 'Yellow',
  EMPTY_SOCKET_COGWHEEL: 'Cogwheel',
  EMPTY_SOCKET_HYDRAULIC: 'Hydraulic',
}
const statEntries = (stats, keys) => Object.entries(stats || {})
  .filter(([key, value]) => Object.hasOwn(keys, key) && typeof value === 'number' && Number.isFinite(value) && value > 0)
  .map(([key, value]) => ({ stat: keys[key], value }))
const consolidate = (entries) => Object.entries(entries.reduce((acc, { stat, value }) => {
  acc[stat] = Math.max(acc[stat] || 0, value)
  return acc
}, {})).map(([stat, value]) => ({ stat, value }))

export function normalizeItem(item) {
  const stats = item.stats || {}
  const secondaryStats = consolidate(statEntries(stats, secondaryKeys))
    .sort((a, b) => b.value - a.value || a.stat.localeCompare(b.stat))
  const primaryStats = consolidate(statEntries(stats, primaryKeys))
    .sort((a, b) => b.value - a.value || a.stat.localeCompare(b.stat))
  const sockets = Object.entries(stats)
    .filter(([key, count]) => Object.hasOwn(socketKeys, key) && Number.isInteger(count) && count > 0)
    .map(([key, count]) => ({ type: socketKeys[key], count }))
  const tooltipLines = Array.isArray(item.tooltipLines) ? item.tooltipLines : []
  const effects = tooltipLines
    .filter((line) => line && (line.spellID != null || /^(Equip|Use):/i.test(line.leftText || '')))
    .map((line) => ({
      ...(Number.isSafeInteger(line.spellID) ? { spellID: line.spellID } : {}),
      text: line.leftText || '',
      ...(Number.isInteger(line.type) ? { tooltipType: line.type } : {}),
    }))
  const isEquipment = item.itemClassID === 2 ||
    (item.itemClassID === 4 && typeof item.equipLocation === 'string' &&
      item.equipLocation.startsWith('INVTYPE_') &&
      item.equipLocation !== 'INVTYPE_NON_EQUIP_IGNORE')
  const isHousingDecor = item.itemClassID === 20 || item.itemClass === 'Housing'
  const itemCategory = isHousingDecor ? 'housing-decor' : isEquipment ? 'equipment' : 'other'
  return {
    ...item,
    ...(item.metadataVersion != null ? {
      secondaryStats, primaryStats, sockets, effects, isEquipment, itemCategory,
      // The highest numeric secondary stat is Stat 1; ties remain explicitly visible.
      stat1: secondaryStats[0]?.stat ?? null,
      stat2: secondaryStats[1]?.stat ?? null,
    } : {}),
  }
}
