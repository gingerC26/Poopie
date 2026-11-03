import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from './constants'
import { emptyGameWins, loadSave, writeSave, type SaveData } from './storage'

const sample: SaveData = {
  unlockedIds: ['1'],
  cooldownUntil: 1_700_000_000_000,
  round: { levelId: '2', guessed: ['A', 'B'], wrong: 3 },
  gameWins: { ...emptyGameWins(), '1': true },
}

describe('storage', () => {
  it('returns an empty save when nothing is stored', () => {
    expect(loadSave()).toEqual({
      unlockedIds: [],
      cooldownUntil: null,
      round: null,
      gameWins: emptyGameWins(),
    })
  })

  it('round-trips a save through localStorage', () => {
    writeSave(sample)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(sample)
    expect(loadSave()).toEqual(sample)
  })

  it('defaults missing gameWins to six false flags', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unlockedIds: ['1'], cooldownUntil: null, round: null }),
    )
    expect(loadSave().gameWins).toEqual(emptyGameWins())
  })

  it('only accepts true flags for known levels', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlockedIds: [],
        cooldownUntil: null,
        round: null,
        gameWins: { '1': true, '2': 'yes', '9': true },
      }),
    )
    expect(loadSave().gameWins).toEqual({ ...emptyGameWins(), '1': true })
  })

  it('falls back to empty data for invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')
    expect(loadSave()).toEqual({
      unlockedIds: [],
      cooldownUntil: null,
      round: null,
      gameWins: emptyGameWins(),
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
      gameWins: emptyGameWins(),
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
