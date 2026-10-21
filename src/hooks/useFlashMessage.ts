import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

/** Navigation state used to pass a one-time confirmation to the next screen. */
export interface FlashState {
  flash: string
}

function readFlash(state: unknown): string | undefined {
  if (typeof state === 'object' && state !== null && 'flash' in state && typeof state.flash === 'string') {
    return state.flash
  }
  return undefined
}

/**
 * Returns the one-time message passed via `navigate(path, { state: { flash } })`, if any.
 * The message is cleared from history so it doesn't reappear on refresh.
 */
export function useFlashMessage(): string | undefined {
  const location = useLocation()
  const navigate = useNavigate()
  const [flash] = useState(() => readFlash(location.state))

  useEffect(() => {
    if (flash) navigate(location.pathname + location.search, { replace: true, state: null })
    // Only on first render of the screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return flash
}
