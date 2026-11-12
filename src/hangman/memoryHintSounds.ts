const soundModules = import.meta.glob(
  '../../public/sprites/memory/hints/*.{m4a,mp3,wav,ogg,M4A,MP3,WAV,OGG}',
  { eager: true, query: '?url', import: 'default' },
)

function publicUrl(path: string) {
  const file = path.split('/').pop()?.split('?')[0] ?? ''
  return `/sprites/memory/hints/${file}`
}

const discovered = Object.keys(soundModules)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map(publicUrl)

/** Drop clips into `public/sprites/memory/hints`. Names sort numerically (1.m4a, 2.m4a, …). */
export const MEMORY_HINT_SOUNDS =
  discovered.length > 0
    ? discovered
    : [
        '/sprites/memory/hints/1.m4a',
        '/sprites/memory/hints/2.m4a',
        '/sprites/memory/hints/3.m4a',
        '/sprites/memory/hints/4.m4a',
        '/sprites/memory/hints/5.m4a',
        '/sprites/memory/hints/6.m4a',
      ]

let lastHint: HTMLAudioElement | null = null

export function playMemoryHintSound() {
  if (MEMORY_HINT_SOUNDS.length === 0) return
  const src = MEMORY_HINT_SOUNDS[Math.floor(Math.random() * MEMORY_HINT_SOUNDS.length)]
  lastHint?.pause()
  const audio = new Audio(src)
  lastHint = audio
  void audio.play().catch(() => {})
}
