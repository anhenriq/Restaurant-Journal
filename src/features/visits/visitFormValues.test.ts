import { describe, expect, it } from 'vitest'
import { toVisitFormValues, toVisitInput, validateVisit } from './visitFormValues'

const TODAY = '2026-10-20'

describe('visit form helpers', () => {
  it("defaults to today's date and 'would go back'", () => {
    expect(toVisitFormValues(undefined, TODAY)).toEqual({
      visitDate: TODAY,
      wentWith: '',
      whatIOrdered: '',
      journalEntry: '',
      wouldGoBack: true,
    })
  })

  it('requires a real date that is not in the future', () => {
    const base = toVisitFormValues(undefined, TODAY)
    expect(validateVisit(base, TODAY)).toEqual({})
    expect(validateVisit({ ...base, visitDate: '2026-10-19' }, TODAY)).toEqual({})
    expect(validateVisit({ ...base, visitDate: '' }, TODAY).visitDate).toBe('Choose the date you went.')
    expect(validateVisit({ ...base, visitDate: '2026-10-21' }, TODAY).visitDate).toMatch(/in the future/)
  })

  it('trims text, keeps paragraph breaks, and carries photos over', () => {
    const input = toVisitInput(
      {
        visitDate: '2026-10-01',
        wentWith: ' Sam ',
        whatIOrdered: ' Tacos ',
        journalEntry: '\n First paragraph.\n\nSecond paragraph. \n',
        wouldGoBack: false,
      },
      ['a.jpg'],
    )
    expect(input).toEqual({
      visitDate: '2026-10-01',
      wentWith: 'Sam',
      whatIOrdered: 'Tacos',
      journalEntry: 'First paragraph.\n\nSecond paragraph.',
      photos: ['a.jpg'],
      wouldGoBack: false,
    })
  })

  it('round-trips an existing visit', () => {
    const existing = {
      visitDate: '2026-09-12',
      wentWith: 'Jess',
      whatIOrdered: 'Flatbread',
      journalEntry: 'Lovely.',
      photos: [],
      wouldGoBack: true,
    }
    expect(toVisitInput(toVisitFormValues(existing, TODAY), existing.photos)).toEqual(existing)
  })
})
