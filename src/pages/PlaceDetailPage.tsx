import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { usePageTitle } from '@/components/layout/pageTitle'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { IconButton } from '@/components/ui/IconButton'
import { LinkButton } from '@/components/ui/LinkButton'
import { LoadError } from '@/components/ui/LoadError'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { useRepository } from '@/data/repositoryContext'
import { RestaurantDetails } from '@/features/restaurants/RestaurantDetails'
import { VisitCard } from '@/features/visits/VisitCard'
import { useFlashMessage, type FlashState } from '@/hooks/useFlashMessage'
import { useRestaurant } from '@/hooks/useRestaurants'
import { useRestaurantVisits } from '@/hooks/useVisits'

export function PlaceDetailPage() {
  const { id = '' } = useParams()
  const repository = useRepository()
  const navigate = useNavigate()
  const place = useRestaurant(id)
  const visits = useRestaurantVisits(id)
  const flash = useFlashMessage()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const restaurant = place.data
  usePageTitle(restaurant?.name)

  if (place.error && !restaurant) {
    return (
      <LoadError
        error={place.error}
        onRetry={place.refetch}
        notFound={{
          title: "We couldn't find that place",
          description: 'It may have been deleted. Head back to your list to find another.',
          backTo: '/want-to-go',
          backLabel: 'Back to Want to Go',
        }}
      />
    )
  }
  if (!restaurant) return <Spinner label="Loading place" />

  const visited = restaurant.status === 'visited'
  const visitCount = visits.data?.length ?? 0
  const subtitle = [restaurant.neighborhood, restaurant.cuisine].filter(Boolean).join(' · ')

  async function handleDelete() {
    if (!restaurant) return
    setDeleting(true)
    setDeleteError(undefined)
    try {
      await repository.deleteRestaurant(restaurant.id)
      const state: FlashState = { flash: `Deleted ${restaurant.name}.` }
      navigate(visited ? '/journal' : '/want-to-go', { state })
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : 'Could not delete this place.')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <>
      <PageHeader
        title={restaurant.name}
        {...(subtitle ? { subtitle } : {})}
        backTo={visited ? { to: '/journal', label: 'Journal' } : { to: '/want-to-go', label: 'Want to Go' }}
        actions={
          <>
            <LinkButton to={`/places/${restaurant.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <IconButton
              icon="trash"
              label={`Delete ${restaurant.name}`}
              tone="danger"
              onClick={() => setConfirmingDelete(true)}
            />
          </>
        }
      />
      {flash && <StatusMessage>{flash}</StatusMessage>}
      {deleteError && (
        <div className="mb-4">
          <ErrorMessage message={deleteError} />
        </div>
      )}

      <div className="mb-6">
        <LinkButton to={`/places/${restaurant.id}/visit`}>
          {visited ? 'Log another visit' : 'Mark as visited'}
        </LinkButton>
      </div>

      <RestaurantDetails restaurant={restaurant} />

      <section aria-labelledby="visits-heading" className="mt-8">
        <h2 id="visits-heading" className="mb-3 text-2xl">
          Your visits
        </h2>
        {visits.error && !visits.data && <ErrorMessage message={visits.error.message} onRetry={visits.refetch} />}
        {visits.loading && !visits.data && !visits.error && <Spinner label="Loading visits" />}
        {visits.data && visits.data.length === 0 && (
          <p className="max-w-prose text-base text-ink-muted">
            No visits yet. When you go, choose “Mark as visited” to start your journal entry.
          </p>
        )}
        {visits.data && visits.data.length > 0 && (
          <ul className="flex flex-col gap-4">
            {visits.data.map((visit) => (
              <VisitCard key={visit.id} visit={visit} headingLevel="h3" />
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete ${restaurant.name}?`}
        destructive
        confirmLabel="Delete place"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      >
        {visitCount > 0
          ? `This also deletes your ${visitCount === 1 ? 'journal entry' : `${visitCount} journal entries`} for this place. This can't be undone.`
          : "This can't be undone."}
      </ConfirmDialog>
    </>
  )
}
