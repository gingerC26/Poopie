import { describe, expect, it } from 'vitest'
import { ARCADE_LANES, applyDart, laneIndexFromX, pickArcadeWind, scoreAtX } from './arcadeDarts'

describe('arcadeDarts', () => {
  it('reads the nine-lane board from left to right', () => {
    expect(ARCADE_LANES).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1])
    expect(scoreAtX(0)).toBe(1)
    expect(scoreAtX(0.5)).toBe(5)
    expect(scoreAtX(0.99)).toBe(1)
    expect(laneIndexFromX(0.5)).toBe(4)
  })

  it('wins on exact zero and busts below', () => {
    expect(applyDart(5, 5)).toEqual({ remaining: 0, bust: false, won: true })
    expect(applyDart(3, 4)).toEqual({ remaining: -1, bust: true, won: false })
    expect(applyDart(20, 5)).toEqual({ remaining: 15, bust: false, won: false })
  })

  it('picks a left or right gust', () => {
    expect(pickArcadeWind(() => 0.1)).toBeLessThan(0)
    expect(pickArcadeWind(() => 0.9)).toBeGreaterThan(0)
  })
})
