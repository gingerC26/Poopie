import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { LOCKER_PHOTOS } from './lockerPhotos'
import { LOCKER_PIN, LOCKER_PIN_LENGTH } from './settings'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', '0', 'v'] as const
const OPEN_BG = 'url(/backgrounds/password-open.jpg)'

type ThrownPhoto = {
  id: number
  src: string
  fromX: string
  fromY: string
  toX: string
  toY: string
  rotate: string
  dx: number
  dy: number
  layer: number
}

function randomThrow(): Omit<ThrownPhoto, 'id' | 'src'> {
  const rotate = Math.round(Math.random() * 60 - 30)
  const toX = 16 + Math.random() * 68
  const toY = 16 + Math.random() * 68
  const edge = Math.floor(Math.random() * 8)
  const from = [
    { fromX: -22, fromY: toY },
    { fromX: 122, fromY: toY },
    { fromX: toX, fromY: -22 },
    { fromX: toX, fromY: 122 },
    { fromX: -22, fromY: -22 },
    { fromX: 122, fromY: -22 },
    { fromX: -22, fromY: 122 },
    { fromX: 122, fromY: 122 },
  ][edge]
  return {
    fromX: `${from.fromX}%`,
    fromY: `${from.fromY}%`,
    toX: `${toX}%`,
    toY: `${toY}%`,
    rotate: `${rotate}deg`,
  }
}

function pointerHitsTrash(clientX: number, clientY: number, trashEl: HTMLElement | null) {
  if (!trashEl) return false
  const box = trashEl.getBoundingClientRect()
  return clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom
}

type Props = {
  onWin?: () => void
}

