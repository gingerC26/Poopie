import Hourglass from './Hourglass'
import { maskWord, titleCaseWord, type Level } from './levels'

function SidebarIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 4v16" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 9l-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 4v16" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

type Props = {
  levels: Level[]
  selectedId: string
  unlocked: Set<string>
  activeRoundId?: string
  open: boolean
  remainingMs: number
  onSelect: (id: string) => void
  onToggle: () => void
}

export default function LevelSidebar({
  levels,
  selectedId,
  unlocked,
  activeRoundId,
  open,
  remainingMs,
  onSelect,
  onToggle,
}: Props) {
  return (
    <aside className={`levels ${open ? 'levels--open' : ''}`} aria-label="Levels">
      <div className="levels-head">
        <p className="levels-label">Levels</p>
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? 'Hide levels' : 'Show levels'}
          aria-expanded={open}
          aria-controls="level-drawer"
          onClick={onToggle}
        >
          <SidebarIcon open={open} />
        </button>
      </div>
      <ol className="levels-list">
        {levels.map((level, index) => {
          const isOpen = unlocked.has(level.id)
          const name = isOpen ? titleCaseWord(level.word) : maskWord(level.word)
          return (
            <li key={level.id}>
              <button
                type="button"
                className={`level-btn ${selectedId === level.id ? 'level-btn--active' : ''} ${isOpen ? 'level-btn--unlocked' : ''} ${activeRoundId === level.id ? 'level-btn--playing' : ''}`}
                onClick={() => onSelect(level.id)}
              >
                <span className="level-name">
                  {index + 1}. {name}
                </span>
                <span
                  className={`level-go ${isOpen ? '' : 'level-go--hidden'}`}
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="levels-hourglass">
        <Hourglass remainingMs={remainingMs} />
      </div>
    </aside>
  )
}
