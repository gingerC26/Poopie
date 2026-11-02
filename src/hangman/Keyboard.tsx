import { KEYBOARD_ROWS } from './constants'

type Props = {
  guessed: string[]
  word: string
  disabled: boolean
  onGuess: (letter: string) => void
}

export default function Keyboard({ guessed, word, disabled, onGuess }: Props) {
  const upper = word.toUpperCase()

  return (
    <div className="keyboard" role="group" aria-label="Letter keyboard">
      {KEYBOARD_ROWS.map((row) => (
        <div key={row} className="keyboard-row">
          {row.split('').map((letter) => {
            const used = guessed.includes(letter)
            const hit = used && upper.includes(letter)
            return (
              <button
                key={letter}
                type="button"
                className={`key ${used ? (hit ? 'key--hit' : 'key--miss') : ''}`}
                disabled={disabled || used}
                onClick={() => onGuess(letter)}
              >
                {letter}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
