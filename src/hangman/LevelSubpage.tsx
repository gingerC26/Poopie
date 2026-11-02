import Gallery from '../pages/Gallery'
import Games from '../pages/Games'
import Scene from '../pages/Scene'
import { titleCaseWord, type Level } from './levels'

type Props = {
  level: Level
}

export default function LevelSubpage({ level }: Props) {
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
