import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TEA_NOTICE_LIMIT, TEA_NOTICE_MS } from './settings'
import { teaPropAtPoint } from './teaHit'

const PROPS = [
  { id: 'water-pot', src: '/sprites/tea/water-pot.png', alt: 'Water pot' },
  { id: 'leaves', src: '/sprites/tea/tea-leaves.png?v=pottery2', alt: 'Tea leaves' },
  { id: 'pot-big', src: '/sprites/tea/pot-big.png', alt: 'Big teapot' },
  { id: 'pot-small', src: '/sprites/tea/pot-small.png', alt: 'Small teapot' },
  { id: 'spoon', src: '/sprites/tea/spoon.png', alt: 'Tea spoon' },
  { id: 'cup', src: '/sprites/tea/tea-cup.png', alt: 'Tea cup' },
  { id: 'cup-filled', src: '/sprites/tea/tea-cup-filled.png', alt: 'Filled tea cup' },
  { id: 'postcard', src: '/sprites/tea/postcard.png', alt: 'Instruction postcard' },
] as const

type TeaPropId = (typeof PROPS)[number]['id']

const TEA_PROP_NAMES: Record<TeaPropId, string> = {
  'water-pot': 'Water Pot',
  leaves: 'Tea Leaves',
  'pot-big': 'Tea Pot (Big)',
  'pot-small': 'Tea Pot (Small)',
  spoon: 'Spoon',
  cup: 'Tea Cup',
  'cup-filled': 'Tea Cup',
  postcard: 'Postcard',
}

type TeaNotice = {
  id: number
  name: string
  ok: boolean
}

export default function TeaGame() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hotId, setHotId] = useState<string | null>(null)
  const [notices, setNotices] = useState<TeaNotice[]>([])
  const noticesRef = useRef<TeaNotice[]>([])
  const noticeId = useRef(0)
  const timers = useRef(new Map<number, number>())

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let lastPoint: { x: number; y: number } | null = null

    const update = (clientX: number, clientY: number) => {
      const next = teaPropAtPoint(root, clientX, clientY)
      setHotId((current) => (current === next ? current : next))
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      lastPoint = { x: event.clientX, y: event.clientY }
      update(event.clientX, event.clientY)
    }

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return
      lastPoint = null
      setHotId(null)
    }

    const onLoad = () => {
      if (!lastPoint) return
      update(lastPoint.x, lastPoint.y)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerout', onLeave)
    root.addEventListener('load', onLoad, true)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onLeave)
      root.removeEventListener('load', onLoad, true)
    }
  }, [])

  const removeNotice = (id: number) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    noticesRef.current = noticesRef.current.filter((notice) => notice.id !== id)
    setNotices(noticesRef.current)
  }

  const showNotice = (propId: TeaPropId) => {
    const notice: TeaNotice = {
      id: ++noticeId.current,
      name: TEA_PROP_NAMES[propId],
      ok: propId === 'spoon',
    }
    const next = [...noticesRef.current, notice].slice(-TEA_NOTICE_LIMIT)
    const kept = new Set(next.map((item) => item.id))
    for (const item of noticesRef.current) {
      if (kept.has(item.id)) continue
      const timer = timers.current.get(item.id)
      if (timer === undefined) continue
      window.clearTimeout(timer)
      timers.current.delete(item.id)
    }
    noticesRef.current = next
    setNotices(next)
    timers.current.set(
      notice.id,
      window.setTimeout(() => removeNotice(notice.id), TEA_NOTICE_MS),
    )
  }

  return (
    <div ref={rootRef} className="tea-props" aria-label="Tea tools">
      {PROPS.map((item) => {
        const dormant = item.id === 'cup-filled'
        return (
          <button
            key={item.id}
            type="button"
            data-prop={item.id}
            aria-label={item.alt}
            hidden={dormant}
            disabled={dormant}
            className={`tea-prop tea-prop--${item.id}${hotId === item.id ? ' is-hot' : ''}`}
            onClick={(event) => {
              if (event.currentTarget.disabled) return
              showNotice(item.id)
            }}
          >
            <img src={item.src} alt={item.alt} draggable={false} />
          </button>
        )
      })}
      {createPortal(
        <div className="tea-notices" aria-live="polite">
          {notices.map((notice) => (
            <p
              key={notice.id}
              className={`tea-notice ${notice.ok ? 'tea-notice--ok' : 'tea-notice--no'}`}
            >
              {notice.ok ? <CheckIcon /> : <CrossIcon />}
              <span>
                {notice.name} is clicked!
              </span>
            </p>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.16" />
      <path
        d="M7 12.5 10.2 16 17 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.16" />
      <path
        d="M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
