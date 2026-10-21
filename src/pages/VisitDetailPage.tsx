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
import { JournalEntryView } from '@/features/visits/JournalEntryView'
import { useFlashMessage, type FlashState } from '@/hooks/useFlashMessage'
import { useVisit, useRestaurantVisits } from '@/hooks/useVisits'
import { formatVisitDate } from '@/lib/format'

export function VisitDetailPage() {
  const { visitId = '' } = useParams()
  const repository = useRepository()
  const navigate = useNavigate()
  const { data: visit, error, refetch } = useVisit(visitId)
  const siblings = useRestaurantVisits(visit?.restaurantId ?? '')
  const flash = useFlashMessage()
  usePageTitle(visit ? `${visit.restaurant.name} · ${formatVisitDate(visit.visitDate)}` : undefined)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | undefined>()

  if (error && !visit) {
    return (
      <LoadError
        error={error}
        onRetry={refetch}
        notFound={{
          title: "We couldn't find that entry",
          description: 'It may have been deleted. Head back to your journal to find another.',
          backTo: '/journal',
          backLabel: 'Back to Journal',
        }}
      />
    )
  }
  if (!visit) return <Spinner label="Loading entry" />

  const { restaurant } = visit
  const date = formatVisitDate(visit.visitDate)
  const isOnlyVisit = siblings.data?.length === 1

  async function handleDelete() {
    if (!visit) return
    setDeleting(true)
    setDeleteError(undefined)
    try {
      await repository.deleteVisit(visit.id)
      const state: FlashState = { flash: `Deleted your entry for ${visit.restaurant.name}.` }
      navigate('/journal', { state })
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : 'Could not delete this entry.')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <>
      <PageHeader
        title={restaurant.name}
        subtitle={`${date} · ${[restaurant.neighborhood, restaurant.cuisine].filter(Boolean).join(' · ')}`}
        backTo={{ to: '/journal', label: 'Journal' }}
        actions={
          <>
            <LinkButton to={`/journal/${visit.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <IconButton
              icon="trash"
              label={`Delete entry for ${restaurant.name}, ${date}`}
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

      <JournalEntryView visit={visit} />

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this entry?"
        destructive
        confirmLabel="Delete entry"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      >
        {isOnlyVisit
          ? `Your writing about ${restaurant.name} on ${date} will be deleted, and the place goes back to your Want to Go list. This can't be undone.`
          : `Your writing about ${restaurant.name} on ${date} will be deleted. This can't be undone.`}
      </ConfirmDialog>
    </>
  )
}
