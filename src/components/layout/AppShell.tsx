import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router'
import { routeTitle } from '@/router/routeHandle'
import { BottomTabBar } from './BottomTabBar'
import { PageTitleContext } from './pageTitle'
import { SideNav } from './SideNav'
import { SkipLink } from './SkipLink'

const APP_NAME = 'Restaurant Journal'

/**
 * Page frame: side nav (md+), bottom tab bar (phones) and the main content area.
 * On every route change it updates the document title and moves focus to <main>
 * so screen reader and keyboard users land at the top of the new page.
 */
export function AppShell() {
  const { pathname } = useLocation()
  const matches = useMatches()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  const [pageTitle, setPageTitle] = useState<string | undefined>()
  const title = pageTitle ?? routeTitle(matches)

  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-dvh md:flex">
      <SkipLink />
      <SideNav />
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-content min-w-0 flex-1 px-4 pb-28 pt-6 focus:outline-none md:px-8 md:pb-12 md:pt-10"
      >
        <PageTitleContext.Provider value={setPageTitle}>
          <Outlet />
        </PageTitleContext.Provider>
      </main>
      <BottomTabBar />
    </div>
  )
}
