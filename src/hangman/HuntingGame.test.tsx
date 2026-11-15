import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HuntingGame from './HuntingGame'
import * as huntingMaze from './huntingMaze'
import * as huntingSprites from './huntingSprites'
import { HUNTING_GRID, HUNTING_TIME_MS } from './settings'

describe('HuntingGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('draws a timed maze board', () => {
    render(<HuntingGame />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByText(/Wusheng Night Market in Tainan/i)).toBeInTheDocument()
    expect(screen.getByLabelText('WASD')).toBeInTheDocument()
    expect(screen.getByLabelText('arrow keys')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar', { name: 'Time' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Maze')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS / 2)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.queryByText(/Wusheng Night Market in Tainan/i)).not.toBeInTheDocument()
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
    const buyList = within(screen.getByLabelText('To Buy List'))
    expect(buyList.getByRole('heading', { name: 'To Buy List:' })).toBeInTheDocument()
    expect(buyList.getByText('Gua bao').closest('s')).toBeNull()
    expect(buyList.getByText('Bubble tea')).toBeInTheDocument()
    expect(buyList.getByText('Xiao long bao')).toBeInTheDocument()
    expect(buyList.getByText('Popcorn chicken')).toBeInTheDocument()
    expect(buyList.getByText('Skewers')).toBeInTheDocument()
    expect(buyList.getByText('Grilled oyster')).toBeInTheDocument()
    expect(screen.queryByAltText('Bubble tea')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Xiao long bao')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Popcorn chicken')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Skewers')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Grilled oyster')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS / 2)
    })
    expect(Number(timer.getAttribute('aria-valuenow'))).toBe(HUNTING_TIME_MS / 2)

    act(() => {
      vi.advanceTimersByTime(HUNTING_TIME_MS)
    })
    expect(screen.queryByRole('progressbar', { name: 'Time' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Maze')).not.toBeInTheDocument()
    expect(screen.getByText(/stores are closed now/i)).toBeInTheDocument()
    expect(screen.getByText(/Ich habe Hunger/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    expect(screen.getByLabelText('Maze')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Time' })).toBeInTheDocument()
    expect(screen.queryByText(/stores are closed now/i)).not.toBeInTheDocument()
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

  it('reveals the next food after the koala touches the current one', () => {
    const open = huntingMaze.generateHuntingMaze(4, () => 0, 0)
    vi.spyOn(huntingMaze, 'generateHuntingMaze').mockReturnValue(open)
    vi.spyOn(huntingSprites, 'placeHuntingPacs').mockReturnValue([
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ])
    vi.spyOn(huntingSprites, 'randomHuntingCell').mockReturnValue({ row: 2, col: 2 })

    const onWin = vi.fn()
    render(<HuntingGame onWin={onWin} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByAltText('Gua bao')).toBeInTheDocument()
    expect(screen.queryByAltText('Bubble tea')).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.queryByAltText('Gua bao')).not.toBeInTheDocument()
    expect(screen.getByAltText('Bubble tea')).toBeInTheDocument()
    const buyList = within(screen.getByLabelText('To Buy List'))
    expect(buyList.getByText('Gua bao').closest('s')).toBeTruthy()
    expect(buyList.getByText('Bubble tea').closest('s')).toBeNull()
    expect(onWin).not.toHaveBeenCalled()
  })

  it('awards the trophy after the last food is eaten', () => {
    const open = huntingMaze.generateHuntingMaze(8, () => 0, 0)
    vi.spyOn(huntingMaze, 'generateHuntingMaze').mockReturnValue(open)
    vi.spyOn(huntingSprites, 'placeHuntingPacs').mockReturnValue([
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ])
    vi.spyOn(huntingSprites, 'randomHuntingCell').mockImplementation((_size, avoid) => ({
      row: avoid?.row ?? 1,
      col: (avoid?.col ?? 1) + 1,
    }))
    const onWin = vi.fn()
    render(<HuntingGame onWin={onWin} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    for (let i = 0; i < 5; i++) fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByAltText('Grilled oyster')).toBeInTheDocument()
    expect(onWin).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.queryByAltText('Grilled oyster')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Maze')).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar', { name: 'Time' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Congratulations' })).toHaveTextContent(
      /yum yum food for the cabbage and the koala/i,
    )
    expect(onWin).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Congratulations' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByLabelText('Maze')).toBeInTheDocument()
    expect(screen.getByAltText('Gua bao')).toBeInTheDocument()
  })
})
