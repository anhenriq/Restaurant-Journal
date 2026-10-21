export interface SupabaseConfig {
  url: string
  anonKey: string
}

/** Reads the first (payload) section of a JWT, or undefined if `key` isn't one. */
function jwtRole(key: string): string | undefined {
  const parts = key.split('.')
  if (parts.length !== 3 || !parts[1]) return undefined
  try {
    const payload: unknown = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload === 'object' && payload !== null && 'role' in payload && typeof payload.role === 'string'
      ? payload.role
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Everything in a VITE_ variable ends up in the downloaded app, so a secret key there would
 * hand full database access to anyone who opens the page. Refuse to start with one.
 */
export function assertPublicKey(key: string): void {
  if (key.startsWith('sb_secret_') || jwtRole(key) === 'service_role') {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY holds a secret (service_role) key. Use the public "anon" or "publishable" key instead, and rotate the secret key in the Supabase dashboard, since it has now been exposed.',
    )
  }
}

/**
 * Returns the Supabase settings from environment variables, or undefined when they aren't filled in
 * (the app then falls back to browser storage). Throws if they are filled in but unsafe or malformed.
 */
export function readSupabaseConfig(env: Record<string, string | undefined>): SupabaseConfig | undefined {
  const url = env.VITE_SUPABASE_URL?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return undefined

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('VITE_SUPABASE_URL is not a valid web address.')
  }
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (parsed.protocol !== 'https:' && !isLocal) {
    throw new Error('VITE_SUPABASE_URL must start with https://')
  }
  assertPublicKey(anonKey)
  return { url: parsed.origin, anonKey }
}