export default function PasswordGame({ onWin }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [flash, setFlash] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [thrown, setThrown] = useState<ThrownPhoto[]>([])
  const [cameraLayer, setCameraLayer] = useState(31)
  const [trashOpen, setTrashOpen] = useState(false)
  const photoCursor = useRef(0)
  const photoId = useRef(0)
  const won = useRef(false)
  const stack = useRef(40)
  const trashRef = useRef<HTMLDivElement>(null)
  const trashOpenRef = useRef(false)
  const drag = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  )
  const photoDrag = useRef<{
    id: number
    startX: number
    startY: number
    origX: number
    origY: number
  } | null>(null)

  const bringFront = () => {
    stack.current += 1
    return stack.current
  }

  const setOverTrash = (over: boolean) => {
    trashOpenRef.current = over
    setTrashOpen(over)
  }

  const fireShutter = () => {
    if (!won.current) {
      won.current = true
      onWin?.()
    }
    setFlash((n) => n + 1)
    if (LOCKER_PHOTOS.length === 0) return
    const src = LOCKER_PHOTOS[photoCursor.current % LOCKER_PHOTOS.length]
    photoCursor.current += 1
    photoId.current += 1
    const layer = bringFront()
    setThrown((list) => [
      ...list,
      { id: photoId.current, src, layer, dx: 0, dy: 0, ...randomThrow() },
    ])
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    setHost(root.closest('.subpage--password') ?? root)
  }, [])

  const closeCamera = () => {
    drag.current = null
    photoDrag.current = null
    trashOpenRef.current = false
    setTrashOpen(false)
    setThrown([])
    setPan({ x: 0, y: 0 })
    setFlash(0)
    setCameraOpen(false)
  }

  useEffect(() => {
    if (!cameraOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCamera()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cameraOpen])

  const close = () => {
    setOpen(false)
    setPin('')
  }

  const press = (key: (typeof KEYS)[number]) => {
    if (key === 'x') {
      setPin('')
      return
    }
    if (key === 'v') {
      if (pin.length < LOCKER_PIN_LENGTH) return
      if (pin !== LOCKER_PIN) {
        setPin('')
        setShake((n) => n + 1)
        return
      }
      const scene = rootRef.current?.closest('.password-scene')
      if (scene instanceof HTMLElement) scene.style.backgroundImage = OPEN_BG
      setUnlocked(true)
      close()
      return
    }
    setPin((current) => (current.length >= LOCKER_PIN_LENGTH ? current : current + key))
  }

  return (
    <div ref={rootRef} className="locker-hotspots" aria-label="Lockers">
      {!unlocked && (
        <button
          type="button"
          className="locker-hot locker-hot--11"
          aria-label="Open locker 11"
          onClick={() => setOpen(true)}
        >
          <span className="locker-hot-hint">open</span>
        </button>
      )}
      {unlocked && (
        <button
          type="button"
          className="locker-camera"
          aria-label="Kodak camera"
          onClick={() => {
            setPan({ x: 0, y: 0 })
            setCameraOpen(true)
          }}
        >
          <img src="/sprites/password/kodak-camera.png?v=shutter" alt="" draggable={false} />
        </button>
      )}
      {cameraOpen &&
        host &&
        createPortal(
          <>
            <div className="locker-camera-dim" />
            <button
              type="button"
              className="locker-camera-close"
              aria-label="Close camera"
              onClick={closeCamera}
            >
              ×
            </button>
            <p className="locker-camera-hint">Click the shutter button!</p>
            <div
              className="locker-camera-zoom"
              aria-label="Drag camera"
              style={{
                zIndex: cameraLayer,
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
              }}
              onPointerDown={(event) => {
                if (event.target !== event.currentTarget && !(event.target instanceof HTMLImageElement)) {
                  return
                }
                event.preventDefault()
                event.stopPropagation()
                try {
                  event.currentTarget.setPointerCapture(event.pointerId)
                } catch {
                  /* untrusted/synthetic pointers may not capture */
                }
                setCameraLayer(bringFront())
                drag.current = {
                  startX: event.clientX,
                  startY: event.clientY,
                  origX: pan.x,
                  origY: pan.y,
                }
              }}
              onPointerMove={(event) => {
                if (!drag.current) return
                setPan({
                  x: drag.current.origX + event.clientX - drag.current.startX,
                  y: drag.current.origY + event.clientY - drag.current.startY,
                })
              }}
              onPointerUp={(event) => {
                drag.current = null
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId)
                }
              }}
              onPointerCancel={(event) => {
                drag.current = null
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId)
                }
              }}
            >
              <img src="/sprites/password/kodak-camera.png?v=shutter" alt="Kodak camera" draggable={false} />
              <button
                type="button"
                className="locker-camera-shutter"
                aria-label="Shutter"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={fireShutter}
              />
              {flash > 0 && <div key={flash} className="locker-camera-flash" aria-hidden="true" />}
            </div>
          </>,
          host,
        )}
      {thrown.length > 0 &&
        host &&
        createPortal(
          <>
          {thrown.map((photo) => (
            <div
              key={photo.id}
              className="locker-thrown-photo"
              aria-label="Thrown photo"
              style={
                {
                  zIndex: photo.layer,
                  '--from-x': photo.fromX,
                  '--from-y': photo.fromY,
                  '--to-x': photo.toX,
                  '--to-y': photo.toY,
                  '--spin': photo.rotate,
                } as CSSProperties
              }
            >
              <div
                className="locker-thrown-photo-shift"
                style={{ transform: `translate(${photo.dx}px, ${photo.dy}px)` }}
              >
                <div
                  className="locker-thrown-photo-turn"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    try {
                      event.currentTarget.setPointerCapture(event.pointerId)
                    } catch {
                      /* untrusted/synthetic pointers may not capture */
                    }
                    const layer = bringFront()
                    photoDrag.current = {
                      id: photo.id,
                      startX: event.clientX,
                      startY: event.clientY,
                      origX: photo.dx,
                      origY: photo.dy,
                    }
                    setThrown((list) =>
                      list.map((item) => (item.id === photo.id ? { ...item, layer } : item)),
                    )
                    setOverTrash(pointerHitsTrash(event.clientX, event.clientY, trashRef.current))
                  }}
                  onPointerMove={(event) => {
                    const dragState = photoDrag.current
                    if (!dragState || dragState.id !== photo.id) return
                    const dx = dragState.origX + event.clientX - dragState.startX
                    const dy = dragState.origY + event.clientY - dragState.startY
                    setThrown((list) =>
                      list.map((item) => (item.id === photo.id ? { ...item, dx, dy } : item)),
                    )
                    setOverTrash(pointerHitsTrash(event.clientX, event.clientY, trashRef.current))
                  }}
                  onPointerUp={(event) => {
                    photoDrag.current = null
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId)
                    }
                    const dropInTrash = pointerHitsTrash(
                      event.clientX,
                      event.clientY,
                      trashRef.current,
                    )
                    setOverTrash(false)
                    if (dropInTrash) {
                      setThrown((list) => list.filter((item) => item.id !== photo.id))
                    }
                  }}
                  onPointerCancel={(event) => {
                    if (photoDrag.current?.id === photo.id) photoDrag.current = null
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId)
                    }
                    setOverTrash(false)
                  }}
                >
                  <img src={photo.src} alt="" draggable={false} />
                </div>
              </div>
            </div>
          ))}
          <div
            ref={trashRef}
            className={`locker-photo-trash${trashOpen ? ' locker-photo-trash--open' : ''}`}
            aria-label="Trash"
            style={{ zIndex: 1_000_000 }}
          >
            <TrashCanIcon />
          </div>
          </>,
          host,
        )}
      {open &&
        host &&
        createPortal(
          <>
            <div className="password-dim" onClick={close} />
            <div
              key={shake}
              className={`password-pad${shake ? ' password-pad--shake' : ''}`}
              role="dialog"
              aria-label="Enter password"
            >
              <p className="password-screen" aria-live="polite" aria-label="Entered password">
                {Array.from({ length: LOCKER_PIN_LENGTH }, (_, index) => (
                  <span key={index} className="password-digit">
                    {pin[index] ?? ''}
                  </span>
                ))}
              </p>
              <div className="password-keys">
                {KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`password-key${key === 'x' ? ' password-key--clear' : ''}${key === 'v' ? ' password-key--ok' : ''}`}
                    aria-label={key === 'x' ? 'Clear' : key === 'v' ? 'Confirm' : key}
                    onClick={() => press(key)}
                  >
                    {key === 'x' ? <CrossIcon /> : key === 'v' ? <CheckIcon /> : key}
                  </button>
                ))}
              </div>
            </div>
          </>,
          host,
        )}
    </div>
  )
}

function TrashCanIcon() {
  return (
    <svg viewBox="0 0 64 72" aria-hidden="true">
      <g className="locker-photo-trash-lid">
        <rect x="22" y="4" width="20" height="7" rx="2.2" />
        <rect x="8" y="12" width="48" height="7" rx="2.4" />
      </g>
      <path d="M12 22h40l-3.6 42.5a6 6 0 0 1-6 5.5H21.6a6 6 0 0 1-6-5.5Z" />
      <path
        d="M24 30v28M32 30v28M40 30v28"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 12.5 10.2 16.2 17.5 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 7 17 17M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
