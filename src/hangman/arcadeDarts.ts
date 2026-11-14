export const ARCADE_LANES = [1, 2, 3, 4, 5, 4, 3, 2, 1] as const

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function laneIndexFromX(x: number, count = ARCADE_LANES.length) {
  const n = Math.min(count - 1, Math.max(0, Math.floor(clamp01(x) * count)))
  return n
}

export function scoreAtX(x: number) {
  return ARCADE_LANES[laneIndexFromX(x)] ?? 1
}

export function applyDart(remaining: number, hit: number) {
  const next = remaining - hit
  return { remaining: next, bust: next < 0, won: next === 0 }
}

export function pickArcadeWind(rng: () => number = Math.random) {
  const magnitude = 0.14 + rng() * 0.2
  return (rng() < 0.5 ? -1 : 1) * magnitude
}
