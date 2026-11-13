import { describe, expect, it } from 'vitest'
import { randomHuntingCell, sameHuntingCell } from './huntingSprites'

describe('randomHuntingCell', () => {
  it('never lands on the avoided cell', () => {
    const avoid = { row: 2, col: 3 }
    for (let i = 0; i < 40; i++) {
      expect(sameHuntingCell(randomHuntingCell(5, avoid), avoid)).toBe(false)
    }
  })
})
