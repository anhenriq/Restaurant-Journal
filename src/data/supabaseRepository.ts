import type { SupabaseClient } from '@supabase/supabase-js'
import { filterRestaurants, filterVisits } from '@/lib/filters'
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
import { NotFoundError, StorageError, type RestaurantRepository } from './repository'
import {
  restaurantFromRow,
  restaurantInputToRow,
  restaurantPatchToRow,
  visitFromRow,
  visitInputToRow,
  visitPatchToRow,
  visitWithRestaurantFromRow,
} from './supabaseMappers'
import { toRepositoryError } from './supabaseErrors'
import {
  expectRow,
  expectRows,
  isIdRow,
  isRestaurantRow,
  isVisitRow,
  isVisitRowWithRestaurant,
} from './supabaseRowGuards'

/**
 * A `RestaurantRepository` backed by Supabase (tables in supabase/schema.sql). Row-level security
 * scopes every query to the signed-in person, so no user id is ever passed from here.
 *
 * Search and filtering reuse the same pure functions as the browser-storage version, so results are
 * identical; a personal journal is small enough to filter after fetching.
 *
 * Every row coming back is shape-checked, so a database that doesn't match the app fails with a
 * clear error instead of showing wrong data.
 */
export function createSupabaseRepository(client: SupabaseClient): RestaurantRepository {
  async function fetchRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await client
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })
      .order('name', { ascending: true })
    if (error) throw toRepositoryError(error)
    return expectRows(data, isRestaurantRow).map(restaurantFromRow)
  }

  async function fetchRestaurant(id: string): Promise<Restaurant> {
    const { data, error } = await client.from('restaurants').select('*').eq('id', id).maybeSingle()
    if (error) throw toRepositoryError(error, { kind: 'restaurant', id })
    const row = expectRow(data, isRestaurantRow)
    if (!row) throw new NotFoundError('restaurant', id)
    return restaurantFromRow(row)
  }

  async function fetchVisit(id: string): Promise<VisitWithRestaurant> {
    const { data, error } = await client
      .from('visits')
      .select('*, restaurant:restaurants(*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw toRepositoryError(error, { kind: 'visit', id })
    const row = expectRow(data, isVisitRowWithRestaurant)
    if (!row?.restaurant) throw new NotFoundError('visit', id)
    return visitWithRestaurantFromRow({ ...row, restaurant: row.restaurant })
  }

  return {
    async listRestaurants(filter?: RestaurantFilter) {
      return filterRestaurants(await fetchRestaurants(), filter)
    },

    getRestaurant: fetchRestaurant,

    async createRestaurant(input: RestaurantInput) {
      const { data, error } = await client
        .from('restaurants')
        .insert(restaurantInputToRow(input))
        .select()
        .single()
      if (error) throw toRepositoryError(error)
      const row = expectRow(data, isRestaurantRow)
      if (!row) throw new StorageError('Your place was saved but could not be read back.')
      return restaurantFromRow(row)
    },

    async updateRestaurant(id: string, patch: RestaurantPatch) {
      const changes = restaurantPatchToRow(patch)
      if (Object.keys(changes).length === 0) return fetchRestaurant(id)
      const { data, error } = await client
        .from('restaurants')
        .update(changes)
        .eq('id', id)
        .select()
        .maybeSingle()
      if (error) throw toRepositoryError(error, { kind: 'restaurant', id })
      const row = expectRow(data, isRestaurantRow)
      if (!row) throw new NotFoundError('restaurant', id)
      return restaurantFromRow(row)
    },

    async deleteRestaurant(id: string) {
      // The database removes the restaurant's visits too (on delete cascade)
      const { data, error } = await client.from('restaurants').delete().eq('id', id).select('id')
      if (error) throw toRepositoryError(error, { kind: 'restaurant', id })
      if (expectRows(data, isIdRow).length === 0) throw new NotFoundError('restaurant', id)
    },

    async listVisits(filter?: VisitFilter) {
      const { data, error } = await client
        .from('visits')
        .select('*, restaurant:restaurants(*)')
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw toRepositoryError(error)
      const visits: VisitWithRestaurant[] = []
      for (const row of expectRows(data, isVisitRowWithRestaurant)) {
        if (row.restaurant) visits.push(visitWithRestaurantFromRow({ ...row, restaurant: row.restaurant }))
      }
      return filterVisits(visits, filter)
    },

    async listVisitsForRestaurant(restaurantId: string) {
      await fetchRestaurant(restaurantId) // NotFoundError for an unknown place, like the other implementation
      const { data, error } = await client
        .from('visits')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw toRepositoryError(error, { kind: 'restaurant', id: restaurantId })
      return expectRows(data, isVisitRow).map(visitFromRow)
    },

    getVisit: fetchVisit,

    async addVisit(restaurantId: string, input: VisitInput): Promise<Visit> {
      // A database trigger flips the restaurant to `visited`
      const { data, error } = await client
        .from('visits')
        .insert(visitInputToRow(restaurantId, input))
        .select()
        .single()
      if (error) throw toRepositoryError(error, { kind: 'restaurant', id: restaurantId })
      const row = expectRow(data, isVisitRow)
      if (!row) throw new StorageError('Your visit was saved but could not be read back.')
      return visitFromRow(row)
    },

    async updateVisit(id: string, patch: VisitPatch): Promise<Visit> {
      const changes = visitPatchToRow(patch)
      if (Object.keys(changes).length === 0) return fetchVisit(id)
      const { data, error } = await client.from('visits').update(changes).eq('id', id).select().maybeSingle()
      if (error) throw toRepositoryError(error, { kind: 'visit', id })
      const row = expectRow(data, isVisitRow)
      if (!row) throw new NotFoundError('visit', id)
      return visitFromRow(row)
    },

    async deleteVisit(id: string) {
      // A database trigger flips the restaurant back to `want_to_go` when its last visit is deleted
      const { data, error } = await client.from('visits').delete().eq('id', id).select('id')
      if (error) throw toRepositoryError(error, { kind: 'visit', id })
      if (expectRows(data, isIdRow).length === 0) throw new NotFoundError('visit', id)
    },
  }
}
