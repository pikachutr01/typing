import type { DiffSegment, TypingResult } from '../types/typing'
import { evaluateExamRules } from './evaluateExamRules'

function roundMetric(value: number) {
  return Number.isFinite(value) ? Math.round(value * 10) / 10 : 0
}

function sumSegmentText(
  segments: DiffSegment[],
  selector: (segment: DiffSegment) => string,
) {
  return segments.reduce((total, segment) => total + selector(segment).length, 0)
}



export function calculateTypingResult(
  expectedText: string,
  actualText: string,
  elapsedSeconds: number,
  diffSegments: DiffSegment[],
  totalKeystrokes = actualText.length,
): TypingResult {
  const correctChars = sumSegmentText(
    diffSegments.filter((segment) => segment.type === 'equal'),
    (segment) => segment.expectedText,
  )

  const replaceSegments = diffSegments.filter(
    (segment) => segment.type === 'replace',
  )
  const deleteSegments = diffSegments.filter(
    (segment) => segment.type === 'delete',
  )
  const insertSegments = diffSegments.filter(
    (segment) => segment.type === 'insert',
  )

  const incorrectChars = replaceSegments.reduce(
    (total, segment) =>
      total + Math.min(segment.expectedText.length, segment.actualText.length),
    0,
  )
  const missedChars =
    sumSegmentText(deleteSegments, (segment) => segment.expectedText) +
    replaceSegments.reduce(
      (total, segment) =>
        total + Math.max(segment.expectedText.length - segment.actualText.length, 0),
      0,
    )
  const extraChars =
    sumSegmentText(insertSegments, (segment) => segment.actualText) +
    replaceSegments.reduce(
      (total, segment) =>
        total + Math.max(segment.actualText.length - segment.expectedText.length, 0),
      0,
    )

  const elapsedMinutes = Math.max(elapsedSeconds / 60, 1 / 60)
  const examEvaluation = evaluateExamRules(expectedText, actualText)
  const evaluatedWordCount =
    examEvaluation.correctWords + examEvaluation.wordErrorCount
  const accuracy =
    evaluatedWordCount === 0
      ? 0
      : roundMetric((examEvaluation.correctWords / evaluatedWordCount) * 100)

  return {
    accuracy,
    totalKeystrokes,
    keystrokesPerMinute: roundMetric(totalKeystrokes / elapsedMinutes),
    wordErrorCount: examEvaluation.wordErrorCount,
    skippedWords: examEvaluation.skippedWords,
    extraSpaceErrors: examEvaluation.extraSpaceErrors,
    hasIncompleteLastWord: examEvaluation.hasIncompleteLastWord,
    isFailedBySkippedWords: examEvaluation.isFailedBySkippedWords,
    correctChars,
    correctWords: examEvaluation.correctWords,
    incorrectChars,
    missedChars,
    extraChars,
    elapsedSeconds,
    expectedComparableChars: expectedText.length,
    actualComparableChars: actualText.length,
    diffSegments,
  }
}
