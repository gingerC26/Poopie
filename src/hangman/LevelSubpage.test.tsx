import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LEVELS } from './levels'
import LevelSubpage from './LevelSubpage'

describe('LevelSubpage', () => {
  it('opens the Careful dumpling scene for level 1', () => {
    render(<LevelSubpage level={LEVELS[0]} />)
    expect(screen.getByRole('heading', { name: 'Careful' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xiao long bao' })).toBeInTheDocument()
  })

  it('routes the other unlocked pages', () => {
    const { rerender } = render(<LevelSubpage level={LEVELS[1]} />)
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument()

    rerender(<LevelSubpage level={LEVELS[2]} />)
    expect(screen.getByRole('heading', { name: '3D' })).toBeInTheDocument()

    rerender(<LevelSubpage level={LEVELS[3]} />)
    expect(screen.getByRole('heading', { name: 'Twenty Seconds' })).toBeInTheDocument()
    expect(screen.getByText('Make a pot of authentic Chinese tea.')).toBeInTheDocument()
    expect(document.querySelector('.tea-scene')).toHaveStyle({
      backgroundImage: 'url(/backgrounds/twenty-seconds.jpg)',
    })
    expect(screen.getByRole('button', { name: 'Water pot' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tea leaves' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Big teapot' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Small teapot' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tea spoon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tea cup' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filled tea cup' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Instruction postcard' })).toBeInTheDocument()

    rerender(<LevelSubpage level={LEVELS[4]} />)
    expect(screen.getByRole('heading', { name: 'Memory' })).toBeInTheDocument()
    expect(screen.getByText('Fifth gift unlocked. Add the real note here.')).toBeInTheDocument()
  })
})
