import { MAX_WRONG } from './constants'
import HangmanFigure from './HangmanFigure'
import Keyboard from './Keyboard'
import type { HangmanState } from './useHangman'

const LOSE_LINES = [
  'The letters ran off to get snacks. No spoilers — see you in 30 minutes.',
  'Nice try. The answer is napping under the hourglass.',
  'Denied. The stick figure took a vow of silence.',
  'That round’s toast. Come back when the sand finishes gossiping.',
  'Wrong hallway. The password is still a secret.',
]

type Props = {
  game: HangmanState
}

function WordZone({ word, guessed }: { word: string; guessed: string[] }) {
  const words = word.split(' ')
  return (
    <div className="word-zone" aria-label="Phrase in progress">
      {words.map((group, wi) => (
        <span key={wi} className="word-group">
          {group.split('').map((char, i) => {
            const letter = char.toUpperCase()
            const revealed = guessed.includes(letter)
            return (
              <span key={`${wi}-${i}`} className={`slot ${revealed ? 'slot--revealed' : ''}`}>
                {revealed ? letter : ''}
              </span>
            )
          })}
        </span>
      ))}
    </div>
  )
}

export default function HangmanPlay({ game }: Props) {
  const { selected, status, guessed, wrong, canGuess, guess, round } = game
  const mood = status === 'won' ? 'won' : 'play'
  const hideProgress = status === 'lost' || status === 'cooldown'
  const shownGuessed = hideProgress ? [] : guessed
  const shownWrong = hideProgress ? 0 : wrong
  const loseLine = LOSE_LINES[Number(selected.id) % LOSE_LINES.length]

  const left = Math.max(0, MAX_WRONG - wrong)
  const message =
    status === 'won'
      ? 'You got it — this level is unlocked.'
      : status === 'lost'
        ? loseLine
        : status === 'cooldown'
          ? 'The hourglass is still running. One round every 30 minutes.'
          : status === 'busy'
            ? `Finish your current round on level ${round?.levelId} first.`
            : status === 'playing'
              ? `${left} miss${left === 1 ? '' : 'es'} left.`
              : 'One guess starts the round and the 30-minute wait.'

  return (
    <div className="hangman">
      <HangmanFigure wrong={shownWrong} mood={mood} />
      <WordZone word={selected.word} guessed={shownGuessed} />
      <p className="hangman-msg">{message}</p>
      {status === 'busy' && round && (
        <button type="button" className="open-gift" onClick={() => game.selectLevel(round.levelId)}>
          Continue level {round.levelId} →
        </button>
      )}
      <Keyboard
        word={selected.word}
        guessed={shownGuessed}
        disabled={!canGuess}
        onGuess={guess}
      />
    </div>
  )
}
