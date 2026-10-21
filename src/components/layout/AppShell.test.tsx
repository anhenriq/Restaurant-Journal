import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'

function renderAt(path: string) {
  return renderApp(path)
}

describe('AppShell', () => {
  it('redirects / to the Want to Go screen', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Want to Go' })).toBeInTheDocument()
  })

  it('offers a skip link and labelled main navigation', async () => {
    renderAt('/want-to-go')
    expect(await screen.findByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main')
    // Both navs are in the DOM (CSS hides one per breakpoint); each has the same links.
    const navs = screen.getAllByRole('navigation', { name: 'Main' })
    expect(navs).toHaveLength(2)
    for (const nav of navs) {
      for (const label of ['Want to Go', 'Add a place', 'Journal', 'Account']) {
        expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
      }
    }
  })

  it('navigates between screens, marks the current one and updates the title', async () => {
    const user = userEvent.setup()
    renderAt('/want-to-go')
    const [nav] = await screen.findAllByRole('navigation', { name: 'Main' })
    if (!nav) throw new Error('navigation not found')

    expect(within(nav).getByRole('link', { name: 'Want to Go' })).toHaveAttribute('aria-current', 'page')

    await user.click(within(nav).getByRole('link', { name: 'Journal' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Journal' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Journal' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('Journal · Restaurant Journal')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('shows a not-found screen for unknown URLs', async () => {
    renderAt('/nope')
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
  })
})
