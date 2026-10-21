import { useNavigate, useParams } from 'react-router'
import { usePageTitle } from '@/components/layout/pageTitle'
import { LoadError } from '@/components/ui/LoadError'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { useRepository } from '@/data/repositoryContext'
import { VisitForm } from '@/features/visits/VisitForm'
import type { FlashState } from '@/hooks/useFlashMessage'
import { useRestaurant } from '@/hooks/useRestaurants'

/** "Mark as visited": turns a saved place into a journal entry (or adds another visit to a favorite). */
export function LogVisitPage() {
  const { id = '' } = useParams()
  const repository = useRepository()
  const navigate = useNavigate()
  const { data: restaurant, error, refetch } = useRestaurant(id)
  usePageTitle(restaurant ? `Visit to ${restaurant.name}` : undefined)

  if (error && !restaurant) {
    return (
      <LoadError
        error={error}
        onRetry={refetch}
        notFound={{
          title: "We couldn't find that place",
          description: 'It may have been deleted.',
          backTo: '/want-to-go',
          backLabel: 'Back to Want to Go',
        }}
      />
    )
  }
  if (!restaurant) return <Spinner label="Loading place" />

  const firstVisit = restaurant.status === 'want_to_go'

  return (
    <>
      <PageHeader
        title={firstVisit ? 'Mark as visited' : 'Log another visit'}
        subtitle={restaurant.name}
        backTo={{ to: `/places/${restaurant.id}`, label: restaurant.name }}
      />
      {restaurant.whySaved && (
        <aside className="mb-6 rounded border border-border bg-surface-sunken p-4">
          <p className="text-sm text-ink-muted">Why you saved it</p>
          <p className="mt-0.5 max-w-prose font-serif text-base">{restaurant.whySaved}</p>
        </aside>
      )}
      <VisitForm
        submitLabel="Save to journal"
        cancelTo={`/places/${restaurant.id}`}
        onSubmit={async (input) => {
          const visit = await repository.addVisit(restaurant.id, input)
          const state: FlashState = { flash: `Saved your visit to ${restaurant.name}.` }
          navigate(`/journal/${visit.id}`, { state })
        }}
      />
    </>
  )
}
