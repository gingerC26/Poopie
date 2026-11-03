import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CarefulGame from './CarefulGame'
import { DISH } from './carefulPath'
import { XLB_SPILL_MS } from './settings'

const VIEW = { x: 0, y: 0, left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }

function layoutField() {
  const field = document.querySelector('.careful-game') as HTMLElement
  const img = document.querySelector('.careful-bg') as HTMLImageElement
  field.getBoundingClientRect = () => ({ ...VIEW, toJSON() {} })
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 1280 })
  Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 720 })
  fireEvent.load(img)
  return { field, img }
}

function clientOf(pct: { x: number; y: number }) {
  return { clientX: (pct.x / 100) * 1280, clientY: (pct.y / 100) * 720 }
}

function parseFloor() {
  const attr = document.querySelector('.careful-maze-floor')?.getAttribute('points')
  if (!attr) throw new Error('maze missing')
  return attr.split(/\s+/).map((pair) => {
    const [x, y] = pair.split(',').map(Number)
    return { clientX: x, clientY: y }
  })
}

describe('CarefulGame', () => {
  it('renders the scene copy and the dumpling in the lunch box', () => {
    render(
      <CarefulGame title="Careful" body="Don't break the xiao-long-bao!" background="/backgrounds/careful.jpg" />,
    )
    expect(screen.getByRole('heading', { name: 'Careful' })).toBeInTheDocument()
    expect(screen.getByText("Don't break the xiao-long-bao!")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xiao long bao' })).toBeInTheDocument()
    expect(screen.getByText('Dip me in the sauce!')).toBeInTheDocument()
    expect(document.querySelector('.careful-maze')).toBeNull()
  })

  it('shows the maze on pointer down', () => {
    render(
      <CarefulGame title="Careful" body="Don't break the xiao-long-bao!" background="/backgrounds/careful.jpg" />,
    )
    layoutField()
    const xlb = screen.getByRole('button', { name: 'Xiao long bao' })
    fireEvent.pointerDown(xlb, { pointerId: 1, ...clientOf({ x: 18.7, y: 84.2 }) })
    expect(screen.queryByText('Dip me in the sauce!')).not.toBeInTheDocument()
    expect(document.querySelector('.careful-maze')).toBeTruthy()
    expect(document.querySelectorAll('.careful-maze-wall')).toHaveLength(2)
  })

  it('spills on a wall, then resets to the lunch box', () => {
    vi.useFakeTimers()
    render(
      <CarefulGame title="Careful" body="Don't break the xiao-long-bao!" background="/backgrounds/careful.jpg" />,
    )
    layoutField()
    const xlb = screen.getByRole('button', { name: 'Xiao long bao' })
    fireEvent.pointerDown(xlb, { pointerId: 1, ...clientOf({ x: 18.7, y: 84.2 }) })
    const wall = document.querySelector('.careful-maze-wall')?.getAttribute('points')
    if (!wall) throw new Error('wall missing')
    const bump = wall.split(/\s+/)[1]?.split(',').map(Number)
    if (!bump) throw new Error('wall point missing')
    fireEvent.pointerMove(xlb, { pointerId: 1, clientX: bump[0], clientY: bump[1] })
    expect(screen.getByRole('button', { name: 'Xiao long bao spilled' })).toHaveClass('xlb--spilled')
    expect(screen.getByText("I'm heartbroken!")).toBeInTheDocument()
    expect(document.querySelector('.xlb-stream')).toBeTruthy()
    expect(document.querySelector('.xlb-face')).toHaveAttribute('src', '/sprites/xlb-face.png')

    fireEvent.pointerMove(xlb, { pointerId: 1, clientX: 700, clientY: 90 })
    expect(screen.getByRole('button', { name: 'Xiao long bao spilled' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(XLB_SPILL_MS)
    })
    expect(screen.getByRole('button', { name: 'Xiao long bao' })).not.toHaveClass('xlb--spilled')
    expect(screen.getByText('Dip me in the sauce!')).toBeInTheDocument()
    expect(document.querySelector('.careful-maze')).toBeNull()
  })

  it('wins on the dish along the path and stays draggable with the original bun', () => {
    render(
      <CarefulGame title="Careful" body="Don't break the xiao-long-bao!" background="/backgrounds/careful.jpg" />,
    )
    layoutField()
    const start = clientOf({ x: 18.7, y: 84.2 })
    let xlb = screen.getByRole('button', { name: 'Xiao long bao' })
    fireEvent.pointerDown(xlb, { pointerId: 1, ...start })
    const floor = parseFloor()
    for (let i = 1; i < floor.length; i++) {
      const a = floor[i - 1]
      const b = floor[i]
      const steps = Math.max(1, Math.ceil(Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) / 8))
      for (let s = 1; s <= steps; s++) {
        const t = s / steps
        fireEvent.pointerMove(xlb, {
          pointerId: 1,
          clientX: a.clientX + (b.clientX - a.clientX) * t,
          clientY: a.clientY + (b.clientY - a.clientY) * t,
        })
      }
    }
    fireEvent.pointerMove(xlb, { pointerId: 1, ...clientOf(DISH) })
    xlb = screen.getByRole('button', { name: 'Xiao long bao in the sauce' })
    expect(xlb).toHaveClass('xlb--happy')
    expect(xlb.querySelector('img')?.getAttribute('src')).toBe('/sprites/xlb.png')
    expect(document.querySelector('.xlb-face')).toHaveAttribute('src', '/sprites/xlb-happy-face.png')
    expect(document.querySelectorAll('.xlb-heart')).toHaveLength(5)

    fireEvent.pointerUp(xlb, { pointerId: 1 })
    expect(screen.getByText("Yay! I'm yum yum!")).toBeInTheDocument()
    fireEvent.pointerDown(xlb, { pointerId: 1, ...clientOf(DISH) })
    expect(screen.getByText("Yay! I'm yum yum!")).toBeInTheDocument()
    fireEvent.pointerMove(xlb, { pointerId: 1, ...clientOf({ x: 70, y: 70 }) })
    expect(screen.getByRole('button', { name: 'Xiao long bao in the sauce' })).toBeInTheDocument()
    expect(document.querySelector('.xlb--spilled')).toBeNull()
  })
})
