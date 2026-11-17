import { describe, expect, it } from 'vitest'
import { LOCKER_PHOTOS } from './lockerPhotos'

describe('LOCKER_PHOTOS', () => {
  it('lists photos in reverse alphabetical filename order', () => {
    const names = LOCKER_PHOTOS.map((url) => url.split('/').pop() ?? url)
    expect(names).toEqual(
      [...names].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
    )
  })
})
