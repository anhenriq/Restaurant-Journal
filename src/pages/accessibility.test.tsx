import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '@/test/axe'
import { createFakeAuth } from '@/test/fakeAuth'
import { renderApp } from '@/test/renderApp'

/** Each screen is rendered in its main states and scanned with axe-core. */
describe('accessibility (axe-core)', () => {
  const screens: Array<[string, string, string]> = [
    ['Want to Go list', '/want-to-go', 'Want to Go'],
    ['Journal list', '/journal', 'Journal'],
    ['Add a place form', '/places/new', 'Add a place'],
    ['Place detail (saved)', '/places/seed-rest-olive-ember', 'Olive & Ember'],
    ['Place detail (visited)', '/places/seed-rest-casa-pelayo', 'Casa Pelayo'],
    ['Edit place', '/places/seed-rest-olive-ember/edit', 'Edit place'],
    ['Mark as visited', '/places/seed-rest-olive-ember/visit', 'Mark as visited'],
    ['Journal entry', '/journal/seed-visit-brick-vine-1', 'Brick & Vine'],
    ['Edit entry', '/journal/seed-visit-brick-vine-1/edit', 'Edit entry'],
    ['Not found', '/nope', 'Page not found'],
  ]

  it.each(screens)('%s has no violations', async (_name, path, heading) => {
    renderApp(path)
    await screen.findByRole('heading', { level: 1, name: heading })
    // let list/detail data finish loading
    await screen.findAllByRole('link')
    await new Promise((resolve) => setTimeout(resolve, 50))
    await expectNoA11yViolations()
  })

  it('has no violations with the filter panel open', async () => {
    const { user } = renderApp('/want-to-go')
    await screen.findByText('4 places to try')
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await expectNoA11yViolations()
  })

  it('has no violations with form errors showing', async () => {
    const { user } = renderApp('/places/new')
    await user.click(await screen.findByRole('button', { name: 'Save place' }))
    await expectNoA11yViolations()
  })

  it('has no violations on the signed-in Account page, including with form errors', async () => {
    const auth = createFakeAuth({ id: 'u1', email: 'george@example.com', firstName: 'Maya', lastName: 'Lopez' })
    const { user } = renderApp('/account', undefined, { auth, hasAccounts: true })
    await screen.findByRole('heading', { level: 2, name: 'Welcome back, Maya' })
    await expectNoA11yViolations()
    await user.clear(screen.getByLabelText('Last name'))
    await user.click(screen.getByRole('button', { name: 'Update account info' }))
    await expectNoA11yViolations()
  })

  it('has no violations with the delete dialog open', async () => {
    const { user } = renderApp('/places/seed-rest-olive-ember')
    await user.click(await screen.findByRole('button', { name: 'Delete Olive & Ember' }))
    await expectNoA11yViolations()
  })
})

describe('page titles', () => {
  it('name the restaurant on detail screens', async () => {
    renderApp('/places/seed-rest-olive-ember')
    await screen.findByRole('heading', { level: 1, name: 'Olive & Ember' })
    await waitFor(() => expect(document.title).toBe('Olive & Ember · Restaurant Journal'))
  })

  it('name the restaurant and date on journal entries', async () => {
    renderApp('/journal/seed-visit-brick-vine-1')
    await screen.findByRole('heading', { level: 1, name: 'Brick & Vine' })
    await waitFor(() => expect(document.title).toBe('Brick & Vine · September 12, 2026 · Restaurant Journal'))
  })

  it('fall back to the screen name for lists', async () => {
    renderApp('/journal')
    await screen.findByRole('heading', { level: 1, name: 'Journal' })
    expect(document.title).toBe('Journal · Restaurant Journal')
  })
})
