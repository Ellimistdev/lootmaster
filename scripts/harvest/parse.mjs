// Parse WoW SavedVariables as data, without evaluating Lua code.
export function parseSavedVariables(source) {
  const tokens = source.match(/--[^\r\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?:\d+\.\d+|\d+)(?:[eE][+-]?\d+)?|[A-Za-z_][A-Za-z_0-9]*|[{}\[\],;=]/g) || []
  let pos = 0
  const peek = () => tokens[pos]
  const take = (expected) => {
    const token = tokens[pos++]
    if (expected && token !== expected) throw new Error('Expected ' + expected + ', got ' + token)
    if (token === undefined) throw new Error('Unexpected end of SavedVariables')
    return token
  }
  const string = (token) => {
    // WoW serializes strings with Lua-style backslash escapes.
    return token.slice(1, -1).replace(/\\(\\|\d{1,3}|n|r|t|"|')/g, (_, escape) => {
      if (/^\d+$/.test(escape)) return String.fromCharCode(Number(escape))
      return { n: '\n', r: '\r', t: '\t' }[escape] ?? escape
    })
  }
  const value = (depth = 0) => {
    if (depth > 100) throw new Error('Excessive nesting')
    const token = take()
    if (token === '{') {
      const entries = []
      let keyed = false
      while (peek() !== '}') {
        if (pos >= tokens.length) throw new Error('Unclosed table')
        let key
        if (peek() === '[') {
          take('[')
          key = value(depth + 1)
          take(']')
          take('=')
          keyed = true
        } else if (/^[A-Za-z_]/.test(peek() || '') && tokens[pos + 1] === '=') {
          key = take()
          take('=')
          keyed = true
        }
        entries.push([key, value(depth + 1)])
        if (peek() === ',' || peek() === ';') take()
        else if (peek() !== '}') throw new Error('Expected table separator')
      }
      take('}')
      if (!keyed) return entries.map((entry) => entry[1])
      const result = Object.create(null)
      let nextIndex = 1
      for (const [key, entry] of entries) {
        const resolved = key === undefined ? String(nextIndex++) : String(key)
        if (Object.hasOwn(result, resolved)) throw new Error('Duplicate Lua table key: ' + resolved)
        result[resolved] = entry
      }
      return result
    }
    if (token[0] === '"' || token[0] === "'") return string(token)
    if (/^\d/.test(token)) return Number(token)
    if (token === 'true') return true
    if (token === 'false') return false
    if (token === 'nil') return null
    throw new Error('Unexpected token: ' + token)
  }
  // Refuse any content beyond one simple SavedVariables assignment.
  while (peek()?.startsWith('--')) take()
  if (take() !== 'LootmasterHarvesterDB') throw new Error('Unexpected SavedVariables name')
  take('=')
  const parsed = value()
  if (pos !== tokens.length) throw new Error('Unexpected content after SavedVariables table')
  return parsed
}
