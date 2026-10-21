import { todayISODate } from '@/lib/format'
import type { Visit, VisitInput } from '@/types'

/** What the visit form holds while the user is typing. Photos aren't edited yet, so they're not here. */
export interface VisitFormValues {
  visitDate: string
  wentWith: string
  whatIOrdered: string
  journalEntry: string
  wouldGoBack: boolean
}

export type VisitFormErrors = Partial<Record<'visitDate', string>>

export function toVisitFormValues(input?: VisitInput, today: string = todayISODate()): VisitFormValues {
  return {
    visitDate: input?.visitDate ?? today,
    wentWith: input?.wentWith ?? '',
    whatIOrdered: input?.whatIOrdered ?? '',
    journalEntry: input?.journalEntry ?? '',
    wouldGoBack: input?.wouldGoBack ?? true,
  }
}

/** Only the date is required, and it can't be in the future. */
export function validateVisit(values: VisitFormValues, today: string = todayISODate()): VisitFormErrors {
  const date = values.visitDate
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { visitDate: 'Choose the date you went.' }
  if (date > today) return { visitDate: "That date is in the future. Choose the day you went." }
  return {}
}

/** Trims text. `photos` are carried over untouched from the visit being edited (if any). */
export function toVisitInput(values: VisitFormValues, photos: string[] = []): VisitInput {
  return {
    visitDate: values.visitDate,
    wentWith: values.wentWith.trim(),
    whatIOrdered: values.whatIOrdered.trim(),
    journalEntry: values.journalEntry.trim(),
    photos,
    wouldGoBack: values.wouldGoBack,
  }
}

/** The editable fields of a visit, for pre-filling the edit form. */
export function pickVisitInput(visit: Visit): VisitInput {
  const { visitDate, wentWith, whatIOrdered, journalEntry, photos, wouldGoBack } = visit
  return { visitDate, wentWith, whatIOrdered, journalEntry, photos, wouldGoBack }
}
