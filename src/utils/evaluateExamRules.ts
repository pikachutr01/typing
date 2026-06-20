export type ExamWordEvaluation = {
  correctWords: number
  wordErrorCount: number
  skippedWords: number
  extraSpaceErrors: number
  hasIncompleteLastWord: boolean
  isFailedBySkippedWords: boolean
}

type Match = {
  expectedIndex: number
  actualIndex: number
}

type WordToken = {
  text: string
  end: number
}

function getWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean)
}

function getWordTokens(value: string) {
  const tokens: WordToken[] = []
  const pattern = /\S+/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(value)) !== null) {
    tokens.push({
      text: match[0],
      end: match.index + match[0].length,
    })
  }

  return tokens
}

function countExtraSpaceErrors(value: string) {
  return value.match(/[^\S\r\n]{2,}/g)?.length ?? 0
}

function findExactWordMatches(expectedWords: string[], actualWords: string[]) {
  const lengths = Array.from({ length: expectedWords.length + 1 }, () =>
    new Array(actualWords.length + 1).fill(0),
  )

  for (let expectedIndex = expectedWords.length - 1; expectedIndex >= 0; expectedIndex -= 1) {
    for (let actualIndex = actualWords.length - 1; actualIndex >= 0; actualIndex -= 1) {
      lengths[expectedIndex][actualIndex] =
        expectedWords[expectedIndex] === actualWords[actualIndex]
          ? lengths[expectedIndex + 1][actualIndex + 1] + 1
          : Math.max(
              lengths[expectedIndex + 1][actualIndex],
              lengths[expectedIndex][actualIndex + 1],
            )
    }
  }

  const matches: Match[] = []
  let expectedIndex = 0
  let actualIndex = 0

  while (expectedIndex < expectedWords.length && actualIndex < actualWords.length) {
    if (expectedWords[expectedIndex] === actualWords[actualIndex]) {
      matches.push({ expectedIndex, actualIndex })
      expectedIndex += 1
      actualIndex += 1
      continue
    }

    if (
      lengths[expectedIndex + 1][actualIndex] >
      lengths[expectedIndex][actualIndex + 1]
    ) {
      expectedIndex += 1
    } else {
      actualIndex += 1
    }
  }

  return matches
}

function isIncompleteLastWord(expectedWords: string[], actualWords: string[]) {
  if (expectedWords.length !== 1 || actualWords.length !== 1) {
    return false
  }

  const [expectedWord] = expectedWords
  const [actualWord] = actualWords

  return actualWord.length > 0 && expectedWord.startsWith(actualWord)
}

function evaluateGap(
  expectedWords: string[],
  actualWords: string[],
  isFinalGap: boolean,
) {
  if (expectedWords.length === 0) {
    return {
      wordErrorCount: actualWords.length,
      skippedWords: 0,
      hasIncompleteLastWord: false,
    }
  }

  if (actualWords.length === 0) {
    return {
      wordErrorCount: 0,
      skippedWords: expectedWords.length,
      hasIncompleteLastWord: false,
    }
  }

  if (isFinalGap && isIncompleteLastWord(expectedWords, actualWords)) {
    return {
      wordErrorCount: 0,
      skippedWords: 0,
      hasIncompleteLastWord: true,
    }
  }

  if (expectedWords.length === 1 && actualWords.length > 1) {
    return {
      wordErrorCount:
        actualWords.join('') === expectedWords[0] ? 1 : actualWords.length,
      skippedWords: 0,
      hasIncompleteLastWord: false,
    }
  }

  if (expectedWords.length > 1 && actualWords.length === 1) {
    return {
      wordErrorCount: 1,
      skippedWords: 0,
      hasIncompleteLastWord: false,
    }
  }

  if (expectedWords.length === actualWords.length) {
    return {
      wordErrorCount: actualWords.length,
      skippedWords: 0,
      hasIncompleteLastWord: false,
    }
  }

  return {
    wordErrorCount: actualWords.length,
    skippedWords: Math.max(expectedWords.length - actualWords.length, 0),
    hasIncompleteLastWord: false,
  }
}

