import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MemoryGame from './MemoryGame'
import { MEMORY_HINT_COOLDOWN_MS } from './settings'

function waitHintReady(hint: HTMLElement) {
  act(() => {
    vi.advanceTimersByTime(MEMORY_HINT_COOLDOWN_MS)
  })
  expect(hint).toBeEnabled()
}

describe('MemoryGame', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () => 'one\ntwo\nthree\n',
      })),
    )
    vi.stubGlobal(
      'Audio',
      vi.fn(() => ({
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('shows guessed progress in the hint and wins after every answer', async () => {
    const user = userEvent.setup()
    const onWin = vi.fn()
    render(<MemoryGame onWin={onWin} />)
    const terminal = screen.getByRole('textbox', { name: 'Terminal' })
    const hint = screen.getByRole('button', { name: 'Hint' })

    await waitFor(() => {
      expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (0/3)')
    })
    expect(hint).toBeEnabled()
    await user.type(terminal, 'x')
    expect(hint).toBeDisabled()
    await user.clear(terminal)
    expect(hint).toBeEnabled()

    await user.type(terminal, 'O.n E!{Enter}')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (1/3)')
    expect(onWin).not.toHaveBeenCalled()

    await user.type(terminal, 'TWO{Enter}')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (2/3)')

    await user.type(terminal, 'one{Enter}')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (2/3)')

    await user.type(terminal, 'nope{Enter}')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (2/3)')
    expect(document.querySelector('.memory-terminal--wrong')).toBeTruthy()
    expect(onWin).not.toHaveBeenCalled()

    await user.type(terminal, 'three{Enter}')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (3/3)')
    expect(onWin).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog', { name: 'Memory note' })).toBeInTheDocument()
    expect(
      screen.getByText(/You remembered 3 names! \*Applause\*/),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Memory note' })).not.toBeInTheDocument()
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (3/3)')

    expect(hint).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (3/3)')
    expect(screen.getByRole('dialog', { name: 'Reset progress' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'N' }))
    expect(screen.queryByRole('dialog', { name: 'Reset progress' })).not.toBeInTheDocument()
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (3/3)')
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    await user.click(screen.getByRole('button', { name: 'Y' }))
    expect(terminal).toHaveValue('')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (0/3)')
    expect(hint).toBeEnabled()

    vi.useFakeTimers()
    fireEvent.click(hint)
    expect(terminal).toHaveValue('o')
    expect(hint).toBeDisabled()
    expect(screen.getByText('Better experience with audio on!')).toBeInTheDocument()
    expect(Audio).toHaveBeenCalledTimes(1)
    fireEvent.click(hint)
    expect(terminal).toHaveValue('o')
    expect(Audio).toHaveBeenCalledTimes(1)
    waitHintReady(hint)
    expect(screen.queryByText('Better experience with audio on!')).not.toBeInTheDocument()
    fireEvent.click(hint)
    expect(terminal).toHaveValue('on')
    expect(Audio).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('Better experience with audio on!')).not.toBeInTheDocument()
  })

  it('reveals punctuation as ordinary characters on an unguessed answer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () => 'O.N.E\ntwo\n',
      })),
    )
    const user = userEvent.setup()
    render(<MemoryGame />)
    const terminal = screen.getByRole('textbox', { name: 'Terminal' })
    const hint = screen.getByRole('button', { name: 'Hint' })

    await waitFor(() => {
      expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (0/2)')
    })

    vi.useFakeTimers()
    fireEvent.click(hint)
    expect(terminal).toHaveValue('O')
    waitHintReady(hint)
    fireEvent.click(hint)
    expect(terminal).toHaveValue('O.')
    waitHintReady(hint)
    fireEvent.click(hint)
    expect(terminal).toHaveValue('O.N')
    waitHintReady(hint)
    vi.useRealTimers()

    await user.type(terminal, 'x')
    expect(hint).toBeDisabled()
    await user.click(hint)
    expect(terminal).toHaveValue('O.Nx')

    await user.clear(terminal)
    expect(hint).toBeEnabled()
  })
})
