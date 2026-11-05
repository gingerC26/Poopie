import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LOCKER_PIN, LOCKER_PIN_LENGTH } from './settings'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', '0', 'v'] as const

export default function PasswordGame() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    setHost(root.closest('.subpage--password') ?? root)
  }, [])

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
      }
      return
    }
    setPin((current) => (current.length >= LOCKER_PIN_LENGTH ? current : current + key))
  }

  return (
    <div ref={rootRef} className="locker-hotspots" aria-label="Lockers">
      <button
        type="button"
        className="locker-hot locker-hot--11"
        aria-label="Open locker 11"
        onClick={() => setOpen(true)}
      >
        <span className="locker-hot-hint">open</span>
      </button>
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
