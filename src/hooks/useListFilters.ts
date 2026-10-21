import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  EMPTY_FILTERS,
  filterCount,
  isFiltering,
  parseFilters,
  serializeFilters,
  toRepositoryFilter,
  type ListFilters,
} from '@/lib/listFilters'

/**
 * Search and filter state for a list screen. It starts from the URL's query string and writes
 * changes back to it (replacing the history entry), so going back from a detail page restores
 * the same filtered list and a filtered view can be bookmarked.
 */
export function useListFilters() {
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState<ListFilters>(() => parseFilters(params))

  useEffect(() => {
    const next = serializeFilters(filters)
    if (next.toString() !== params.toString()) setParams(next, { replace: true })
    // Writes state -> URL only; reading the URL happens once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  return {
    filters,
    /** Filter object to pass to the data hooks. */
    repositoryFilter: toRepositoryFilter(filters),
    isFiltering: isFiltering(filters),
    activeFilterCount: filterCount(filters),
    update: (patch: Partial<ListFilters>) => setFilters((current) => ({ ...current, ...patch })),
    clear: () => setFilters(EMPTY_FILTERS),
  }
}

export type ListFilterControls = ReturnType<typeof useListFilters>
