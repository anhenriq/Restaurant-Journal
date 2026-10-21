import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SEED_DATA } from '@/data/seed'
import { EMPTY_JOURNAL, renderApp } from '@/test/renderApp'

const BRICK_VINE_ENTRY = '/journal/seed-visit-brick-vine-1' // the only visit to Brick & Vine
const CASA_ENTRY_1 = '/journal/seed-visit-casa-pelayo-1' // one of two visits to Casa Pelayo

describe('Journal list screen', () => {
  it('lists every entry, newest first, as links to the entry', async () => {
    renderApp('/journal')
    expect(await screen.findByRole('heading', { level: 1, name: 'Journal' })).toBeInTheDocument()
    expect(await screen.findByText('4 entries')).toBeInTheDocument()

    const main = screen.getByRole('main')
    const titles = within(main)
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent)
    expect(titles).toEqual(['Casa Pelayo', 'Brick & Vine', 'Glasshouse Social', 'Casa Pelayo'])

    const first = within(main).getAllByRole('link', { name: 'Casa Pelayo' })[0]
    expect(first).toHaveAttribute('href', '/journal/seed-visit-casa-pelayo-2')
    expect(within(main).getByText('September 12, 2026 · With Jess and Tom')).toBeInTheDocument()
    expect(within(main).getByText('Would not go back')).toBeInTheDocument()
    expect(within(main).getAllByText('Would go back')).toHaveLength(3)
  })

  it('shows an empty state before there are any visits', async () => {
    renderApp('/journal', EMPTY_JOURNAL)
    expect(await screen.findByRole('heading', { name: 'Your journal is empty' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See your Want to Go list' })).toHaveAttribute('href', '/want-to-go')
  })
})

describe('Journal entry reading view', () => {
  it('presents the visit details and the writing paragraph by paragraph', async () => {
    renderApp(BRICK_VINE_ENTRY)
    expect(await screen.findByRole('heading', { level: 1, name: 'Brick & Vine' })).toBeInTheDocument()
    expect(screen.getByText(/September 12, 2026 · Tempe · Italian/)).toBeInTheDocument()
    expect(screen.getByText('Jess and Tom')).toBeInTheDocument()
    expect(screen.getByText(/Cacio e pepe, wood-fired mushroom flatbread/)).toBeInTheDocument()
    expect(screen.getByText('Would go back')).toBeInTheDocument()

    const writing = screen.getByRole('region', { name: 'Your writing' })
    expect(within(writing).getAllByText(/./, { selector: 'p' })).toHaveLength(3)
    expect(within(writing).getByText(/Jess was right/)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'About Brick & Vine' })).toHaveAttribute(
      'href',
      '/places/seed-rest-brick-vine',
    )
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', `${BRICK_VINE_ENTRY}/edit`)
  })

  it('invites the reader to write when an entry has no text', async () => {
    const seed = {
      ...SEED_DATA,
      visits: SEED_DATA.visits.map((v) =>
        v.id === 'seed-visit-brick-vine-1' ? { ...v, journalEntry: '', wentWith: '' } : v,
      ),
    }
    renderApp(BRICK_VINE_ENTRY, seed)
    expect(await screen.findByText(/You didn't write anything for this visit/)).toBeInTheDocument()
    expect(screen.queryByText('Went with')).not.toBeInTheDocument()
  })

  it('says so when the entry does not exist', async () => {
    renderApp('/journal/nope')
    expect(await screen.findByRole('heading', { name: "We couldn't find that entry" })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Journal' })).toHaveAttribute('href', '/journal')
  })
})

describe('Edit entry screen', () => {
  it('pre-fills the entry, saves changes and shows them in the reading view', async () => {
    const { user, repository } = renderApp(`${BRICK_VINE_ENTRY}/edit`)
    const writing = await screen.findByRole('textbox', { name: 'Your journal entry (optional)' })
    expect((writing as HTMLTextAreaElement).value).toContain('Jess was right.')
    expect(screen.getByLabelText('Date of visit')).toHaveValue('2026-09-12')
    expect(screen.getByRole('textbox', { name: 'Who did you go with? (optional)' })).toHaveValue('Jess and Tom')
    const wouldGoBack = screen.getByRole('switch', { name: /Would you go back/ })
    expect(wouldGoBack).toHaveAttribute('aria-checked', 'true')

    await user.clear(writing)
    await user.type(writing, 'Rewritten after a second thought.')
    fireEvent.change(screen.getByLabelText('Date of visit'), { target: { value: '2026-09-13' } })
    await user.click(wouldGoBack)
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Brick & Vine' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Saved changes to your entry.')
    expect(await screen.findByText('Rewritten after a second thought.')).toBeInTheDocument()
    expect(screen.getByText(/^September 13, 2026 ·/)).toBeInTheDocument()
    expect(screen.getByText('Would not go back')).toBeInTheDocument()

    const saved = await repository.getVisit('seed-visit-brick-vine-1')
    expect(saved).toMatchObject({ visitDate: '2026-09-13', wouldGoBack: false, wentWith: 'Jess and Tom' })
  })

  it('cancels back to the entry without changes', async () => {
    const { user, repository } = renderApp(`${BRICK_VINE_ENTRY}/edit`)
    await user.type(await screen.findByRole('textbox', { name: 'Your journal entry (optional)' }), ' EXTRA')
    await user.click(screen.getByRole('link', { name: 'Cancel' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Brick & Vine' })).toBeInTheDocument()
    expect((await repository.getVisit('seed-visit-brick-vine-1')).journalEntry).not.toContain('EXTRA')
  })
})

describe('Delete entry', () => {
  it('deleting a place\'s only entry sends it back to Want to Go', async () => {
    const { user, repository } = renderApp(BRICK_VINE_ENTRY)
    await user.click(await screen.findByRole('button', { name: /Delete entry for Brick & Vine/ }))
    const dialog = screen.getByRole('dialog', { name: 'Delete this entry?' })
    await expect(within(dialog).findByText(/goes back to your Want to Go list/)).resolves.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete entry' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Journal' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Deleted your entry for Brick & Vine.')
    expect(await screen.findByText('3 entries')).toBeInTheDocument()
    expect((await repository.getRestaurant('seed-rest-brick-vine')).status).toBe('want_to_go')
  })

  it('deleting one of several entries keeps the place visited', async () => {
    const { user, repository } = renderApp(CASA_ENTRY_1)
    await user.click(await screen.findByRole('button', { name: /Delete entry for Casa Pelayo/ }))
    const dialog = screen.getByRole('dialog', { name: 'Delete this entry?' })
    expect(await within(dialog).findByText(/will be deleted\. This can't be undone\./)).not.toHaveTextContent(
      'Want to Go',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Delete entry' }))

    expect(await screen.findByText('3 entries')).toBeInTheDocument()
    expect((await repository.getRestaurant('seed-rest-casa-pelayo')).status).toBe('visited')
  })

  it('can be cancelled', async () => {
    const { user, repository } = renderApp(BRICK_VINE_ENTRY)
    await user.click(await screen.findByRole('button', { name: /Delete entry for Brick & Vine/ }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await repository.listVisits()).toHaveLength(4)
  })
})
