export const HUNTING_PACS = [
  { id: 'koala', src: '/sprites/hunting/koala.png?v=alpha', alt: 'Koala' },
  { id: 'gua-bao', src: '/sprites/hunting/gua-bao.png?v=alpha', alt: 'Gua bao' },
  { id: 'boba', src: '/sprites/hunting/boba.png?v=alpha', alt: 'Bubble tea' },
  { id: 'xlb', src: '/sprites/hunting/xlb.png?v=alpha', alt: 'Xiao long bao' },
  { id: 'popcorn-chicken', src: '/sprites/hunting/popcorn-chicken.png?v=alpha', alt: 'Popcorn chicken' },
  { id: 'skewers', src: '/sprites/hunting/skewers.png?v=alpha', alt: 'Skewers' },
] as const

export const HUNTING_FOODS = HUNTING_PACS.filter((pac) => pac.id !== 'koala')

export type HuntingCell = { row: number; col: number }

export function sameHuntingCell(a: HuntingCell, b: HuntingCell) {
  return a.row === b.row && a.col === b.col
}

export function randomHuntingCell(
  size: number,
  avoid?: HuntingCell | null,
  rng: () => number = Math.random,
): HuntingCell {
  const total = size * size
  if (total <= 1) return { row: 0, col: 0 }
  let row = 0
  let col = 0
  do {
    const n = Math.floor(rng() * total)
    row = Math.floor(n / size)
    col = n % size
  } while (avoid && row === avoid.row && col === avoid.col)
  return { row, col }
}

export function placeHuntingPacs(
  size: number,
  count = HUNTING_PACS.length,
  rng: () => number = Math.random,
) {
  const spots: Array<{ row: number; col: number }> = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) spots.push({ row, col })
  }
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const swap = spots[i]
    spots[i] = spots[j]
    spots[j] = swap
  }
  return spots.slice(0, Math.min(count, spots.length))
}
