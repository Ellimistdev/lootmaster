// Pretty-print objects while keeping numeric loot-ID arrays on a single line.
// This retains inspectable JSON without a line per item ID.
export function stringifyPublishedLoot(value) {
  const indent = (depth) => '  '.repeat(depth)
  const write = (node, depth) => {
    if (node === null || typeof node !== 'object') return JSON.stringify(node)
    if (Array.isArray(node)) {
      if (!node.length) return '[]'
      if (node.every((id) => Number.isSafeInteger(id))) return JSON.stringify(node)
      return '[\n' + node.map((item) => indent(depth + 1) + write(item, depth + 1)).join(',\n') + '\n' + indent(depth) + ']'
    }
    const entries = Object.entries(node).filter(([, val]) => val !== undefined)
    if (!entries.length) return '{}'
    return '{\n' + entries.map(([key, val]) => indent(depth + 1) + JSON.stringify(key) + ': ' + write(val, depth + 1)).join(',\n') + '\n' + indent(depth) + '}'
  }
  return write(value, 0) + '\n'
}
