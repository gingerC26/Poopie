export type LevelPage = 'note' | 'gallery' | 'spline' | 'games'

export type Level = {
  id: string
  word: string
  page: LevelPage
  background?: string
  note?: { title: string; body: string }
}

export const LEVEL_IDS = ['1', '2', '3', '4', '5', '6'] as const
export type LevelId = (typeof LEVEL_IDS)[number]

export const LEVELS: Level[] = [
  {
    id: '1',
    word: 'CAREFUL',
    page: 'note',
    background: '/backgrounds/careful.jpg',
    note: {
      title: 'Careful',
      body: "Don't break the xiao-long-bao!",
    },
  },
  {
    id: '2',
    word: 'PASSWORD',
    page: 'gallery',
  },
  {
    id: '3',
    word: 'ARCADE',
    page: 'spline',
  },
  {
    id: '4',
    word: 'TEN MINUTES',
    page: 'games',
  },
  {
    id: '5',
    word: 'MEMORY',
    page: 'note',
    note: {
      title: 'Memory',
      body: 'Fifth gift unlocked. Add the real note here.',
    },
  },
  {
    id: '6',
    word: 'HUNTING',
    page: 'note',
    note: {
      title: 'Hunting',
      body: 'Sixth gift unlocked. Add the real note here.',
    },
  },
]

export function getLevel(id: string) {
  return LEVELS.find((level) => level.id === id)
}

export function maskWord(word: string) {
  return word.replace(/[A-Za-z]/g, '?')
}

export function titleCaseWord(word: string) {
  return word
    .toLowerCase()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function lettersIn(word: string) {
  return [...new Set(word.toUpperCase().replace(/[^A-Z]/g, '').split(''))]
}
