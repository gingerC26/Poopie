import { vi } from 'vitest'
import { LEVELS } from '../hangman/levels'
import type { HangmanState } from '../hangman/useHangman'

export function mockGame(over: Partial<HangmanState> = {}): HangmanState {
  return {
    levels: LEVELS,
    selected: LEVELS[0],
    unlocked: new Set(),
    sidebarOpen: true,
    setSidebarOpen: vi.fn(),
    remainingMs: 0,
    onCooldown: false,
    status: 'ready',
    guessed: [],
    wrong: 0,
    canGuess: true,
    guess: vi.fn(),
    selectLevel: vi.fn(),
    openUnlocked: vi.fn(),
    markLevelWon: vi.fn(),
    clearGameWins: vi.fn(),
    won: new Set(),
    round: null,
    ...over,
  }
}
