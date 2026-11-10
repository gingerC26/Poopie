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

export default function PasswordGame() {
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
  const photoCursor = useRef(0)
  const photoId = useRef(0)
  const drag = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  )

  const fireShutter = () => {
    setFlash((n) => n + 1)
    if (LOCKER_PHOTOS.length === 0) return
    const src = LOCKER_PHOTOS[photoCursor.current % LOCKER_PHOTOS.length]
    photoCursor.current += 1
    photoId.current += 1
    setThrown((list) => [...list, { id: photoId.current, src, ...randomThrow() }])
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    setHost(root.closest('.subpage--password') ?? root)
  }, [])

  const closeCamera = () => {
    drag.current = null
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
          thrown.map((photo) => (
            <div
              key={photo.id}
              className="locker-thrown-photo"
              style={
                {
                  '--from-x': photo.fromX,
                  '--from-y': photo.fromY,
                  '--to-x': photo.toX,
                  '--to-y': photo.toY,
                  '--spin': photo.rotate,
                } as CSSProperties
              }
            >
              <img src={photo.src} alt="" draggable={false} />
            </div>
          )),
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
