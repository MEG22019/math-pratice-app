import { describe, expect, it } from 'vitest'

import { createId } from './id'
import { randomInteger, shuffle } from './random'

describe('random utilities', () => {
  it('generates inclusive minimum and maximum values', () => {
    expect(randomInteger(3, 8, () => 0)).toBe(3)
    expect(randomInteger(3, 8, () => 0.999_999)).toBe(8)
  })

  it('rejects invalid bounds and random values', () => {
    expect(() => randomInteger(5, 4)).toThrow()
    expect(() => randomInteger(0, 1, () => 1)).toThrow()
  })

  it('shuffles without mutating the input', () => {
    const original = [1, 2, 3]

    expect(shuffle(original, () => 0)).toEqual([2, 3, 1])
    expect(original).toEqual([1, 2, 3])
  })

  it('creates nonempty unique IDs', () => {
    const firstId = createId('question')
    const secondId = createId('question')

    expect(firstId).toMatch(/^question-/)
    expect(secondId).toMatch(/^question-/)
    expect(firstId).not.toBe(secondId)
  })
})
