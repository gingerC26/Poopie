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
    expect(screen.queryByRole('img', { name: 'Maze' })).not.toBeInTheDocument()

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

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS / 2)
    })
    expect(Number(timer.getAttribute('aria-valuenow'))).toBe(HUNTING_TIME_MS / 2)

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS)
    })
    expect(timer).toHaveAttribute('aria-valuenow', '0')
  })
})
