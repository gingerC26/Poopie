import { useEffect, useId, useState } from 'react'
import { COOLDOWN_MS } from './constants'

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

type Props = {
  remainingMs: number
}

export default function Hourglass({ remainingMs }: Props) {
  const uid = useId().replace(/:/g, '')
  const [displayMs, setDisplayMs] = useState(remainingMs)

  useEffect(() => {
    setDisplayMs(remainingMs)
    if (remainingMs <= 0) return
    const started = performance.now()
    const from = remainingMs
    let frame = 0
    const tick = (now: number) => {
      const next = Math.max(0, from - (now - started))
      setDisplayMs(next)
      if (next > 0) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [remainingMs])

  const ready = displayMs <= 0
  const remaining = ready ? 1 : Math.min(1, displayMs / COOLDOWN_MS)
  const spilled = 1 - remaining
  const flowing = !ready

  const topH = 34 * remaining
  const botH = 34 * spilled

  return (
    <div
      className={`hourglass ${ready ? 'hourglass--ready' : ''} ${flowing ? 'hourglass--flowing' : ''}`}
      title={ready ? 'Ready to play' : 'Next round unlocks after this countdown'}
    >
      <svg viewBox="0 0 72 108" className="hourglass-icon" aria-hidden="true">
        <defs>
          <clipPath id={`${uid}-top`}>
            <path d="M20 18 H52 C54 18 55 20 54 26 C50 40 40 47 36 52 C32 47 22 40 18 26 C17 20 18 18 20 18 Z" />
          </clipPath>
          <clipPath id={`${uid}-bot`}>
            <path d="M20 90 H52 C54 90 55 88 54 82 C50 68 40 61 36 56 C32 61 22 68 18 82 C17 88 18 90 20 90 Z" />
          </clipPath>
          <linearGradient id={`${uid}-sand`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd27a" />
            <stop offset="100%" stopColor="#e89a4c" />
          </linearGradient>
        </defs>

        <rect x="16" y="6" width="40" height="11" rx="3.5" fill="#f4b4c8" />
        <rect x="16" y="91" width="40" height="11" rx="3.5" fill="#f4b4c8" />

        <path
          d="M20 18 H52 C54 18 55 20 54 26 C50 40 40 47 36 52 C40 57 50 64 54 78 C55 84 54 90 52 90 H20 C18 90 17 84 18 78 C22 64 32 57 36 52 C32 47 22 40 18 26 C17 20 18 18 20 18 Z"
          fill="#fff8fb"
          fillOpacity="0.35"
          stroke="#e8a0b8"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        <g clipPath={`url(#${uid}-top)`}>
          <rect
            x="16"
            y={52 - topH}
            width="40"
            height={topH}
            fill={`url(#${uid}-sand)`}
          />
        </g>
        <g clipPath={`url(#${uid}-bot)`}>
          <rect
            x="16"
            y={90 - botH}
            width="40"
            height={botH}
            fill={`url(#${uid}-sand)`}
          />
        </g>

        {flowing && (
          <g className="hourglass-stream">
            <rect x="34.2" y="50" width="3.6" height="8" rx="1.8" fill="#e89a4c" />
            <circle className="grain grain-a" cx="36" cy="52" r="1.4" fill="#ffd27a" />
            <circle className="grain grain-b" cx="36" cy="58" r="1.2" fill="#e89a4c" />
          </g>
        )}
      </svg>
      <span className="hourglass-time">
        {ready ? 'Ready' : formatRemaining(displayMs)}
      </span>
    </div>
  )
}
