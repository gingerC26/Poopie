import { MAX_WRONG } from './constants'

type Props = {
  wrong: number
  mood: 'play' | 'won' | 'lost'
}

export default function HangmanFigure({ wrong, mood }: Props) {
  const stage = mood === 'won' ? MAX_WRONG : wrong
  const show = (n: number) => stage >= n

  return (
    <svg
      className="figurine"
      viewBox="0 0 200 240"
      role="img"
      aria-label={`Hangman stage ${stage} of ${MAX_WRONG}`}
    >
      {show(1) && (
        <circle
          cx="100"
          cy="52"
          r="24"
          fill="#ffd6e5"
          stroke="#c86b88"
          strokeWidth="4"
        />
      )}
      {show(2) && (
        <path
          d="M100 76 V 138"
          fill="none"
          stroke="#c86b88"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      {show(3) && (
        <path
          d="M100 92 Q 72 108 58 152"
          fill="none"
          stroke="#c86b88"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      {show(4) && (
        <path
          d="M100 92 Q 128 108 142 152"
          fill="none"
          stroke="#c86b88"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      {show(5) && (
        <path
          d="M100 138 Q 80 168 70 206"
          fill="none"
          stroke="#c86b88"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      {show(6) && (
        <path
          d="M100 138 Q 120 168 130 206"
          fill="none"
          stroke="#c86b88"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      {show(7) && (
        <g>
          <path
            d="M86 48 C84 45, 78 45, 78 50 C78 53, 86 58, 88 60 C90 58, 98 53, 98 50 C98 45, 92 45, 90 48 Z"
            fill="#ff5d8f"
          />
          <path
            d="M110 48 C108 45, 102 45, 102 50 C102 53, 110 58, 112 60 C114 58, 122 53, 122 50 C122 45, 116 45, 114 48 Z"
            fill="#ff5d8f"
          />
          <path
            d="M90 64 Q100 74 110 64"
            fill="none"
            stroke="#c86b88"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  )
}
