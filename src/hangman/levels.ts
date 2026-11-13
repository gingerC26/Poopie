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
    page: 'note',
    background: '/backgrounds/password.jpg',
    note: {
      title: 'Password',
      body: 'Open the right locker.',
    },
  },
  {
    id: '3',
    word: 'ARCADE',
    page: 'spline',
  },
  {
    id: '4',
    word: 'TWENTY SECONDS',
    page: 'note',
    background: '/backgrounds/twenty-seconds.jpg',
    note: {
      title: 'Twenty Seconds',
      body: 'Make a pot of authentic Chinese tea.',
    },
  },
  {
    id: '5',
    word: 'MEMORY',
    page: 'note',
    background: '/backgrounds/memory.jpg?v=night2',
    note: {
      title: 'Memory',
      body: 'Enjoy the Sun Moon Lake view with popcorn chicken.',
    },
  },
  {
    id: '6',
    word: 'HUNTING',
    page: 'note',
    background: '/backgrounds/hunting.jpg?v=notext',
    note: {
      title: 'Hunting',
      body: 'Buy our dinna before time runs out!',
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
