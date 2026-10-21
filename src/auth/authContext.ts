import { createContext, useContext } from 'react'
import type { AuthService, AuthUser } from './auth'

export type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: AuthUser }

export interface AuthContextValue {
  state: AuthState
  service: AuthService
  /** False when running on browser storage, where there is no account to sign out of. */
  hasAccounts: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
