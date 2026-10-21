import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import type { AuthService } from '@/auth/auth'
import { createLocalAuth } from '@/auth/localAuth'
import { AuthProvider } from '@/auth/AuthProvider'
import { createLocalStorageRepository } from '@/data/localStorageRepository'
import { RepositoryProvider } from '@/data/RepositoryProvider'
import { routes } from '@/router'
import type { JournalData } from '@/types'

export const EMPTY_JOURNAL: JournalData = { restaurants: [], visits: [] }

interface RenderAppOptions {
  /** Defaults to a stand-in that is always signed in, like the browser-storage mode. */
  auth?: AuthService
  /** Pretend the app is connected to accounts (shows the signed-in email and Sign out on the Account page). */
  hasAccounts?: boolean
}

/**
 * Renders the whole app at `path` with a fresh localStorage-backed repository.
 * Uses the built-in sample data unless `seed` is given.
 */
export function renderApp(path: string, seed?: JournalData, options: RenderAppOptions = {}) {
  localStorage.clear()
  const repository = createLocalStorageRepository(seed ? { seed } : {})
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  render(
    <RepositoryProvider repository={repository}>
      <AuthProvider service={options.auth ?? createLocalAuth()} hasAccounts={options.hasAccounts ?? false}>
        <RouterProvider router={router} />
      </AuthProvider>
    </RepositoryProvider>,
  )
  return { user, repository, router }
}
