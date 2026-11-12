import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MemoryGame from './MemoryGame'

describe('MemoryGame', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () => 'one\ntwo\nthree\n',
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
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
    expect(onWin).not.toHaveBeenCalled()

    await user.type(terminal, 'three{Enter}')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (3/3)')
    expect(onWin).toHaveBeenCalledTimes(1)

    expect(hint).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(terminal).toHaveValue('')
    expect(terminal).toHaveAttribute('placeholder', 'Who have we guessed... (0/3)')
    expect(hint).toBeEnabled()

    await user.click(hint)
    expect(terminal).toHaveValue('o')
    await user.click(hint)
    expect(terminal).toHaveValue('on')
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

    await user.click(hint)
    expect(terminal).toHaveValue('O')
    await user.click(hint)
    expect(terminal).toHaveValue('O.')
    await user.click(hint)
    expect(terminal).toHaveValue('O.N')
    expect(hint).toBeEnabled()

    await user.type(terminal, 'x')
    expect(hint).toBeDisabled()
    await user.click(hint)
    expect(terminal).toHaveValue('O.Nx')

    await user.clear(terminal)
    expect(hint).toBeEnabled()
  })
})
