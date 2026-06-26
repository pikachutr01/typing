export type DiffSegmentType = 'equal' | 'insert' | 'delete' | 'replace'

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
  mistypedWords: string[]
}

