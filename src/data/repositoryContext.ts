import { createContext, useContext } from 'react'
import type { RestaurantRepository } from './repository'

export const RepositoryContext = createContext<RestaurantRepository | null>(null)

/** The app's data access. Components must use this instead of importing a concrete repository. */
export function useRepository(): RestaurantRepository {
  const repository = useContext(RepositoryContext)
  if (!repository) throw new Error('useRepository must be used inside <RepositoryProvider>')
  return repository
}
