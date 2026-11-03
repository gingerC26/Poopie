import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY } from './constants'
import { lettersIn } from './levels'
import { COOLDOWN_MS } from './settings'
import { emptyGameWins, loadSave } from './storage'
import { useHangman } from './useHangman'

function guessAll(result: { current: ReturnType<typeof useHangman> }, word: string) {
  for (const letter of lettersIn(word)) {
    act(() => result.current.guess(letter))
  }
}

describe('useHangman', () => {
  it('starts ready on level 1 with no guesses', () => {
    const { result } = renderHook(() => useHangman())
    expect(result.current.status).toBe('ready')
    expect(result.current.selected.id).toBe('1')
    expect(result.current.canGuess).toBe(true)
    expect(result.current.guessed).toEqual([])
  })

  it('ignores non-letters and duplicate guesses', () => {
    const { result } = renderHook(() => useHangman())
    act(() => result.current.guess('1'))
    act(() => result.current.guess('C'))
    act(() => result.current.guess('c'))
    expect(result.current.guessed).toEqual(['C'])
    expect(result.current.wrong).toBe(0)
  })

  it('starts the hourglass on the first guess and counts misses', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
    const { result } = renderHook(() => useHangman())
    act(() => result.current.guess('Z'))
    expect(result.current.status).toBe('playing')
    expect(result.current.wrong).toBe(1)
    expect(result.current.remainingMs).toBe(COOLDOWN_MS)
    expect(loadSave().cooldownUntil).toBe(1_000_000 + COOLDOWN_MS)

    act(() => {
      vi.advanceTimersByTime(1_000)
    })
    expect(result.current.remainingMs).toBe(COOLDOWN_MS - 1_000)
  })

  it('unlocks CAREFUL after every unique letter is guessed', () => {
    const { result } = renderHook(() => useHangman())
    guessAll(result, 'CAREFUL')
    expect(result.current.status).toBe('unlocked')
    expect(result.current.unlocked.has('1')).toBe(true)
    expect(loadSave().unlockedIds).toContain('1')
    expect(loadSave().round).toBeNull()
  })

  it('loses after seven misses and blocks further guesses on that level', () => {
    const { result } = renderHook(() => useHangman())
    for (const letter of ['Z', 'Q', 'X', 'J', 'K', 'V', 'B']) {
      act(() => result.current.guess(letter))
    }
    expect(result.current.status).toBe('lost')
    expect(result.current.wrong).toBe(7)
    expect(result.current.unlocked.has('1')).toBe(false)
    act(() => result.current.guess('C'))
    expect(result.current.unlocked.has('1')).toBe(false)
    expect(loadSave().round).toBeNull()
  })

  it('blocks a new round while cooldown is running with no active round', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlockedIds: [],
        cooldownUntil: Date.now() + 30_000,
        round: null,
      }),
    )
    const { result } = renderHook(() => useHangman())
    expect(result.current.status).toBe('cooldown')
    expect(result.current.canGuess).toBe(false)
    act(() => result.current.guess('C'))
    expect(result.current.guessed).toEqual([])
  })

  it('marks other levels busy while a round is in progress', () => {
    const { result } = renderHook(() => useHangman())
    act(() => result.current.guess('C'))
    act(() => result.current.selectLevel('2'))
    expect(result.current.status).toBe('busy')
    expect(result.current.selected.id).toBe('2')
    act(() => result.current.guess('P'))
    expect(result.current.round?.levelId).toBe('1')
  })

  it('records a mini-game win without dropping hangman unlocks', () => {
    const { result } = renderHook(() => useHangman())
    guessAll(result, 'CAREFUL')
    act(() => result.current.markLevelWon('1'))
    expect(result.current.won.has('1')).toBe(true)
    expect(result.current.won.has('2')).toBe(false)
    expect(loadSave().gameWins['1']).toBe(true)
    expect(loadSave().unlockedIds).toContain('1')
  })

  it('clears mini-game wins without touching hangman unlocks', () => {
    const { result } = renderHook(() => useHangman())
    guessAll(result, 'CAREFUL')
    act(() => result.current.markLevelWon('1'))
    act(() => result.current.clearGameWins())
    expect(result.current.won.has('1')).toBe(false)
    expect(loadSave().gameWins['1']).toBe(false)
    expect(loadSave().unlockedIds).toContain('1')
  })

  it('keeps game wins when another hangman guess is saved', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlockedIds: [],
        cooldownUntil: null,
        round: null,
        gameWins: { '1': false, '2': true, '3': false, '4': false, '5': false, '6': false },
      }),
    )
    const { result } = renderHook(() => useHangman())
    act(() => result.current.guess('C'))
    expect(loadSave().gameWins['2']).toBe(true)
    expect(result.current.won.has('2')).toBe(true)
  })

  it('ignores mini-game wins for unknown levels', () => {
    const { result } = renderHook(() => useHangman())
    act(() => result.current.markLevelWon('99'))
    expect(result.current.won.size).toBe(0)
    expect(loadSave().gameWins).toEqual(emptyGameWins())
  })

  it('accepts physical keyboard letters', () => {
    const { result } = renderHook(() => useHangman())
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
    })
    expect(result.current.guessed).toEqual(['C'])
  })
})
