import Gallery from '../pages/Gallery'
import Games from '../pages/Games'
import Scene from '../pages/Scene'
import CarefulGame from './CarefulGame'
import MemoryGame from './MemoryGame'
import PasswordGame from './PasswordGame'
import TeaGame from './TeaGame'
import { titleCaseWord, type Level } from './levels'

type Props = {
  level: Level
  onWin?: () => void
}

export default function LevelSubpage({ level, onWin }: Props) {
  if (level.id === '1' && level.background) {
    return (
      <CarefulGame
        title={level.note?.title ?? titleCaseWord(level.word)}
        body={level.note?.body ?? ''}
        background={level.background}
        onWin={onWin}
      />
    )
  }
  if (level.page === 'gallery') return <Gallery />
  if (level.page === 'spline') return <Scene />
  if (level.page === 'games') return <Games />

  const isTea = level.id === '4'
  const isPassword = level.id === '2'
  const isMemory = level.id === '5'
  const coverScene = isTea || isPassword

  return (
    <article
      className={`subpage ${level.background ? 'subpage--scene' : ''} ${isTea ? 'subpage--tea' : ''} ${isPassword ? 'subpage--password' : ''} ${isMemory ? 'subpage--memory' : ''}`}
      style={
        level.background && !coverScene
          ? { backgroundImage: `url(${level.background})` }
          : undefined
      }
    >
      {isTea && (
        <div
          className="tea-scene"
          style={
            level.background
              ? { backgroundImage: `url(${level.background})` }
              : undefined
          }
        >
          <TeaGame onWin={onWin} />
        </div>
      )}
      {isPassword && (
        <div
          className="password-scene"
          style={
            level.background
              ? { backgroundImage: `url(${level.background})` }
              : undefined
          }
        >
          <PasswordGame onWin={onWin} />
        </div>
      )}
      {isMemory && <MemoryGame onWin={onWin} />}
      <div className="subpage-copy">
        <h1>{level.note?.title ?? titleCaseWord(level.word)}</h1>
        <p className="lede">{level.note?.body}</p>
      </div>
    </article>
  )
}
