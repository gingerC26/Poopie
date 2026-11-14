import { assetUrl } from './assetUrl'
import { HUNTING_FOOD_MIN_DISTANCE } from './settings'

export const HUNTING_PACS = [
  { id: 'koala', src: assetUrl('/sprites/hunting/koala.png?v=alpha'), alt: 'Koala' },
  { id: 'gua-bao', src: assetUrl('/sprites/hunting/gua-bao.png?v=alpha'), alt: 'Gua bao' },
  { id: 'boba', src: assetUrl('/sprites/hunting/boba.png?v=alpha'), alt: 'Bubble tea' },
  { id: 'xlb', src: assetUrl('/sprites/hunting/xlb.png?v=alpha'), alt: 'Xiao long bao' },
  { id: 'popcorn-chicken', src: assetUrl('/sprites/hunting/popcorn-chicken.png?v=alpha'), alt: 'Popcorn chicken' },
  { id: 'skewers', src: assetUrl('/sprites/hunting/skewers.png?v=alpha'), alt: 'Skewers' },
] as const

export const HUNTING_FOODS = HUNTING_PACS.filter((pac) => pac.id !== 'koala')

export type HuntingCell = { row: number; col: number }

export function sameHuntingCell(a: HuntingCell, b: HuntingCell) {
  return a.row === b.row && a.col === b.col
}

export function huntingManhattan(a: HuntingCell, b: HuntingCell) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

export function randomHuntingCell(
  size: number,
  avoid?: HuntingCell | null,
  rng: () => number = Math.random,
  minDistance = HUNTING_FOOD_MIN_DISTANCE,
): HuntingCell {
  const total = size * size
  if (total <= 1) return { row: 0, col: 0 }

  const far: HuntingCell[] = []
  let best: HuntingCell | null = null
  let bestDistance = -1
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (avoid && row === avoid.row && col === avoid.col) continue
      const cell = { row, col }
      const distance = avoid ? huntingManhattan(cell, avoid) : minDistance
      if (distance > bestDistance) {
        best = cell
        bestDistance = distance
      }
      if (!avoid || distance >= minDistance) far.push(cell)
    }
  }
  const pool = far.length > 0 ? far : best ? [best] : [{ row: 0, col: 0 }]
  return pool[Math.floor(rng() * pool.length)] ?? pool[0]
}

export function placeHuntingPacs(
  size: number,
  count = HUNTING_PACS.length,
  rng: () => number = Math.random,
) {
  const koala = randomHuntingCell(size, null, rng)
  const spots = [koala]
  while (spots.length < Math.min(count, size * size)) {
    spots.push(randomHuntingCell(size, koala, rng))
  }
  return spots
}
