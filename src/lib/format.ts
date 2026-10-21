import type { PriceLevel } from '@/types'

export const PRICE_LEVEL_DESCRIPTIONS: Record<PriceLevel, string> = {
  1: 'Cheap eats',
  2: 'Moderate',
  3: 'Pricey',
  4: 'Special occasion',
}

/** 1 → "$", 4 → "$$$$" */
export function priceSymbols(level: PriceLevel): string {
  return '$'.repeat(level)
}

/** "2026-09-12" → "September 12, 2026". Returns the input unchanged if it isn't a valid date. */
export function formatVisitDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const [, year, month, day] = match.map(Number)
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1))
  if (Number.isNaN(date.getTime())) return isoDate
  // UTC on both sides so the calendar day never shifts with the viewer's time zone
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** Today's local calendar date as YYYY-MM-DD (the default for a new visit). */
export function todayISODate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Splits journal text into paragraphs at blank lines, dropping empty ones. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
