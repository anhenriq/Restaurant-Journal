import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EMPTY_JOURNAL, renderApp } from '@/test/renderApp'

afterEach(() => vi.restoreAllMocks())

describe('Want to Go screen', () => {
  it('lists only places still to visit, as links to their details', async () => {
    renderApp('/want-to-go')
    expect(await screen.findByRole('heading', { level: 1, name: 'Want to Go' })).toBeInTheDocument()
    expect(await screen.findByText('4 places to try')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'La Ramada Verde' })
    expect(link).toHaveAttribute('href', '/places/seed-rest-ramada-verde')
    expect(screen.getByRole('link', { name: 'Sable Terrace' })).toBeInTheDocument()
    // Visited places belong in the journal, not here
    expect(screen.queryByRole('link', { name: 'Brick & Vine' })).not.toBeInTheDocument()
  })

  it('shows each place with its details', async () => {
    renderApp('/want-to-go')
    const card = (await screen.findByRole('link', { name: 'Olive & Ember' })).closest('li')
    if (!card) throw new Error('card not found')
    expect(within(card).getByText('Central Phoenix · Mediterranean')).toBeInTheDocument()
    expect(within(card).getByText('Recommended by Dana')).toBeInTheDocument()
    expect(within(card).getByText('Dim lighting')).toBeInTheDocument()
    expect(within(card).getByText('Price: Pricey, 3 of 4')).toBeInTheDocument()
  })

  it('shows an empty state with a way to add a place', async () => {
    renderApp('/want-to-go', EMPTY_JOURNAL)
    expect(await screen.findByRole('heading', { name: 'No places saved yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add your first place' })).toHaveAttribute('href', '/places/new')
  })
})

describe('Add a place screen', () => {
  it('saves a place and returns to the list with a confirmation', async () => {
    const { user, repository } = renderApp('/places/new', EMPTY_JOURNAL)
    await user.type(await screen.findByRole('textbox', { name: 'Restaurant name' }), '  Taco Hideout ')
    await user.type(screen.getByRole('textbox', { name: 'Neighborhood or city' }), 'Mesa')
    await user.type(screen.getByRole('textbox', { name: 'Recommended by (optional)' }), 'Priya')
    await user.type(screen.getByRole('textbox', { name: 'Why do you want to go? (optional)' }), 'Great patio')
    await user.click(screen.getByRole('checkbox', { name: 'Patio' }))
    await user.click(screen.getByRole('radio', { name: '$ Cheap eats' }))
    await user.click(screen.getByRole('button', { name: 'Save place' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Want to Go' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Saved Taco Hideout to your list.')
    expect(await screen.findByRole('link', { name: 'Taco Hideout' })).toBeInTheDocument()

    const [saved] = await repository.listRestaurants()
    expect(saved).toMatchObject({
      name: 'Taco Hideout',
      neighborhood: 'Mesa',
      recommendedBy: 'Priya',
      whySaved: 'Great patio',
      vibeTags: ['patio'],
      priceLevel: 1,
      status: 'want_to_go',
    })
  })

  it('explains missing required fields and focuses the first one', async () => {
    const { user, repository } = renderApp('/places/new', EMPTY_JOURNAL)
    await user.click(await screen.findByRole('button', { name: 'Save place' }))

    const name = screen.getByRole('textbox', { name: 'Restaurant name' })
    expect(name).toBeInvalid()
    expect(name).toHaveAccessibleDescription("Error: Enter the restaurant's name.")
    expect(name).toHaveFocus()
    expect(screen.getByRole('textbox', { name: 'Neighborhood or city' })).toHaveAccessibleDescription(
      'Error: Enter a neighborhood or city.',
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Add a place' })).toBeInTheDocument()
    expect(await repository.listRestaurants()).toEqual([])

    // The error clears once the user starts fixing it
    await user.type(name, 'A')
    expect(name).toBeValid()
  })

  it('goes back to the list on Cancel without saving', async () => {
    const { user, repository } = renderApp('/places/new', EMPTY_JOURNAL)
    await user.type(await screen.findByRole('textbox', { name: 'Restaurant name' }), 'Never saved')
    await user.click(screen.getByRole('link', { name: 'Cancel' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Want to Go' })).toBeInTheDocument()
    expect(await repository.listRestaurants()).toEqual([])
  })

  it('shows a message and keeps the form when saving fails', async () => {
    const { user } = renderApp('/places/new', EMPTY_JOURNAL)
    await user.type(await screen.findByRole('textbox', { name: 'Restaurant name' }), 'Casa')
    await user.type(screen.getByRole('textbox', { name: 'Neighborhood or city' }), 'Mesa')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    await user.click(screen.getByRole('button', { name: 'Save place' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save your changes')
    expect(screen.getByRole('textbox', { name: 'Restaurant name' })).toHaveValue('Casa')
    expect(screen.getByRole('button', { name: 'Save place' })).toBeEnabled()
  })
})
