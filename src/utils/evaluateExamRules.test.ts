import { describe, expect, it } from 'vitest'
import { evaluateExamRules, getReachedExpectedText } from './evaluateExamRules'

describe('evaluateExamRules', () => {
  it('counts extra, missing, transposed and mixed character word errors as one word error each', () => {
    expect(evaluateExamRules('adalet', 'adalett').wordErrorCount).toBe(1)
    expect(evaluateExamRules('adalet', 'adaet').wordErrorCount).toBe(1)
    expect(evaluateExamRules('adalet', 'adalte').wordErrorCount).toBe(1)
    expect(evaluateExamRules('adalet', 'ada2let').wordErrorCount).toBe(1)
  })

  it('counts correctly split words as one word error', () => {
    const result = evaluateExamRules('adalet', 'ad al et')

    expect(result.wordErrorCount).toBe(1)
    expect(result.correctWords).toBe(0)
  })

  it('counts incorrectly split word parts separately', () => {
    const result = evaluateExamRules('birleştirme', 'bir leşş tir me')

    expect(result.wordErrorCount).toBe(4)
  })

  it('counts merged adjacent words as one word error', () => {
    const result = evaluateExamRules('adalet bakanlığı', 'adaletbakanlığı')

    expect(result.wordErrorCount).toBe(1)
  })

  it('counts each repeated space run as one word error', () => {
    const result = evaluateExamRules('adalet bakanlığı için', 'adalet  bakanlığı   için')

    expect(result.extraSpaceErrors).toBe(2)
    expect(result.wordErrorCount).toBe(2)
  })

  it('does not count skipped words as word errors', () => {
    const result = evaluateExamRules('bugün hava çok güzel', 'bugün çok güzel')

    expect(result.correctWords).toBe(3)
    expect(result.skippedWords).toBe(1)
    expect(result.wordErrorCount).toBe(0)
  })

  it('marks twenty-two skipped words as failed', () => {
    const result = evaluateExamRules(
      'w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 w12 w13 w14 w15 w16 w17 w18 w19 w20 w21 w22 w23',
      'w1 w23',
    )

    expect(result.skippedWords).toBe(21)
    expect(result.isFailedBySkippedWords).toBe(false)

    const failedResult = evaluateExamRules(
      'w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 w12 w13 w14 w15 w16 w17 w18 w19 w20 w21 w22 w23 w24',
      'w1 w24',
    )

    expect(failedResult.skippedWords).toBe(22)
    expect(failedResult.isFailedBySkippedWords).toBe(true)
  })

  it('does not count the incomplete last word as a word error', () => {
    const result = evaluateExamRules('savunma makamı olarak', 'savunma makamı ola')

    expect(result.correctWords).toBe(2)
    expect(result.hasIncompleteLastWord).toBe(true)
    expect(result.wordErrorCount).toBe(0)
  })

  it('keeps the reached target aligned after a wrong final-area word', () => {
    const expectedText =
      'kanunilik ilkesi de cezaların başka bir özelliğidir ceza yasa koyucu tarafından kanunla konulup ancak kanunla kaldırılabilir yasa koyucu neyin suç olup olmayacağı'
    const actualText =
      'kanunilik ilkesi de cezaların başka bir özelliğidir ceza yasa koyucu tarafından kanunla koyulup ancak kanunla kaldırılabilir yasa koyucu neyin suç'

    expect(getReachedExpectedText(expectedText, actualText)).toBe(
      'kanunilik ilkesi de cezaların başka bir özelliğidir ceza yasa koyucu tarafından kanunla konulup ancak kanunla kaldırılabilir yasa koyucu neyin suç',
    )
  })

  it('matches a repeated trailing word to the nearest expected position', () => {
    const expectedText =
      'tam ehliyetsizler hukuki işlem yapamazlar bu yaptıkları hukuki işlem geçersiz sayılır'
    const actualText = 'tam ehliyet sizler hukuki'

    expect(getReachedExpectedText(expectedText, actualText)).toBe(
      'tam ehliyetsizler hukuki',
    )
  })
})
