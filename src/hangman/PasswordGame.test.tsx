import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PasswordGame from './PasswordGame'

describe('PasswordGame', () => {
  it('marks locker 11 as a clickable open hotspot', () => {
    render(<PasswordGame />)
    const locker = screen.getByRole('button', { name: 'Open locker 11' })
    expect(locker).toHaveClass('locker-hot--11')
    expect(locker).toHaveTextContent('open')
  })
})
