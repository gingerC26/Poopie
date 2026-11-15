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

  it('hides Clear win records when the setting is off', () => {
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
        onClearWins={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Clear win records' })).not.toBeInTheDocument()
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

  it('disables Password and shows a tool icon while the level is closed', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <LevelSidebar
        levels={LEVELS}
        selectedId="1"
        unlocked={new Set()}
        open
        remainingMs={0}
        onSelect={onSelect}
        onToggle={() => {}}
      />,
    )
    const password = screen.getByRole('button', { name: /6\. \?+/ })
    expect(password).toBeDisabled()
    expect(password).toHaveClass('level-btn--closed')
    expect(password.querySelector('.level-trophy-icon')).toHaveAttribute(
      'src',
      '/icons/tool.png?v=ref',
    )
    expect(password.querySelector('.level-go')).toBeNull()
    await user.click(password)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
