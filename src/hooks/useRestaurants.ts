import { useRepository } from '@/data/repositoryContext'
import type { RestaurantFilter } from '@/types'
import { useAsync } from './useAsync'

export function useRestaurants(filter?: RestaurantFilter) {
  const repository = useRepository()
  return useAsync(() => repository.listRestaurants(filter), [repository, JSON.stringify(filter ?? {})])
}

export function useRestaurant(id: string) {
  const repository = useRepository()
  return useAsync(() => repository.getRestaurant(id), [repository, id])
}
