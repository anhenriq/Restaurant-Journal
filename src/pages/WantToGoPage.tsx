import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LinkButton } from '@/components/ui/LinkButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { ResultCount } from '@/components/ui/ResultCount'
import { Spinner } from '@/components/ui/Spinner'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { RestaurantCard } from '@/features/restaurants/RestaurantCard'
import { RestaurantFilterBar } from '@/features/restaurants/RestaurantFilterBar'
import { useFlashMessage } from '@/hooks/useFlashMessage'
import { useListFilters } from '@/hooks/useListFilters'
import { useRestaurants } from '@/hooks/useRestaurants'

export function WantToGoPage() {
  const controls = useListFilters()
  const { data: places, error, loading, refetch } = useRestaurants({
    ...controls.repositoryFilter,
    status: 'want_to_go',
  })
  const flash = useFlashMessage()

  const count = places?.length
  const subtitle =
    count === undefined ? undefined : count === 1 ? '1 place to try' : `${count} places to try`
  const resultMessage =
    controls.isFiltering && count !== undefined
      ? count === 1
        ? '1 place matches.'
        : `${count} places match.`
      : undefined

  return (
    <>
      <PageHeader
        title="Want to Go"
        {...(subtitle ? { subtitle } : {})}
        actions={<LinkButton to="/places/new">Add a place</LinkButton>}
      />
      {flash && <StatusMessage>{flash}</StatusMessage>}

      <RestaurantFilterBar
        controls={controls}
        label="Search your saved places"
        placeholder="Search name, cuisine, notes…"
      />
      <ResultCount message={resultMessage} />

      {error && !places && <ErrorMessage message={error.message} onRetry={refetch} />}
      {loading && !places && !error && <Spinner label="Loading your places" />}

      {places && places.length === 0 && !controls.isFiltering && (
        <EmptyState
          icon="bookmark"
          title="No places saved yet"
          description="When a friend mentions a spot, or you spot one you'd like to try, save it here so you don't forget."
          action={<LinkButton to="/places/new">Add your first place</LinkButton>}
        />
      )}

      {places && places.length === 0 && controls.isFiltering && (
        <EmptyState
          icon="search"
          title="No places match"
          description="Try a different word, or remove a filter."
          action={<Button onClick={controls.clear}>Clear search and filters</Button>}
        />
      )}

      {places && places.length > 0 && (
        <ul className="flex flex-col gap-4">
          {places.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </ul>
      )}
    </>
  )
}
