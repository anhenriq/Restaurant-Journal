import { filterRestaurants, filterVisits } from '@/lib/filters'
import { createId } from '@/lib/ids'
import type {
  JournalData,
  Restaurant,
  RestaurantFilter,
  RestaurantInput,
  RestaurantPatch,
  Visit,
  VisitFilter,
  VisitInput,
  VisitPatch,
  VisitWithRestaurant,
} from '@/types'
import { NotFoundError, StorageError, type RestaurantRepository } from './repository'
import { SEED_DATA } from './seed'

export const STORAGE_KEY = 'restaurant-journal:v1'
const STORAGE_VERSION = 1

export interface LocalStorageRepositoryOptions {
  /** Defaults to `window.localStorage`. */
  storage?: Storage
  /** Artificial delay per call, so loading states behave as they will with a real network. */
  latencyMs?: number
  /** Data written the first time the app runs. Defaults to the built-in sample places. */
  seed?: JournalData
  now?: () => Date
  generateId?: () => string
}

function isStoredJournal(value: unknown): value is JournalData & { version: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === STORAGE_VERSION &&
    'restaurants' in value &&
    Array.isArray(value.restaurants) &&
    'visits' in value &&
    Array.isArray(value.visits)
  )
}

/**
 * A `RestaurantRepository` that keeps everything in localStorage under one key.
 * This is the mock used until Supabase is wired in; see README for how to swap it.
 */
export function createLocalStorageRepository(
  options: LocalStorageRepositoryOptions = {},
): RestaurantRepository {
  const { latencyMs = 0, seed = SEED_DATA, now = () => new Date(), generateId = createId } = options

  function getStorage(): Storage {
    try {
      return options.storage ?? window.localStorage
    } catch (cause) {
      throw new StorageError('Browser storage is not available.', { cause })
    }
  }

  function write(data: JournalData): void {
    try {
      getStorage().setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, ...data }))
    } catch (cause) {
      if (cause instanceof StorageError) throw cause
      throw new StorageError('Could not save your changes. Browser storage may be full.', { cause })
    }
  }

  /** Reads fresh from storage on every call, so other tabs' changes are never overwritten. */
  function read(): JournalData {
    let raw: string | null
    try {
      raw = getStorage().getItem(STORAGE_KEY)
    } catch (cause) {
      if (cause instanceof StorageError) throw cause
      throw new StorageError('Could not read your saved data.', { cause })
    }

    if (raw === null) {
      const initial = structuredClone(seed)
      write(initial)
      return initial
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch (cause) {
      throw new StorageError('Your saved data is unreadable.', { cause })
    }
    if (!isStoredJournal(parsed)) {
      throw new StorageError('Your saved data is in an unexpected format.')
    }
    // Shallow shape check only: the data was written by this repository.
    return { restaurants: parsed.restaurants, visits: parsed.visits }
  }

  function delay(): Promise<void> {
    return latencyMs > 0 ? new Promise((resolve) => setTimeout(resolve, latencyMs)) : Promise.resolve()
  }

  const timestamp = (): string => now().toISOString()

  function findRestaurant(data: JournalData, id: string): Restaurant {
    const restaurant = data.restaurants.find((r) => r.id === id)
    if (!restaurant) throw new NotFoundError('restaurant', id)
    return restaurant
  }

  function findVisit(data: JournalData, id: string): Visit {
    const visit = data.visits.find((v) => v.id === id)
    if (!visit) throw new NotFoundError('visit', id)
    return visit
  }

  function withRestaurant(data: JournalData, visit: Visit): VisitWithRestaurant {
    return { ...visit, restaurant: findRestaurant(data, visit.restaurantId) }
  }

  /** Enforces the invariant: a restaurant is `visited` iff it has at least one visit. */
  function syncStatus(data: JournalData, restaurantId: string): void {
    const restaurant = data.restaurants.find((r) => r.id === restaurantId)
    if (!restaurant) return
    const status = data.visits.some((v) => v.restaurantId === restaurantId) ? 'visited' : 'want_to_go'
    if (restaurant.status !== status) {
      restaurant.status = status
      restaurant.updatedAt = timestamp()
    }
  }

  const byNewestVisit = (a: Visit, b: Visit): number =>
    b.visitDate.localeCompare(a.visitDate) || b.createdAt.localeCompare(a.createdAt)

  return {
    async listRestaurants(filter?: RestaurantFilter) {
      await delay()
      const { restaurants } = read()
      return filterRestaurants(restaurants, filter).sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name),
      )
    },

    async getRestaurant(id: string) {
      await delay()
      return findRestaurant(read(), id)
    },

    async createRestaurant(input: RestaurantInput) {
      await delay()
      const data = read()
      const created = timestamp()
      const restaurant: Restaurant = {
        ...input,
        id: generateId(),
        status: 'want_to_go',
        createdAt: created,
        updatedAt: created,
      }
      data.restaurants.push(restaurant)
      write(data)
      return restaurant
    },

    async updateRestaurant(id: string, patch: RestaurantPatch) {
      await delay()
      const data = read()
      const restaurant = findRestaurant(data, id)
      Object.assign(restaurant, patch, { updatedAt: timestamp() })
      write(data)
      return restaurant
    },

    async deleteRestaurant(id: string) {
      await delay()
      const data = read()
      findRestaurant(data, id)
      data.restaurants = data.restaurants.filter((r) => r.id !== id)
      data.visits = data.visits.filter((v) => v.restaurantId !== id)
      write(data)
    },

    async listVisits(filter?: VisitFilter) {
      await delay()
      const data = read()
      const visits = data.visits
        .filter((v) => data.restaurants.some((r) => r.id === v.restaurantId))
        .sort(byNewestVisit)
        .map((v) => withRestaurant(data, v))
      return filterVisits(visits, filter)
    },

    async listVisitsForRestaurant(restaurantId: string) {
      await delay()
      const data = read()
      findRestaurant(data, restaurantId)
      return data.visits.filter((v) => v.restaurantId === restaurantId).sort(byNewestVisit)
    },

    async getVisit(id: string) {
      await delay()
      const data = read()
      return withRestaurant(data, findVisit(data, id))
    },

    async addVisit(restaurantId: string, input: VisitInput) {
      await delay()
      const data = read()
      findRestaurant(data, restaurantId)
      const created = timestamp()
      const visit: Visit = {
        ...input,
        id: generateId(),
        restaurantId,
        createdAt: created,
        updatedAt: created,
      }
      data.visits.push(visit)
      syncStatus(data, restaurantId)
      write(data)
      return visit
    },

    async updateVisit(id: string, patch: VisitPatch) {
      await delay()
      const data = read()
      const visit = findVisit(data, id)
      Object.assign(visit, patch, { updatedAt: timestamp() })
      write(data)
      return visit
    },

    async deleteVisit(id: string) {
      await delay()
      const data = read()
      const visit = findVisit(data, id)
      data.visits = data.visits.filter((v) => v.id !== id)
      syncStatus(data, visit.restaurantId)
      write(data)
    },
  }
}
