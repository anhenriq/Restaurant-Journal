import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LinkButton } from '@/components/ui/LinkButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { ResultCount } from '@/components/ui/ResultCount'
import { Spinner } from '@/components/ui/Spinner'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { RestaurantFilterBar } from '@/features/restaurants/RestaurantFilterBar'
import { VisitCard } from '@/features/visits/VisitCard'
import { useFlashMessage } from '@/hooks/useFlashMessage'
import { useListFilters } from '@/hooks/useListFilters'
import { useVisits } from '@/hooks/useVisits'

export function JournalPage() {
  const controls = useListFilters()
  const { data: visits, error, loading, refetch } = useVisits(controls.repositoryFilter)
  const flash = useFlashMessage()

  const count = visits?.length
  const subtitle = count === undefined ? undefined : count === 1 ? '1 entry' : `${count} entries`
  const resultMessage =
    controls.isFiltering && count !== undefined
      ? count === 1
        ? '1 entry matches.'
        : `${count} entries match.`
      : undefined

  return (
    <>
      <PageHeader title="Journal" {...(subtitle ? { subtitle } : {})} />
      {flash && <StatusMessage>{flash}</StatusMessage>}

      <RestaurantFilterBar
        controls={controls}
        label="Search your journal"
        placeholder="Search places, people, dishes, your writing…"
      />
      <ResultCount message={resultMessage} />

      {error && !visits && <ErrorMessage message={error.message} onRetry={refetch} />}
      {loading && !visits && !error && <Spinner label="Loading your journal" />}

      {visits && visits.length === 0 && !controls.isFiltering && (
        <EmptyState
          icon="book"
          title="Your journal is empty"
          description="After you visit a place, mark it as visited and write about the night in your own words. It will show up here."
          action={<LinkButton to="/want-to-go">See your Want to Go list</LinkButton>}
        />
      )}

      {visits && visits.length === 0 && controls.isFiltering && (
        <EmptyState
          icon="search"
          title="No entries match"
          description="Try a different word, or remove a filter."
          action={<Button onClick={controls.clear}>Clear search and filters</Button>}
        />
      )}

      {visits && visits.length > 0 && (
        <ul className="flex flex-col gap-4">
          {visits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </ul>
      )}
    </>
  )
}
