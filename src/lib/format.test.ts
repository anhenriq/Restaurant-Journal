import { describe, expect, it } from 'vitest'
import { formatVisitDate, priceSymbols, splitParagraphs, todayISODate } from './format'

describe('format helpers', () => {
  it('renders price levels as dollar signs', () => {
    expect(priceSymbols(1)).toBe('$')
    expect(priceSymbols(4)).toBe('$$$$')
  })

  it('formats a calendar date without shifting the day', () => {
    expect(formatVisitDate('2026-09-12')).toBe('September 12, 2026')
    expect(formatVisitDate('2026-01-01')).toBe('January 1, 2026')
  })

  it('returns malformed dates unchanged', () => {
    expect(formatVisitDate('last tuesday')).toBe('last tuesday')
    expect(formatVisitDate('')).toBe('')
  })

  it("formats today's local date as YYYY-MM-DD", () => {
    expect(todayISODate(new Date(2026, 8, 5))).toBe('2026-09-05')
  })

  it('splits journal text into paragraphs at blank lines', () => {
    expect(splitParagraphs('One.\n\nTwo line\nstill two.\n\n\n  \nThree.')).toEqual([
      'One.',
      'Two line\nstill two.',
      'Three.',
    ])
    expect(splitParagraphs('   ')).toEqual([])
  })
})
