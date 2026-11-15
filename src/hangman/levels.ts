export type Level = {
  id: string
  word: string
  background?: string
  note?: { title: string; body: string }
}

export const LEVEL_IDS = ['1', '2', '3', '4', '5', '6'] as const
export type LevelId = (typeof LEVEL_IDS)[number]

export const LEVELS: Level[] = [
  {
    id: '1',
    word: 'CAREFUL',
    background: '/backgrounds/careful.jpg',
    note: {
      title: 'Careful',
      body: "Don't break the xiao-long-bao!",
    },
  },
  {
    id: '2',
    word: 'TWENTY SECONDS',
    background: '/backgrounds/twenty-seconds.jpg',
    note: {
      title: 'Twenty Seconds',
      body: 'Make a pot of authentic Chinese tea.',
    },
  },
  {
    id: '3',
    word: 'HUNTING',
    background: '/backgrounds/hunting.jpg?v=notext',
    note: {
      title: 'Hunting',
      body: 'Buy our dinna before time runs out!',
    },
  },
  {
    id: '4',
    word: 'MEMORY',
    background: '/backgrounds/memory.jpg?v=night2',
    note: {
      title: 'Memory',
      body: 'Enjoy the Sun Moon Lake view with popcorn chicken.',
    },
  },
  {
    id: '5',
    word: 'ARCADE',
    background: '/backgrounds/arcade.jpg?v=notext',
    note: {
      title: 'Arcade',
      body: 'A cozy date in a cold typhoon day.',
    },
  },
  {
    id: '6',
    word: 'PASSWORD',
    background: '/backgrounds/password.jpg',
    note: {
      title: 'Password',
      body: 'Open the right locker.',
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
