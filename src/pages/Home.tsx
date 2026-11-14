import { useEffect } from 'react'
import HangmanPlay from '../hangman/HangmanPlay'
import LevelSidebar from '../hangman/LevelSidebar'
import LevelSubpage from '../hangman/LevelSubpage'
import { preloadGiftAssets } from '../hangman/preloadAssets'
import { CLEAR_WIN_RECORDS_BUTTON } from '../hangman/settings'
import { TeaSteepProvider } from '../hangman/TeaSteep'
import { useHangman } from '../hangman/useHangman'

export default function Home() {
  const game = useHangman()
  const showSubpage = game.status === 'unlocked'

  useEffect(() => {
    preloadGiftAssets()
  }, [])

  return (
    <TeaSteepProvider>
      <div className={`board ${game.sidebarOpen ? '' : 'board--collapsed'}`}>
        <div id="level-drawer">
          <LevelSidebar
            levels={game.levels}
            selectedId={game.selected.id}
            unlocked={game.unlocked}
            won={game.won}
            activeRoundId={game.round?.levelId}
            open={game.sidebarOpen}
            remainingMs={game.remainingMs}
            onSelect={game.selectLevel}
            onToggle={() => game.setSidebarOpen((open) => !open)}
            onClearWins={CLEAR_WIN_RECORDS_BUTTON ? game.clearGameWins : undefined}
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
              <LevelSubpage
                level={game.selected}
                onWin={() => game.markLevelWon(game.selected.id)}
              />
            ) : (
              <HangmanPlay game={game} />
            )}
          </section>
        </div>
      </div>
    </TeaSteepProvider>
  )
}
