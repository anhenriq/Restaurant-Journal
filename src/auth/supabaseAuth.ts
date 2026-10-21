import type { SupabaseClient, User } from '@supabase/supabase-js'
import { AuthError, type AuthService, type AuthUser } from './auth'

/** Plain-language text for Supabase sign-in problems, keyed by Supabase's error code. */
export function friendlyAuthMessage(code: string | undefined, name?: string): string {
  switch (code) {
    case 'invalid_credentials':
      return "That email and password don't match. Check them and try again."
    case 'email_not_confirmed':
      return 'Please confirm your email first: open the link we sent you, then sign in.'
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with that email already exists. Try signing in instead.'
    case 'weak_password':
      return 'Choose a stronger password (at least 8 characters, ideally a mix of letters and numbers).'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Wait a few minutes and try again.'
    case 'signup_disabled':
      return 'New accounts are turned off for this journal.'
    case 'email_address_invalid':
    case 'validation_failed':
      return 'That email address doesn\'t look right.'
    default:
      return name === 'AuthRetryableFetchError'
        ? "Couldn't reach the server. Check your connection and try again."
        : "Couldn't sign you in. Please try again."
  }
}

/** A non-empty string from loosely typed metadata, or undefined. */
const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user?.email) return null
  const meta: unknown = user.user_metadata
  const firstName = typeof meta === 'object' && meta !== null && 'first_name' in meta ? text(meta.first_name) : undefined
  const lastName = typeof meta === 'object' && meta !== null && 'last_name' in meta ? text(meta.last_name) : undefined
  return {
    id: user.id,
    email: user.email,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  }
}

/** Sign-in with email and password through Supabase Auth. The session is kept in this browser. */
export function createSupabaseAuth(client: SupabaseClient): AuthService {
  return {
    async getUser() {
      const { data } = await client.auth.getSession()
      return toAuthUser(data.session?.user)
    },

    onChange(listener) {
      const { data } = client.auth.onAuthStateChange((_event, session) => listener(toAuthUser(session?.user)))
      return () => data.subscription.unsubscribe()
    },

    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw new AuthError(friendlyAuthMessage(error.code, error.name), { cause: error })
    },

    async signUp(email, password, profile) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          // Stored with the account (auth user metadata)
          data: { first_name: profile.firstName, last_name: profile.lastName },
        },
      })
      if (error) throw new AuthError(friendlyAuthMessage(error.code, error.name), { cause: error })
      // No session yet means the project requires clicking a confirmation link first
      return { needsConfirmation: data.session === null }
    },

    async updateAccount({ firstName, lastName, email }) {
      const { data: session } = await client.auth.getSession()
      const emailChanged = session.session?.user.email !== email
      const { data, error } = await client.auth.updateUser(
        {
          ...(emailChanged ? { email } : {}),
          data: { first_name: firstName, last_name: lastName },
        },
        emailChanged ? { emailRedirectTo: window.location.origin } : undefined,
      )
      if (error) throw new AuthError(friendlyAuthMessage(error.code, error.name), { cause: error })
      // With "Confirm email" on, the address only changes after the person clicks the emailed link
      return { emailChangePending: emailChanged && data.user.email !== email }
    },

    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) throw new AuthError("Couldn't sign you out. Please try again.", { cause: error })
    },
  }
}
