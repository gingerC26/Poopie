import { useEffect, useRef, useState } from 'react'
import { ARCADE_LANES, applyDart, pickArcadeWind, scoreAtX } from './arcadeDarts'
import { ARCADE_DARTS, ARCADE_FLIGHT_MS, ARCADE_LAND_MS, ARCADE_START_SCORE } from './settings'

type Phase = 'lobby' | 'play' | 'win' | 'lose'

const STEER = 0.42

type Props = {
  onWin?: () => void
}

export default function ArcadeGame({ onWin }: Props) {
  const [phase, setPhase] = useState<Phase>('lobby')
  const [loseKind, setLoseKind] = useState<'bust' | 'darts'>('bust')
  const [noteOpen, setNoteOpen] = useState(true)
  const [remaining, setRemaining] = useState(ARCADE_START_SCORE)
  const [dartsLeft, setDartsLeft] = useState(ARCADE_DARTS)
  const [flying, setFlying] = useState(false)
  const [dart, setDart] = useState({ x: 0.5, y: 0 })
  const [wind, setWind] = useState(0)
  const [lastHit, setLastHit] = useState<number | null>(null)
  const dartRef = useRef(dart)
  const windRef = useRef(0)
  const steerRef = useRef(0)
  const remainingRef = useRef(ARCADE_START_SCORE)
  const dartsRef = useRef(ARCADE_DARTS)
  const onWinRef = useRef(onWin)
  onWinRef.current = onWin

  const begin = () => {
    remainingRef.current = ARCADE_START_SCORE
    dartsRef.current = ARCADE_DARTS
    setRemaining(ARCADE_START_SCORE)
    setDartsLeft(ARCADE_DARTS)
    setLastHit(null)
    setNoteOpen(true)
    setLoseKind('bust')
    setPhase('play')
    launchDart()
  }

  const launchDart = () => {
    const gust = pickArcadeWind()
    windRef.current = gust
    setWind(gust)
    dartRef.current = { x: 0.5, y: 0 }
    setDart({ x: 0.5, y: 0 })
    setLastHit(null)
    setFlying(true)
  }

  useEffect(() => {
    if (!flying) return
    const started = Date.now()
    const id = window.setInterval(() => {
      const y = Math.min(1, (Date.now() - started) / ARCADE_FLIGHT_MS)
      const x = Math.min(0.98, Math.max(0.02, dartRef.current.x + (windRef.current + steerRef.current) * 0.016))
      dartRef.current = { x, y }
      setDart({ x, y })
      if (y < 1) return
      window.clearInterval(id)
      setFlying(false)
      const hit = scoreAtX(x)
      const result = applyDart(remainingRef.current, hit)
      remainingRef.current = result.remaining
      dartsRef.current -= 1
      setRemaining(result.remaining)
      setDartsLeft(dartsRef.current)
      setLastHit(hit)
      if (result.won) {
        setPhase('win')
        onWinRef.current?.()
        return
      }
      if (result.bust) {
        setLoseKind('bust')
        setPhase('lose')
        return
      }
      if (dartsRef.current <= 0) {
        setLoseKind('darts')
        setPhase('lose')
        return
      }
      window.setTimeout(() => {
        if (remainingRef.current <= 0) return
        launchDart()
      }, ARCADE_LAND_MS)
    }, 16)
    return () => window.clearInterval(id)
  }, [flying])

  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        event.preventDefault()
        steerRef.current = -STEER
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        event.preventDefault()
        steerRef.current = STEER
      }
    }
    const onUp = (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowLeft' ||
        event.key === 'a' ||
        event.key === 'A' ||
        event.key === 'ArrowRight' ||
        event.key === 'd' ||
        event.key === 'D'
      ) {
        steerRef.current = 0
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onUp)
    }
  }, [phase])

  if (phase === 'win' && noteOpen) {
    return (
      <div className="arcade-play arcade-play--card">
        <div className="arcade-win" role="dialog" aria-label="Checkout">
          <button
            type="button"
            className="arcade-win-close"
            aria-label="Close"
            onClick={() => setNoteOpen(false)}
          >
            ×
          </button>
          <p className="arcade-win-heart" aria-hidden="true">
            ♡
          </p>
          <p>Checkout. He made a little hand-heart, and you got shy.</p>
        </div>
      </div>
    )
  }

  if (phase !== 'play') {
    const retry = phase === 'lose'
    return (
      <div className="arcade-play arcade-play--lobby">
        {retry && (
          <p className="arcade-status">
            {loseKind === 'bust'
              ? 'Bust! You went under zero. Try again.'
              : "Out of darts, and you're not at zero. Try again."}
          </p>
        )}
        <button type="button" className="arcade-start" onClick={begin}>
          {retry ? 'Restart' : 'Start'}
        </button>
      </div>
    )
  }

  const windLeft = wind < 0
  const windPips = Math.max(1, Math.round(Math.abs(wind) / 0.12))

  return (
    <div className="arcade-play arcade-play--board">
      <div className="arcade-hud">
        <p>
          Score <strong>{Math.max(0, remaining)}</strong>
        </p>
        <p aria-label={`${dartsLeft} darts left`}>
          Darts <span className="arcade-darts">{'*'.repeat(Math.max(0, dartsLeft))}</span>
        </p>
        <p className="arcade-wind" aria-label={windLeft ? 'Wind left' : 'Wind right'}>
          Wind {windLeft ? '<'.repeat(windPips) : '>'.repeat(windPips)}
        </p>
      </div>
      {lastHit !== null && !flying && (
        <p className="arcade-hit" aria-live="polite">
          Hit {lastHit}
        </p>
      )}
      <div className="arcade-field" aria-label="Dartboard">
        <div className="arcade-lanes">
          {ARCADE_LANES.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className={`arcade-lane${value === 5 ? ' arcade-lane--bull' : ''}`}
            >
              {value}
            </span>
          ))}
        </div>
        <div className="arcade-air">
          <span
            className="arcade-dart"
            style={{
              left: `${dart.x * 100}%`,
              top: `${(1 - dart.y) * 100}%`,
            }}
          />
        </div>
      </div>
      <p className="arcade-hint">A D or arrows vs the wind</p>
    </div>
  )
}
