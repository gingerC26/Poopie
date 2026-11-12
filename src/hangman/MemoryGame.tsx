import { useEffect, useRef, useState } from 'react'
import { loadMemoryAnswers, memoryKey, type MemoryAnswer } from './memoryAnswers'
import { playMemoryHintSound } from './memoryHintSounds'
import { MEMORY_HINT_COOLDOWN_MS, MEMORY_RESET_BUTTON } from './settings'

type Props = {
  onWin?: () => void
}

function memoryWinNote(count: number) {
  return `Playing Guess Who with you, at a scenic spot (although too dark to see anything), eating popcorn chicken, seeing you and holding your hand is my favorite moment in this trip. Thank you for creating such beautiful memories with me! (And your memory is great too... You remembered ${count} names! *Applause*)`
}

export default function MemoryGame({ onWin }: Props) {
  const [value, setValue] = useState('')
  const [answers, setAnswers] = useState<MemoryAnswer[]>([])
  const [guessed, setGuessed] = useState<string[]>([])
  const [hintKey, setHintKey] = useState<string | null>(null)
  const [hintLen, setHintLen] = useState(0)
  const [hintOwned, setHintOwned] = useState(true)
  const [wrong, setWrong] = useState(0)
  const [noteOpen, setNoteOpen] = useState(false)
  const [hintCooling, setHintCooling] = useState(false)
  const hintCoolTimer = useRef(0)

  useEffect(() => {
    let alive = true
    loadMemoryAnswers().then((names) => {
      if (alive) setAnswers(names)
    })
    return () => {
      alive = false
      window.clearTimeout(hintCoolTimer.current)
    }
  }, [])

  const remaining = answers.filter((answer) => !guessed.includes(answer.key))

  const submit = () => {
    const key = memoryKey(value)
    if (!key) return
    const hit = answers.some((answer) => answer.key === key) && !guessed.includes(key)
    setValue('')
    setHintOwned(true)
    if (!hit) {
      setWrong((n) => n + 1)
      return
    }
    setWrong(0)
    const next = [...guessed, key]
    setGuessed(next)
    if (hintKey === key) {
      setHintKey(null)
      setHintLen(0)
    }
    if (next.length === answers.length) {
      setNoteOpen(true)
      onWin?.()
    }
  }

  const reset = () => {
    setValue('')
    setGuessed([])
    setHintKey(null)
    setHintLen(0)
    setHintOwned(true)
    setWrong(0)
    setNoteOpen(false)
    window.clearTimeout(hintCoolTimer.current)
    setHintCooling(false)
  }

  const hint = () => {
    if (remaining.length === 0 || !hintOwned || hintCooling) return
    playMemoryHintSound()
    const current = remaining.find((answer) => answer.key === hintKey) ?? remaining[0]
    const nextLen = current.key === hintKey ? Math.min(current.display.length, hintLen + 1) : 1
    setHintKey(current.key)
    setHintLen(nextLen)
    setHintOwned(true)
    setValue(current.display.slice(0, nextLen))
    setHintCooling(true)
    window.clearTimeout(hintCoolTimer.current)
    hintCoolTimer.current = window.setTimeout(() => {
      setHintCooling(false)
    }, MEMORY_HINT_COOLDOWN_MS)
  }

  const cleared = answers.length > 0 && guessed.length === answers.length

  return (
    <>
      {cleared && noteOpen && (
        <div className="memory-win" role="dialog" aria-label="Memory note">
          <button
            type="button"
            className="memory-win-close"
            aria-label="Close"
            onClick={() => setNoteOpen(false)}
          >
            ×
          </button>
          <img src="/sprites/memory/win.jpg" alt="" />
          <p>{memoryWinNote(answers.length)}</p>
        </div>
      )}
      <div className="memory-terminal-dock">
      {MEMORY_RESET_BUTTON && (
        <button type="button" className="memory-terminal-reset" onClick={reset}>
          Reset
        </button>
      )}
      <button
        type="button"
        className="memory-terminal-reset"
        onClick={hint}
        disabled={remaining.length === 0 || !hintOwned || hintCooling}
      >
        Hint
      </button>
      <input
        className={`memory-terminal${wrong ? ' memory-terminal--wrong' : ''}`}
        aria-label="Terminal"
        type="text"
        placeholder={`Who have we guessed... (${guessed.length}/${answers.length})`}
        value={value}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        onChange={(event) => {
          const next = event.target.value
          setValue(next)
          setHintOwned(next === '')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          }
        }}
      />
    </div>
    </>
  )
}
