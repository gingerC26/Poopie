import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ArcadeGame from './ArcadeGame'

describe('ArcadeGame', () => {
  it('opens on an arcade Start button', () => {
    render(<ArcadeGame />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
  })
})
