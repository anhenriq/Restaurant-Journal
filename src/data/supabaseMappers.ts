import {
  PRICE_LEVELS,
  VIBE_TAGS,
  type PriceLevel,
  type Restaurant,
  type RestaurantInput,
  type RestaurantPatch,
  type VibeTag,
  type Visit,
  type VisitInput,
  type VisitPatch,
  type VisitWithRestaurant,
} from '@/types'

/** A row of the `restaurants` table (see supabase/schema.sql). */
export interface RestaurantRow {
  id: string
  name: string
  neighborhood: string
  cuisine: string
  status: string
  recommended_by: string | null
  why_saved: string
  vibe_tags: string[]
  price_level: number
  created_at: string
  updated_at: string
}

/** A row of the `visits` table. */
export interface VisitRow {
  id: string
  restaurant_id: string
  visit_date: string
  went_with: string
  what_i_ordered: string
  journal_entry: string
  photos: string[]
  would_go_back: boolean
  created_at: string
  updated_at: string
}

export type VisitRowWithRestaurant = VisitRow & { restaurant: RestaurantRow | null }

const isVibeTag = (value: string): value is VibeTag => (VIBE_TAGS as readonly string[]).includes(value)
const isPriceLevel = (value: number): value is PriceLevel => (PRICE_LEVELS as readonly number[]).includes(value)

/** Database → app. Unknown tags (e.g. from an older version) are dropped rather than crashing the UI. */
export function restaurantFromRow(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood,
    cuisine: row.cuisine,
    status: row.status === 'visited' ? 'visited' : 'want_to_go',
    ...(row.recommended_by ? { recommendedBy: row.recommended_by } : {}),
    whySaved: row.why_saved,
    vibeTags: row.vibe_tags.filter(isVibeTag),
    priceLevel: isPriceLevel(row.price_level) ? row.price_level : 2,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function visitFromRow(row: VisitRow): Visit {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    visitDate: row.visit_date,
    wentWith: row.went_with,
    whatIOrdered: row.what_i_ordered,
    journalEntry: row.journal_entry,
    photos: row.photos,
    wouldGoBack: row.would_go_back,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function visitWithRestaurantFromRow(row: VisitRowWithRestaurant & { restaurant: RestaurantRow }): VisitWithRestaurant {
  return { ...visitFromRow(row), restaurant: restaurantFromRow(row.restaurant) }
}

/** App → database, for creating a restaurant. The id, owner, status and timestamps come from the database. */
export function restaurantInputToRow(input: RestaurantInput) {
  return {
    name: input.name,
    neighborhood: input.neighborhood,
    cuisine: input.cuisine,
    recommended_by: input.recommendedBy ?? null,
    why_saved: input.whySaved,
    vibe_tags: input.vibeTags,
    price_level: input.priceLevel,
  }
}

/**
 * Only fields present in the patch are written. A key that is present with value `undefined`
 * (for example `recommendedBy: undefined`) clears that column.
 */
export function restaurantPatchToRow(patch: RestaurantPatch): Partial<ReturnType<typeof restaurantInputToRow>> {
  const row: Partial<ReturnType<typeof restaurantInputToRow>> = {}
  if ('name' in patch && patch.name !== undefined) row.name = patch.name
  if ('neighborhood' in patch && patch.neighborhood !== undefined) row.neighborhood = patch.neighborhood
  if ('cuisine' in patch && patch.cuisine !== undefined) row.cuisine = patch.cuisine
  if ('recommendedBy' in patch) row.recommended_by = patch.recommendedBy ?? null
  if ('whySaved' in patch && patch.whySaved !== undefined) row.why_saved = patch.whySaved
  if ('vibeTags' in patch && patch.vibeTags !== undefined) row.vibe_tags = patch.vibeTags
  if ('priceLevel' in patch && patch.priceLevel !== undefined) row.price_level = patch.priceLevel
  return row
}

export function visitInputToRow(restaurantId: string, input: VisitInput) {
  return {
    restaurant_id: restaurantId,
    visit_date: input.visitDate,
    went_with: input.wentWith,
    what_i_ordered: input.whatIOrdered,
    journal_entry: input.journalEntry,
    photos: input.photos,
    would_go_back: input.wouldGoBack,
  }
}

export function visitPatchToRow(patch: VisitPatch): Partial<Omit<ReturnType<typeof visitInputToRow>, 'restaurant_id'>> {
  const row: Partial<Omit<ReturnType<typeof visitInputToRow>, 'restaurant_id'>> = {}
  if (patch.visitDate !== undefined) row.visit_date = patch.visitDate
  if (patch.wentWith !== undefined) row.went_with = patch.wentWith
  if (patch.whatIOrdered !== undefined) row.what_i_ordered = patch.whatIOrdered
  if (patch.journalEntry !== undefined) row.journal_entry = patch.journalEntry
  if (patch.photos !== undefined) row.photos = patch.photos
  if (patch.wouldGoBack !== undefined) row.would_go_back = patch.wouldGoBack
  return row
}
