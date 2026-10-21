import { StorageError } from './repository'
import type { RestaurantRow, VisitRow, VisitRowWithRestaurant } from './supabaseMappers'

type Obj = Record<string, unknown>

const isObject = (value: unknown): value is Obj => typeof value === 'object' && value !== null
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

export function isRestaurantRow(value: unknown): value is RestaurantRow {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.neighborhood === 'string' &&
    typeof value.cuisine === 'string' &&
    typeof value.status === 'string' &&
    (value.recommended_by === null || typeof value.recommended_by === 'string') &&
    typeof value.why_saved === 'string' &&
    isStringArray(value.vibe_tags) &&
    typeof value.price_level === 'number' &&
    typeof value.created_at === 'string' &&
    typeof value.updated_at === 'string'
  )
}

export function isVisitRow(value: unknown): value is VisitRow {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.restaurant_id === 'string' &&
    typeof value.visit_date === 'string' &&
    typeof value.went_with === 'string' &&
    typeof value.what_i_ordered === 'string' &&
    typeof value.journal_entry === 'string' &&
    isStringArray(value.photos) &&
    typeof value.would_go_back === 'boolean' &&
    typeof value.created_at === 'string' &&
    typeof value.updated_at === 'string'
  )
}

export function isVisitRowWithRestaurant(value: unknown): value is VisitRowWithRestaurant {
  return isVisitRow(value) && isObject(value) && (value.restaurant === null || isRestaurantRow(value.restaurant))
}

export const isIdRow = (value: unknown): value is { id: string } => isObject(value) && typeof value.id === 'string'

const UNEXPECTED = 'Your journal returned data in an unexpected format. The database tables may not match the app.'

/** Checks that `data` is a list of rows of the expected shape. */
export function expectRows<T>(data: unknown, guard: (value: unknown) => value is T): T[] {
  if (!Array.isArray(data) || !data.every(guard)) throw new StorageError(UNEXPECTED)
  return data
}

/** Checks that `data` is one row of the expected shape (or null/missing, which is returned as null). */
export function expectRow<T>(data: unknown, guard: (value: unknown) => value is T): T | null {
  if (data === null || data === undefined) return null
  if (!guard(data)) throw new StorageError(UNEXPECTED)
  return data
}
