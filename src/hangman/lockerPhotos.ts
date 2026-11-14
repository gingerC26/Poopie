import { assetUrl } from './assetUrl'

const photoModules = import.meta.glob(
  '../../public/sprites/password/photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true },
)

function publicUrl(path: string) {
  const file = path.split('/').pop() ?? ''
  return assetUrl(`/sprites/password/photos/${file}`)
}

const discovered = Object.keys(photoModules)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map(publicUrl)

/** Drop photos into `public/sprites/password/photos`. Names sort numerically (1.jpg, 2.jpg, …). */
export const LOCKER_PHOTOS =
  discovered.length > 0
    ? discovered
    : [
        assetUrl('/sprites/password/photos/1.jpg'),
        assetUrl('/sprites/password/photos/2.jpg'),
        assetUrl('/sprites/password/photos/3.jpg'),
      ]
