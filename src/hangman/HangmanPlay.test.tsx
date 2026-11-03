import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockGame } from '../test/hangmanState'
import { LEVELS } from './levels'
import HangmanPlay from './HangmanPlay'

describe('HangmanPlay', () => {
  it('shows empty slots and the ready prompt', () => {
    render(<HangmanPlay game={mockGame()} />)
    expect(screen.getByLabelText('Phrase in progress')).toBeInTheDocument()
    expect(screen.getByText('One guess starts the round and the 1-minute wait.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Hangman stage 0 of 7/ })).toBeInTheDocument()
  })

  it('reveals guessed letters and remaining misses while playing', () => {
    render(
      <HangmanPlay
        game={mockGame({
          status: 'playing',
          guessed: ['C', 'A'],
          wrong: 2,
        })}
      />,
    )
    expect(screen.getByText('5 misses left.')).toBeInTheDocument()
    const slots = document.querySelectorAll('.slot--revealed')
    expect([...slots].map((slot) => slot.textContent)).toEqual(['C', 'A'])
  })

  it('hides progress after a loss and shows a funny line', () => {
    render(
      <HangmanPlay
        game={mockGame({
          status: 'lost',
          guessed: ['Z'],
          wrong: 7,
          canGuess: false,
        })}
      />,
    )
    expect(document.querySelectorAll('.slot--revealed')).toHaveLength(0)
    expect(screen.getByRole('img', { name: /Hangman stage 0 of 7/ })).toBeInTheDocument()
    expect(screen.getByText(/snacks|napping|silence|toast|hallway/)).toBeInTheDocument()
  })

  it('points the player at the active round when they browse another level', async () => {
    const game = mockGame({
      selected: LEVELS[1],
      status: 'busy',
      canGuess: false,
      round: { levelId: '1', guessed: ['C'], wrong: 0 },
    })
    const user = userEvent.setup()
    render(<HangmanPlay game={game} />)
    expect(screen.getByText('Finish your current round on level 1 first.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue level 1 →' }))
    expect(game.selectLevel).toHaveBeenCalledWith('1')
  })
})
