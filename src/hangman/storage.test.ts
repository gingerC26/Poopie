import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from './constants'
import { loadSave, writeSave, type SaveData } from './storage'

const sample: SaveData = {
  unlockedIds: ['1'],
  cooldownUntil: 1_700_000_000_000,
  round: { levelId: '2', guessed: ['A', 'B'], wrong: 3 },
}

describe('storage', () => {
  it('returns an empty save when nothing is stored', () => {
    expect(loadSave()).toEqual({
      unlockedIds: [],
      cooldownUntil: null,
      round: null,
    })
  })

  it('round-trips a save through localStorage', () => {
    writeSave(sample)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(sample))
    expect(loadSave()).toEqual(sample)
  })

  it('falls back to empty data for invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')
    expect(loadSave()).toEqual({
      unlockedIds: [],
      cooldownUntil: null,
      round: null,
    })
  })

  it('ignores a non-array unlockedIds field', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unlockedIds: '1', cooldownUntil: 12, round: null }),
    )
    expect(loadSave()).toEqual({
      unlockedIds: [],
      cooldownUntil: 12,
      round: null,
    })
  })

  it('treats a non-numeric cooldown as null', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unlockedIds: [], cooldownUntil: 'soon', round: null }),
    )
    expect(loadSave().cooldownUntil).toBeNull()
  })
})
