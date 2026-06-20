import { describe, expect, it } from 'vitest'
import { diffText, getReachedDiffSegments } from './diffText'

describe('diffText', () => {
  it('keeps correct text after a skipped word aligned', () => {
    const segments = diffText('bugün hava çok güzel', 'bugün çok güzel')

    expect(segments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'delete', expectedText: 'hava ' }),
        expect.objectContaining({ type: 'equal', expectedText: 'çok güzel' }),
      ]),
    )
  })

  it('marks extra words as inserts', () => {
    const segments = diffText('hızlı yaz', 'hızlı ve yaz')
    const insertSegment = segments.find((segment) => segment.type === 'insert')

    expect(insertSegment?.actualText).toContain('ve')
  })

  it('marks wrong words as replacements', () => {
    const segments = diffText('temiz kod', 'temiz kalem')

    expect(segments.some((segment) => segment.type === 'replace')).toBe(true)
  })

  it('does not mark the final aligned text as extra after earlier omissions', () => {
    const targetText =
      'soruşturma evresinde hakkında suç işlediği şüphe bulunan kişilere şüpheli denir savunma makamı olarak yer alır şüpheli'
    const actualText =
      'soruşturma hakkında suç şüphe bulunan kişilere şüpheli denir savunma makamı olarak yer alır şüpheli'
    const reachedSegments = getReachedDiffSegments(diffText(targetText, actualText))
    const lastSegment = reachedSegments.at(-1)

    expect(lastSegment).toEqual(
      expect.objectContaining({
        type: 'equal',
        expectedText: expect.stringContaining('yer alır şüpheli'),
      }),
    )
    expect(
      reachedSegments.some(
        (segment) =>
          segment.type === 'insert' && segment.actualText.includes('yer alır şüpheli'),
      ),
    ).toBe(false)
  })

  it('drops the untouched target tail after the last typed replacement', () => {
    const reachedSegments = getReachedDiffSegments(diffText('abcdef', 'abX'))

    expect(reachedSegments.map((segment) => segment.expectedText).join('')).toBe(
      'abc',
    )
    expect(reachedSegments.map((segment) => segment.actualText).join('')).toBe(
      'abX',
    )
  })
})
