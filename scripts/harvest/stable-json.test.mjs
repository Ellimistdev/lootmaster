import { describe, expect, it } from 'vitest'
import { stableStringify } from './stable-json.mjs'

describe('stableStringify', () => {
  it('sorts nested object properties while preserving array order', () => {
    const a = { z: [{ b: 2, a: 1 }, { z: 3, c: 4 }], b: { z: true, a: false } }
    const b = { b: { a: false, z: true }, z: [{ a: 1, b: 2 }, { c: 4, z: 3 }] }
    expect(stableStringify(a)).toBe(stableStringify(b))
    expect(JSON.parse(stableStringify(a))).toEqual(a)
    expect(stableStringify(a).indexOf('"b"')).toBeLessThan(stableStringify(a).indexOf('"z"'))
  })
})
