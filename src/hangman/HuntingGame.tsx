import { useEffect, useState, type CSSProperties } from 'react'
import { generateHuntingMaze } from './huntingMaze'
import { HUNTING_PACS, placeHuntingPacs } from './huntingSprites'
import { HUNTING_TIME_MS } from './settings'

export default function HuntingGame() {
  const [maze] = useState(() => generateHuntingMaze())
  const [pacCells] = useState(() => placeHuntingPacs(maze.size))
  const [playing, setPlaying] = useState(false)
  const [remaining, setRemaining] = useState(HUNTING_TIME_MS)

  useEffect(() => {
    if (!playing) return
    const started = Date.now()
    const id = window.setInterval(() => {
      const left = Math.max(0, HUNTING_TIME_MS - (Date.now() - started))
      setRemaining(left)
      if (left <= 0) window.clearInterval(id)
    }, 50)
    return () => window.clearInterval(id)
  }, [playing])

  if (!playing) {
    return (
      <div className="hunting-play">
        <button type="button" className="hunting-start" onClick={() => setPlaying(true)}>
          Start
        </button>
      </div>
    )
  }

  const walls = []
  const unit = 100 / maze.size
  for (let row = 0; row <= maze.size; row++) {
    for (let col = 0; col < maze.size; col++) {
      if (!maze.horiz[row][col]) continue
      const style: CSSProperties = {
        left: `${col * unit}%`,
        width: `${unit}%`,
      }
      if (row === 0) style.top = 0
      else if (row === maze.size) style.bottom = 0
      else {
        style.top = `${row * unit}%`
        style.transform = 'translateY(-50%)'
      }
      walls.push(<span key={`h-${row}-${col}`} className="hunting-wall hunting-wall--h" style={style} />)
    }
  }
  for (let row = 0; row < maze.size; row++) {
    for (let col = 0; col <= maze.size; col++) {
      if (!maze.vert[row][col]) continue
      const style: CSSProperties = {
        top: `${row * unit}%`,
        height: `${unit}%`,
      }
      if (col === 0) style.left = 0
      else if (col === maze.size) style.right = 0
      else {
        style.left = `${col * unit}%`
        style.transform = 'translateX(-50%)'
      }
      walls.push(<span key={`v-${row}-${col}`} className="hunting-wall hunting-wall--v" style={style} />)
    }
  }

  const ratio = remaining / HUNTING_TIME_MS

  return (
    <div className="hunting-play">
      <div
        className="hunting-timer"
        role="progressbar"
        aria-label="Time"
        aria-valuemin={0}
        aria-valuemax={HUNTING_TIME_MS}
        aria-valuenow={Math.round(remaining)}
      >
        <div className="hunting-timer-fill" style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <div className="hunting-map" aria-label="Maze">
        {walls}
        {HUNTING_PACS.map((pac, index) => {
          const cell = pacCells[index]
          if (!cell) return null
          return (
            <img
              key={pac.id}
              className="hunting-pac"
              src={pac.src}
              alt={pac.alt}
              style={{
                left: `${(cell.col - 0.16) * unit}%`,
                top: `${(cell.row - 0.16) * unit}%`,
                width: `${unit * 1.32}%`,
                height: `${unit * 1.32}%`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
