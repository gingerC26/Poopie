import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TEA_NOTICE_MS } from './settings'
import TeaGame from './TeaGame'

const alphas = new Map<string, number[]>([
  ['Filled tea cup', [255, 0, 0, 255, 0, 0, 0, 0]],
  ['Tea cup', [0, 0, 0, 0, 0, 0, 0, 255]],
])

const elementFromPoint = document.elementFromPoint

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.elementFromPoint = elementFromPoint
})

describe('TeaGame', () => {
  it('fades the opaque sprite under the pointer and skips transparent pixels', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type: string) => {
      if (type !== '2d') return null
      let pixels = new Uint8ClampedArray()
      return {
        drawImage(image: HTMLImageElement) {
          pixels = Uint8ClampedArray.from(alphas.get(image.alt) ?? [])
        },
        getImageData(_x: number, _y: number, width: number, height: number) {
          return { data: pixels, width, height, colorSpace: 'srgb' }
        },
      } as unknown as CanvasRenderingContext2D
    })

    render(<TeaGame />)
    const root = document.querySelector('.tea-props') as HTMLElement
    root.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        width: 1000,
        height: 500,
        right: 1000,
        bottom: 500,
        toJSON() {},
      }) as DOMRect
    Object.defineProperty(root, 'offsetWidth', { configurable: true, value: 1000 })
    Object.defineProperty(root, 'offsetHeight', { configurable: true, value: 500 })
    document.elementFromPoint = () => null

    const filled = document.querySelector('.tea-prop--cup-filled') as HTMLButtonElement
    const cup = screen.getByRole('button', { name: 'Tea cup' })
    expect(filled).not.toBeVisible()
    expect(filled).toBeDisabled()
    place(filled, root)
    place(cup, root)
    prime(filled.querySelector('img') as HTMLImageElement)
    prime(cup.querySelector('img') as HTMLImageElement)

    move(105, 105)
    expect(filled).not.toHaveClass('is-hot')
    expect(cup).not.toHaveClass('is-hot')

    move(115, 105)
    expect(filled).not.toHaveClass('is-hot')
    expect(cup).toHaveClass('is-hot')

    move(40, 40)
    expect(filled).not.toHaveClass('is-hot')
    expect(cup).not.toHaveClass('is-hot')
  })

  it('starts with the filled tea cup inactive', () => {
    render(<TeaGame />)
    const filled = document.querySelector('.tea-prop--cup-filled') as HTMLButtonElement
    expect(filled).not.toBeVisible()
    expect(filled).toBeDisabled()
    fireEvent.click(filled)
    expect(screen.queryByText('Tea is ready!')).not.toBeInTheDocument()
  })

  it('follows the brew order and swaps in the filled cup when tea is ready', () => {
    render(<TeaGame />)
    brewTea()
    expect(screen.queryByRole('button', { name: 'Tea cup' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filled tea cup' })).toBeVisible()
  })

  it('shows brew time from pouring water to pouring the small pot', () => {
    vi.useFakeTimers()
    const { container } = render(
      <div className="subpage--tea">
        <TeaGame />
      </div>,
    )
    brewTea({ steepMs: 23_400 })
    const dialog = screen.getByRole('dialog', { name: 'Brew time' })
    expect(dialog).toHaveTextContent('Tea brewed for 23.4 seconds.')
    expect(dialog).toHaveTextContent('Drink the tea to play again.')
    expect(container.querySelector('.subpage--tea .tea-result')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Brew time' })).not.toBeInTheDocument()
  })

  it('resets the brew after drinking the filled cup', () => {
    render(<TeaGame />)
    brewTea()
    fireEvent.click(screen.getByRole('button', { name: 'Filled tea cup' }))
    expect(screen.queryByRole('dialog', { name: 'Brew time' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tea cup' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Filled tea cup' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tea spoon' }))
    expect(screen.getByText('Picked up the spoon!')).toBeInTheDocument()
  })

  it('resets to the first step after a wrong item', () => {
    render(<TeaGame />)
    fireEvent.click(screen.getByRole('button', { name: 'Tea spoon' }))
    fireEvent.click(screen.getByRole('button', { name: 'Water pot' }))
    expect(screen.getByText('Wrong item, start again!').closest('.tea-notice')).toHaveClass(
      'tea-notice--no',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Tea leaves' }))
    expect(screen.getAllByText('Wrong item, start again!')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Tea spoon' }))
    expect(screen.getByText('Picked up the spoon!')).toBeInTheDocument()
  })

  it('keeps at most three notices and clears them after three seconds', () => {
    vi.useFakeTimers()
    render(<TeaGame />)
    fireEvent.click(screen.getByRole('button', { name: 'Water pot' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tea leaves' }))
    fireEvent.click(screen.getByRole('button', { name: 'Big teapot' }))
    fireEvent.click(screen.getByRole('button', { name: 'Small teapot' }))

    expect(screen.getAllByText('Wrong item, start again!')).toHaveLength(3)

    act(() => {
      vi.advanceTimersByTime(TEA_NOTICE_MS - 1)
    })
    expect(screen.getAllByText('Wrong item, start again!')).toHaveLength(3)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByText('Wrong item, start again!')).not.toBeInTheDocument()
  })
})

const BREW_CLICKS = [
  ['Tea spoon', 'Picked up the spoon!'],
  ['Tea leaves', 'Scooped up some tea leaves!'],
  ['Big teapot', 'Put leaves in the tea pot!'],
  ['Water pot', 'Picked up the water pot!'],
  ['Big teapot', 'Poured hot water in the tea pot!'],
  ['Big teapot', 'Picked up the big tea pot!'],
  ['Small teapot', 'Poured tea in the small tea pot!'],
  ['Small teapot', 'Picked up the small tea pot!'],
  ['Tea cup', 'Tea is ready!'],
] as const

function brewTea({ steepMs = 0 } = {}) {
  BREW_CLICKS.forEach(([label, message], index) => {
    if (index === 5 && steepMs) {
      act(() => {
        vi.advanceTimersByTime(steepMs)
      })
    }
    fireEvent.click(screen.getByRole('button', { name: label }))
    if (index === BREW_CLICKS.length - 1) {
      expect(screen.queryByText(message)).not.toBeInTheDocument()
      return
    }
    expect(screen.getByText(message).closest('.tea-notice')).toHaveClass('tea-notice--ok')
  })
}

function place(button: HTMLElement, root: HTMLElement) {
  Object.defineProperty(button, 'offsetParent', { configurable: true, get: () => root })
  Object.defineProperty(button, 'offsetLeft', { configurable: true, value: 100 })
  Object.defineProperty(button, 'offsetTop', { configurable: true, value: 100 })
  Object.defineProperty(button, 'offsetWidth', { configurable: true, value: 20 })
  Object.defineProperty(button, 'offsetHeight', { configurable: true, value: 10 })
}

function prime(img: HTMLImageElement) {
  Object.defineProperty(img, 'complete', { configurable: true, value: true })
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 2 })
  Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 1 })
}

function move(clientX: number, clientY: number) {
  fireEvent.pointerMove(window, { clientX, clientY, pointerType: 'mouse' })
}
