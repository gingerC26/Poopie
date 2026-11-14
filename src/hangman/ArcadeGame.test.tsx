import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ArcadeGame from './ArcadeGame'
import * as arcadeDarts from './arcadeDarts'
import { ARCADE_FLIGHT_MS, ARCADE_LAND_MS } from './settings'

function throwDart() {
  act(() => {
    vi.advanceTimersByTime(ARCADE_FLIGHT_MS + 40)
  })
}

function nextDart() {
  act(() => {
    vi.advanceTimersByTime(ARCADE_LAND_MS + 40)
  })
}

describe('ArcadeGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    vi.spyOn(arcadeDarts, 'pickArcadeWind').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('opens on an arcade Start button', () => {
    render(<ArcadeGame />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Dartboard')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('checks out after four bulls and awards the trophy', () => {
    const onWin = vi.fn()
    render(<ArcadeGame onWin={onWin} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    throwDart()
    expect(screen.getByText('15')).toBeInTheDocument()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    expect(screen.getByRole('dialog', { name: 'Checkout' })).toHaveTextContent(/hand-heart/i)
    expect(onWin).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('busts when a throw goes under zero', () => {
    vi.spyOn(arcadeDarts, 'scoreAtX').mockReturnValueOnce(5)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(4)
      .mockReturnValueOnce(5)
    render(<ArcadeGame />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    expect(screen.getByText(/Bust/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })

  it('loses when the five darts are gone and the score is not zero', () => {
    vi.spyOn(arcadeDarts, 'scoreAtX').mockReturnValue(1)
    render(<ArcadeGame />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    for (let i = 0; i < 4; i++) {
      throwDart()
      nextDart()
    }
    throwDart()
    expect(screen.getByText(/Out of darts/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })
})
