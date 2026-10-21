import type { AuthService, AuthUser } from './auth'

export const LOCAL_USER: AuthUser = { id: 'local-user', email: 'this browser' }

/**
 * Stand-in used when no backend is configured: data lives in this browser only, so there is
 * nobody to sign in. The person is always "signed in" and can't sign out.
 */
export function createLocalAuth(): AuthService {
  return {
    getUser: () => Promise.resolve(LOCAL_USER),
    onChange: () => () => undefined,
    signIn: () => Promise.resolve(),
    signUp: () => Promise.resolve({ needsConfirmation: false }),
    updateAccount: () => Promise.resolve({ emailChangePending: false }),
    signOut: () => Promise.resolve(),
  }
}
