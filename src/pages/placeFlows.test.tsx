import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { todayISODate } from '@/lib/format'
import { renderApp } from '@/test/renderApp'

const WANT_TO_GO = '/places/seed-rest-olive-ember'
const VISITED = '/places/seed-rest-casa-pelayo'

describe('Place detail screen', () => {
  it('shows a saved place with a "Mark as visited" call to action and no visits yet', async () => {
    renderApp(WANT_TO_GO)
    expect(await screen.findByRole('heading', { level: 1, name: 'Olive & Ember' })).toBeInTheDocument()
    expect(screen.getByText('Central Phoenix · Mediterranean')).toBeInTheDocument()
    expect(screen.getByText('Dana')).toBeInTheDocument()
    expect(screen.getByText(/candlelit tables/)).toBeInTheDocument()
    expect(screen.getByText('Quiet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mark as visited' })).toHaveAttribute(
      'href',
      '/places/seed-rest-olive-ember/visit',
    )
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', `${WANT_TO_GO}/edit`)
    expect(within(screen.getByRole('main')).getByRole('link', { name: /Want to Go/ })).toHaveAttribute('href', '/want-to-go')
    expect(await screen.findByText(/No visits yet/)).toBeInTheDocument()
  })

  it('shows the visit history of a visited place, newest first, with a way to log another', async () => {
    renderApp(VISITED)
    expect(await screen.findByRole('heading', { level: 1, name: 'Casa Pelayo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Log another visit' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Mark as visited' })).not.toBeInTheDocument()

    const history = await screen.findByRole('region', { name: 'Your visits' })
    const links = within(history).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['October 4, 2026', 'August 16, 2026'])
    expect(links[0]).toHaveAttribute('href', '/journal/seed-visit-casa-pelayo-2')
    expect(within(screen.getByRole('main')).getByRole('link', { name: /Journal/ })).toHaveAttribute('href', '/journal')
  })

  it('says so when the place does not exist', async () => {
    renderApp('/places/nope')
    expect(await screen.findByRole('heading', { name: "We couldn't find that place" })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Want to Go' })).toHaveAttribute('href', '/want-to-go')
  })

  it('deletes a place after confirmation and returns to the list', async () => {
    const { user, repository } = renderApp(WANT_TO_GO)
    await user.click(await screen.findByRole('button', { name: 'Delete Olive & Ember' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete Olive & Ember?' })
    expect(dialog).toHaveTextContent("This can't be undone.")
    await user.click(within(dialog).getByRole('button', { name: 'Delete place' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Want to Go' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Deleted Olive & Ember.')
    expect(await screen.findByText('3 places to try')).toBeInTheDocument()
    await expect(repository.getRestaurant('seed-rest-olive-ember')).rejects.toThrow()
  })

  it('warns that deleting a visited place also deletes its entries, and can be cancelled', async () => {
    const { user, repository } = renderApp(VISITED)
    await user.click(await screen.findByRole('button', { name: 'Delete Casa Pelayo' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete Casa Pelayo?' })
    expect(dialog).toHaveTextContent('This also deletes your 2 journal entries')

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Casa Pelayo' })).toBeInTheDocument()
    expect(await repository.listVisitsForRestaurant('seed-rest-casa-pelayo')).toHaveLength(2)
  })
})

describe('Edit place screen', () => {
  it('pre-fills the form, saves changes and shows them on the detail page', async () => {
    const { user, repository } = renderApp(`${WANT_TO_GO}/edit`)
    const name = await screen.findByRole('textbox', { name: 'Restaurant name' })
    expect(name).toHaveValue('Olive & Ember')
    expect(screen.getByRole('textbox', { name: 'Recommended by (optional)' })).toHaveValue('Dana')
    expect(screen.getByRole('checkbox', { name: 'Quiet' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '$$$ Pricey' })).toBeChecked()

    await user.clear(name)
    await user.type(name, 'Olive and Ember')
    await user.click(screen.getByRole('checkbox', { name: 'Quiet' }))
    await user.click(screen.getByRole('radio', { name: '$$ Moderate' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Olive and Ember' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Saved changes to Olive and Ember.')
    const saved = await repository.getRestaurant('seed-rest-olive-ember')
    expect(saved.priceLevel).toBe(2)
    expect(saved.vibeTags).not.toContain('quiet')
    expect(saved.status).toBe('want_to_go')
  })

  it('lets you clear "Recommended by"', async () => {
    const { user, repository } = renderApp(`${WANT_TO_GO}/edit`)
    await user.clear(await screen.findByRole('textbox', { name: 'Recommended by (optional)' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Olive & Ember' })).toBeInTheDocument()
    expect((await repository.getRestaurant('seed-rest-olive-ember')).recommendedBy).toBeUndefined()
    expect(screen.queryByText('Recommended by')).not.toBeInTheDocument()
  })

  it('cancels back to the detail page without changes', async () => {
    const { user, repository } = renderApp(`${WANT_TO_GO}/edit`)
    await user.type(await screen.findByRole('textbox', { name: 'Restaurant name' }), ' XYZ')
    await user.click(screen.getByRole('link', { name: 'Cancel' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Olive & Ember' })).toBeInTheDocument()
    expect((await repository.getRestaurant('seed-rest-olive-ember')).name).toBe('Olive & Ember')
  })
})

describe('Mark as visited screen', () => {
  it('turns a saved place into a journal entry', async () => {
    const { user, repository, router } = renderApp(`${WANT_TO_GO}/visit`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Mark as visited' })).toBeInTheDocument()
    expect(screen.getByText(/candlelit tables/)).toBeInTheDocument() // reminder of why it was saved
    expect(screen.getByLabelText('Date of visit')).toHaveValue(todayISODate())
    const wouldGoBack = screen.getByRole('switch', { name: /Would you go back/ })
    expect(wouldGoBack).toHaveAttribute('aria-checked', 'true')

    fireEvent.change(screen.getByLabelText('Date of visit'), { target: { value: '2026-10-10' } })
    await user.type(screen.getByRole('textbox', { name: 'Who did you go with? (optional)' }), 'Dana')
    await user.type(screen.getByRole('textbox', { name: 'What did you order? (optional)' }), 'Lamb flatbread')
    await user.type(
      screen.getByRole('textbox', { name: 'Your journal entry (optional)' }),
      'Candles on every table.{Enter}{Enter}Worth the splurge.',
    )
    await user.click(wouldGoBack)
    expect(wouldGoBack).toHaveAttribute('aria-checked', 'false')
    await user.click(screen.getByRole('button', { name: 'Save to journal' }))

    // Lands on the new journal entry, with a confirmation
    expect(await screen.findByRole('heading', { level: 1, name: 'Olive & Ember' })).toBeInTheDocument()
    expect(router.state.location.pathname).toMatch(/^\/journal\/.+/)
    expect(screen.getByRole('status')).toHaveTextContent('Saved your visit to Olive & Ember.')
    expect(screen.getByText('Candles on every table.')).toBeInTheDocument()

    const visits = await repository.listVisitsForRestaurant('seed-rest-olive-ember')
    expect(visits).toHaveLength(1)
    expect(visits[0]).toMatchObject({
      visitDate: '2026-10-10',
      wentWith: 'Dana',
      whatIOrdered: 'Lamb flatbread',
      journalEntry: 'Candles on every table.\n\nWorth the splurge.',
      wouldGoBack: false,
    })
    expect((await repository.getRestaurant('seed-rest-olive-ember')).status).toBe('visited')
  })

  it('offers "Log another visit" for a place already visited', async () => {
    renderApp(`${VISITED}/visit`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Log another visit' })).toBeInTheDocument()
  })

  it('requires a valid, non-future date', async () => {
    const { user, repository } = renderApp(`${WANT_TO_GO}/visit`)
    const date = await screen.findByLabelText('Date of visit')

    fireEvent.change(date, { target: { value: '' } })
    await user.click(screen.getByRole('button', { name: 'Save to journal' }))
    expect(date).toBeInvalid()
    expect(date).toHaveAccessibleDescription('Error: Choose the date you went.')
    expect(date).toHaveFocus()

    fireEvent.change(date, { target: { value: '2999-01-01' } })
    await user.click(screen.getByRole('button', { name: 'Save to journal' }))
    expect(date).toHaveAccessibleDescription(/in the future/)

    expect(await repository.listVisitsForRestaurant('seed-rest-olive-ember')).toEqual([])
    expect(screen.getByRole('heading', { level: 1, name: 'Mark as visited' })).toBeInTheDocument()
  })

  it('cancels back to the place without saving', async () => {
    const { user, repository } = renderApp(`${WANT_TO_GO}/visit`)
    await screen.findByRole('heading', { level: 1, name: 'Mark as visited' })
    await user.click(screen.getByRole('link', { name: 'Cancel' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Olive & Ember' })).toBeInTheDocument()
    expect(await repository.listVisitsForRestaurant('seed-rest-olive-ember')).toEqual([])
  })
})
