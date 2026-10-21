import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/ui/PageHeader'
import { useRepository } from '@/data/repositoryContext'
import { RestaurantForm } from '@/features/restaurants/RestaurantForm'
import type { FlashState } from '@/hooks/useFlashMessage'

export function AddPlacePage() {
  const repository = useRepository()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Add a place"
        subtitle="Save a restaurant you'd like to try."
        backTo={{ to: '/want-to-go', label: 'Want to Go' }}
      />
      <RestaurantForm
        submitLabel="Save place"
        cancelTo="/want-to-go"
        onSubmit={async (input) => {
          const place = await repository.createRestaurant(input)
          const state: FlashState = { flash: `Saved ${place.name} to your list.` }
          navigate('/want-to-go', { state })
        }}
      />
    </>
  )
}
