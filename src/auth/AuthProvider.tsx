import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthService } from './auth'
import { AuthContext, type AuthState } from './authContext'

interface AuthProviderProps {
  service: AuthService
  hasAccounts: boolean
  children: ReactNode
}

/** Keeps track of who is signed in and shares it with the app. */
export function AuthProvider({ service, hasAccounts, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let current = true
    const apply = (user: Awaited<ReturnType<AuthService['getUser']>>) => {
      if (current) setState(user ? { status: 'signedIn', user } : { status: 'signedOut' })
    }
    service.getUser().then(apply, () => apply(null))
    const stopListening = service.onChange(apply)
    return () => {
      current = false
      stopListening()
    }
  }, [service])

  const value = useMemo(() => ({ state, service, hasAccounts }), [state, service, hasAccounts])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
