export type TestStatus = 'idle' | 'running' | 'finished'

export type DurationMinutes = 1 | 3 | 5 | 7 | 10

export type DiffSegmentType = 'equal' | 'insert' | 'delete' | 'replace'

export type TypingText = {
  id: string
  title: string
  content: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export type DiffSegment = {
  id: string
  type: DiffSegmentType
  expectedText: string
  actualText: string
}

export type TypingResult = {
  accuracy: number
  totalKeystrokes: number
  keystrokesPerMinute: number
  wordErrorCount: number
  skippedWords: number
  extraSpaceErrors: number
  hasIncompleteLastWord: boolean
  isFailedBySkippedWords: boolean
  correctChars: number
  correctWords: number
  incorrectChars: number
  missedChars: number
  extraChars: number
  elapsedSeconds: number
  expectedComparableChars: number
  actualComparableChars: number
  diffSegments: DiffSegment[]
}

export type TestHistoryEntry = Omit<TypingResult, 'diffSegments'> & {
  date: string
  textId: string
  textTitle?: string
  durationMinutes: DurationMinutes
  originalText: string
  inputValue: string
}
