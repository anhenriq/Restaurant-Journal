import { describe, expect, it } from 'vitest'
import {
  restaurantFromRow,
  restaurantInputToRow,
  restaurantPatchToRow,
  visitInputToRow,
  visitPatchToRow,
  type RestaurantRow,
} from './supabaseMappers'

const row: RestaurantRow = {
  id: 'r1',
  name: 'Brick & Vine',
  neighborhood: 'Tempe',
  cuisine: 'Italian',
  status: 'visited',
  recommended_by: 'Jess',
  why_saved: 'Courtyard',
  vibe_tags: ['patio', 'from_an_older_version'],
  price_level: 2,
  created_at: '2026-08-30T19:45:00.000Z',
  updated_at: '2026-09-13T15:00:00.000Z',
}

describe('Supabase row mapping', () => {
  it('maps a restaurant row to the app type, dropping unknown tags', () => {
    expect(restaurantFromRow(row)).toEqual({
      id: 'r1',
      name: 'Brick & Vine',
      neighborhood: 'Tempe',
      cuisine: 'Italian',
      status: 'visited',
      recommendedBy: 'Jess',
      whySaved: 'Courtyard',
      vibeTags: ['patio'],
      priceLevel: 2,
      createdAt: '2026-08-30T19:45:00.000Z',
      updatedAt: '2026-09-13T15:00:00.000Z',
    })
  })

  it('omits "recommended by" when the column is null, and defaults odd status and price values', () => {
    const mapped = restaurantFromRow({ ...row, recommended_by: null, status: 'weird', price_level: 9 })
    expect('recommendedBy' in mapped).toBe(false)
    expect(mapped.status).toBe('want_to_go')
    expect(mapped.priceLevel).toBe(2)
  })

  it('maps new restaurants to columns, leaving id, owner, status and timestamps to the database', () => {
    const insert = restaurantInputToRow({
      name: 'A',
      neighborhood: 'B',
      cuisine: '',
      whySaved: 'why',
      vibeTags: ['quiet'],
      priceLevel: 3,
    })
    expect(insert).toEqual({
      name: 'A',
      neighborhood: 'B',
      cuisine: '',
      recommended_by: null,
      why_saved: 'why',
      vibe_tags: ['quiet'],
      price_level: 3,
    })
  })

  it('writes only the fields present in a patch, and clears a column given an explicit undefined', () => {
    expect(restaurantPatchToRow({ name: 'New' })).toEqual({ name: 'New' })
    expect(restaurantPatchToRow({})).toEqual({})
    expect(restaurantPatchToRow({ recommendedBy: undefined })).toEqual({ recommended_by: null })
    expect(restaurantPatchToRow({ recommendedBy: 'Sam', priceLevel: 1 })).toEqual({
      recommended_by: 'Sam',
      price_level: 1,
    })
  })

  it('maps visits to columns and patches only what changed', () => {
    expect(
      visitInputToRow('r1', {
        visitDate: '2026-10-01',
        wentWith: 'Sam',
        whatIOrdered: 'Tacos',
        journalEntry: 'Nice',
        photos: [],
        wouldGoBack: false,
      }),
    ).toEqual({
      restaurant_id: 'r1',
      visit_date: '2026-10-01',
      went_with: 'Sam',
      what_i_ordered: 'Tacos',
      journal_entry: 'Nice',
      photos: [],
      would_go_back: false,
    })
    expect(visitPatchToRow({ wouldGoBack: false })).toEqual({ would_go_back: false })
    expect(visitPatchToRow({})).toEqual({})
  })
})
