import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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
    expect(screen.getByRole('button', { name: 'Kodak camera' })).toBeInTheDocument()
    expect(document.querySelector('.password-scene')).toHaveStyle({
      backgroundImage: 'url(/backgrounds/password-open.jpg)',
    })
  })

  it('keeps the camera out of the closed locker', () => {
    render(<PasswordGame />)
    expect(screen.queryByRole('button', { name: 'Kodak camera' })).not.toBeInTheDocument()
  })

  it('zooms the camera over a dark overlay', () => {
    const { container } = render(
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
    fireEvent.click(screen.getByRole('button', { name: 'Kodak camera' }))

    const zoomed = container.querySelector('.locker-camera-zoom')
    expect(zoomed).toBeTruthy()
    expect(container.querySelector('.subpage--password .locker-camera-dim')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Shutter' })).toBeInTheDocument()
    expect(screen.getByText('Click the shutter button!')).toBeInTheDocument()

    fireEvent.click(document.querySelector('.locker-camera-dim') as HTMLElement)
    expect(container.querySelector('.locker-camera-zoom')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close camera' }))
    expect(container.querySelector('.locker-camera-zoom')).toBeNull()
    expect(screen.queryByText('Click the shutter button!')).not.toBeInTheDocument()
  })

  it('drags the zoomed camera and keeps it until the close button is clicked', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Kodak camera' }))

    const zoomed = document.querySelector('.locker-camera-zoom') as HTMLElement
    fireEvent.pointerDown(zoomed, { pointerId: 1, clientX: 200, clientY: 180 })
    fireEvent.pointerMove(zoomed, { pointerId: 1, clientX: 248, clientY: 151 })
    expect(zoomed).toHaveStyle({
      transform: 'translate(calc(-50% + 48px), calc(-50% + -29px))',
    })
    fireEvent.pointerUp(zoomed, { pointerId: 1 })
    expect(document.querySelector('.locker-camera-zoom')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Shutter' }))
    expect(document.querySelector('.locker-camera-zoom')).toBeTruthy()
    expect(document.querySelector('.locker-camera-flash')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close camera' }))
    expect(document.querySelector('.locker-camera-zoom')).toBeNull()
  })

  it('throws locker photos in order when the shutter fires', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Kodak camera' }))

    const shutter = screen.getByRole('button', { name: 'Shutter' })
    fireEvent.click(shutter)
    fireEvent.click(shutter)
    fireEvent.click(shutter)
    fireEvent.click(shutter)

    const photos = [...document.querySelectorAll('.locker-thrown-photo img')] as HTMLImageElement[]
    expect(photos.map((img) => img.getAttribute('src'))).toEqual([
      '/sprites/password/photos/1.jpg',
      '/sprites/password/photos/2.jpg',
      '/sprites/password/photos/3.jpg',
      '/sprites/password/photos/1.jpg',
    ])

    const card = document.querySelector('.locker-thrown-photo') as HTMLElement
    expect(card.style.getPropertyValue('--spin')).toMatch(/-?\d+deg/)

    fireEvent.click(screen.getByRole('button', { name: 'Close camera' }))
    expect(document.querySelectorAll('.locker-thrown-photo')).toHaveLength(0)
    expect(screen.queryByLabelText('Trash')).not.toBeInTheDocument()
  })

  it('drags thrown photos and raises the dragged camera or photo', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Kodak camera' }))

    const shutter = screen.getByRole('button', { name: 'Shutter' })
    fireEvent.click(shutter)
    fireEvent.click(shutter)

    const photos = [...document.querySelectorAll('.locker-thrown-photo')] as HTMLElement[]
    const first = photos[0]
    const second = photos[1]
    expect(Number(second.style.zIndex)).toBeGreaterThan(Number(first.style.zIndex))

    const firstHandle = first.querySelector('.locker-thrown-photo-turn') as HTMLElement
    fireEvent.pointerDown(firstHandle, { pointerId: 2, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(firstHandle, { pointerId: 2, clientX: 140, clientY: 125 })
    expect(first.querySelector('.locker-thrown-photo-shift')).toHaveStyle({
      transform: 'translate(40px, 25px)',
    })
    expect(Number(first.style.zIndex)).toBeGreaterThan(Number(second.style.zIndex))
    fireEvent.pointerUp(firstHandle, { pointerId: 2 })

    const zoomed = document.querySelector('.locker-camera-zoom') as HTMLElement
    fireEvent.pointerDown(zoomed, { pointerId: 3, clientX: 200, clientY: 180 })
    expect(Number(zoomed.style.zIndex)).toBeGreaterThan(Number(first.style.zIndex))

    fireEvent.pointerDown(first, { pointerId: 5, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(first, { pointerId: 5, clientX: 80, clientY: 90 })
    expect(first.querySelector('.locker-thrown-photo-shift')).toHaveStyle({
      transform: 'translate(40px, 25px)',
    })
  })

  it('opens the trash while the pointer is over it and deletes on drop', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Kodak camera' }))
    fireEvent.click(screen.getByRole('button', { name: 'Shutter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Shutter' }))

    expect(screen.getByLabelText('Trash')).toBeInTheDocument()
    expect(screen.getByLabelText('Trash')).not.toHaveClass('locker-photo-trash--open')

    const photo = document.querySelector('.locker-thrown-photo-turn') as HTMLElement
    const trash = screen.getByLabelText('Trash')
    const box = (left: number, top: number, right: number, bottom: number) =>
      ({
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: bottom - top,
        x: left,
        y: top,
        toJSON() {},
      }) as DOMRect

    vi.spyOn(trash, 'getBoundingClientRect').mockReturnValue(box(200, 200, 260, 260))

    fireEvent.pointerDown(photo, { pointerId: 4, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(photo, { pointerId: 4, clientX: 20, clientY: 20 })
    expect(trash).not.toHaveClass('locker-photo-trash--open')

    fireEvent.pointerMove(photo, { pointerId: 4, clientX: 220, clientY: 220 })
    expect(trash).toHaveClass('locker-photo-trash--open')

    fireEvent.pointerUp(photo, { pointerId: 4, clientX: 220, clientY: 220 })
    expect(document.querySelectorAll('.locker-thrown-photo')).toHaveLength(1)
    expect(screen.getByLabelText('Trash')).not.toHaveClass('locker-photo-trash--open')
  })
})
