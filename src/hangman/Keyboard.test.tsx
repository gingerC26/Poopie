import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Keyboard from './Keyboard'

describe('Keyboard', () => {
  it('renders every letter key', () => {
    render(<Keyboard guessed={[]} word="CAREFUL" disabled={false} onGuess={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(26)
    expect(screen.getByRole('button', { name: 'Q' })).toBeEnabled()
  })

  it('reports a guess when a letter is clicked', async () => {
    const onGuess = vi.fn()
    const user = userEvent.setup()
    render(<Keyboard guessed={[]} word="CAREFUL" disabled={false} onGuess={onGuess} />)
    await user.click(screen.getByRole('button', { name: 'C' }))
    expect(onGuess).toHaveBeenCalledWith('C')
  })

  it('marks hits and misses and disables used keys', () => {
    render(
      <Keyboard guessed={['C', 'Z']} word="CAREFUL" disabled={false} onGuess={() => {}} />,
    )
    const hit = screen.getByRole('button', { name: 'C' })
    const miss = screen.getByRole('button', { name: 'Z' })
    expect(hit).toBeDisabled()
    expect(hit).toHaveClass('key--hit')
    expect(miss).toBeDisabled()
    expect(miss).toHaveClass('key--miss')
  })

  it('disables the whole board when guessing is not allowed', () => {
    render(<Keyboard guessed={[]} word="CAREFUL" disabled onGuess={() => {}} />)
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled()
  })
})
