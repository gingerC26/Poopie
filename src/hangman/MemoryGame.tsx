import { useEffect, useState } from 'react'
import { loadMemoryAnswers, memoryKey, type MemoryAnswer } from './memoryAnswers'
import { MEMORY_RESET_BUTTON } from './settings'

type Props = {
  onWin?: () => void
}

export default function MemoryGame({ onWin }: Props) {
  const [value, setValue] = useState('')
  const [answers, setAnswers] = useState<MemoryAnswer[]>([])
  const [guessed, setGuessed] = useState<string[]>([])
  const [hintKey, setHintKey] = useState<string | null>(null)
  const [hintLen, setHintLen] = useState(0)
  const [hintOwned, setHintOwned] = useState(true)

  useEffect(() => {
    let alive = true
    loadMemoryAnswers().then((names) => {
      if (alive) setAnswers(names)
    })
    return () => {
      alive = false
    }
  }, [])

  const remaining = answers.filter((answer) => !guessed.includes(answer.key))

  const submit = () => {
    const key = memoryKey(value)
    setValue('')
    setHintOwned(true)
    if (!key || !answers.some((answer) => answer.key === key) || guessed.includes(key)) return
    const next = [...guessed, key]
    setGuessed(next)
    if (hintKey === key) {
      setHintKey(null)
      setHintLen(0)
    }
    if (next.length === answers.length) onWin?.()
  }

  const reset = () => {
    setValue('')
    setGuessed([])
    setHintKey(null)
    setHintLen(0)
    setHintOwned(true)
  }

  const hint = () => {
    if (remaining.length === 0 || !hintOwned) return
    const current = remaining.find((answer) => answer.key === hintKey) ?? remaining[0]
    const nextLen = current.key === hintKey ? Math.min(current.display.length, hintLen + 1) : 1
    setHintKey(current.key)
    setHintLen(nextLen)
    setHintOwned(true)
    setValue(current.display.slice(0, nextLen))
  }

  return (
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
        disabled={remaining.length === 0 || !hintOwned}
      >
        Hint
      </button>
      <input
        className="memory-terminal"
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
  )
}
