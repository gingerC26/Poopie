import HangmanPlay from '../hangman/HangmanPlay'
import LevelSidebar from '../hangman/LevelSidebar'
import LevelSubpage from '../hangman/LevelSubpage'
import { useHangman } from '../hangman/useHangman'

export default function Home() {
  const game = useHangman()
  const showSubpage = game.status === 'unlocked'

  return (
    <div className={`board ${game.sidebarOpen ? '' : 'board--collapsed'}`}>
      <div id="level-drawer">
        <LevelSidebar
          levels={game.levels}
          selectedId={game.selected.id}
          unlocked={game.unlocked}
          activeRoundId={game.round?.levelId}
          open={game.sidebarOpen}
          remainingMs={game.remainingMs}
          onSelect={game.selectLevel}
          onToggle={() => game.setSidebarOpen((open) => !open)}
        />
      </div>

      {game.sidebarOpen && (
        <button
          type="button"
          className="backdrop"
          aria-label="Hide levels"
          onClick={() => game.setSidebarOpen(false)}
        />
      )}

      <div className="main">
        <section className="stage">
          {showSubpage ? (
            <LevelSubpage level={game.selected} />
          ) : (
            <HangmanPlay game={game} />
          )}
        </section>
      </div>
    </div>
  )
}
