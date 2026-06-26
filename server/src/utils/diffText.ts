import DiffMatchPatch from 'diff-match-patch'
import type { DiffSegment } from '../types/typing'

const dmp = new DiffMatchPatch()

function createSegment(
  index: number,
  type: DiffSegment['type'],
  expectedText: string,
  actualText: string,
): DiffSegment {
  return {
    id: `${index}-${type}-${expectedText.length}-${actualText.length}`,
    type,
    expectedText,
    actualText,
  }
}

function recreateSegment(
  source: DiffSegment,
  index: number,
  expectedText: string,
  actualText: string,
) {
  return createSegment(index, source.type, expectedText, actualText)
}

export function diffText(expectedText: string, actualText: string) {
  const diffs = dmp.diff_main(expectedText, actualText)
  dmp.diff_cleanupSemantic(diffs)

  const segments: DiffSegment[] = []

  for (let index = 0; index < diffs.length; index += 1) {
    const [operation, text] = diffs[index]

    if (operation === 0) {
      segments.push(createSegment(index, 'equal', text, text))
      continue
    }

    if (operation === -1) {
      const nextDiff = diffs[index + 1]

      if (nextDiff?.[0] === 1) {
        segments.push(createSegment(index, 'replace', text, nextDiff[1]))
        index += 1
        continue
      }

      segments.push(createSegment(index, 'delete', text, ''))
      continue
    }

    segments.push(createSegment(index, 'insert', '', text))
  }

  return segments
}

export function getReachedDiffSegments(segments: DiffSegment[]) {
  let expectedOffset = 0
  let reachedExpectedOffset = 0

  const positionedSegments = segments.map((segment) => {
    const expectedStart = expectedOffset
    expectedOffset += segment.expectedText.length

    return {
      segment,
      expectedStart,
      expectedEnd: expectedOffset,
    }
  })

  for (const { segment, expectedStart, expectedEnd } of positionedSegments) {
    if (segment.type === 'equal') {
      reachedExpectedOffset = Math.max(reachedExpectedOffset, expectedEnd)
      continue
    }

    if (segment.type === 'replace') {
      reachedExpectedOffset = Math.max(
        reachedExpectedOffset,
        expectedStart + Math.min(segment.expectedText.length, segment.actualText.length),
      )
      continue
    }

    if (segment.type === 'insert') {
      reachedExpectedOffset = Math.max(reachedExpectedOffset, expectedStart)
    }
  }

  const reachedSegments: DiffSegment[] = []

  for (const { segment, expectedStart, expectedEnd } of positionedSegments) {
    if (segment.type === 'insert') {
      if (expectedStart <= reachedExpectedOffset) {
        reachedSegments.push(
          recreateSegment(
            segment,
            reachedSegments.length,
            segment.expectedText,
            segment.actualText,
          ),
        )
      }

      continue
    }

    if (expectedStart >= reachedExpectedOffset) {
      continue
    }

    if (expectedEnd <= reachedExpectedOffset) {
      reachedSegments.push(
        recreateSegment(
          segment,
          reachedSegments.length,
          segment.expectedText,
          segment.actualText,
        ),
      )
      continue
    }

    const expectedLength = reachedExpectedOffset - expectedStart
    const expectedText = segment.expectedText.slice(0, expectedLength)
    const actualText =
      segment.type === 'replace'
        ? segment.actualText.slice(0, expectedLength)
        : segment.type === 'equal'
          ? expectedText
          : ''

    if (expectedText || actualText) {
      reachedSegments.push(
        recreateSegment(segment, reachedSegments.length, expectedText, actualText),
      )
    }
  }

  return reachedSegments
}
