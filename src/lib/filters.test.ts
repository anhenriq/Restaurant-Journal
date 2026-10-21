import { describe, expect, it } from 'vitest'
import { SEED_DATA } from '@/data/seed'
import type { VisitWithRestaurant } from '@/types'
import { filterRestaurants, filterVisits } from './filters'

const { restaurants, visits } = SEED_DATA

const visitsWithRestaurant: VisitWithRestaurant[] = visits.map((visit) => {
  const restaurant = restaurants.find((r) => r.id === visit.restaurantId)
  if (!restaurant) throw new Error(`Seed visit ${visit.id} has no restaurant`)
  return { ...visit, restaurant }
})

const names = (list: ReadonlyArray<{ name: string }>) => list.map((r) => r.name).sort()

describe('filterRestaurants', () => {
  it('returns everything with no filter', () => {
    expect(filterRestaurants(restaurants)).toHaveLength(restaurants.length)
  })

  it('filters by status', () => {
    expect(names(filterRestaurants(restaurants, { status: 'want_to_go' }))).toEqual([
      'Kiln Street Noodle House',
      'La Ramada Verde',
      'Olive & Ember',
      'Sable Terrace',
    ])
    expect(filterRestaurants(restaurants, { status: 'visited' })).toHaveLength(3)
    expect(filterRestaurants(restaurants, { status: 'all' })).toHaveLength(restaurants.length)
  })

  it('requires ALL selected vibe tags', () => {
    expect(names(filterRestaurants(restaurants, { vibeTags: ['patio'] }))).toEqual([
      'Brick & Vine',
      'La Ramada Verde',
      'Olive & Ember',
      'Sable Terrace',
    ])
    expect(names(filterRestaurants(restaurants, { vibeTags: ['patio', 'dim_lighting'] }))).toEqual([
      'Brick & Vine',
      'Olive & Ember',
      'Sable Terrace',
    ])
    expect(filterRestaurants(restaurants, { vibeTags: ['patio', 'live_music'] })).toEqual([])
  })

  it('treats price as a maximum', () => {
    expect(filterRestaurants(restaurants, { maxPriceLevel: 1 }).every((r) => r.priceLevel === 1)).toBe(true)
    expect(filterRestaurants(restaurants, { maxPriceLevel: 2 })).toHaveLength(4)
    expect(filterRestaurants(restaurants, { maxPriceLevel: 4 })).toHaveLength(restaurants.length)
  })

  it('searches name, cuisine, neighborhood, recommender and notes, ignoring case and accents', () => {
    expect(names(filterRestaurants(restaurants, { search: 'TAIWANESE' }))).toEqual(['Kiln Street Noodle House'])
    expect(names(filterRestaurants(restaurants, { search: 'guadalupe' }))).toEqual(['Casa Pelayo'])
    expect(names(filterRestaurants(restaurants, { search: 'marcus' }))).toEqual(['La Ramada Verde'])
    expect(names(filterRestaurants(restaurants, { search: 'mesquite' }))).toEqual(['La Ramada Verde'])
    expect(names(filterRestaurants(restaurants, { search: 'dim lighting' }))).toContain('Olive & Ember')
    const accented = [{ ...restaurants[0]!, name: 'Café Jalapeño' }]
    expect(filterRestaurants(accented, { search: 'cafe jalapeno' })).toHaveLength(1)
  })

  it('requires every search word to match', () => {
    expect(names(filterRestaurants(restaurants, { search: 'tempe italian' }))).toEqual(['Brick & Vine'])
    expect(filterRestaurants(restaurants, { search: 'tempe taiwanese' })).toEqual([])
  })

  it('ignores blank searches and combines filters', () => {
    expect(filterRestaurants(restaurants, { search: '   ' })).toHaveLength(restaurants.length)
    expect(
      names(filterRestaurants(restaurants, { status: 'want_to_go', vibeTags: ['patio'], maxPriceLevel: 3 })),
    ).toEqual(['La Ramada Verde', 'Olive & Ember'])
  })
})

describe('filterVisits', () => {
  it('searches the journal text, not just the restaurant', () => {
    expect(filterVisits(visitsWithRestaurant, { search: 'basset hound' }).map((v) => v.id)).toEqual([
      'seed-visit-brick-vine-1',
    ])
    expect(filterVisits(visitsWithRestaurant, { search: 'caldo' }).map((v) => v.id)).toEqual([
      'seed-visit-casa-pelayo-2',
    ])
  })

  it("filters on the restaurant's tags and price", () => {
    expect(
      new Set(filterVisits(visitsWithRestaurant, { vibeTags: ['hole_in_the_wall'] }).map((v) => v.restaurant.name)),
    ).toEqual(new Set(['Casa Pelayo']))
    expect(filterVisits(visitsWithRestaurant, { maxPriceLevel: 2 })).toHaveLength(3)
  })
})