export function evaluateExamRules(
  expectedText: string,
  actualText: string,
): ExamWordEvaluation {
  const expectedWords = getWords(expectedText)
  const actualWords = getWords(actualText)
  const matches = findExactWordMatches(expectedWords, actualWords)
  const extraSpaceErrors = countExtraSpaceErrors(actualText)

  let wordErrorCount = extraSpaceErrors
  let skippedWords = 0
  let hasIncompleteLastWord = false
  let previousExpectedIndex = 0
  let previousActualIndex = 0

  const evaluateBetween = (
    nextExpectedIndex: number,
    nextActualIndex: number,
    isFinalGap: boolean,
  ) => {
    const result = evaluateGap(
      expectedWords.slice(previousExpectedIndex, nextExpectedIndex),
      actualWords.slice(previousActualIndex, nextActualIndex),
      isFinalGap,
    )

    wordErrorCount += result.wordErrorCount
    skippedWords += result.skippedWords
    hasIncompleteLastWord ||= result.hasIncompleteLastWord
  }

  for (const match of matches) {
    evaluateBetween(match.expectedIndex, match.actualIndex, false)
    previousExpectedIndex = match.expectedIndex + 1
    previousActualIndex = match.actualIndex + 1
  }

  evaluateBetween(expectedWords.length, actualWords.length, true)

  return {
    correctWords: matches.length,
    wordErrorCount,
    skippedWords,
    extraSpaceErrors,
    hasIncompleteLastWord,
    isFailedBySkippedWords: skippedWords >= 14,
  }
}

export function getReachedExpectedText(expectedText: string, actualText: string) {
  const expectedTokens = getWordTokens(expectedText)
  const actualWords = getWords(actualText)

  if (expectedTokens.length === 0 || actualWords.length === 0) {
    return ''
  }

  const expectedWords = expectedTokens.map((token) => token.text)
  const matches = findExactWordMatches(expectedWords, actualWords)
  
  const validMatches = [...matches]
  
  while (validMatches.length > 1) {
    let clusterSize = 1
    let i = validMatches.length - 1
    
    while (i > 0) {
      const curr = validMatches[i]
      const prev = validMatches[i - 1]
      const expectedGap = curr.expectedIndex - prev.expectedIndex - 1
      const actualGap = curr.actualIndex - prev.actualIndex - 1
      const skippedWords = expectedGap - actualGap
      
      if (skippedWords <= 1) {
        clusterSize++
        i--
      } else {
        break
      }
    }
    
    if (i === 0) break
    
    const firstInCluster = validMatches[i]
    const beforeCluster = validMatches[i - 1]
    const expectedGap = firstInCluster.expectedIndex - beforeCluster.expectedIndex - 1
    const actualGap = firstInCluster.actualIndex - beforeCluster.actualIndex - 1
    const skippedWords = expectedGap - actualGap
    
    if ((skippedWords >= 4 && clusterSize < 3) || (skippedWords >= 10 && clusterSize < 5)) {
      validMatches.splice(i, clusterSize)
    } else {
      break
    }
  }

  const lastMatch = validMatches.at(-1)
  let reachedWordCount = lastMatch === undefined ? 0 : lastMatch.expectedIndex + 1
  const previousExpectedIndex =
    lastMatch === undefined ? 0 : lastMatch.expectedIndex + 1
  const previousActualIndex = lastMatch === undefined ? 0 : lastMatch.actualIndex + 1
  const trailingActualWords = actualWords.length - previousActualIndex

  if (trailingActualWords > 0) {
    reachedWordCount = Math.max(
      reachedWordCount,
      Math.min(previousExpectedIndex + trailingActualWords, expectedTokens.length),
    )
  }

  if (reachedWordCount === 0) {
    reachedWordCount = 1
  }

  return expectedText.slice(0, expectedTokens[reachedWordCount - 1].end)
}
