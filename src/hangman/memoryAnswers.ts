import { MEMORY_ANSWERS_PATH } from './settings'

export function publicAssetUrl(projectPath: string) {
  return `/${projectPath.replace(/^public\//, '')}`
}

export function memoryKey(text: string) {
  return text.toLowerCase().replace(/[^a-z]/g, '')
}

export type MemoryAnswer = {
  key: string
  display: string
}

export function parseMemoryAnswers(raw: string) {
  const seen = new Set<string>()
  const answers: MemoryAnswer[] = []
  for (const line of raw.split(/\r?\n/)) {
    const display = line.trim()
    const key = memoryKey(display)
    if (!key || seen.has(key)) continue
    seen.add(key)
    answers.push({ key, display })
  }
  return answers
}

export async function loadMemoryAnswers() {
  try {
    const response = await fetch(publicAssetUrl(MEMORY_ANSWERS_PATH))
    if (!response.ok) return []
    return parseMemoryAnswers(await response.text())
  } catch {
    return []
  }
}
