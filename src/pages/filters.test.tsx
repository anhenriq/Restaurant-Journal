import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'

const placeNames = () =>
  within(screen.getByRole('main'))
    .queryAllByRole('heading', { level: 2 })
    .map((h) => h.textContent)

describe('Want to Go search and filters', () => {
  it('searches names, notes and recommenders, announcing the result count', async () => {
    const { user } = renderApp('/want-to-go')
    await screen.findByText('4 places to try')

    await user.type(screen.getByRole('searchbox', { name: 'Search your saved places' }), 'dana')
    await waitFor(() => expect(placeNames()).toEqual(['Olive & Ember']))
    expect(screen.getByText('1 place matches.')).toBeInTheDocument()
    expect(screen.getByText('1 place to try')).toBeInTheDocument()
  })

  it('filters by vibe (all selected must match) and by maximum price', async () => {
    const { user } = renderApp('/want-to-go')
    await screen.findByText('4 places to try')
    await user.click(screen.getByRole('button', { name: 'Filters' }))

    await user.click(screen.getByRole('checkbox', { name: 'Patio' }))
    await waitFor(() => expect(placeNames()).toHaveLength(3))
    expect(screen.getByRole('button', { name: /Filters/ })).toHaveTextContent('1 active')

    await user.click(screen.getByRole('checkbox', { name: 'Dim lighting' }))
    await waitFor(() => expect(placeNames().sort()).toEqual(['Olive & Ember', 'Sable Terrace']))

    await user.click(screen.getByRole('radio', { name: '$$$ Pricey' }))
    await waitFor(() => expect(placeNames()).toEqual(['Olive & Ember']))
    expect(screen.getByRole('button', { name: /Filters/ })).toHaveTextContent('3 active')
  })

  it('shows a "no matches" state that can be cleared, unlike the empty state', async () => {
    const { user } = renderApp('/want-to-go')
    await screen.findByText('4 places to try')
    await user.type(screen.getByRole('searchbox', { name: 'Search your saved places' }), 'zzzz')

    expect(await screen.findByRole('heading', { name: 'No places match' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'No places saved yet' })).not.toBeInTheDocument()
    expect(screen.getByText('0 places match.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search and filters' }))
    await waitFor(() => expect(placeNames()).toHaveLength(4))
    expect(screen.getByRole('searchbox', { name: 'Search your saved places' })).toHaveValue('')
  })

  it('"Clear all" resets the search and filters', async () => {
    const { user } = renderApp('/want-to-go')
    await screen.findByText('4 places to try')
    await user.type(screen.getByRole('searchbox', { name: 'Search your saved places' }), 'terrace')
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    await waitFor(() => expect(placeNames()).toHaveLength(4))
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
  })

  it('starts from filters in the URL and keeps the URL in sync', async () => {
    const { user, router } = renderApp('/want-to-go?q=patio&tags=quiet&price=3')
    expect(await screen.findByRole('searchbox', { name: 'Search your saved places' })).toHaveValue('patio')
    // The filter panel opens by itself when filters are active, with the right ones selected
    expect(screen.getByRole('checkbox', { name: 'Quiet' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '$$$ Pricey' })).toBeChecked()
    await waitFor(() => expect(placeNames()).toEqual(['Olive & Ember']))

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    await waitFor(() => expect(router.state.location.search).toBe(''))
  })
})

describe('Journal search and filters', () => {
  it('searches the text of the writing', async () => {
    const { user } = renderApp('/journal')
    await screen.findByText('4 entries')
    await user.type(screen.getByRole('searchbox', { name: 'Search your journal' }), 'basset')
    await waitFor(() => expect(placeNames()).toEqual(['Brick & Vine']))
    expect(screen.getByText('1 entry matches.')).toBeInTheDocument()
  })

  it('filters entries by the restaurant\'s vibe and price', async () => {
    const { user } = renderApp('/journal')
    await screen.findByText('4 entries')
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await user.click(screen.getByRole('checkbox', { name: 'Hole-in-the-wall' }))
    await waitFor(() => expect(placeNames()).toEqual(['Casa Pelayo', 'Casa Pelayo']))

    await user.click(screen.getByRole('checkbox', { name: 'Hole-in-the-wall' }))
    await user.click(screen.getByRole('radio', { name: '$ Cheap eats' }))
    await waitFor(() => expect(placeNames()).toHaveLength(2))
  })

  it('shows a no-matches state', async () => {
    const { user } = renderApp('/journal')
    await screen.findByText('4 entries')
    await user.type(screen.getByRole('searchbox', { name: 'Search your journal' }), 'zzzz')
    expect(await screen.findByRole('heading', { name: 'No entries match' })).toBeInTheDocument()
  })
})
