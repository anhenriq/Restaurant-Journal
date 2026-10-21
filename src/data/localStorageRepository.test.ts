import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLocalStorageRepository, STORAGE_KEY } from './localStorageRepository'
import { StorageError } from './repository'
import { describeRepositoryContract, EMPTY_DATA } from './repositoryContract'
import { SEED_DATA } from './seed'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describeRepositoryContract('localStorage repository', (seed) => {
  localStorage.clear()
  let n = 0
  let clock = Date.parse('2026-10-01T12:00:00.000Z')
  return createLocalStorageRepository({
    seed,
    generateId: () => `id-${++n}`,
    now: () => new Date((clock += 1000)),
  })
})

describe('localStorage repository specifics', () => {
  it('seeds sample data on first run and persists it', async () => {
    const repo = createLocalStorageRepository()
    expect(await repo.listRestaurants()).toHaveLength(SEED_DATA.restaurants.length)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    // A second repository instance sees the same stored data (survives "reload")
    await repo.createRestaurant({
      name: 'Another',
      neighborhood: 'Mesa',
      cuisine: '',
      whySaved: '',
      vibeTags: [],
      priceLevel: 1,
    })
    const again = createLocalStorageRepository()
    expect(await again.listRestaurants()).toHaveLength(SEED_DATA.restaurants.length + 1)
  })

  it('does not overwrite unreadable stored data', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    const repo = createLocalStorageRepository({ seed: EMPTY_DATA })
    await expect(repo.listRestaurants()).rejects.toBeInstanceOf(StorageError)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{not json')

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, restaurants: [], visits: [] }))
    await expect(repo.listRestaurants()).rejects.toBeInstanceOf(StorageError)
  })

  it('reports a full storage as StorageError and keeps the old data', async () => {
    const repo = createLocalStorageRepository({ seed: EMPTY_DATA })
    const input = { name: 'A', neighborhood: 'B', cuisine: '', whySaved: '', vibeTags: [], priceLevel: 1 as const }
    await repo.createRestaurant(input)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    await expect(repo.createRestaurant({ ...input, name: 'Second' })).rejects.toBeInstanceOf(StorageError)
    vi.restoreAllMocks()
    expect(await repo.listRestaurants()).toHaveLength(1)
  })
})
