import { describe, expect, it } from 'vitest'
import { assertPublicKey, readSupabaseConfig } from './supabaseConfig'

/** Builds a JWT-shaped string with the given payload (signature is irrelevant here). */
function fakeJwt(payload: object): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, '')
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`
}

describe('readSupabaseConfig', () => {
  const url = 'https://abc.supabase.co'

  it('returns nothing when the settings are not filled in (the app then uses browser storage)', () => {
    expect(readSupabaseConfig({})).toBeUndefined()
    expect(readSupabaseConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: '' })).toBeUndefined()
    expect(readSupabaseConfig({ VITE_SUPABASE_URL: '  ', VITE_SUPABASE_ANON_KEY: 'key' })).toBeUndefined()
  })

  it('returns the settings, trimmed and with a clean origin', () => {
    const anon = fakeJwt({ role: 'anon' })
    expect(readSupabaseConfig({ VITE_SUPABASE_URL: ` ${url}/ `, VITE_SUPABASE_ANON_KEY: ` ${anon} ` })).toEqual({
      url,
      anonKey: anon,
    })
    expect(readSupabaseConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: 'sb_publishable_abc' })?.anonKey).toBe(
      'sb_publishable_abc',
    )
  })

  it('rejects malformed or insecure addresses', () => {
    expect(() => readSupabaseConfig({ VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_ANON_KEY: 'k' })).toThrow(/valid web address/)
    expect(() => readSupabaseConfig({ VITE_SUPABASE_URL: 'http://abc.supabase.co', VITE_SUPABASE_ANON_KEY: 'k' })).toThrow(/https/)
    expect(readSupabaseConfig({ VITE_SUPABASE_URL: 'http://localhost:54321', VITE_SUPABASE_ANON_KEY: 'k' })?.url).toBe(
      'http://localhost:54321',
    )
  })

  it('refuses a secret key, which would be exposed to everyone who opens the app', () => {
    expect(() => readSupabaseConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: 'sb_secret_abc' })).toThrow(/secret/)
    expect(() =>
      readSupabaseConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: fakeJwt({ role: 'service_role' }) }),
    ).toThrow(/service_role/)
  })
})

describe('assertPublicKey', () => {
  it('allows anon and publishable keys', () => {
    expect(() => assertPublicKey(fakeJwt({ role: 'anon' }))).not.toThrow()
    expect(() => assertPublicKey('sb_publishable_xyz')).not.toThrow()
    expect(() => assertPublicKey('not-a-jwt')).not.toThrow()
  })
})
