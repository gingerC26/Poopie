import { assetUrl } from './assetUrl'
import Gallery from '../pages/Gallery'
import Games from '../pages/Games'
import Scene from '../pages/Scene'
import CarefulGame from './CarefulGame'
import ArcadeGame from './ArcadeGame'
import HuntingGame from './HuntingGame'
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
  const isArcade = level.id === '3'
  const isMemory = level.id === '5'
  const isHunting = level.id === '6'
  const coverScene = isTea || isPassword
  const background = level.background ? assetUrl(level.background) : undefined

  return (
    <article
      className={`subpage ${level.background ? 'subpage--scene' : ''} ${isTea ? 'subpage--tea' : ''} ${isPassword ? 'subpage--password' : ''} ${isArcade ? 'subpage--arcade' : ''} ${isMemory ? 'subpage--memory' : ''} ${isHunting ? 'subpage--hunting' : ''}`}
      style={
        background && !coverScene
          ? { backgroundImage: `url(${background})` }
          : undefined
      }
    >
      {isTea && (
        <div
          className="tea-scene"
          style={
            background
              ? { backgroundImage: `url(${background})` }
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
            background
              ? { backgroundImage: `url(${background})` }
              : undefined
          }
        >
          <PasswordGame onWin={onWin} />
        </div>
      )}
      {isArcade && <ArcadeGame onWin={onWin} />}
      {isMemory && <MemoryGame onWin={onWin} />}
      {isHunting && <HuntingGame onWin={onWin} />}
      <div className="subpage-copy">
        <h1>{level.note?.title ?? titleCaseWord(level.word)}</h1>
        <p className="lede">{level.note?.body}</p>
      </div>
    </article>
  )
}
