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

function startPlaying() {
  fireEvent.click(screen.getByRole('button', { name: 'Start' }))
  fireEvent.click(screen.getByRole('button', { name: /I.m ready/i }))
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

  it('opens on Start, then briefs the board before play', () => {
    render(<ArcadeGame />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Dartboard')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Dartboard')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText(/Get to exactly 0 to win/i)).toBeInTheDocument()
    expect(screen.getByText(/You have 5 darts/i)).toBeInTheDocument()
    expect(screen.getByText(/Typhoon/i)).toBeInTheDocument()
    expect(screen.getByText(/Pushes the dart left or right/i)).toBeInTheDocument()
    expect(screen.getByLabelText('1 2 3 4 5 4 3 2 1')).toBeInTheDocument()
    expect(screen.getByText(/Land on a square/i)).toBeInTheDocument()
    expect(screen.queryByText(/bull/i)).not.toBeInTheDocument()
    expect(screen.getByText(/use < > or A D/i)).toBeInTheDocument()
    throwDart()
    expect(screen.getByText('20')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /I.m ready/i }))
    expect(screen.queryByRole('button', { name: /I.m ready/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Land on a square/i)).not.toBeInTheDocument()
  })

  it('checks out after four bulls and awards the trophy', () => {
    const onWin = vi.fn()
    render(<ArcadeGame onWin={onWin} />)
    startPlaying()
    throwDart()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('Hit 5!')).toBeInTheDocument()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    expect(screen.getByText('Hit 5!')).toBeInTheDocument()
    nextDart()
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
    startPlaying()
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    nextDart()
    throwDart()
    expect(screen.getByText('-4')).toBeInTheDocument()
    nextDart()
    expect(screen.getByText(/Math is hard/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })

  it('loses when the five darts are gone and the score is not zero', () => {
    vi.spyOn(arcadeDarts, 'scoreAtX').mockReturnValue(1)
    render(<ArcadeGame />)
    startPlaying()
    for (let i = 0; i < 4; i++) {
      throwDart()
      nextDart()
    }
    throwDart()
    nextDart()
    expect(screen.getByText(/You ran out of darts/i)).toBeInTheDocument()
    expect(screen.getByText(/Try again/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })
})
