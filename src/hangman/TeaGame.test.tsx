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
    expect(screen.queryByText('Tea Cup is clicked!')).not.toBeInTheDocument()
  })

  it('marks the spoon with a check and every other prop with a cross', () => {
    render(<TeaGame />)
    fireEvent.click(screen.getByRole('button', { name: 'Tea spoon' }))
    expect(screen.getByText('Spoon is clicked!').closest('.tea-notice')).toHaveClass('tea-notice--ok')

    fireEvent.click(screen.getByRole('button', { name: 'Water pot' }))
    expect(screen.getByText('Water Pot is clicked!').closest('.tea-notice')).toHaveClass('tea-notice--no')

    fireEvent.click(screen.getByRole('button', { name: 'Tea cup' }))
    expect(screen.getByText('Tea Cup is clicked!').closest('.tea-notice')).toHaveClass('tea-notice--no')
  })

  it('keeps at most three notices and clears them after three seconds', () => {
    vi.useFakeTimers()
    render(<TeaGame />)
    fireEvent.click(screen.getByRole('button', { name: 'Water pot' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tea leaves' }))
    fireEvent.click(screen.getByRole('button', { name: 'Big teapot' }))
    fireEvent.click(screen.getByRole('button', { name: 'Small teapot' }))

    expect(screen.queryByText('Water Pot is clicked!')).not.toBeInTheDocument()
    expect(screen.getByText('Tea Leaves is clicked!')).toBeInTheDocument()
    expect(screen.getByText('Tea Pot (Big) is clicked!')).toBeInTheDocument()
    expect(screen.getByText('Tea Pot (Small) is clicked!')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(TEA_NOTICE_MS - 1)
    })
    expect(screen.getByText('Tea Pot (Small) is clicked!')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByText(/is clicked!/)).not.toBeInTheDocument()
  })
})

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
