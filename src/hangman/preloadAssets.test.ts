import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { giftImageUrls, preloadGiftAssets, resetPreloadState } from './preloadAssets'

describe('preloadAssets', () => {
  beforeEach(() => {
    resetPreloadState()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetPreloadState()
  })

  it('lists backgrounds first and includes game pictures', () => {
    const urls = giftImageUrls()
    expect(urls[0]).toContain('/backgrounds/')
    expect(urls.some((url) => url.includes('/backgrounds/careful.jpg'))).toBe(true)
    expect(urls.some((url) => url.includes('/sprites/xlb.png'))).toBe(true)
    expect(urls.some((url) => url.includes('arcade.jpg?v=notext'))).toBe(true)
    expect(urls.some((url) => url.includes('/sprites/password/photos/'))).toBe(true)
  })

  it('warms pictures after idle without waiting', () => {
    const srcs: string[] = []
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
      cb()
      return 1
    })
    vi.stubGlobal(
      'Image',
      class {
        decoding = ''
        set src(value: string) {
          srcs.push(value)
        }
      },
    )
    preloadGiftAssets()
    expect(srcs.length).toBe(giftImageUrls().length)
    expect(srcs.some((url) => url.includes('/sprites/tea/'))).toBe(true)
  })
})
