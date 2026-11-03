import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HangmanFigure from './HangmanFigure'

describe('HangmanFigure', () => {
  it('labels the current stage', () => {
    const { getByRole } = render(<HangmanFigure wrong={3} mood="play" />)
    expect(getByRole('img', { name: 'Hangman stage 3 of 7' })).toBeInTheDocument()
  })

  it('draws more of the figure as misses increase', () => {
    const { rerender, container } = render(<HangmanFigure wrong={1} mood="play" />)
    const count = () => container.querySelectorAll('circle, path').length
    const atOne = count()
    rerender(<HangmanFigure wrong={6} mood="play" />)
    expect(count()).toBeGreaterThan(atOne)
  })

  it('shows the full figure with heart-eyes on a win', () => {
    const { getByRole, container } = render(<HangmanFigure wrong={0} mood="won" />)
    expect(getByRole('img', { name: 'Hangman stage 7 of 7' })).toBeInTheDocument()
    expect(container.querySelectorAll('path[fill="#ff5d8f"]')).toHaveLength(2)
  })
})
