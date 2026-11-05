import { useEffect, useRef, useState } from 'react'
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

export default function TeaGame() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hotId, setHotId] = useState<string | null>(null)

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

  return (
    <div ref={rootRef} className="tea-props" aria-label="Tea tools">
      {PROPS.map((item) => (
        <button
          key={item.id}
          type="button"
          data-prop={item.id}
          className={`tea-prop tea-prop--${item.id}${hotId === item.id ? ' is-hot' : ''}`}
        >
          <img src={item.src} alt={item.alt} draggable={false} />
        </button>
      ))}
    </div>
  )
}
