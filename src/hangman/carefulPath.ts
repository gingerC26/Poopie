export type Pt = { x: number; y: number }

/** Left-center of the sauce dish, as percent of the background image. */
export const GOAL = { x: 90.4, y: 91.2 }

const IMG_W = 1280
const IMG_H = 720
const HALF_WIDTH = 4.15
const HALF_PX = (HALF_WIDTH / 100) * IMG_W
const MIN_LOOP_GAP = HALF_PX * 2.15

function add(a: Pt, b: Pt): Pt {
  return { x: a.x + b.x, y: a.y + b.y }
}

function sub(a: Pt, b: Pt): Pt {
  return { x: a.x - b.x, y: a.y - b.y }
}

function mul(a: Pt, s: number): Pt {
  return { x: a.x * s, y: a.y * s }
}

function len(a: Pt) {
  return Math.hypot(a.x, a.y)
}

function norm(a: Pt): Pt {
  const d = len(a)
  return d < 1e-6 ? { x: 0, y: 0 } : { x: a.x / d, y: a.y / d }
}

function perp(a: Pt): Pt {
  return { x: -a.y, y: a.x }
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function toPx(p: Pt): Pt {
  return { x: (p.x / 100) * IMG_W, y: (p.y / 100) * IMG_H }
}

function pointsAttr(points: Pt[]) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function key(c: number, r: number) {
  return `${c},${r}`
}

/** Self-avoiding walk on a grid from bottom-left to bottom-right. */
function gridWalk(nc: number, nr: number): [number, number][] | null {
  const startC = 0
  const startR = nr - 1
  const goalC = nc - 1
  const goalR = nr - 1
  const minVisit = Math.ceil(nc * nr * 0.7)
  const path: [number, number][] = []
  const seen = new Set<string>()

  function dfs(c: number, r: number): boolean {
    seen.add(key(c, r))
    path.push([c, r])
    if (c === goalC && r === goalR) {
      if (path.length >= minVisit) return true
    } else {
      const next: [number, number][] = []
      if (c > 0) next.push([c - 1, r])
      if (c < nc - 1) next.push([c + 1, r])
      if (r > 0) next.push([c, r - 1])
      if (r < nr - 1) next.push([c, r + 1])
      shuffle(next)
      for (const [nc2, nr2] of next) {
        if (seen.has(key(nc2, nr2))) continue
        if (dfs(nc2, nr2)) return true
      }
    }
    path.pop()
    seen.delete(key(c, r))
    return false
  }

  return dfs(startC, startR) ? path.slice() : null
}

function randomWaypoints(startPct: Pt): Pt[] {
  const start = toPx(startPct)
  const goal = toPx(GOAL)
  const nc = Math.random() < 0.45 ? 3 : 4
  const nr = Math.random() < 0.4 ? 2 : 3
  const walk = gridWalk(nc, nr) ?? gridWalk(3, 2)
  if (!walk) {
    return [start, { x: goal.x, y: start.y }]
  }

  const col0 = start.x + HALF_PX * 2.7 + rand(8, 24)
  const colN = goal.x - HALF_PX * 3.2 - rand(8, 20)
  const cols = Array.from(
    { length: nc },
    (_, i) => col0 + ((colN - col0) * i) / (nc - 1),
  )
  const rowBot = start.y
  const rowTop = rand(120, 210)
  const rows = Array.from(
    { length: nr },
    (_, i) => rowTop + ((rowBot - rowTop) * i) / (nr - 1),
  )

  const pts: Pt[] = [start]
  for (const [c, r] of walk) {
    const p = { x: cols[c], y: rows[r] }
    const last = pts[pts.length - 1]
    if (last.x !== p.x && last.y !== p.y) {
      if (Math.random() < 0.5) pts.push({ x: p.x, y: last.y })
      else pts.push({ x: last.x, y: p.y })
    }
    pts.push(p)
  }
  const last = pts[pts.length - 1]
  const mouth = { x: goal.x, y: last.y }
  if (Math.abs(last.x - mouth.x) > 1) pts.push(mouth)
  else pts[pts.length - 1] = mouth
  return pts
}

function collapseColinear(points: Pt[]) {
  const out: Pt[] = []
  for (const p of points) {
    const a = out[out.length - 2]
    const b = out[out.length - 1]
    if (b && Math.hypot(p.x - b.x, p.y - b.y) < 1) continue
    if (a && b && ((a.x === b.x && b.x === p.x) || (a.y === b.y && b.y === p.y))) {
      out[out.length - 1] = p
      continue
    }
    out.push(p)
  }
  return out
}

/** Square-corner offset so every wall is horizontal or vertical. */
function offsetOrtho(points: Pt[], dist: number): Pt[] {
  const n = points.length
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const prev = points[Math.max(0, i - 1)]
    const curr = points[i]
    const next = points[Math.min(n - 1, i + 1)]
    const nIn = perp(norm(sub(curr, prev)))
    const nOut = perp(norm(sub(next, curr)))
    if (i === 0) {
      out.push(add(curr, mul(nOut, dist)))
      continue
    }
    if (i === n - 1) {
      out.push(add(curr, mul(nIn, dist)))
      continue
    }
    out.push(add(curr, add(mul(nIn, dist), mul(nOut, dist))))
  }
  return out
}

function minSeparation(samples: Pt[], skip: number) {
  let best = Infinity
  for (let i = 0; i < samples.length; i++) {
    for (let j = i + skip; j < samples.length; j++) {
      const d = Math.hypot(samples[j].x - samples[i].x, samples[j].y - samples[i].y)
      if (d < best) best = d
    }
  }
  return best
}

function densify(points: Pt[], spacing: number) {
  const out: Pt[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const a = out[out.length - 1]
    const b = points[i]
    const d = len(sub(b, a))
    const steps = Math.max(1, Math.floor(d / spacing))
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return out
}

export type Corridor = {
  floor: string
  left: string
  right: string
  floorWidth: number
}

export function buildCorridor(start: Pt): Corridor {
  let best: Pt[] | null = null
  let bestLen = -1

  for (let attempt = 0; attempt < 40; attempt++) {
    const corners = collapseColinear(randomWaypoints(start))
    const samples = densify(corners, 8)
    if (minSeparation(samples, 28) < MIN_LOOP_GAP) continue
    if (corners.length > bestLen) {
      bestLen = corners.length
      best = corners
    }
  }

  const center = best ?? collapseColinear(randomWaypoints(start))
  return {
    floor: pointsAttr(center),
    left: pointsAttr(offsetOrtho(center, HALF_PX)),
    right: pointsAttr(offsetOrtho(center, -HALF_PX)),
    floorWidth: HALF_PX * 2,
  }
}
