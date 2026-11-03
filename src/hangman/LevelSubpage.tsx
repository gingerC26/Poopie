import Gallery from '../pages/Gallery'
import Games from '../pages/Games'
import Scene from '../pages/Scene'
import CarefulGame from './CarefulGame'
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

  return (
    <article
      className={`subpage ${level.background ? 'subpage--scene' : ''}`}
      style={
        level.background
          ? { backgroundImage: `url(${level.background})` }
          : undefined
      }
    >
      <div className="subpage-copy">
        <h1>{level.note?.title ?? titleCaseWord(level.word)}</h1>
        <p className="lede">{level.note?.body}</p>
      </div>
    </article>
  )
}
