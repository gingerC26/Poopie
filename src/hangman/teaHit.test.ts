import { describe, expect, it } from 'vitest'
import {
  alphaAt,
  localPointInBox,
  topHotProp,
  type BoxMetrics,
  type ParentMetrics,
  type TeaHitTarget,
} from './teaHit'

const parent: ParentMetrics = {
  left: 0,
  top: 0,
  width: 200,
  height: 200,
  offsetWidth: 200,
  offsetHeight: 200,
}

function box(overrides: Partial<BoxMetrics> = {}): BoxMetrics {
  return {
    offsetLeft: 0,
    offsetTop: 0,
    offsetWidth: 100,
    offsetHeight: 40,
    transform: 'none',
    originX: 50,
    originY: 20,
    ...overrides,
  }
}

function target(overrides: Partial<TeaHitTarget> = {}): TeaHitTarget {
  return {
    id: 'cup',
    parent,
    box: box({ offsetWidth: 10, offsetHeight: 10, originX: 0, originY: 0 }),
    pixels: new Uint8ClampedArray([0, 0, 0, 255]),
    imageWidth: 1,
    imageHeight: 1,
    ...overrides,
  }
}

describe('tea hit testing', () => {
  it('maps a translated prop back onto its unshifted box', () => {
    const point = localPointInBox(
      parent,
      box({
        offsetLeft: 100,
        offsetTop: 80,
        offsetWidth: 100,
        transform: 'matrix(1, 0, 0, 1, -50, 0)',
      }),
      50,
      80,
    )
    expect(point).toEqual({ x: 0, y: 0 })
  })

  it('maps a rotated prop and ignores the empty corners of its bounding box', () => {
    const rotated = box({ transform: 'matrix(0, 1, -1, 0, 0, 0)' })
    expect(localPointInBox(parent, rotated, 50, 60)).toEqual({ x: 90, y: 20 })
    expect(localPointInBox(parent, rotated, 10, 10)).toBeNull()
  })

  it('accounts for a scaled scene', () => {
    const point = localPointInBox(
      { left: 10, top: 20, width: 200, height: 100, offsetWidth: 100, offsetHeight: 50 },
      box({ offsetLeft: 10, offsetTop: 5, offsetWidth: 20, offsetHeight: 10, originX: 0, originY: 0 }),
      30,
      30,
    )
    expect(point).toEqual({ x: 0, y: 0 })
  })

  it('reads the pixel under the pointer', () => {
    const pixels = new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 255])
    expect(alphaAt(pixels, 2, 1, 1, 1, 20, 10)).toBe(0)
    expect(alphaAt(pixels, 2, 1, 15, 5, 20, 10)).toBe(255)
  })

  it('ignores transparent pixels and falls through to the prop underneath', () => {
    const clear = new Uint8ClampedArray([0, 0, 0, 0])
    const solid = new Uint8ClampedArray([0, 0, 0, 255])
    const top = target({ id: 'cup-filled', pixels: clear })
    const bottom = target({ id: 'cup', pixels: solid })

    expect(topHotProp([top], 1, 1)).toBeNull()
    expect(topHotProp([top, bottom], 1, 1)).toBe('cup')
    expect(topHotProp([target({ id: 'cup-filled' }), bottom], 1, 1)).toBe('cup-filled')
  })
})
