/** First focusable element: lets keyboard users jump past the navigation. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-20 focus:flex focus:min-h-touch focus:items-center focus:rounded focus:bg-accent focus:px-4 focus:text-ink-on-accent"
    >
      Skip to main content
    </a>
  )
}
