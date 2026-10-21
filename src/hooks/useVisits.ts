import { useRepository } from '@/data/repositoryContext'
import type { VisitFilter } from '@/types'
import { useAsync } from './useAsync'

export function useVisits(filter?: VisitFilter) {
  const repository = useRepository()
  return useAsync(() => repository.listVisits(filter), [repository, JSON.stringify(filter ?? {})])
}

export function useVisit(id: string) {
  const repository = useRepository()
  return useAsync(() => repository.getVisit(id), [repository, id])
}

export function useRestaurantVisits(restaurantId: string) {
  const repository = useRepository()
  return useAsync(() => repository.listVisitsForRestaurant(restaurantId), [repository, restaurantId])
}
