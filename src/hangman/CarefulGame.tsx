import { useEffect, useRef, useState } from 'react'
import { buildCorridor, hitsDish, hitsWalls, type Corridor } from './carefulPath'
import { XLB_SPILL_MS } from './settings'

/** Center of the bottom lunch-box well, as percent of the background image. */
const START = { x: 18.7, y: 84.2 }
const XLB_WIDTH = 6.4
const IMG_W = 1280
const IMG_H = 720
const HIT_RADIUS_PX = (XLB_WIDTH / 100) * IMG_W * 0.4 + 9

type Props = {
  title: string
  body: string
  background: string
  onWin?: () => void
}

type Box = { left: number; top: number; width: number; height: number }

function coverRect(container: DOMRect, natW: number, natH: number): Box {
  const scale = Math.max(container.width / natW, container.height / natH)
  const width = natW * scale
  const height = natH * scale
  return {
    left: container.left + (container.width - width) / 2,
    top: container.top + (container.height - height) / 2,
    width,
    height,
  }
}

export default function CarefulGame({ title, body, background, onWin }: Props) {
  const fieldRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)
  const [pos, setPos] = useState(START)
  const [layout, setLayout] = useState<Box | null>(null)
  const [corridor, setCorridor] = useState<Corridor | null>(null)
  const [spilled, setSpilled] = useState(false)
  const [happy, setHappy] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const spilledRef = useRef(false)
  const happyRef = useRef(false)
  const corridorRef = useRef<Corridor | null>(null)

  function measure() {
    const field = fieldRef.current
    const img = bgRef.current
    if (!field || !img?.naturalWidth) return
    const fr = field.getBoundingClientRect()
    const box = coverRect(fr, img.naturalWidth, img.naturalHeight)
    setLayout({
      left: box.left - fr.left,
      top: box.top - fr.top,
      width: box.width,
      height: box.height,
    })
  }

  useEffect(() => {
    measure()
    const node = fieldRef.current
    const ro = new ResizeObserver(measure)
    if (node) ro.observe(node)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    spilledRef.current = spilled
    if (!spilled) return
    const id = window.setTimeout(() => {
      spilledRef.current = false
      setSpilled(false)
      setDragging(false)
      corridorRef.current = null
      setCorridor(null)
      setPos(START)
    }, XLB_SPILL_MS)
    return () => window.clearTimeout(id)
  }, [spilled])

  function toPct(clientX: number, clientY: number) {
    const field = fieldRef.current
    const img = bgRef.current
    if (!field || !img?.naturalWidth) return START
    const box = coverRect(field.getBoundingClientRect(), img.naturalWidth, img.naturalHeight)
    return {
      x: ((clientX - box.left) / box.width) * 100,
      y: ((clientY - box.top) / box.height) * 100,
    }
  }

  function spill(at: { x: number; y: number }, target: HTMLButtonElement, pointerId: number) {
    drag.current = null
    spilledRef.current = true
    setDragging(false)
    setPos(at)
    setSpilled(true)
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (spilledRef.current) return
    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* untrusted/synthetic pointers may not capture */
    }
    setDragging(true)
    const p = toPct(event.clientX, event.clientY)
    drag.current = { dx: p.x - pos.x, dy: p.y - pos.y }
    if (!corridorRef.current) {
      corridorRef.current = buildCorridor(START)
      setCorridor(corridorRef.current)
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.current || spilledRef.current) return
    const p = toPct(event.clientX, event.clientY)
    const next = {
      x: Math.min(97, Math.max(3, p.x - drag.current.dx)),
      y: Math.min(97, Math.max(3, p.y - drag.current.dy)),
    }
    const maze = corridorRef.current
    if (!happyRef.current && hitsDish(next, HIT_RADIUS_PX)) {
      happyRef.current = true
      setHappy(true)
      setNoteOpen(true)
      onWin?.()
    }
    if (!happyRef.current && maze && hitsWalls(next, maze, HIT_RADIUS_PX)) {
      spill(next, event.currentTarget, event.pointerId)
      return
    }
    setPos(next)
  }

  function onPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const bubbleLine = spilled
    ? "I'm heartbroken!"
    : happy
      ? "Yay! I'm yum yum!"
      : dragging
        ? null
        : 'Dip me in the sauce!'

  return (
    <article className="subpage subpage--scene careful-game" ref={fieldRef}>
      <img
        ref={bgRef}
        className="careful-bg"
        src={background}
        alt=""
        draggable={false}
        onLoad={measure}
      />
      <div className="subpage-copy">
        <h1>{title}</h1>
        <p className="lede">{body}</p>
      </div>
      {corridor && layout && (
        <svg
          className="careful-maze"
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          style={{
            left: layout.left,
            top: layout.top,
            width: layout.width,
            height: layout.height,
          }}
          aria-hidden
        >
          <polyline
            className="careful-maze-floor"
            points={corridor.floor}
            strokeWidth={corridor.floorWidth}
          />
          <polyline className="careful-maze-edge" points={corridor.left} />
          <polyline className="careful-maze-edge" points={corridor.right} />
          <polyline className="careful-maze-wall" points={corridor.left} />
          <polyline className="careful-maze-wall" points={corridor.right} />
        </svg>
      )}
      <button
        type="button"
        className={`xlb${spilled ? ' xlb--spilled' : ''}${happy ? ' xlb--happy' : ''}`}
        aria-label={
          spilled ? 'Xiao long bao spilled' : happy ? 'Xiao long bao in the sauce' : 'Xiao long bao'
        }
        style={
          layout
            ? {
                left: layout.left + (pos.x / 100) * layout.width,
                top: layout.top + (pos.y / 100) * layout.height,
                width: (XLB_WIDTH / 100) * layout.width,
              }
            : { left: `${START.x}%`, top: `${START.y}%` }
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img src="/sprites/xlb.png" alt="" draggable={false} />
        {spilled && (
          <span className="xlb-spill" aria-hidden>
            <img className="xlb-face" src="/sprites/xlb-face.png" alt="" draggable={false} />
            <i className="xlb-hole" />
            <i className="xlb-stream" />
          </span>
        )}
        {bubbleLine && (
          <span
            className="xlb-bubble"
            aria-hidden
          >
            {bubbleLine}
          </span>
        )}
        {happy && (
          <span className="xlb-win" aria-hidden>
            <img className="xlb-face" src="/sprites/xlb-happy-face.png" alt="" draggable={false} />
            <span className="xlb-hearts">
              {[0, 1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className={`xlb-heart xlb-heart--${i}`}
                  src="/sprites/xlb-heart.png"
                  alt=""
                  draggable={false}
                />
              ))}
            </span>
          </span>
        )}
      </button>
      {happy && noteOpen && (
        <div className="careful-postcard-layer">
          <div className="careful-postcard" role="dialog" aria-label="Postcard">
            <button
              type="button"
              className="careful-postcard-close"
              aria-label="Close"
              onClick={() => setNoteOpen(false)}
            >
              ×
            </button>
            <div className="careful-postcard-clips">
              <span className="careful-postcard-clip careful-postcard-clip--a">
                <img src="/sprites/careful/win-1.jpg" alt="" />
              </span>
              <span className="careful-postcard-clip careful-postcard-clip--b">
                <img src="/sprites/careful/win-2.jpg" alt="" />
              </span>
            </div>
            <p>
              From Minoh&apos;s udon to Din Tai Fung&apos;s xiao-long-bao, I observe a great
              improvement in your chopsticks skill. I am gratified, and I hope you continue
              mastering this holy craft and enhancing your Asian authenticity.
            </p>
            <p>p.s. I miss your kapsalon! When will you make one for me again?</p>
          </div>
        </div>
      )}
    </article>
  )
}
