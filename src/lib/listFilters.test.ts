import { describe, expect, it } from 'vitest'
import {
  EMPTY_FILTERS,
  filterCount,
  isFiltering,
  parseFilters,
  serializeFilters,
  toRepositoryFilter,
} from './listFilters'

describe('list filters', () => {
  it('round-trips through the URL', () => {
    const filters = { search: 'fig tree', vibeTags: ['patio' as const, 'quiet' as const], maxPriceLevel: 2 as const }
    const params = serializeFilters(filters)
    expect(params.toString()).toBe('q=fig+tree&tags=patio%2Cquiet&price=2')
    expect(parseFilters(new URLSearchParams(params.toString()))).toEqual(filters)
  })

  it('serializes empty filters to nothing', () => {
    expect(serializeFilters(EMPTY_FILTERS).toString()).toBe('')
    expect(parseFilters(new URLSearchParams(''))).toEqual(EMPTY_FILTERS)
  })

  it('ignores unknown tags and bad prices from a hand-edited URL', () => {
    expect(parseFilters(new URLSearchParams('tags=patio,nonsense&price=9'))).toEqual({
      search: '',
      vibeTags: ['patio'],
      maxPriceLevel: undefined,
    })
    expect(parseFilters(new URLSearchParams('price=abc')).maxPriceLevel).toBeUndefined()
  })

  it('counts tag and price filters, and knows when the list is narrowed', () => {
    expect(filterCount(EMPTY_FILTERS)).toBe(0)
    expect(filterCount({ search: 'x', vibeTags: ['patio', 'quiet'], maxPriceLevel: 1 })).toBe(3)
    expect(isFiltering(EMPTY_FILTERS)).toBe(false)
    expect(isFiltering({ ...EMPTY_FILTERS, search: '   ' })).toBe(false)
    expect(isFiltering({ ...EMPTY_FILTERS, search: 'taco' })).toBe(true)
    expect(isFiltering({ ...EMPTY_FILTERS, maxPriceLevel: 3 })).toBe(true)
  })

  it('builds a repository filter without unset fields', () => {
    expect(toRepositoryFilter(EMPTY_FILTERS)).toEqual({})
    expect(toRepositoryFilter({ search: ' taco ', vibeTags: ['patio'], maxPriceLevel: 2 })).toEqual({
      search: 'taco',
      vibeTags: ['patio'],
      maxPriceLevel: 2,
    })
  })
})
