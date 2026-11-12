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
    expect(getLevel('2')?.background).toBe('/backgrounds/password.jpg')
    expect(getLevel('4')?.background).toBe('/backgrounds/twenty-seconds.jpg')
    expect(getLevel('5')?.background).toBe('/backgrounds/memory.jpg?v=night2')
    expect(getLevel('missing')).toBeUndefined()
  })

  it('masks letters but keeps spaces', () => {
    expect(maskWord('CAREFUL')).toBe('???????')
    expect(maskWord('TWENTY SECONDS')).toBe('?????? ???????')
  })

  it('title-cases multi-word phrases', () => {
    expect(titleCaseWord('TWENTY SECONDS')).toBe('Twenty Seconds')
    expect(titleCaseWord('CAREFUL')).toBe('Careful')
  })

  it('collects unique A-Z letters and ignores spaces', () => {
    expect(lettersIn('CAREFUL').sort().join('')).toBe('ACEFLRU')
    expect(lettersIn('TWENTY SECONDS').sort().join('')).toBe('CDENOSTWY')
    expect(lettersIn('password')).toEqual(lettersIn('PASSWORD'))
  })
})
