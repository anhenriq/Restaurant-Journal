export interface AuthUser {
  id: string
  email: string
  /** From sign-up or Account. Missing for accounts created before names were asked for. */
  firstName?: string
  lastName?: string
}

/** Thrown for sign-in problems. `message` is written for the person using the app. */
export class AuthError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'AuthError'
  }
}

/** What we ask for, besides email and password, when someone creates an account. */
export interface SignUpProfile {
  firstName: string
  lastName: string
}

/** What the Account page lets someone change. */
export interface AccountChanges {
  firstName: string
  lastName: string
  email: string
}

/**
 * Who is using the app. The screens only know this interface, just like they only know
 * RestaurantRepository, so the sign-in provider can change without touching them.
 */
export interface AuthService {
  /** The signed-in person right now, or null. */
  getUser(): Promise<AuthUser | null>
  /** Calls `listener` whenever someone signs in or out. Returns a function that stops listening. */
  onChange(listener: (user: AuthUser | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  /** `needsConfirmation` is true when the person must click a link in an email before signing in. */
  signUp(email: string, password: string, profile: SignUpProfile): Promise<{ needsConfirmation: boolean }>
  /**
   * Saves a name and/or email change. `emailChangePending` is true when the new address must be
   * confirmed (by clicking a link sent to it) before it takes effect.
   */
  updateAccount(changes: AccountChanges): Promise<{ emailChangePending: boolean }>
  signOut(): Promise<void>
}
