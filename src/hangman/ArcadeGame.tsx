import { useState } from 'react'

type Props = {
  onWin?: () => void
}

export default function ArcadeGame(_props: Props) {
  const [playing, setPlaying] = useState(false)

  if (!playing) {
    return (
      <div className="arcade-play arcade-play--lobby">
        <button type="button" className="arcade-start" onClick={() => setPlaying(true)}>
          Start
        </button>
      </div>
    )
  }

  return <div className="arcade-play" />
}
