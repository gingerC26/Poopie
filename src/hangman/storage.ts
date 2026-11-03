import { STORAGE_KEY } from './constants'
import { LEVEL_IDS, type LevelId } from './levels'

export type RoundState = {
  levelId: string
  guessed: string[]
  wrong: number
}

export type GameWins = Record<LevelId, boolean>

export type SaveData = {
  unlockedIds: string[]
  cooldownUntil: number | null
  round: RoundState | null
  gameWins: GameWins
}

export function emptyGameWins(): GameWins {
  return {
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    '6': false,
  }
}

export function parseGameWins(raw: unknown): GameWins {
  const wins = emptyGameWins()
  if (!raw || typeof raw !== 'object') return wins
  const record = raw as Record<string, unknown>
  for (const id of LEVEL_IDS) {
    if (record[id] === true) wins[id] = true
  }
  return wins
}

const empty: SaveData = {
  unlockedIds: [],
  cooldownUntil: null,
  round: null,
  gameWins: emptyGameWins(),
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...empty, gameWins: emptyGameWins() }
    const parsed = JSON.parse(raw) as SaveData
    return {
      unlockedIds: Array.isArray(parsed.unlockedIds) ? parsed.unlockedIds : [],
      cooldownUntil:
        typeof parsed.cooldownUntil === 'number' ? parsed.cooldownUntil : null,
      round: parsed.round ?? null,
      gameWins: parseGameWins(parsed.gameWins),
    }
  } catch {
    return { ...empty, gameWins: emptyGameWins() }
  }
}

export function writeSave(data: SaveData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
