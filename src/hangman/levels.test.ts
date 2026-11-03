import { describe, expect, it } from 'vitest'
import { getLevel, lettersIn, LEVEL_IDS, LEVELS, maskWord, titleCaseWord } from './levels'

describe('levels', () => {
  it('lists six hangman gifts with unique ids', () => {
    expect(LEVELS).toHaveLength(6)
    expect(new Set(LEVELS.map((level) => level.id)).size).toBe(6)
    expect([...LEVEL_IDS]).toEqual(LEVELS.map((level) => level.id))
  })

  it('finds a level by id and misses unknown ids', () => {
    expect(getLevel('1')?.word).toBe('CAREFUL')
    expect(getLevel('missing')).toBeUndefined()
  })

  it('masks letters but keeps spaces', () => {
    expect(maskWord('CAREFUL')).toBe('???????')
    expect(maskWord('TEN MINUTES')).toBe('??? ???????')
  })

  it('title-cases multi-word phrases', () => {
    expect(titleCaseWord('TEN MINUTES')).toBe('Ten Minutes')
    expect(titleCaseWord('CAREFUL')).toBe('Careful')
  })

  it('collects unique A-Z letters and ignores spaces', () => {
    expect(lettersIn('CAREFUL').sort().join('')).toBe('ACEFLRU')
    expect(lettersIn('TEN MINUTES').sort().join('')).toBe('EIMNSTU')
    expect(lettersIn('password')).toEqual(lettersIn('PASSWORD'))
  })
})
