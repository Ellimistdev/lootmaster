// Sort object properties recursively, preserving array order and values.
// Numeric identifier keys use numeric ordering; named properties sort alphabetically.
const compareKeys = (a, b) => {
  const numeric = (key) => /^(0|[1-9][0-9]*)$/.test(key) && Number.isSafeInteger(Number(key))
  if (numeric(a) && numeric(b)) return Number(a) - Number(b)
  return a < b ? -1 : a > b ? 1 : 0
}
export function stableStringify(value) {
  const seen = new WeakSet()
  const normalize = (node) => {
    if (!node || typeof node !== 'object') return node
    if (seen.has(node)) throw new TypeError('Circular JSON value')
    seen.add(node)
    const result = Array.isArray(node) ? node.map(normalize) :
      Object.fromEntries(Object.keys(node).sort(compareKeys).map((key) => [key, normalize(node[key])]))
    seen.delete(node)
    return result
  }
  return JSON.stringify(normalize(value), null, 2) + '\n'
}
