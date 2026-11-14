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
    expect(screen.queryByRole('button', { name: 'Filled tea cup' })).not.toBeInTheDocument()
    expect(document.querySelector('.tea-prop--cup-filled')).toHaveAttribute('hidden')
    expect(screen.getByRole('button', { name: 'Instruction postcard' })).toBeInTheDocument()

    rerender(<LevelSubpage level={LEVELS[2]} />)
    expect(screen.getByRole('heading', { name: 'Hunting' })).toBeInTheDocument()
    expect(document.querySelector('.subpage--hunting')).toBeTruthy()
    expect(document.querySelector('.subpage--scene')).toHaveStyle({
      backgroundImage: 'url(/backgrounds/hunting.jpg?v=notext)',
    })
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Maze')).not.toBeInTheDocument()

    rerender(<LevelSubpage level={LEVELS[3]} />)
    expect(screen.getByRole('heading', { name: 'Memory' })).toBeInTheDocument()
    expect(screen.getByText('Enjoy the Sun Moon Lake view with popcorn chicken.')).toBeInTheDocument()
    expect(document.querySelector('.subpage--memory')).toBeTruthy()
    expect(document.querySelector('.subpage--scene')).toHaveStyle({
      backgroundImage: 'url(/backgrounds/memory.jpg?v=night2)',
    })
    expect(screen.getByRole('textbox', { name: 'Terminal' })).toBeInTheDocument()

    rerender(<LevelSubpage level={LEVELS[4]} />)
    expect(screen.getByRole('heading', { name: 'Arcade' })).toBeInTheDocument()
    expect(screen.getByText('A cozy date in a cold typhoon day.')).toBeInTheDocument()
    expect(document.querySelector('.subpage--arcade')).toBeTruthy()
    expect(document.querySelector('.subpage--scene')).toHaveStyle({
      backgroundImage: 'url(/backgrounds/arcade.jpg?v=notext)',
    })
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()

    rerender(<LevelSubpage level={LEVELS[5]} />)
    expect(screen.getByRole('heading', { name: 'Password' })).toBeInTheDocument()
    expect(screen.getByText('Open the right locker.')).toBeInTheDocument()
    expect(document.querySelector('.password-scene')).toHaveStyle({
      backgroundImage: 'url(/backgrounds/password.jpg)',
    })
    expect(screen.getByRole('button', { name: 'Open locker 11' })).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
  })
})
