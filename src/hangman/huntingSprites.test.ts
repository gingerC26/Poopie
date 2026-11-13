import { describe, expect, it } from 'vitest'
import { huntingManhattan, placeHuntingPacs, randomHuntingCell, sameHuntingCell } from './huntingSprites'
import { HUNTING_FOOD_MIN_DISTANCE, HUNTING_GRID } from './settings'

describe('randomHuntingCell', () => {
  it('never lands on the avoided cell', () => {
    const avoid = { row: 2, col: 3 }
    for (let i = 0; i < 40; i++) {
      expect(sameHuntingCell(randomHuntingCell(5, avoid), avoid)).toBe(false)
    }
  })

  it('keeps food at least eight Manhattan steps from the koala', () => {
    const koala = { row: 6, col: 6 }
    for (let i = 0; i < 80; i++) {
      const food = randomHuntingCell(HUNTING_GRID, koala)
      expect(huntingManhattan(food, koala)).toBeGreaterThanOrEqual(HUNTING_FOOD_MIN_DISTANCE)
    }
  })
})

describe('placeHuntingPacs', () => {
  it('spaces the first food away from the koala', () => {
    for (let i = 0; i < 40; i++) {
      const [koala, food] = placeHuntingPacs(HUNTING_GRID, 2)
      expect(koala).toBeTruthy()
      expect(food).toBeTruthy()
      expect(huntingManhattan(koala!, food!)).toBeGreaterThanOrEqual(HUNTING_FOOD_MIN_DISTANCE)
    }
  })
})
