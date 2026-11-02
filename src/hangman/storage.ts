import { STORAGE_KEY } from './constants'

export type RoundState = {
  levelId: string
  guessed: string[]
  wrong: number
}

export type SaveData = {
  unlockedIds: string[]
  cooldownUntil: number | null
  round: RoundState | null
}

const empty: SaveData = {
  unlockedIds: [],
  cooldownUntil: null,
  round: null,
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...empty }
    const parsed = JSON.parse(raw) as SaveData
    return {
      unlockedIds: Array.isArray(parsed.unlockedIds) ? parsed.unlockedIds : [],
      cooldownUntil:
        typeof parsed.cooldownUntil === 'number' ? parsed.cooldownUntil : null,
      round: parsed.round ?? null,
    }
  } catch {
    return { ...empty }
  }
}

export function writeSave(data: SaveData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
