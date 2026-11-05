export type ParentMetrics = {
  left: number
  top: number
  width: number
  height: number
  offsetWidth: number
  offsetHeight: number
}

export type BoxMetrics = {
  offsetLeft: number
  offsetTop: number
  offsetWidth: number
  offsetHeight: number
  transform: string
  originX: number
  originY: number
}

export type TeaHitTarget = {
  id: string
  parent: ParentMetrics
  box: BoxMetrics
  pixels: Uint8ClampedArray | null
  imageWidth: number
  imageHeight: number
}

type SpriteSample = {
  pixels: Uint8ClampedArray
  width: number
  height: number
}

const sprites = new WeakMap<HTMLImageElement, SpriteSample>()

export function localPointInBox(
  parent: ParentMetrics,
  box: BoxMetrics,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  if (parent.offsetWidth === 0 || parent.offsetHeight === 0) return null
  if (parent.width === 0 || parent.height === 0) return null
  if (box.offsetWidth === 0 || box.offsetHeight === 0) return null

  const parentX = ((clientX - parent.left) / parent.width) * parent.offsetWidth
  const parentY = ((clientY - parent.top) / parent.height) * parent.offsetHeight
  const dx = parentX - (box.offsetLeft + box.originX)
  const dy = parentY - (box.offsetTop + box.originY)
  const delta = applyInverse(box.transform, dx, dy)
  if (!delta) return null

  const x = delta.x + box.originX
  const y = delta.y + box.originY
  if (x < 0 || y < 0 || x >= box.offsetWidth || y >= box.offsetHeight) return null
  return { x, y }
}

export function alphaAt(
  pixels: Uint8ClampedArray,
  imageWidth: number,
  imageHeight: number,
  localX: number,
  localY: number,
  layoutWidth: number,
  layoutHeight: number,
): number {
  if (imageWidth <= 0 || imageHeight <= 0 || layoutWidth <= 0 || layoutHeight <= 0) return 0
  const px = Math.floor((localX / layoutWidth) * imageWidth)
  const py = Math.floor((localY / layoutHeight) * imageHeight)
  if (px < 0 || py < 0 || px >= imageWidth || py >= imageHeight) return 0
  return pixels[(py * imageWidth + px) * 4 + 3] ?? 0
}

export function topHotProp(props: TeaHitTarget[], clientX: number, clientY: number): string | null {
  for (const prop of props) {
    if (!prop.pixels) continue
    const local = localPointInBox(prop.parent, prop.box, clientX, clientY)
    if (!local) continue
    const alpha = alphaAt(
      prop.pixels,
      prop.imageWidth,
      prop.imageHeight,
      local.x,
      local.y,
      prop.box.offsetWidth,
      prop.box.offsetHeight,
    )
    if (alpha > 0) return prop.id
  }
  return null
}

export function teaPropAtPoint(root: HTMLElement, clientX: number, clientY: number): string | null {
  const covered = document.elementFromPoint?.(clientX, clientY)?.closest('.subpage-copy')
  if (covered) return null
  return topHotProp(measureTeaProps(root), clientX, clientY)
}

function measureTeaProps(root: HTMLElement): TeaHitTarget[] {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>(':scope > .tea-prop')].reverse()
  const measured: TeaHitTarget[] = []

  for (const button of buttons) {
    if (button.hidden) continue
    const img = button.querySelector('img')
    const parent = button.offsetParent
    if (!(img instanceof HTMLImageElement) || !(parent instanceof HTMLElement)) continue

    const rect = parent.getBoundingClientRect()
    const origin = parseTransformOrigin(
      getComputedStyle(button).transformOrigin,
      button.offsetWidth,
      button.offsetHeight,
    )
    const sample = sampleSprite(img)
    measured.push({
      id: button.dataset.prop ?? '',
      parent: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        offsetWidth: parent.offsetWidth,
        offsetHeight: parent.offsetHeight,
      },
      box: {
        offsetLeft: button.offsetLeft,
        offsetTop: button.offsetTop,
        offsetWidth: button.offsetWidth,
        offsetHeight: button.offsetHeight,
        transform: getComputedStyle(button).transform,
        originX: origin.x,
        originY: origin.y,
      },
      pixels: sample?.pixels ?? null,
      imageWidth: sample?.width ?? 0,
      imageHeight: sample?.height ?? 0,
    })
  }

  return measured
}

function sampleSprite(img: HTMLImageElement): SpriteSample | null {
  const cached = sprites.get(img)
  if (cached) return cached
  if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return null

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  context.drawImage(img, 0, 0)
  try {
    const image = context.getImageData(0, 0, canvas.width, canvas.height)
    const sample = { pixels: image.data, width: image.width, height: image.height }
    sprites.set(img, sample)
    return sample
  } catch {
    return null
  }
}

function applyInverse(transform: string, x: number, y: number) {
  const matrix = readMatrix(transform)
  if (!matrix) return null
  const [a, b, c, d, e, f] = matrix
  const det = a * d - c * b
  if (!Number.isFinite(det) || Math.abs(det) < 1e-8) return null
  const nextX = (d * x - c * y + (c * f - d * e)) / det
  const nextY = (-b * x + a * y + (b * e - a * f)) / det
  if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return null
  return { x: nextX, y: nextY }
}

function readMatrix(transform: string): number[] | null {
  if (!transform || transform === 'none') return [1, 0, 0, 1, 0, 0]
  const matrix = transform.match(/matrix\(([^)]+)\)/)
  if (matrix?.[1]) return splitNumbers(matrix[1], 6)
  const matrix3d = transform.match(/matrix3d\(([^)]+)\)/)
  if (!matrix3d?.[1]) return null
  const values = splitNumbers(matrix3d[1], 16)
  if (!values) return null
  return [values[0], values[1], values[4], values[5], values[12], values[13]]
}

function splitNumbers(source: string, count: number) {
  const values = source
    .split(',')
    .map((part) => Number.parseFloat(part))
  if (values.length !== count || values.some((value) => !Number.isFinite(value))) return null
  return values
}

function parseTransformOrigin(origin: string, width: number, height: number) {
  const [xToken = '50%', yToken = '50%'] = origin.trim().split(/\s+/)
  return {
    x: resolveLength(xToken, width),
    y: resolveLength(yToken, height),
  }
}

function resolveLength(token: string, size: number) {
  if (token.endsWith('%')) return (Number.parseFloat(token) / 100) * size
  if (token === 'center') return size / 2
  if (token === 'left' || token === 'top') return 0
  if (token === 'right' || token === 'bottom') return size
  const value = Number.parseFloat(token)
  return Number.isFinite(value) ? value : size / 2
}
