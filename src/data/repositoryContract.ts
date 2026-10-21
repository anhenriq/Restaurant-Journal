import { describe, expect, it } from 'vitest'
import type { JournalData, RestaurantInput, VisitInput } from '@/types'
import { NotFoundError, type RestaurantRepository } from './repository'
import { SEED_DATA } from './seed'

export const EMPTY_DATA: JournalData = { restaurants: [], visits: [] }

const placeInput: RestaurantInput = {
  name: 'Test Taqueria',
  neighborhood: 'Mesa',
  cuisine: 'Mexican',
  recommendedBy: 'Sam',
  whySaved: 'Great patio',
  vibeTags: ['patio'],
  priceLevel: 2,
}

const visitInput: VisitInput = {
  visitDate: '2026-10-01',
  wentWith: 'Sam',
  whatIOrdered: 'Tacos',
  journalEntry: 'Lovely evening.',
  photos: [],
  wouldGoBack: true,
}

/** Makes a repository holding `seed`, with ids and the clock under the test's control where possible. */
export type RepositoryFactory = (seed: JournalData) => RestaurantRepository

/**
 * The rules every RestaurantRepository must follow, whatever stores the data.
 * Run it against each implementation (browser storage, Supabase…).
 */
export function describeRepositoryContract(name: string, create: RepositoryFactory) {
  describe(`${name} follows the repository contract`, () => {
    it('creates a place as want_to_go, newest first', async () => {
      const repo = create(EMPTY_DATA)
      const first = await repo.createRestaurant({ ...placeInput, name: 'First' })
      const second = await repo.createRestaurant({ ...placeInput, name: 'Second' })
      expect(first).toMatchObject({ status: 'want_to_go', name: 'First', recommendedBy: 'Sam' })
      expect(first.id).toEqual(expect.any(String))
      expect((await repo.listRestaurants()).map((r) => r.name)).toEqual(['Second', 'First'])
      expect((await repo.getRestaurant(second.id)).name).toBe('Second')
    })

    it('updates a place and bumps updatedAt', async () => {
      const repo = create(EMPTY_DATA)
      const place = await repo.createRestaurant(placeInput)
      const updated = await repo.updateRestaurant(place.id, { whySaved: 'Changed my mind', priceLevel: 3 })
      expect(updated).toMatchObject({ whySaved: 'Changed my mind', priceLevel: 3, name: 'Test Taqueria' })
      expect(updated.updatedAt > place.updatedAt).toBe(true)
      expect(updated.createdAt).toBe(place.createdAt)
    })

    it('clears "recommended by" only when the patch says so explicitly', async () => {
      const repo = create(EMPTY_DATA)
      const place = await repo.createRestaurant(placeInput)
      expect((await repo.updateRestaurant(place.id, { name: 'Renamed' })).recommendedBy).toBe('Sam')
      const cleared = await repo.updateRestaurant(place.id, { recommendedBy: undefined })
      expect(cleared.recommendedBy).toBeUndefined()
      expect((await repo.getRestaurant(place.id)).recommendedBy).toBeUndefined()
    })

    it('"Mark as visited" adds a visit and flips the place to visited', async () => {
      const repo = create(EMPTY_DATA)
      const place = await repo.createRestaurant(placeInput)
      const visit = await repo.addVisit(place.id, visitInput)

      expect(visit).toMatchObject({ restaurantId: place.id, wentWith: 'Sam', wouldGoBack: true })
      expect((await repo.getRestaurant(place.id)).status).toBe('visited')
      expect(await repo.listRestaurants({ status: 'want_to_go' })).toEqual([])

      const journal = await repo.listVisits()
      expect(journal).toHaveLength(1)
      expect(journal[0]?.restaurant.name).toBe('Test Taqueria')
    })

    it('supports repeat visits, newest first', async () => {
      const repo = create(EMPTY_DATA)
      const place = await repo.createRestaurant(placeInput)
      await repo.addVisit(place.id, { ...visitInput, visitDate: '2026-09-01' })
      await repo.addVisit(place.id, { ...visitInput, visitDate: '2026-10-01' })
      const visits = await repo.listVisitsForRestaurant(place.id)
      expect(visits.map((v) => v.visitDate)).toEqual(['2026-10-01', '2026-09-01'])
    })

    it('updates a visit', async () => {
      const repo = create(EMPTY_DATA)
      const place = await repo.createRestaurant(placeInput)
      const visit = await repo.addVisit(place.id, visitInput)
      const updated = await repo.updateVisit(visit.id, { journalEntry: 'Even better on reflection.', wouldGoBack: false })
      expect(updated).toMatchObject({ journalEntry: 'Even better on reflection.', wouldGoBack: false, restaurantId: place.id })
      expect((await repo.getVisit(visit.id)).journalEntry).toBe('Even better on reflection.')
    })

    it('reverts a place to want_to_go only when its last visit is deleted', async () => {
      const repo = create(EMPTY_DATA)
      const place = await repo.createRestaurant(placeInput)
      const a = await repo.addVisit(place.id, visitInput)
      const b = await repo.addVisit(place.id, visitInput)

      await repo.deleteVisit(a.id)
      expect((await repo.getRestaurant(place.id)).status).toBe('visited')
      await repo.deleteVisit(b.id)
      expect((await repo.getRestaurant(place.id)).status).toBe('want_to_go')
    })

    it('deleting a place also deletes its visits', async () => {
      const repo = create(EMPTY_DATA)
      const place = await repo.createRestaurant(placeInput)
      const visit = await repo.addVisit(place.id, visitInput)
      await repo.deleteRestaurant(place.id)
      expect(await repo.listRestaurants()).toEqual([])
      expect(await repo.listVisits()).toEqual([])
      await expect(repo.getVisit(visit.id)).rejects.toBeInstanceOf(NotFoundError)
    })

    it('applies filters to places and visits', async () => {
      const repo = create(SEED_DATA)
      expect((await repo.listRestaurants({ status: 'visited' })).length).toBe(3)
      expect(
        (await repo.listRestaurants({ vibeTags: ['patio', 'dim_lighting'], maxPriceLevel: 3 })).map((r) => r.name).sort(),
      ).toEqual(['Brick & Vine', 'Olive & Ember'])
      expect((await repo.listVisits({ search: 'fig tree' })).map((v) => v.restaurant.name)).toEqual(['Brick & Vine'])
    })

    it('lists seeded visits newest first, each with its restaurant', async () => {
      const repo = create(SEED_DATA)
      const visits = await repo.listVisits()
      expect(visits.map((v) => v.visitDate)).toEqual(['2026-10-04', '2026-09-12', '2026-08-22', '2026-08-16'])
      expect(visits[1]?.restaurant.name).toBe('Brick & Vine')
    })

    it('rejects unknown ids with NotFoundError', async () => {
      const repo = create(EMPTY_DATA)
      await expect(repo.getRestaurant('nope')).rejects.toBeInstanceOf(NotFoundError)
      await expect(repo.updateRestaurant('nope', { name: 'x' })).rejects.toBeInstanceOf(NotFoundError)
      await expect(repo.deleteRestaurant('nope')).rejects.toBeInstanceOf(NotFoundError)
      await expect(repo.listVisitsForRestaurant('nope')).rejects.toBeInstanceOf(NotFoundError)
      await expect(repo.addVisit('nope', visitInput)).rejects.toBeInstanceOf(NotFoundError)
      await expect(repo.getVisit('nope')).rejects.toBeInstanceOf(NotFoundError)
      await expect(repo.updateVisit('nope', { journalEntry: 'x' })).rejects.toBeInstanceOf(NotFoundError)
      await expect(repo.deleteVisit('nope')).rejects.toBeInstanceOf(NotFoundError)
    })
  })
}
