export const HUNTING_PACS = [
  { id: 'koala', src: '/sprites/hunting/koala.png?v=alpha', alt: 'Koala' },
  { id: 'gua-bao', src: '/sprites/hunting/gua-bao.png?v=alpha', alt: 'Gua bao' },
  { id: 'boba', src: '/sprites/hunting/boba.png?v=alpha', alt: 'Bubble tea' },
  { id: 'xlb', src: '/sprites/hunting/xlb.png?v=alpha', alt: 'Xiao long bao' },
  { id: 'popcorn-chicken', src: '/sprites/hunting/popcorn-chicken.png?v=alpha', alt: 'Popcorn chicken' },
  { id: 'skewers', src: '/sprites/hunting/skewers.png?v=alpha', alt: 'Skewers' },
] as const

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
