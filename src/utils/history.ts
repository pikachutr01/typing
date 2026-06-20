import type { DurationMinutes, TestHistoryEntry, TypingResult } from '../types/typing'

const HISTORY_KEY = 'typing_test_history'

export function getHistory(): TestHistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to parse history from localStorage', error)
    return []
  }
}

export function getTestHistory(textId: string, durationMinutes: DurationMinutes): TestHistoryEntry[] {
  const history = getHistory()
  return history.filter(
    (entry) => entry.textId === textId && entry.durationMinutes === durationMinutes
  )
}

export function saveTestHistory(
  textId: string,
  durationMinutes: DurationMinutes,
  result: TypingResult
): void {
  const history = getHistory()

  // Remove diffSegments to save space
  const { diffSegments, ...resultWithoutSegments } = result

  const newEntry: TestHistoryEntry = {
    ...resultWithoutSegments,
    date: new Date().toISOString(),
    textId,
    durationMinutes,
  }

  history.push(newEntry)

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save history to localStorage', error)
  }
}
