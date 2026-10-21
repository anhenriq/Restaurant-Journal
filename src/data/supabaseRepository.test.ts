import { describe, expect, it } from 'vitest'
import { createFakeSupabase } from '@/test/fakeSupabase'
import { StorageError } from './repository'
import { describeRepositoryContract, EMPTY_DATA } from './repositoryContract'
import { createSupabaseRepository } from './supabaseRepository'

describeRepositoryContract('Supabase repository (fake database)', (seed) =>
  createSupabaseRepository(createFakeSupabase(seed)),
)

describe('Supabase repository specifics', () => {
  it('fails clearly when the database rows do not match the app', async () => {
    const client = createFakeSupabase(EMPTY_DATA)
    const badRows = { from: () => ({ select: () => ({ order: () => ({ order: () => Promise.resolve({ data: [{ id: 1 }], error: null }) }) }) }) }
    const repo = createSupabaseRepository(Object.assign(client, badRows))
    await expect(repo.listRestaurants()).rejects.toBeInstanceOf(StorageError)
    await expect(repo.listRestaurants()).rejects.toThrow(/unexpected format/)
  })

  it('turns database errors into friendly StorageErrors', async () => {
    const failing = {
      from: () => ({
        select: () => ({
          order: () => ({ order: () => Promise.resolve({ data: null, error: { code: '', message: 'TypeError: Failed to fetch' } }) }),
        }),
      }),
    }
    const repo = createSupabaseRepository(failing as never)
    await expect(repo.listRestaurants()).rejects.toThrow(/Couldn't reach your journal/)
  })
})
