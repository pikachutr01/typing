import { describe, expect, it } from 'vitest'
import { calculateTypingResult } from './calculateMetrics'
import { diffText } from './diffText'

describe('calculateTypingResult', () => {
  it('calculates WPM and perfect accuracy for exact input', () => {
    const expectedText = 'abcde abcde'
    const segments = diffText(expectedText, expectedText)
    const result = calculateTypingResult(expectedText, expectedText, 60, segments)

    expect(result.correctChars).toBe(11)
    expect(result.correctWords).toBe(2)
    expect(result.totalKeystrokes).toBe(11)
    expect(result.keystrokesPerMinute).toBe(11)
    expect(result.wordsPerMinute).toBe(2)
    expect(result.wpm).toBe(2.2)
    expect(result.accuracy).toBe(100)
  })

  it('counts extra characters', () => {
    const expectedText = 'merhaba dünya'
    const actualText = 'merhaba güzel dünya'
    const segments = diffText(expectedText, actualText)
    const result = calculateTypingResult(expectedText, actualText, 60, segments)

    expect(result.extraChars).toBeGreaterThan(0)
    expect(result.wordErrorCount).toBe(1)
    expect(result.accuracy).toBeLessThan(100)
  })

  it('counts correct words in order even when a word is skipped', () => {
    const expectedText = 'bugün hava çok güzel'
    const actualText = 'bugün çok güzel'
    const segments = diffText(expectedText, actualText)
    const result = calculateTypingResult(expectedText, actualText, 60, segments)

    expect(result.correctWords).toBe(3)
  })

  it('uses the supplied keystroke count for speed statistics', () => {
    const expectedText = 'merhaba dünya'
    const actualText = 'merhaba dünya'
    const segments = diffText(expectedText, actualText)
    const result = calculateTypingResult(expectedText, actualText, 30, segments, 20)

    expect(result.totalKeystrokes).toBe(20)
    expect(result.keystrokesPerMinute).toBe(40)
    expect(result.wordsPerMinute).toBe(4)
  })
})
