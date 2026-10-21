import { useNavigate, useParams } from 'react-router'
import { usePageTitle } from '@/components/layout/pageTitle'
import { LoadError } from '@/components/ui/LoadError'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { useRepository } from '@/data/repositoryContext'
import { pickRestaurantInput } from '@/features/restaurants/formValues'
import { RestaurantForm } from '@/features/restaurants/RestaurantForm'
import type { FlashState } from '@/hooks/useFlashMessage'
import { useRestaurant } from '@/hooks/useRestaurants'

export function EditPlacePage() {
  const { id = '' } = useParams()
  const repository = useRepository()
  const navigate = useNavigate()
  const { data: restaurant, error, refetch } = useRestaurant(id)
  usePageTitle(restaurant ? `Edit ${restaurant.name}` : undefined)

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

  return (
    <>
      <PageHeader
        title="Edit place"
        subtitle={restaurant.name}
        backTo={{ to: `/places/${restaurant.id}`, label: restaurant.name }}
      />
      <RestaurantForm
        initialValues={pickRestaurantInput(restaurant)}
        submitLabel="Save changes"
        cancelTo={`/places/${restaurant.id}`}
        onSubmit={async (input) => {
          // `recommendedBy: undefined` clears it when the field was emptied (the form omits blank values)
          const updated = await repository.updateRestaurant(restaurant.id, { recommendedBy: undefined, ...input })
          const state: FlashState = { flash: `Saved changes to ${updated.name}.` }
          navigate(`/places/${restaurant.id}`, { state })
        }}
      />
    </>
  )
}
