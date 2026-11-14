import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { assetUrl } from './assetUrl'
import { generateHuntingMaze, huntingStep, type HuntingDir } from './huntingMaze'
import {
  HUNTING_FOODS,
  HUNTING_PACS,
  placeHuntingPacs,
  randomHuntingCell,
  sameHuntingCell,
} from './huntingSprites'
import { HUNTING_TIME_MS } from './settings'

const KEY_DIR: Record<string, HuntingDir> = {
  ArrowUp: 'n',
  w: 'n',
  W: 'n',
  ArrowRight: 'e',
  d: 'e',
  D: 'e',
  ArrowDown: 's',
  s: 's',
  S: 's',
  ArrowLeft: 'w',
  a: 'w',
  A: 'w',
}

const koalaSprite = HUNTING_PACS.find((pac) => pac.id === 'koala') ?? HUNTING_PACS[0]

const WASD_KEYS = [
  ['', 'W', ''],
  ['A', 'S', 'D'],
] as const

const ARROW_KEYS = [
  ['', '↑', ''],
  ['←', '↓', '→'],
] as const

function HuntingKeypad({
  keys,
  label,
}: {
  keys: readonly (readonly string[])[]
  label: string
}) {
  return (
    <span className="hunting-keys" role="img" aria-label={label}>
      {keys.flat().map((cap, i) =>
        cap ? (
          <kbd key={i} aria-hidden="true">
            {cap}
          </kbd>
        ) : (
          <span className="hunting-key-gap" key={i} aria-hidden="true" />
        ),
      )}
    </span>
  )
}

type Props = {
  onWin?: () => void
}

export default function HuntingGame({ onWin }: Props) {
  const [maze, setMaze] = useState(() => generateHuntingMaze())
  const [koalaCell, setKoalaCell] = useState({ row: 0, col: 0 })
  const [foodIndex, setFoodIndex] = useState(0)
  const [foodCell, setFoodCell] = useState({ row: 0, col: 1 })
  const [playing, setPlaying] = useState(false)
  const [won, setWon] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [noteOpen, setNoteOpen] = useState(true)
  const [remaining, setRemaining] = useState(HUNTING_TIME_MS)
  const koalaRef = useRef(koalaCell)
  const foodIndexRef = useRef(foodIndex)
  const foodCellRef = useRef(foodCell)
  const onWinRef = useRef(onWin)
  onWinRef.current = onWin

  const begin = () => {
    const nextMaze = generateHuntingMaze()
    const nextStarts = placeHuntingPacs(nextMaze.size, 2)
    const koala = nextStarts[0]
    const food = nextStarts[1] ?? nextStarts[0]
    setMaze(nextMaze)
    setKoalaCell(koala)
    koalaRef.current = koala
    setFoodIndex(0)
    foodIndexRef.current = 0
    setFoodCell(food)
    foodCellRef.current = food
    setRemaining(HUNTING_TIME_MS)
    setWon(false)
    setTimedOut(false)
    setNoteOpen(true)
    setPlaying(true)
  }

  useEffect(() => {
    if (!playing || won) return
    const started = Date.now()
    const id = window.setInterval(() => {
      const left = Math.max(0, HUNTING_TIME_MS - (Date.now() - started))
      setRemaining(left)
      if (left <= 0) {
        window.clearInterval(id)
        setTimedOut(true)
        setPlaying(false)
      }
    }, 50)
    return () => window.clearInterval(id)
  }, [playing, won])

  useEffect(() => {
    if (!playing || won) return
    const onKey = (event: KeyboardEvent) => {
      const dir = KEY_DIR[event.key]
      if (!dir) return
      event.preventDefault()
      const next = huntingStep(maze, koalaRef.current.row, koalaRef.current.col, dir) ?? koalaRef.current
      koalaRef.current = next
      setKoalaCell(next)
      if (
        foodIndexRef.current < HUNTING_FOODS.length &&
        sameHuntingCell(next, foodCellRef.current)
      ) {
        const following = foodIndexRef.current + 1
        foodIndexRef.current = following
        setFoodIndex(following)
        if (following < HUNTING_FOODS.length) {
          const spot = randomHuntingCell(maze.size, next)
          foodCellRef.current = spot
          setFoodCell(spot)
        } else {
          setWon(true)
          onWinRef.current?.()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing, maze, won])

  if (won && noteOpen) {
    return (
      <div className="hunting-play hunting-play--card">
        <div className="hunting-postcard" role="dialog" aria-label="Congratulations">
          <button
            type="button"
            className="hunting-postcard-close"
            aria-label="Close"
            onClick={() => setNoteOpen(false)}
          >
            ×
          </button>
          <div className="hunting-postcard-clips">
            <span className="hunting-postcard-clip hunting-postcard-clip--a">
              <img src={assetUrl('/sprites/hunting/win-1.jpg')} alt="" />
            </span>
            <span className="hunting-postcard-clip hunting-postcard-clip--b">
              <img src={assetUrl('/sprites/hunting/win-2.jpg')} alt="" />
            </span>
          </div>
          <p>
            Thank you for getting all of the yum yum food for the cabbage and the koala! Yum
            yum... There are still so many yum yum food in night markets that you haven&apos;t
            tried! You should come again soon...
          </p>
        </div>
      </div>
    )
  }

  if (!playing || won) {
    const retry = timedOut && !won
    return (
      <div className="hunting-play hunting-play--lobby">
        <p className="hunting-welcome">
          {retry ? (
            <>
              Oh no! All the stores are closed now, and we don&apos;t have enough food to survive
              the night. Try again, Ich habe Hunger!
            </>
          ) : (
            <>
              Welcome to Wusheng Night Market in Tainan! The shops are closing soon, get your food
              in time!
              <span className="hunting-welcome-controls">
                Use <HuntingKeypad keys={WASD_KEYS} label="WASD" /> or{' '}
                <HuntingKeypad keys={ARROW_KEYS} label="arrow keys" /> to control the koalabbage.
              </span>
            </>
          )}
        </p>
        <button type="button" className="hunting-start" onClick={begin}>
          {retry ? 'Restart' : 'Start'}
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
  const food = foodIndex < HUNTING_FOODS.length ? HUNTING_FOODS[foodIndex] : null
  const pacBox = (cell: { row: number; col: number }) => ({
    left: `${(cell.col - 0.16) * unit}%`,
    top: `${(cell.row - 0.16) * unit}%`,
    width: `${unit * 1.32}%`,
    height: `${unit * 1.32}%`,
  })

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
        <div className="hunting-pac hunting-pac--player" style={pacBox(koalaCell)}>
          <span className="hunting-pac-pointer" aria-hidden="true" />
          <img src={koalaSprite.src} alt={koalaSprite.alt} />
        </div>
        {food && (
          <div className="hunting-pac" style={pacBox(foodCell)}>
            <img src={food.src} alt={food.alt} />
          </div>
        )}
      </div>
    </div>
  )
}
