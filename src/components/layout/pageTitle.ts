import { createContext, useContext, useEffect } from 'react'

type SetPageTitle = (title: string | undefined) => void

/** Lets a page override its route's default document title (e.g. with the restaurant's name). */
export const PageTitleContext = createContext<SetPageTitle>(() => undefined)

/** Sets the browser tab title while the page is shown. Pass undefined until the data has loaded. */
export function usePageTitle(title: string | undefined): void {
  const setPageTitle = useContext(PageTitleContext)
  useEffect(() => {
    setPageTitle(title)
    return () => setPageTitle(undefined)
  }, [title, setPageTitle])
}
