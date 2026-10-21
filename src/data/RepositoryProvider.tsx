import type { ReactNode } from 'react'
import type { RestaurantRepository } from './repository'
import { RepositoryContext } from './repositoryContext'

interface RepositoryProviderProps {
  repository: RestaurantRepository
  children: ReactNode
}

export function RepositoryProvider({ repository, children }: RepositoryProviderProps) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>
}
