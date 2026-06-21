import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { DurationMinutes, TestHistoryEntry, TypingResult } from '../types/typing'

export async function checkTestHistory(textId: string | number): Promise<boolean> {
  const token = useAuthStore.getState().token
  if (!token) return false

  try {
    const res = await api.get(`/history/check/${textId}`)
    return res.data.hasHistory
  } catch (err) {
    console.error(err)
    return false
  }
}

export async function getTestHistoryDurations(textId: string | number): Promise<DurationMinutes[]> {
  const token = useAuthStore.getState().token
  if (!token) return []

  try {
    const res = await api.get(`/history/durations/${textId}`)
    return res.data
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getPaginatedTestHistory(
  textId: string | number, 
  durationMinutes: DurationMinutes,
  limit: number = 20,
  offset: number = 0
): Promise<TestHistoryEntry[]> {
  const token = useAuthStore.getState().token
  if (!token) return []

  try {
    const res = await api.get(`/history/${textId}/${durationMinutes}?limit=${limit}&offset=${offset}`)
    return res.data.map((entry: any) => ({
      accuracy: entry.accuracy,
      totalKeystrokes: entry.total_keystrokes,
      keystrokesPerMinute: entry.keystrokes_per_minute,
      correctWords: entry.correct_words,
      wordErrorCount: entry.word_error_count,
      skippedWords: entry.skipped_words,
      isFailedBySkippedWords: entry.is_failed_by_skipped_words === 1,
      extraSpaceErrors: entry.extra_space_errors,
      hasIncompleteLastWord: entry.has_incomplete_last_word === 1,
      correctChars: entry.correct_chars,
      incorrectChars: entry.incorrect_chars,
      missedChars: entry.missed_chars,
      extraChars: entry.extra_chars,
      elapsedSeconds: entry.elapsed_seconds,
      expectedComparableChars: entry.expected_comparable_chars,
      actualComparableChars: entry.actual_comparable_chars,
      date: entry.created_at,
      textId: entry.text_id,
      textTitle: entry.text_title,
      durationMinutes: entry.duration_minutes,
      originalText: entry.original_text || '',
      inputValue: entry.input_value || ''
    }))
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function saveTestHistory(
  textId: string | number,
  durationMinutes: DurationMinutes,
  result: TypingResult,
  inputValue: string
): Promise<void> {
  const token = useAuthStore.getState().token
  if (!token) return

  try {
    await api.post('/history', {
      text_id: textId,
      duration_minutes: durationMinutes,
      accuracy: result.accuracy,
      total_keystrokes: result.totalKeystrokes,
      keystrokes_per_minute: result.keystrokesPerMinute,
      correct_words: result.correctWords,
      word_error_count: result.wordErrorCount,
      skipped_words: result.skippedWords,
      is_failed_by_skipped_words: result.isFailedBySkippedWords,
      extra_space_errors: result.extraSpaceErrors,
      has_incomplete_last_word: result.hasIncompleteLastWord,
      correct_chars: result.correctChars,
      incorrect_chars: result.incorrectChars,
      missed_chars: result.missedChars,
      extra_chars: result.extraChars,
      elapsed_seconds: result.elapsedSeconds,
      expected_comparable_chars: result.expectedComparableChars,
      actual_comparable_chars: result.actualComparableChars,
      input_value: inputValue
    })
  } catch (error) {
    console.error('Failed to save history to API', error)
  }
}
