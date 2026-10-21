import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { AuthError } from './auth'
import { createSupabaseAuth, friendlyAuthMessage } from './supabaseAuth'

function clientWith(auth: object): SupabaseClient {
  return { auth } as unknown as SupabaseClient
}

describe('friendlyAuthMessage', () => {
  it('speaks plainly and never leaks internals', () => {
    expect(friendlyAuthMessage('invalid_credentials')).toMatch(/don't match/)
    expect(friendlyAuthMessage('email_not_confirmed')).toMatch(/confirm your email/)
    expect(friendlyAuthMessage('user_already_exists')).toMatch(/already exists/)
    expect(friendlyAuthMessage('over_email_send_rate_limit')).toMatch(/Too many/)
    expect(friendlyAuthMessage(undefined, 'AuthRetryableFetchError')).toMatch(/connection/)
    expect(friendlyAuthMessage('something_new')).toBe("Couldn't sign you in. Please try again.")
  })
})

describe('createSupabaseAuth', () => {
  const user = { id: 'u1', email: 'george@example.com' }

  it('includes the first and last name saved at sign-up or on the Account page', async () => {
    const named = { ...user, user_metadata: { first_name: 'George', last_name: 'Rivera' } }
    const auth = createSupabaseAuth(clientWith({ getSession: () => Promise.resolve({ data: { session: { user: named } } }) }))
    expect(await auth.getUser()).toEqual({ id: 'u1', email: 'george@example.com', firstName: 'George', lastName: 'Rivera' })
  })

  it('reads the current person from the saved session', async () => {
    const auth = createSupabaseAuth(clientWith({ getSession: () => Promise.resolve({ data: { session: { user } } }) }))
    expect(await auth.getUser()).toEqual({ id: 'u1', email: 'george@example.com' })
    const none = createSupabaseAuth(clientWith({ getSession: () => Promise.resolve({ data: { session: null } }) }))
    expect(await none.getUser()).toBeNull()
  })

  it('reports sign-in and sign-out as they happen, and can stop listening', () => {
    const unsubscribe = vi.fn()
    let callback: (event: string, session: { user: typeof user } | null) => void = () => undefined
    const auth = createSupabaseAuth(
      clientWith({
        onAuthStateChange: (cb: typeof callback) => {
          callback = cb
          return { data: { subscription: { unsubscribe } } }
        },
      }),
    )
    const listener = vi.fn()
    const stop = auth.onChange(listener)
    callback('SIGNED_IN', { user })
    callback('SIGNED_OUT', null)
    expect(listener.mock.calls).toEqual([[{ id: 'u1', email: 'george@example.com' }], [null]])
    stop()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('signs in with email and password, turning failures into friendly AuthErrors', async () => {
    const signInWithPassword = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { code: 'invalid_credentials', name: 'AuthApiError', message: 'raw' } })
    const auth = createSupabaseAuth(clientWith({ signInWithPassword }))
    await expect(auth.signIn('a@b.co', 'pw')).resolves.toBeUndefined()
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.co', password: 'pw' })
    const failure = auth.signIn('a@b.co', 'wrong')
    await expect(failure).rejects.toBeInstanceOf(AuthError)
    await expect(failure).rejects.toThrow(/don't match/)
  })

  it('says whether sign-up needs an email confirmation', async () => {
    const signUp = vi
      .fn()
      .mockResolvedValueOnce({ data: { session: null }, error: null })
      .mockResolvedValueOnce({ data: { session: { user } }, error: null })
    const auth = createSupabaseAuth(clientWith({ signUp }))
    const profile = { firstName: 'George', lastName: 'Rivera' }
    expect(await auth.signUp('a@b.co', 'password1', profile)).toEqual({ needsConfirmation: true })
    expect(await auth.signUp('a@b.co', 'password1', profile)).toEqual({ needsConfirmation: false })
    expect(signUp.mock.calls[0]?.[0]).toMatchObject({
      email: 'a@b.co',
      options: {
        emailRedirectTo: window.location.origin,
        data: { first_name: 'George', last_name: 'Rivera' },
      },
    })
  })

  it('saves a name change without touching the email', async () => {
    const updateUser = vi.fn().mockResolvedValue({ data: { user: { ...user } }, error: null })
    const auth = createSupabaseAuth(
      clientWith({ getSession: () => Promise.resolve({ data: { session: { user } } }), updateUser }),
    )
    const result = await auth.updateAccount({ firstName: 'George', lastName: 'Rivera', email: 'george@example.com' })
    expect(result).toEqual({ emailChangePending: false })
    expect(updateUser).toHaveBeenCalledWith({ data: { first_name: 'George', last_name: 'Rivera' } }, undefined)
  })

  it('asks Supabase to change the email, and reports when it must be confirmed first', async () => {
    const updateUser = vi
      .fn()
      .mockResolvedValueOnce({ data: { user: { ...user, email: 'new@example.com' } }, error: null }) // applied at once
      .mockResolvedValueOnce({ data: { user: { ...user, new_email: 'new@example.com' } }, error: null }) // waiting for the link
    const auth = createSupabaseAuth(
      clientWith({ getSession: () => Promise.resolve({ data: { session: { user } } }), updateUser }),
    )
    const changes = { firstName: 'George', lastName: 'Rivera', email: 'new@example.com' }
    expect(await auth.updateAccount(changes)).toEqual({ emailChangePending: false })
    expect(await auth.updateAccount(changes)).toEqual({ emailChangePending: true })
    expect(updateUser.mock.calls[0]).toEqual([
      { email: 'new@example.com', data: { first_name: 'George', last_name: 'Rivera' } },
      { emailRedirectTo: window.location.origin },
    ])
  })

  it('turns update failures into friendly AuthErrors', async () => {
    const updateUser = vi.fn().mockResolvedValue({ data: { user: null }, error: { code: 'email_exists', name: 'AuthApiError', message: 'raw' } })
    const auth = createSupabaseAuth(
      clientWith({ getSession: () => Promise.resolve({ data: { session: { user } } }), updateUser }),
    )
    const failure = auth.updateAccount({ firstName: 'G', lastName: 'R', email: 'taken@example.com' })
    await expect(failure).rejects.toBeInstanceOf(AuthError)
    await expect(failure).rejects.toThrow(/already exists/)
  })

  it('signs out', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null })
    await createSupabaseAuth(clientWith({ signOut })).signOut()
    expect(signOut).toHaveBeenCalledOnce()
  })
})
