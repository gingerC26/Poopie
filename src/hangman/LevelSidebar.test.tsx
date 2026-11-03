import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from './levels'
import LevelSidebar from './LevelSidebar'

describe('LevelSidebar', () => {
  it('masks locked names and shows unlocked titles', () => {
    render(
      <LevelSidebar
        levels={LEVELS}
        selectedId="1"
        unlocked={new Set(['1'])}
        won={new Set(['1'])}
        open
        remainingMs={0}
        onSelect={() => {}}
        onToggle={() => {}}
      />,
    )
    const careful = screen.getByRole('button', { name: /1\. Careful/ })
    expect(careful).toHaveClass('level-btn--unlocked')
    expect(careful).toHaveClass('level-btn--won')
    expect(careful.querySelector('.level-trophy-icon')).toHaveAttribute('src', '/icons/trophy.svg')
    expect(screen.getByRole('button', { name: /2\. \?+/ }).querySelector('.level-trophy')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Clear win records' })).not.toBeInTheDocument()
  })

  it('clears win records from the sidebar', async () => {
    const onClearWins = vi.fn()
    const user = userEvent.setup()
    render(
      <LevelSidebar
        levels={LEVELS}
        selectedId="1"
        unlocked={new Set(['1'])}
        won={new Set(['1'])}
        open
        remainingMs={0}
        onSelect={() => {}}
        onToggle={() => {}}
        onClearWins={onClearWins}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear win records' }))
    expect(onClearWins).toHaveBeenCalled()
  })

  it('selects a level and toggles the drawer', async () => {
    const onSelect = vi.fn()
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(
      <LevelSidebar
        levels={LEVELS}
        selectedId="1"
        unlocked={new Set()}
        open
        remainingMs={0}
        onSelect={onSelect}
        onToggle={onToggle}
      />,
    )
    await user.click(screen.getByRole('button', { name: /2\. \?+/ }))
    expect(onSelect).toHaveBeenCalledWith('2')
    await user.click(screen.getByRole('button', { name: 'Hide levels' }))
    expect(onToggle).toHaveBeenCalled()
  })
})
