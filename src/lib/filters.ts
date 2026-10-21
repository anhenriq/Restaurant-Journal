import type {
  Restaurant,
  RestaurantFilter,
  VisitFilter,
  VisitWithRestaurant,
} from '@/types'
import { VIBE_TAG_LABELS } from '@/types'

/** Lowercase and strip accents so "Jalapeño" matches "jalapeno". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

function searchTerms(search: string | undefined): string[] {
  return normalize(search ?? '')
    .split(/\s+/)
    .filter(Boolean)
}

function restaurantText(restaurant: Restaurant): string[] {
  return [
    restaurant.name,
    restaurant.neighborhood,
    restaurant.cuisine,
    restaurant.recommendedBy ?? '',
    restaurant.whySaved,
    ...restaurant.vibeTags.map((tag) => VIBE_TAG_LABELS[tag]),
  ]
}

/** True when every search word appears somewhere in the given text fields. */
function matchesAllTerms(terms: readonly string[], fields: readonly string[]): boolean {
  if (terms.length === 0) return true
  const haystack = normalize(fields.join(' \n '))
  return terms.every((term) => haystack.includes(term))
}

function matchesPlaceFilters(restaurant: Restaurant, filter: VisitFilter): boolean {
  const { vibeTags = [], maxPriceLevel } = filter
  if (maxPriceLevel !== undefined && restaurant.priceLevel > maxPriceLevel) return false
  return vibeTags.every((tag) => restaurant.vibeTags.includes(tag))
}

export function filterRestaurants(
  restaurants: readonly Restaurant[],
  filter: RestaurantFilter = {},
): Restaurant[] {
  const terms = searchTerms(filter.search)
  const { status = 'all' } = filter
  return restaurants.filter(
    (restaurant) =>
      (status === 'all' || restaurant.status === status) &&
      matchesPlaceFilters(restaurant, filter) &&
      matchesAllTerms(terms, restaurantText(restaurant)),
  )
}

export function filterVisits(
  visits: readonly VisitWithRestaurant[],
  filter: VisitFilter = {},
): VisitWithRestaurant[] {
  const terms = searchTerms(filter.search)
  return visits.filter(
    (visit) =>
      matchesPlaceFilters(visit.restaurant, filter) &&
      matchesAllTerms(terms, [
        ...restaurantText(visit.restaurant),
        visit.wentWith,
        visit.whatIOrdered,
        visit.journalEntry,
      ]),
  )
}
