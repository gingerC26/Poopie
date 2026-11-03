import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DISH } from '../hangman/carefulPath'
import { lettersIn } from '../hangman/levels'
import Home from './Home'

const VIEW = { x: 0, y: 0, left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }

function layoutCarefulField() {
  const field = document.querySelector('.careful-game') as HTMLElement
  const img = document.querySelector('.careful-bg') as HTMLImageElement
  field.getBoundingClientRect = () => ({ ...VIEW, toJSON() {} })
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 1280 })
  Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 720 })
  fireEvent.load(img)
}

function clientOf(pct: { x: number; y: number }) {
  return { clientX: (pct.x / 100) * 1280, clientY: (pct.y / 100) * 720 }
}

async function unlockCareful(user: ReturnType<typeof userEvent.setup>) {
  for (const letter of lettersIn('CAREFUL')) {
    await user.click(screen.getByRole('button', { name: letter }))
  }
}

function dipDumplingInSauce() {
  layoutCarefulField()
  const start = clientOf({ x: 18.7, y: 84.2 })
  const xlb = screen.getByRole('button', { name: 'Xiao long bao' })
  fireEvent.pointerDown(xlb, { pointerId: 1, ...start })
  const attr = document.querySelector('.careful-maze-floor')?.getAttribute('points')
  if (!attr) throw new Error('maze missing')
  const floor = attr.split(/\s+/).map((pair) => {
    const [x, y] = pair.split(',').map(Number)
    return { clientX: x, clientY: y }
  })
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
}

describe('Home', () => {
  it('starts on hangman with locked level names', () => {
    render(<Home />)
    expect(screen.getByLabelText('Letter keyboard')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1\. \?+/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xiao long bao' })).not.toBeInTheDocument()
  })

  it('unlocks Careful and shows the dumpling scene after solving the word', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await unlockCareful(user)
    expect(screen.getByRole('heading', { name: 'Careful' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xiao long bao' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1\. Careful/ })).toBeInTheDocument()
  })

  it('keeps a Careful trophy after sauce, remount, then clear wins', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Home />)
    await unlockCareful(user)
    dipDumplingInSauce()
    expect(screen.getByRole('button', { name: /1\. Careful/ }).querySelector('.level-trophy')).toBeTruthy()

    unmount()
    render(<Home />)
    const careful = screen.getByRole('button', { name: /1\. Careful/ })
    expect(careful.querySelector('.level-trophy-icon')).toHaveAttribute('src', '/icons/trophy.svg')

    await user.click(screen.getByRole('button', { name: 'Clear win records' }))
    expect(screen.getByRole('button', { name: /1\. Careful/ }).querySelector('.level-trophy')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Careful' })).toBeInTheDocument()
  })
})
