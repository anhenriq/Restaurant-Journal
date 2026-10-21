import type { SupabaseClient } from '@supabase/supabase-js'
import type { JournalData } from '@/types'
import type { RestaurantRow, VisitRow } from '@/data/supabaseMappers'

type Table = 'restaurants' | 'visits'
type Row = Record<string, unknown>
interface Failure {
  code: string
  message: string
}
interface Result {
  data: unknown
  error: Failure | null
}

export interface FakeSupabaseOptions {
  now?: () => Date
}

/**
 * A tiny in-memory stand-in for the Supabase tables in supabase/schema.sql. It understands only the
 * query shapes supabaseRepository.ts uses, and it plays the part of the database's triggers and
 * foreign keys (visit insert/delete updates the restaurant's status; deleting a restaurant cascades).
 * It lets the repository contract tests run without a network, but it is NOT a substitute for
 * trying the app against a real project.
 */
export function createFakeSupabase(seed: JournalData, options: FakeSupabaseOptions = {}): SupabaseClient {
  let clock = Date.parse('2026-10-01T12:00:00.000Z')
  const now = options.now ?? (() => new Date((clock += 1000)))
  let counter = 0
  const newId = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`

  const tables: Record<Table, Row[]> = {
    restaurants: seed.restaurants.map(
      (r) => ({
        id: r.id,
        name: r.name,
        neighborhood: r.neighborhood,
        cuisine: r.cuisine,
        status: r.status,
        recommended_by: r.recommendedBy ?? null,
        why_saved: r.whySaved,
        vibe_tags: [...r.vibeTags],
        price_level: r.priceLevel,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      } satisfies RestaurantRow),
    ),
    visits: seed.visits.map(
      (v) => ({
        id: v.id,
        restaurant_id: v.restaurantId,
        visit_date: v.visitDate,
        went_with: v.wentWith,
        what_i_ordered: v.whatIOrdered,
        journal_entry: v.journalEntry,
        photos: [...v.photos],
        would_go_back: v.wouldGoBack,
        created_at: v.createdAt,
        updated_at: v.updatedAt,
      } satisfies VisitRow),
    ),
  }

  /** The trigger in schema.sql: status follows whether the restaurant has any visits. */
  function syncStatus(restaurantId: unknown) {
    const restaurant = tables.restaurants.find((r) => r.id === restaurantId)
    if (!restaurant) return
    const status = tables.visits.some((v) => v.restaurant_id === restaurantId) ? 'visited' : 'want_to_go'
    if (restaurant.status !== status) {
      restaurant.status = status
      restaurant.updated_at = now().toISOString()
    }
  }

  function query(table: Table) {
    let op: 'select' | 'insert' | 'update' | 'delete' = 'select'
    let payload: Row = {}
    let embedRestaurant = false
    let returning = false
    let mode: 'many' | 'single' | 'maybeSingle' = 'many'
    const filters: Array<[string, unknown]> = []
    const orders: Array<[string, boolean]> = []

    function run(): Result {
      const matches = (row: Row) => filters.every(([column, value]) => row[column] === value)
      let rows: Row[]

      if (op === 'insert') {
        const created = now().toISOString()
        if (table === 'visits' && !tables.restaurants.some((r) => r.id === payload.restaurant_id)) {
          return { data: null, error: { code: '23503', message: 'foreign key violation' } }
        }
        const row: Row =
          table === 'restaurants'
            ? { id: newId(), status: 'want_to_go', created_at: created, updated_at: created, ...payload }
            : { id: newId(), created_at: created, updated_at: created, ...payload }
        tables[table].push(row)
        if (table === 'visits') syncStatus(row.restaurant_id)
        rows = [row]
      } else if (op === 'update') {
        rows = tables[table].filter(matches)
        for (const row of rows) Object.assign(row, payload, { updated_at: now().toISOString() })
      } else if (op === 'delete') {
        rows = tables[table].filter(matches)
        tables[table] = tables[table].filter((row) => !rows.includes(row))
        if (table === 'restaurants') {
          const gone = new Set(rows.map((r) => r.id))
          tables.visits = tables.visits.filter((v) => !gone.has(v.restaurant_id))
        } else {
          for (const row of rows) syncStatus(row.restaurant_id)
        }
      } else {
        rows = tables[table].filter(matches)
      }

      rows = [...rows].sort((a, b) => {
        for (const [column, ascending] of orders) {
          const left = String(a[column])
          const right = String(b[column])
          if (left !== right) return (left < right ? -1 : 1) * (ascending ? 1 : -1)
        }
        return 0
      })

      let output: Row[] = rows.map((row) => structuredClone(row))
      if (embedRestaurant && table === 'visits') {
        output = output.map((row) => ({
          ...row,
          restaurant: structuredClone(tables.restaurants.find((r) => r.id === row.restaurant_id) ?? null),
        }))
      }
      if (op !== 'select' && !returning) return { data: null, error: null }

      if (mode === 'many') return { data: output, error: null }
      if (mode === 'single') {
        return output.length === 1
          ? { data: output[0], error: null }
          : { data: null, error: { code: 'PGRST116', message: 'expected a single row' } }
      }
      return { data: output[0] ?? null, error: null }
    }

    const builder = {
      select(columns?: string) {
        if (op === 'select') embedRestaurant = Boolean(columns?.includes('restaurant:restaurants'))
        else returning = true
        return builder
      },
      insert(values: Row) {
        op = 'insert'
        payload = values
        return builder
      },
      update(values: Row) {
        op = 'update'
        payload = values
        return builder
      },
      delete() {
        op = 'delete'
        return builder
      },
      eq(column: string, value: unknown) {
        filters.push([column, value])
        return builder
      },
      order(column: string, opts?: { ascending?: boolean }) {
        orders.push([column, opts?.ascending ?? true])
        return builder
      },
      single() {
        mode = 'single'
        return builder
      },
      maybeSingle() {
        mode = 'maybeSingle'
        return builder
      },
      then<T>(resolve: (value: Result) => T) {
        return Promise.resolve(run()).then(resolve)
      },
    }
    return builder
  }

  const client = { from: (table: Table) => query(table) }
  // Only the parts of the client the repository calls are implemented
  return client as unknown as SupabaseClient
}
