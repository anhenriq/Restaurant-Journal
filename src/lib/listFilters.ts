import { PRICE_LEVELS, VIBE_TAGS, type PriceLevel, type VibeTag, type VisitFilter } from '@/types'

/** What the user has chosen on a list screen's search and filter bar. */
export interface ListFilters {
  search: string
  vibeTags: VibeTag[]
  maxPriceLevel: PriceLevel | undefined
}

export const EMPTY_FILTERS: ListFilters = { search: '', vibeTags: [], maxPriceLevel: undefined }

const isVibeTag = (value: string): value is VibeTag => (VIBE_TAGS as readonly string[]).includes(value)
const isPriceLevel = (value: number): value is PriceLevel => (PRICE_LEVELS as readonly number[]).includes(value)

/** Reads filters from a URL's query string (?q=patio&tags=patio,quiet&price=2). Ignores anything invalid. */
export function parseFilters(params: URLSearchParams): ListFilters {
  const price = Number(params.get('price'))
  const tags = (params.get('tags') ?? '').split(',').filter(isVibeTag)
  return {
    search: params.get('q') ?? '',
    vibeTags: VIBE_TAGS.filter((tag) => tags.includes(tag)),
    maxPriceLevel: isPriceLevel(price) ? price : undefined,
  }
}

/** The inverse of parseFilters; empty filters give an empty query string. */
export function serializeFilters(filters: ListFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('q', filters.search)
  if (filters.vibeTags.length > 0) params.set('tags', filters.vibeTags.join(','))
  if (filters.maxPriceLevel !== undefined) params.set('price', String(filters.maxPriceLevel))
  return params
}

/** Number of chosen tag and price filters (the search text is shown separately). */
export function filterCount(filters: ListFilters): number {
  return filters.vibeTags.length + (filters.maxPriceLevel !== undefined ? 1 : 0)
}

/** True when anything is narrowing the list. */
export function isFiltering(filters: ListFilters): boolean {
  return filters.search.trim() !== '' || filterCount(filters) > 0
}

/** Converts to the repository's filter type, leaving out anything unset. */
export function toRepositoryFilter(filters: ListFilters): VisitFilter {
  const search = filters.search.trim()
  return {
    ...(search ? { search } : {}),
    ...(filters.vibeTags.length > 0 ? { vibeTags: filters.vibeTags } : {}),
    ...(filters.maxPriceLevel !== undefined ? { maxPriceLevel: filters.maxPriceLevel } : {}),
  }
}
