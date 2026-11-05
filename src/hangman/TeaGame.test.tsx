import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

    const filled = screen.getByRole('button', { name: 'Filled tea cup' })
    const cup = screen.getByRole('button', { name: 'Tea cup' })
    place(filled, root)
    place(cup, root)
    prime(filled.querySelector('img') as HTMLImageElement)
    prime(cup.querySelector('img') as HTMLImageElement)

    move(105, 105)
    expect(filled).toHaveClass('is-hot')
    expect(cup).not.toHaveClass('is-hot')

    move(115, 105)
    expect(filled).not.toHaveClass('is-hot')
    expect(cup).toHaveClass('is-hot')

    move(40, 40)
    expect(filled).not.toHaveClass('is-hot')
    expect(cup).not.toHaveClass('is-hot')
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
