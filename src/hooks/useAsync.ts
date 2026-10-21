import { useCallback, useEffect, useState, type DependencyList } from 'react'

export interface AsyncState<T> {
  /** Last successfully loaded value. Kept while reloading so lists don't flash empty. */
  data: T | undefined
  error: Error | undefined
  loading: boolean
  /** Run the loader again (e.g. after a save). */
  refetch: () => void
}

/** Runs `load` on mount and whenever `deps` change. Ignores results from superseded calls. */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let current = true
    setLoading(true)
    load().then(
      (result) => {
        if (!current) return
        setData(result)
        setError(undefined)
        setLoading(false)
      },
      (cause: unknown) => {
        if (!current) return
        setError(cause instanceof Error ? cause : new Error(String(cause)))
        setLoading(false)
      },
    )
    return () => {
      current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `load` is intentionally keyed by `deps`
  }, [...deps, reloadCount])

  const refetch = useCallback(() => setReloadCount((n) => n + 1), [])

  return { data, error, loading, refetch }
}
