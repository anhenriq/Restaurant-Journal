import { AuthError, type AccountChanges, type AuthService, type AuthUser, type SignUpProfile } from '@/auth/auth'

export interface FakeAuth extends AuthService {
  /** Accounts that exist, by email. */
  accounts: Map<string, string>
  /** Names given at sign-up, by email. */
  profiles: Map<string, SignUpProfile>
  /** Set to make the next sign-up require email confirmation. */
  requireConfirmation: boolean
  /** Set to make an email change wait for confirmation (the address stays the same until then). */
  emailChangeNeedsConfirmation: boolean
  /** Every call to updateAccount, in order. */
  updates: AccountChanges[]
}

/** An AuthService for tests: starts signed out (or as `initialUser`), with email/password accounts held in memory. */
export function createFakeAuth(initialUser: AuthUser | null = null): FakeAuth {
  let current = initialUser
  const listeners = new Set<(user: AuthUser | null) => void>()
  const set = (user: AuthUser | null) => {
    current = user
    for (const listener of listeners) listener(user)
  }

  const fake: FakeAuth = {
    accounts: new Map([['george@example.com', 'correct-horse']]),
    profiles: new Map(),
    requireConfirmation: false,
    emailChangeNeedsConfirmation: false,
    updates: [],
    getUser: () => Promise.resolve(current),
    onChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    signIn(email, password) {
      if (fake.accounts.get(email) !== password) {
        return Promise.reject(new AuthError("That email and password don't match. Check them and try again."))
      }
      set({ id: `user-${email}`, email })
      return Promise.resolve()
    },
    signUp(email, password, profile) {
      if (fake.accounts.has(email)) {
        return Promise.reject(new AuthError('An account with that email already exists. Try signing in instead.'))
      }
      fake.accounts.set(email, password)
      fake.profiles.set(email, profile)
      if (fake.requireConfirmation) return Promise.resolve({ needsConfirmation: true })
      set({ id: `user-${email}`, email })
      return Promise.resolve({ needsConfirmation: false })
    },
    updateAccount(changes) {
      if (!current) return Promise.reject(new AuthError('Please sign in again.'))
      fake.updates.push(changes)
      const emailChanged = changes.email !== current.email
      const pending = emailChanged && fake.emailChangeNeedsConfirmation
      set({ ...current, firstName: changes.firstName, lastName: changes.lastName, email: pending ? current.email : changes.email })
      return Promise.resolve({ emailChangePending: pending })
    },
    signOut() {
      set(null)
      return Promise.resolve()
    },
  }
  return fake
}
