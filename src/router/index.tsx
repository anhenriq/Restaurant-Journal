import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { RequireAuth } from '@/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { AccountPage } from '@/pages/AccountPage'
import { AddPlacePage } from '@/pages/AddPlacePage'
import { EditPlacePage } from '@/pages/EditPlacePage'
import { EditVisitPage } from '@/pages/EditVisitPage'
import { JournalPage } from '@/pages/JournalPage'
import { LogVisitPage } from '@/pages/LogVisitPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceDetailPage } from '@/pages/PlaceDetailPage'
import { SignInPage } from '@/pages/SignInPage'
import { VisitDetailPage } from '@/pages/VisitDetailPage'
import { WantToGoPage } from '@/pages/WantToGoPage'
import type { RouteHandle } from './routeHandle'

const handle = (title: string): RouteHandle => ({ title })

/** Exported separately so tests can mount the same routes in a memory router. */
export const routes: RouteObject[] = [
  { path: '/sign-in', element: <SignInPage /> },
  {
    // Everything else needs a signed-in person (always true when data is kept in this browser)
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/want-to-go" replace /> },
          { path: 'want-to-go', element: <WantToGoPage />, handle: handle('Want to Go') },
          { path: 'places/new', element: <AddPlacePage />, handle: handle('Add a place') },
          { path: 'places/:id', element: <PlaceDetailPage />, handle: handle('Place details') },
          { path: 'places/:id/edit', element: <EditPlacePage />, handle: handle('Edit place') },
          { path: 'places/:id/visit', element: <LogVisitPage />, handle: handle('Mark as visited') },
          { path: 'journal', element: <JournalPage />, handle: handle('Journal') },
          { path: 'journal/:visitId', element: <VisitDetailPage />, handle: handle('Journal entry') },
          { path: 'journal/:visitId/edit', element: <EditVisitPage />, handle: handle('Edit entry') },
          { path: 'account', element: <AccountPage />, handle: handle('Account') },
          { path: '*', element: <NotFoundPage />, handle: handle('Page not found') },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
