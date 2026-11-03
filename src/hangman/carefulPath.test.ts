import { describe, expect, it } from 'vitest'
import {
  buildCorridor,
  DISH,
  GOAL,
  hitsDish,
  hitsWalls,
  type Pt,
} from './carefulPath'
import { XLB_PATH_HALF_WIDTH } from './settings'

const START = { x: 18.7, y: 84.2 }
const IMG_W = 1280
const IMG_H = 720

function parsePts(attr: string): Pt[] {
  return attr
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number)
      return { x, y }
    })
}

function assertOrtho(pts: Pt[]) {
  for (let i = 1; i < pts.length; i++) {
    const dx = Math.abs(pts[i].x - pts[i - 1].x)
    const dy = Math.abs(pts[i].y - pts[i - 1].y)
    expect(dx < 0.51 || dy < 0.51).toBe(true)
  }
}

function toPct(p: Pt): Pt {
  return { x: (p.x / IMG_W) * 100, y: (p.y / IMG_H) * 100 }
}

describe('hitsDish', () => {
  it('counts the bowl center as a hit', () => {
    expect(hitsDish(DISH)).toBe(true)
    expect(hitsDish(GOAL)).toBe(true)
  })

  it('misses the lunch-box start and far corners', () => {
    expect(hitsDish(START)).toBe(false)
    expect(hitsDish({ x: 0, y: 0 })).toBe(false)
    expect(hitsDish({ x: 50, y: 50 })).toBe(false)
  })

  it('grows the bowl when a dumpling radius is supplied', () => {
    const edge = { x: DISH.x + 5.4 + 0.4, y: DISH.y }
    expect(hitsDish(edge)).toBe(false)
    expect(hitsDish(edge, 40)).toBe(true)
  })
})

describe('buildCorridor', () => {
  it('builds orthogonal walls from the lunch box through the dish', () => {
    const corridor = buildCorridor(START)
    const floor = parsePts(corridor.floor)
    const left = parsePts(corridor.left)
    const right = parsePts(corridor.right)

    expect(floor.length).toBeGreaterThan(1)
    expect(left.length).toBeGreaterThan(1)
    expect(right.length).toBeGreaterThan(1)
    expect(corridor.leftPts).toHaveLength(left.length)
    expect(corridor.rightPts).toHaveLength(right.length)
    expect(corridor.floorWidth).toBeCloseTo((XLB_PATH_HALF_WIDTH / 100) * IMG_W * 2, 5)

    assertOrtho(floor)
    assertOrtho(left)
    assertOrtho(right)

    expect(floor[0].x).toBeCloseTo((START.x / 100) * IMG_W, 0)
    expect(floor[0].y).toBeCloseTo((START.y / 100) * IMG_H, 0)
    expect(floor[floor.length - 1].x).toBeGreaterThan((DISH.x / 100) * IMG_W)
  })

  it('keeps the start of the floor away from both walls', () => {
    const corridor = buildCorridor(START)
    expect(hitsWalls(START, corridor, 12)).toBe(false)
  })

  it('detects a point sitting on a wall polyline', () => {
    const corridor = buildCorridor(START)
    const onWall = toPct(corridor.leftPts[Math.floor(corridor.leftPts.length / 2)])
    if (hitsDish(onWall, 20)) {
      expect(hitsWalls(onWall, corridor, 20)).toBe(false)
    } else {
      expect(hitsWalls(onWall, corridor, 20)).toBe(true)
    }
  })

  it('does not count dish overlap as a wall hit', () => {
    const corridor = buildCorridor(START)
    expect(hitsWalls(DISH, corridor, 40)).toBe(false)
  })

  it('can produce different routes across runs', () => {
    const routes = new Set(
      Array.from({ length: 8 }, () => buildCorridor(START).floor),
    )
    expect(routes.size).toBeGreaterThan(1)
  })
})
