import { useCallback, useEffect, useMemo, useState } from 'react'
import { MAX_WRONG } from './constants'
import { COOLDOWN_MS } from './settings'
import { getLevel, lettersIn, LEVEL_IDS, LEVELS, type LevelId } from './levels'
import { emptyGameWins, loadSave, writeSave, type RoundState, type SaveData } from './storage'

function now() {
  return Date.now()
}

export function useHangman() {
  const [save, setSave] = useState<SaveData>(() => loadSave())
  const [selectedId, setSelectedId] = useState(
    () => save.round?.levelId ?? LEVELS[0].id,
  )
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.matchMedia('(min-width: 801px)').matches,
  )
  const [clock, setClock] = useState(now)
  const [justFinished, setJustFinished] = useState<{
    levelId: string
    won: boolean
  } | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setClock(now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const persist = useCallback((patch: Partial<SaveData>) => {
    setSave((prev) => {
      const next = { ...prev, ...patch }
      writeSave(next)
      return next
    })
  }, [])

  const remainingMs = Math.max(0, (save.cooldownUntil ?? 0) - clock)
  const onCooldown = remainingMs > 0
  const selected = getLevel(selectedId) ?? LEVELS[0]
  const unlocked = useMemo(() => new Set(save.unlockedIds), [save.unlockedIds])
  const isUnlocked = unlocked.has(selected.id)
  const round = save.round
  const isActiveRound = round?.levelId === selected.id

  const status = useMemo(() => {
    if (isUnlocked && !isActiveRound) return 'unlocked'
    if (justFinished?.levelId === selected.id && !justFinished.won && onCooldown) {
      return 'lost'
    }
    if (round && round.levelId !== selected.id) return 'busy'
    if (!round && onCooldown) return 'cooldown'
    if (isActiveRound) return 'playing'
    return 'ready'
  }, [isActiveRound, isUnlocked, justFinished, onCooldown, round, selected.id])

  const guess = useCallback(
    (raw: string) => {
      const letter = raw.toUpperCase()
      if (!/^[A-Z]$/.test(letter)) return

      const level = getLevel(selectedId)
      if (!level || unlocked.has(level.id)) return
      if (round && round.levelId !== level.id) return
      if (!round && onCooldown) return
      if (justFinished?.levelId === level.id) return

      const current: RoundState = round ?? {
        levelId: level.id,
        guessed: [],
        wrong: 0,
      }
      if (current.guessed.includes(letter)) return

      const guessed = [...current.guessed, letter]
      const hit = lettersIn(level.word).includes(letter)
      const wrong = current.wrong + (hit ? 0 : 1)
      const won = lettersIn(level.word).every((ch) => guessed.includes(ch))
      const lost = !won && wrong >= MAX_WRONG

      persist({
        unlockedIds: won
          ? Array.from(new Set([...save.unlockedIds, level.id]))
          : save.unlockedIds,
        cooldownUntil: round ? save.cooldownUntil : now() + COOLDOWN_MS,
        round: won || lost ? null : { levelId: level.id, guessed, wrong },
      })

      if (won || lost) setJustFinished({ levelId: level.id, won })
    },
    [
      justFinished,
      onCooldown,
      persist,
      round,
      save.cooldownUntil,
      save.unlockedIds,
      selectedId,
      unlocked,
    ],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      guess(event.key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [guess])

  const selectLevel = useCallback(
    (id: string) => {
      setSelectedId(id)
      if (save.unlockedIds.includes(id)) setJustFinished(null)
    },
    [save.unlockedIds],
  )

  const openUnlocked = useCallback(() => {
    setJustFinished(null)
  }, [])

  const markLevelWon = useCallback((id: string) => {
    if (!(LEVEL_IDS as readonly string[]).includes(id)) return
    const levelId = id as LevelId
    persist({
      gameWins: { ...save.gameWins, [levelId]: true },
    })
  }, [persist, save.gameWins])

  const won = useMemo(() => {
    const ids = (Object.keys(save.gameWins) as LevelId[]).filter((id) => save.gameWins[id])
    return new Set(ids)
  }, [save.gameWins])

  const clearGameWins = useCallback(() => {
    persist({ gameWins: emptyGameWins() })
  }, [persist])

  return {
    levels: LEVELS,
    selected,
    unlocked,
    sidebarOpen,
    setSidebarOpen,
    remainingMs,
    onCooldown,
    status,
    guessed: isActiveRound
      ? (round?.guessed ?? [])
      : justFinished?.levelId === selected.id && justFinished.won
        ? lettersIn(selected.word)
        : [],
    wrong: justFinished?.levelId === selected.id && !justFinished.won
      ? MAX_WRONG
      : isActiveRound
        ? (round?.wrong ?? 0)
        : 0,
    canGuess: status === 'ready' || status === 'playing',
    guess,
    selectLevel,
    openUnlocked,
    markLevelWon,
    clearGameWins,
    won,
    round,
  }
}

export type HangmanState = ReturnType<typeof useHangman>
