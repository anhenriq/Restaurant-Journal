/**
 * Every data type in the app lives in this module.
 * UI components and the repository interface both import from here, so a new
 * backend (e.g. Supabase) only has to produce and accept these shapes.
 */

export const RESTAURANT_STATUSES = ['want_to_go', 'visited'] as const
export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number]

export const PRICE_LEVELS = [1, 2, 3, 4] as const
/** 1 = $ (cheap) … 4 = $$$$ (special occasion) */
export type PriceLevel = (typeof PRICE_LEVELS)[number]

export const VIBE_TAGS = [
  'patio',
  'dim_lighting',
  'hole_in_the_wall',
  'good_for_groups',
  'date_night',
  'quiet',
  'cozy',
  'live_music',
  'dog_friendly',
  'family_run',
] as const
export type VibeTag = (typeof VIBE_TAGS)[number]

export const VIBE_TAG_LABELS: Record<VibeTag, string> = {
  patio: 'Patio',
  dim_lighting: 'Dim lighting',
  hole_in_the_wall: 'Hole-in-the-wall',
  good_for_groups: 'Good for groups',
  date_night: 'Date night',
  quiet: 'Quiet',
  cozy: 'Cozy',
  live_music: 'Live music',
  dog_friendly: 'Dog friendly',
  family_run: 'Family run',
}

/** A place George has saved. `status` is maintained by the repository (see Visit). */
export interface Restaurant {
  id: string
  name: string
  /** Neighborhood or city, e.g. "Tempe" or "Downtown Phoenix" */
  neighborhood: string
  cuisine: string
  status: RestaurantStatus
  /** Who tipped George off, e.g. a friend's name */
  recommendedBy?: string
  /** Short note: why this place is on the list */
  whySaved: string
  vibeTags: VibeTag[]
  priceLevel: PriceLevel
  /** ISO 8601 timestamps */
  createdAt: string
  updatedAt: string
}

/**
 * One trip to a restaurant. A restaurant can have many visits.
 * Invariant kept by the repository: a restaurant is `visited` exactly when it has at least one visit.
 */
export interface Visit {
  id: string
  restaurantId: string
  /** Calendar date, YYYY-MM-DD */
  visitDate: string
  wentWith: string
  whatIOrdered: string
  /** Free-form writing. Paragraphs are separated by blank lines. */
  journalEntry: string
  /** Photo URLs. Reserved: the upload UI is not built yet. */
  photos: string[]
  wouldGoBack: boolean
  createdAt: string
  updatedAt: string
}

/** A visit together with the restaurant it belongs to (what the journal list and entry views need). */
export type VisitWithRestaurant = Visit & { restaurant: Restaurant }

/** Fields the user supplies when saving a place. Status and timestamps are set by the repository. */
export type RestaurantInput = Omit<Restaurant, 'id' | 'status' | 'createdAt' | 'updatedAt'>
export type RestaurantPatch = Partial<RestaurantInput>

/** Fields the user supplies when writing a visit entry. */
export type VisitInput = Omit<Visit, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>
export type VisitPatch = Partial<VisitInput>

/** Search and filter options. Omitted fields mean "don't filter on this". */
export interface RestaurantFilter {
  /** Case- and accent-insensitive; every word must match somewhere in the place's text. */
  search?: string
  /** A place must have ALL of these tags. */
  vibeTags?: readonly VibeTag[]
  /** Show places at this price level or cheaper. */
  maxPriceLevel?: PriceLevel
  status?: RestaurantStatus | 'all'
}

/** Visits are filtered by their restaurant's tags and price, and searched across the entry text too. */
export type VisitFilter = Pick<RestaurantFilter, 'search' | 'vibeTags' | 'maxPriceLevel'>

/** The complete persisted dataset. */
export interface JournalData {
  restaurants: Restaurant[]
  visits: Visit[]
}
