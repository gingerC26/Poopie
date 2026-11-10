import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PasswordGame from './PasswordGame'

describe('PasswordGame', () => {
  it('marks locker 11 as a clickable open hotspot', () => {
    render(<PasswordGame />)
    const locker = screen.getByRole('button', { name: 'Open locker 11' })
    expect(locker).toHaveClass('locker-hot--11')
    expect(locker).toHaveTextContent('open')
  })

  it('opens a six-digit keypad that types, caps, and clears', () => {
    const { container } = render(
      <div className="subpage--password">
        <PasswordGame />
      </div>,
    )
    expect(screen.queryByRole('dialog', { name: 'Enter password' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open locker 11' }))
    expect(container.querySelector('.subpage--password .password-dim')).toBeTruthy()
    expect(screen.getByRole('dialog', { name: 'Enter password' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByLabelText('Entered password')).toHaveTextContent('12')

    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '7' }))
    expect(screen.getByLabelText('Entered password')).toHaveTextContent('123456')

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByLabelText('Entered password')).toHaveTextContent('')

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(document.querySelector('.password-dim') as HTMLElement)
    expect(screen.queryByRole('dialog', { name: 'Enter password' })).not.toBeInTheDocument()
  })

  it('ignores confirm until six digits, then shakes and clears a wrong PIN', () => {
    render(
      <div className="subpage--password">
        <PasswordGame />
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open locker 11' }))
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByLabelText('Entered password')).toHaveTextContent('12')
    expect(document.querySelector('.password-pad--shake')).toBeNull()

    for (const digit of '3456') {
      fireEvent.click(screen.getByRole('button', { name: digit }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.getByLabelText('Entered password')).toHaveTextContent('')
    expect(document.querySelector('.password-pad--shake')).toBeTruthy()
  })

  it('opens locker 11 when the correct PIN is confirmed', () => {
    render(
      <div className="subpage--password">
        <div
          className="password-scene"
          style={{ backgroundImage: 'url(/backgrounds/password.jpg)' }}
        >
          <PasswordGame />
        </div>
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open locker 11' }))
    for (const digit of '030226') {
      fireEvent.click(screen.getByRole('button', { name: digit }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(screen.queryByRole('dialog', { name: 'Enter password' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open locker 11' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Kodak camera' })).toBeInTheDocument()
    expect(document.querySelector('.password-scene')).toHaveStyle({
      backgroundImage: 'url(/backgrounds/password-open.jpg)',
    })
  })

  it('keeps the camera out of the closed locker', () => {
    render(<PasswordGame />)
    expect(screen.queryByRole('img', { name: 'Kodak camera' })).not.toBeInTheDocument()
  })
})
