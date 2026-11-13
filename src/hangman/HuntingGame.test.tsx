import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HuntingGame from './HuntingGame'
import { HUNTING_GRID, HUNTING_TIME_MS } from './settings'

describe('HuntingGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('draws a timed maze board', () => {
    render(<HuntingGame />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar', { name: 'Time' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Maze')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS / 2)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    const timer = screen.getByRole('progressbar', { name: 'Time' })
    expect(timer).toHaveAttribute('aria-valuemax', String(HUNTING_TIME_MS))
    expect(timer).toHaveAttribute('aria-valuenow', String(HUNTING_TIME_MS))
    expect(document.querySelectorAll('.hunting-wall')).toHaveLength(
      document.querySelectorAll('.hunting-wall--h').length +
        document.querySelectorAll('.hunting-wall--v').length,
    )
    expect(document.querySelectorAll('.hunting-wall').length).toBeGreaterThanOrEqual(HUNTING_GRID * 4)
    expect(screen.getByAltText('Koala')).toBeInTheDocument()
    expect(screen.getByAltText('Gua bao')).toBeInTheDocument()
    expect(screen.getByAltText('Bubble tea')).toBeInTheDocument()
    expect(screen.getByAltText('Xiao long bao')).toBeInTheDocument()
    expect(screen.getByAltText('Popcorn chicken')).toBeInTheDocument()
    expect(screen.getByAltText('Skewers')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS / 2)
    })
    expect(Number(timer.getAttribute('aria-valuenow'))).toBe(HUNTING_TIME_MS / 2)

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS)
    })
    expect(timer).toHaveAttribute('aria-valuenow', '0')
  })

  it('moves the koala with arrows and WASD', () => {
    render(<HuntingGame />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    const koala = screen.getByAltText('Koala').closest('.hunting-pac--player')
    expect(koala?.querySelector('.hunting-pac-pointer')).toBeTruthy()
    const start = koala?.getAttribute('style') ?? ''
    for (const key of ['ArrowRight', 'd', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowUp', 'w']) {
      fireEvent.keyDown(window, { key })
      if (koala?.getAttribute('style') !== start) break
    }
    expect(koala?.getAttribute('style')).not.toBe(start)
  })
})
