import { HUNTING_GRID } from './settings'

export type HuntingMaze = {
  size: number
  /** Top edges of each row of cells, plus the bottom outer edge. `(size + 1) x size`. */
  horiz: boolean[][]
  /** Left edges of each row of cells, plus the right outer edge. `size x (size + 1)`. */
  vert: boolean[][]
}

type Rng = () => number

const WALL_CHANCE = 0.38

function grid(rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false))
}

export function emptyHuntingMaze(size = HUNTING_GRID): HuntingMaze {
  return {
    size,
    horiz: grid(size + 1, size),
    vert: grid(size, size + 1),
  }
}

function sealBorder(maze: HuntingMaze) {
  const last = maze.size
  for (let col = 0; col < last; col++) {
    maze.horiz[0][col] = true
    maze.horiz[last][col] = true
  }
  for (let row = 0; row < last; row++) {
    maze.vert[row][0] = true
    maze.vert[row][last] = true
  }
}

export function cellWallCount(maze: HuntingMaze, row: number, col: number) {
  let count = 0
  if (maze.horiz[row][col]) count += 1
  if (maze.horiz[row + 1][col]) count += 1
  if (maze.vert[row][col]) count += 1
  if (maze.vert[row][col + 1]) count += 1
  return count
}

function canAddHoriz(maze: HuntingMaze, row: number, col: number) {
  if (maze.horiz[row][col]) return false
  if (row > 0 && cellWallCount(maze, row - 1, col) >= 3) return false
  if (row < maze.size && cellWallCount(maze, row, col) >= 3) return false
  return true
}

function canAddVert(maze: HuntingMaze, row: number, col: number) {
  if (maze.vert[row][col]) return false
  if (col > 0 && cellWallCount(maze, row, col - 1) >= 3) return false
  if (col < maze.size && cellWallCount(maze, row, col) >= 3) return false
  return true
}

function walk(maze: HuntingMaze, row: number, col: number, visit: (r: number, c: number) => boolean) {
  const size = maze.size
  const seen = Array.from({ length: size }, () => Array.from({ length: size }, () => false))
  const queue: Array<[number, number]> = [[row, col]]
  seen[row][col] = true
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i]
    if (!visit(r, c)) return
    if (r > 0 && !maze.horiz[r][c] && !seen[r - 1][c]) {
      seen[r - 1][c] = true
      queue.push([r - 1, c])
    }
    if (r < size - 1 && !maze.horiz[r + 1][c] && !seen[r + 1][c]) {
      seen[r + 1][c] = true
      queue.push([r + 1, c])
    }
    if (c > 0 && !maze.vert[r][c] && !seen[r][c - 1]) {
      seen[r][c - 1] = true
      queue.push([r, c - 1])
    }
    if (c < size - 1 && !maze.vert[r][c + 1] && !seen[r][c + 1]) {
      seen[r][c + 1] = true
      queue.push([r, c + 1])
    }
  }
}

export function mazeConnected(maze: HuntingMaze) {
  let count = 0
  walk(maze, 0, 0, () => {
    count += 1
    return true
  })
  return count === maze.size * maze.size
}

function cellsLinked(maze: HuntingMaze, aRow: number, aCol: number, bRow: number, bCol: number) {
  let found = false
  walk(maze, aRow, aCol, (r, c) => {
    if (r === bRow && c === bCol) {
      found = true
      return false
    }
    return true
  })
  return found
}

function shuffle<T>(items: T[], rng: Rng) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const swap = next[i]
    next[i] = next[j]
    next[j] = swap
  }
  return next
}

type Edge =
  | { kind: 'horiz'; row: number; col: number }
  | { kind: 'vert'; row: number; col: number }

export function generateHuntingMaze(
  size = HUNTING_GRID,
  rng: Rng = Math.random,
  chance = WALL_CHANCE,
): HuntingMaze {
  const maze = emptyHuntingMaze(size)
  sealBorder(maze)
  const edges: Edge[] = []
  for (let row = 1; row < size; row++) {
    for (let col = 0; col < size; col++) edges.push({ kind: 'horiz', row, col })
  }
  for (let row = 0; row < size; row++) {
    for (let col = 1; col < size; col++) edges.push({ kind: 'vert', row, col })
  }
  for (const edge of shuffle(edges, rng)) {
    if (rng() >= chance) continue
    if (edge.kind === 'horiz') {
      if (!canAddHoriz(maze, edge.row, edge.col)) continue
      maze.horiz[edge.row][edge.col] = true
      if (!cellsLinked(maze, edge.row - 1, edge.col, edge.row, edge.col)) {
        maze.horiz[edge.row][edge.col] = false
      }
    } else {
      if (!canAddVert(maze, edge.row, edge.col)) continue
      maze.vert[edge.row][edge.col] = true
      if (!cellsLinked(maze, edge.row, edge.col - 1, edge.row, edge.col)) {
        maze.vert[edge.row][edge.col] = false
      }
    }
  }
  return maze
}
