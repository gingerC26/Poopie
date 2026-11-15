import { assetUrl } from './assetUrl'
import { HUNTING_PACS } from './huntingSprites'
import { LEVELS } from './levels'
import { LOCKER_PHOTOS } from './lockerPhotos'

const publicImages = import.meta.glob(
  '../../public/**/*.{jpg,jpeg,png,webp,svg,JPG,JPEG,PNG,WEBP,SVG}',
  { eager: true },
)

/** Cache-busting query strings the games actually request. */
const VERSIONED = [
  '/backgrounds/arcade.jpg?v=notext',
  '/backgrounds/memory.jpg?v=night2',
  '/backgrounds/hunting.jpg?v=notext',
  '/sprites/tea/tea-leaves.png?v=pottery2',
  '/sprites/password/kodak-camera.png?v=shutter',
  '/sprites/hunting/koala.png?v=alpha',
  '/sprites/hunting/gua-bao.png?v=alpha',
  '/sprites/hunting/boba.png?v=alpha',
  '/sprites/hunting/xlb.png?v=alpha',
  '/sprites/hunting/popcorn-chicken.png?v=alpha',
  '/sprites/hunting/skewers.png?v=alpha',
  '/sprites/hunting/grilled-oyster.png?v=alpha',
]

const EXTRA = [
  '/backgrounds/password-open.jpg',
  '/sprites/tea/postcard-clip.jpg',
  '/sprites/tea/postcard-stamp.png',
  '/sprites/arcade/checkout.jpg',
  '/sprites/careful/win-1.jpg',
  '/sprites/careful/win-2.jpg',
  '/sprites/memory/win.jpg',
  '/sprites/hunting/win-1.jpg',
  '/sprites/hunting/win-2.jpg',
  '/sprites/xlb.png',
  '/sprites/xlb-face.png',
  '/sprites/xlb-happy-face.png',
  '/sprites/xlb-heart.png',
  '/icons/trophy.svg',
]

const warming = new Set<string>()

export function resetPreloadState() {
  warming.clear()
}

function fromPublicGlob() {
  return Object.keys(publicImages).map((path) => {
    const file = path.replace(/^.*\/public\//, '')
    return assetUrl(file)
  })
}

function rank(url: string) {
  if (url.includes('/backgrounds/')) return 0
  if (url.includes('/win')) return 2
  return 1
}

export function giftImageUrls() {
  const urls = [
    ...fromPublicGlob(),
    ...LEVELS.flatMap((level) => (level.background ? [assetUrl(level.background)] : [])),
    ...VERSIONED.map(assetUrl),
    ...EXTRA.map(assetUrl),
    ...LOCKER_PHOTOS,
    ...HUNTING_PACS.map((pac) => pac.src),
  ]
  return [...new Set(urls)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

function whenIdle(fn: () => void) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(fn, { timeout: 400 })
    return
  }
  setTimeout(fn, 0)
}

function warmImage(src: string) {
  if (warming.has(src) || typeof Image === 'undefined') return
  warming.add(src)
  const img = new Image()
  img.decoding = 'async'
  img.src = src
}

/** Warm pictures after hangman paints. Does not wait, so the board stays usable. */
export function preloadGiftAssets() {
  const urls = giftImageUrls()
  let i = 0
  const batch = 4
  const pump = () => {
    for (let n = 0; n < batch && i < urls.length; n++) warmImage(urls[i++])
    if (i < urls.length) whenIdle(pump)
  }
  whenIdle(pump)
}
