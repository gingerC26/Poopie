import { describe, expect, it } from 'vitest'
import { cellWallCount, generateHuntingMaze, huntingStep, mazeConnected } from './huntingMaze'

function rngFrom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 0x100000000
  }
}

describe('generateHuntingMaze', () => {
  it('never closes a cell with four walls', () => {
    const maze = generateHuntingMaze(16, rngFrom(7), 1)
    expect(maze.size).toBe(16)
    expect(maze.horiz).toHaveLength(17)
    expect(maze.vert).toHaveLength(16)
    for (let row = 0; row < maze.size; row++) {
      for (let col = 0; col < maze.size; col++) {
        expect(cellWallCount(maze, row, col)).toBeLessThanOrEqual(3)
      }
    }
  })

  it('places some walls when chance is high', () => {
    const maze = generateHuntingMaze(8, rngFrom(3), 0.8)
    const walls =
      maze.horiz.flat().filter(Boolean).length + maze.vert.flat().filter(Boolean).length
    expect(walls).toBeGreaterThan(8)
  })

  it('keeps only the outer walls when chance is zero', () => {
    const maze = generateHuntingMaze(6, rngFrom(1), 0)
    for (let col = 0; col < maze.size; col++) {
      expect(maze.horiz[0][col]).toBe(true)
      expect(maze.horiz[maze.size][col]).toBe(true)
    }
    for (let row = 0; row < maze.size; row++) {
      expect(maze.vert[row][0]).toBe(true)
      expect(maze.vert[row][maze.size]).toBe(true)
    }
    for (let row = 1; row < maze.size; row++) {
      expect(maze.horiz[row].some(Boolean)).toBe(false)
    }
    for (let row = 0; row < maze.size; row++) {
      expect(maze.vert[row].slice(1, maze.size).some(Boolean)).toBe(false)
    }
  })

  it('keeps every cell reachable from every other cell', () => {
    expect(mazeConnected(generateHuntingMaze(16, rngFrom(7), 1))).toBe(true)
    expect(mazeConnected(generateHuntingMaze(16, rngFrom(99), 0.5))).toBe(true)
    expect(mazeConnected(generateHuntingMaze(8, rngFrom(3), 0.8))).toBe(true)
  })

  it('walls every outer edge', () => {
    const maze = generateHuntingMaze(16, rngFrom(11), 0.5)
    for (let col = 0; col < maze.size; col++) {
      expect(maze.horiz[0][col]).toBe(true)
      expect(maze.horiz[maze.size][col]).toBe(true)
    }
    for (let row = 0; row < maze.size; row++) {
      expect(maze.vert[row][0]).toBe(true)
      expect(maze.vert[row][maze.size]).toBe(true)
    }
  })
})

describe('huntingStep', () => {
  it('moves through open sides and stops at outer walls', () => {
    const maze = generateHuntingMaze(4, rngFrom(1), 0)
    expect(huntingStep(maze, 1, 1, 'n')).toEqual({ row: 0, col: 1 })
    expect(huntingStep(maze, 1, 1, 's')).toEqual({ row: 2, col: 1 })
    expect(huntingStep(maze, 1, 1, 'w')).toEqual({ row: 1, col: 0 })
    expect(huntingStep(maze, 1, 1, 'e')).toEqual({ row: 1, col: 2 })
    expect(huntingStep(maze, 0, 0, 'n')).toBeNull()
    expect(huntingStep(maze, 0, 0, 'w')).toBeNull()
    expect(huntingStep(maze, 0, 0, 'e')).toEqual({ row: 0, col: 1 })
  })
})
