import { useNavigate, useParams } from 'react-router'
import { usePageTitle } from '@/components/layout/pageTitle'
import { LoadError } from '@/components/ui/LoadError'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { useRepository } from '@/data/repositoryContext'
import { pickVisitInput } from '@/features/visits/visitFormValues'
import { VisitForm } from '@/features/visits/VisitForm'
import type { FlashState } from '@/hooks/useFlashMessage'
import { useVisit } from '@/hooks/useVisits'
import { formatVisitDate } from '@/lib/format'

export function EditVisitPage() {
  const { visitId = '' } = useParams()
  const repository = useRepository()
  const navigate = useNavigate()
  const { data: visit, error, refetch } = useVisit(visitId)
  usePageTitle(visit ? `Edit entry for ${visit.restaurant.name}` : undefined)

  if (error && !visit) {
    return (
      <LoadError
        error={error}
        onRetry={refetch}
        notFound={{
          title: "We couldn't find that entry",
          description: 'It may have been deleted.',
          backTo: '/journal',
          backLabel: 'Back to Journal',
        }}
      />
    )
  }
  if (!visit) return <Spinner label="Loading entry" />

  const entryPath = `/journal/${visit.id}`

  return (
    <>
      <PageHeader
        title="Edit entry"
        subtitle={`${visit.restaurant.name} · ${formatVisitDate(visit.visitDate)}`}
        backTo={{ to: entryPath, label: 'Back to entry' }}
      />
      <VisitForm
        initialValues={pickVisitInput(visit)}
        submitLabel="Save changes"
        cancelTo={entryPath}
        onSubmit={async (input) => {
          await repository.updateVisit(visit.id, input)
          const state: FlashState = { flash: 'Saved changes to your entry.' }
          navigate(entryPath, { state })
        }}
      />
    </>
  )
}
