/** Per-route metadata, attached to routes via the `handle` property. */
export interface RouteHandle {
  /** Used for the browser tab title and announced on navigation. */
  title: string
}

function isRouteHandle(value: unknown): value is RouteHandle {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    typeof value.title === 'string'
  )
}

/** Title of the deepest matched route that declares one. */
export function routeTitle(matches: ReadonlyArray<{ handle: unknown }>): string | undefined {
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.handle
    if (isRouteHandle(handle)) return handle.title
  }
  return undefined
}
