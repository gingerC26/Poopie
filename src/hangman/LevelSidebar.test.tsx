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
        open
        remainingMs={0}
        onSelect={() => {}}
        onToggle={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: /1\. Careful/ })).toHaveClass('level-btn--unlocked')
    expect(screen.getByRole('button', { name: /2\. \?+/ })).toBeInTheDocument()
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
