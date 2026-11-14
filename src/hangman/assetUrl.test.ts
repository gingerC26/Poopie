import { describe, expect, it } from 'vitest'
import { assetUrl } from './assetUrl'

describe('assetUrl', () => {
  it('keeps public files under Vite base', () => {
    expect(assetUrl('/sprites/xlb.png')).toBe('/sprites/xlb.png')
    expect(assetUrl('public/sprites/memory/answers.txt')).toBe(
      '/sprites/memory/answers.txt',
    )
    expect(assetUrl('/backgrounds/arcade.jpg?v=notext')).toBe(
      '/backgrounds/arcade.jpg?v=notext',
    )
  })
})
