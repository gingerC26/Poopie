import { describe, expect, it } from 'vitest'
import { memoryKey, parseMemoryAnswers, publicAssetUrl } from './memoryAnswers'

describe('memoryAnswers', () => {
  it('keeps unique a-z keys in order', () => {
    expect(parseMemoryAnswers('one\n\n two \nO.N.E\nthree\n')).toEqual([
      { key: 'one', display: 'one' },
      { key: 'two', display: 'two' },
      { key: 'three', display: 'three' },
    ])
    expect(parseMemoryAnswers('O.N.E\n')).toEqual([{ key: 'one', display: 'O.N.E' }])
  })

  it('ignores case, spaces, and punctuation when matching', () => {
    expect(memoryKey('  T.w.o! ')).toBe('two')
    expect(memoryKey('ONE')).toBe('one')
  })

  it('maps the settings path onto a public URL', () => {
    expect(publicAssetUrl('public/sprites/memory/answers.txt')).toBe(
      '/sprites/memory/answers.txt',
    )
  })
})
