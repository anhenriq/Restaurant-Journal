import type {
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

/** Thrown when an id doesn't match any stored restaurant or visit. */
export class NotFoundError extends Error {
  constructor(kind: 'restaurant' | 'visit', id: string) {
    super(`No ${kind} found with id "${id}"`)
    this.name = 'NotFoundError'
  }
}

/** Thrown when the backing store can't be read or written (corrupt data, storage full, offline…). */
export class StorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'StorageError'
  }
}

/**
 * The only way the UI talks to stored data.
 *
 * Every method is async so a network-backed implementation (Supabase) can replace the
 * localStorage one without changing any caller. Implementations must:
 * - reject with `NotFoundError` for unknown ids and `StorageError` for storage failures
 * - keep `Restaurant.status` in sync: `visited` iff the restaurant has at least one visit
 * - delete a restaurant's visits when the restaurant is deleted
 */
export interface RestaurantRepository {
  /** Newest saved first. */
  listRestaurants(filter?: RestaurantFilter): Promise<Restaurant[]>
  getRestaurant(id: string): Promise<Restaurant>
  /** New places start as `want_to_go`. */
  createRestaurant(input: RestaurantInput): Promise<Restaurant>
  updateRestaurant(id: string, patch: RestaurantPatch): Promise<Restaurant>
  /** Also deletes the restaurant's visits. */
  deleteRestaurant(id: string): Promise<void>

  /** Most recent visit date first. */
  listVisits(filter?: VisitFilter): Promise<VisitWithRestaurant[]>
  listVisitsForRestaurant(restaurantId: string): Promise<Visit[]>
  getVisit(id: string): Promise<VisitWithRestaurant>
  /** "Mark as visited": records a visit and flips the restaurant to `visited`. */
  addVisit(restaurantId: string, input: VisitInput): Promise<Visit>
  updateVisit(id: string, patch: VisitPatch): Promise<Visit>
  /** Deleting a restaurant's last visit flips it back to `want_to_go`. */
  deleteVisit(id: string): Promise<void>
}
