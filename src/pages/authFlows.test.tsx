import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthError } from '@/auth/auth'
import { createFakeAuth } from '@/test/fakeAuth'
import { renderApp } from '@/test/renderApp'

const GEORGE = { id: 'u1', email: 'george@example.com' }

describe('signed out', () => {
  it('sends you to the sign-in page, then back to where you were headed', async () => {
    const auth = createFakeAuth()
    const { user, router } = renderApp('/journal', undefined, { auth, hasAccounts: true })

    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/sign-in')
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'george@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Journal' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/journal')
  })

  it('explains a wrong password and keeps you on the page', async () => {
    const { user } = renderApp('/want-to-go', undefined, { auth: createFakeAuth(), hasAccounts: true })
    await user.type(await screen.findByLabelText('Email'), 'george@example.com')
    await user.type(screen.getByLabelText('Password'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("That email and password don't match")
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  it('asks for the missing fields and focuses the first', async () => {
    const { user } = renderApp('/want-to-go', undefined, { auth: createFakeAuth(), hasAccounts: true })
    await user.click(await screen.findByRole('button', { name: 'Sign in' }))
    const email = screen.getByLabelText('Email')
    expect(email).toBeInvalid()
    expect(email).toHaveFocus()
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Error: Enter your password.')
  })

  it('creates an account and signs in when no email confirmation is needed', async () => {
    const auth = createFakeAuth()
    const { user } = renderApp('/want-to-go', undefined, { auth, hasAccounts: true })
    await user.click(await screen.findByRole('button', { name: 'New here? Create an account' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('First name'), '  George ')
    await user.type(screen.getByLabelText('Last name'), 'Rivera')
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(/Use at least 8 characters/)

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'long-enough-password')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Want to Go' })).toBeInTheDocument()
    expect(auth.profiles.get('new@example.com')).toEqual({ firstName: 'George', lastName: 'Rivera' })
  })

  it('asks for a first and last name when creating an account, but not when signing in', async () => {
    const { user } = renderApp('/want-to-go', undefined, { auth: createFakeAuth(), hasAccounts: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New here? Create an account' }))
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'long-enough-password')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const first = screen.getByLabelText('First name')
    expect(first).toBeInvalid()
    expect(first).toHaveFocus()
    expect(first).toHaveAccessibleDescription('Error: Enter your first name.')
    expect(screen.getByLabelText('Last name')).toHaveAccessibleDescription('Error: Enter your last name.')
    expect(screen.getByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument()
  })

  it('tells you to confirm your email when the project requires it, and lets you sign in afterward', async () => {
    const auth = createFakeAuth()
    auth.requireConfirmation = true
    const { user } = renderApp('/want-to-go', undefined, { auth, hasAccounts: true })
    await user.click(await screen.findByRole('button', { name: 'New here? Create an account' }))
    await user.type(screen.getByLabelText('First name'), 'George')
    await user.type(screen.getByLabelText('Last name'), 'Rivera')
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'long-enough-password')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('status')).toHaveTextContent('We sent a confirmation link to new@example.com')
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
    // The form is usable again, so they can sign in once they've confirmed
    await user.type(screen.getByLabelText('Password'), 'long-enough-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Want to Go' })).toBeInTheDocument()
  })

  it('ignores a redirect target outside the app', async () => {
    const { router } = renderApp('/sign-in', undefined, { auth: createFakeAuth(GEORGE), hasAccounts: true })
    await waitFor(() => expect(router.state.location.pathname).toBe('/want-to-go'))
  })
})

describe('signed in', () => {
  const NAMED = { ...GEORGE, firstName: 'Maya', lastName: 'Lopez' }

  it('welcomes the person by name, shows their details, and offers Add a place and Sign out', async () => {
    renderApp('/account', undefined, { auth: createFakeAuth(NAMED), hasAccounts: true })
    expect(await screen.findByRole('heading', { level: 2, name: 'Welcome back, Maya' })).toBeInTheDocument()
    expect(screen.getByText('Your places and entries are saved to your account and are private to you.')).toBeInTheDocument()
    const main = screen.getByRole('main')
    expect(within(main).getByRole('link', { name: 'Add a place' })).toHaveAttribute('href', '/places/new')
    expect(within(main).getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Account details' })).toBeInTheDocument()
    expect(screen.getByLabelText('First name')).toHaveValue('Maya')
    expect(screen.getByLabelText('Last name')).toHaveValue('Lopez')
    expect(screen.getByLabelText('Email')).toHaveValue('george@example.com')
  })

  it('still welcomes someone whose account has no name yet', async () => {
    renderApp('/account', undefined, { auth: createFakeAuth(GEORGE), hasAccounts: true })
    expect(await screen.findByRole('heading', { level: 2, name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByLabelText('First name')).toHaveValue('')
  })

  it('updates the name and shows the new name in the welcome', async () => {
    const auth = createFakeAuth(NAMED)
    const { user } = renderApp('/account', undefined, { auth, hasAccounts: true })
    const first = await screen.findByLabelText('First name')
    await user.clear(first)
    await user.type(first, '  Aly ')
    await user.click(screen.getByRole('button', { name: 'Update account info' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Your account info is updated.')
    expect(auth.updates).toEqual([{ firstName: 'Aly', lastName: 'Lopez', email: 'george@example.com' }])
    expect(await screen.findByRole('heading', { level: 2, name: 'Welcome back, Aly' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update account info' })).toBeEnabled()
  })

  it('says a changed email must be confirmed when the project requires it', async () => {
    const auth = createFakeAuth(NAMED)
    auth.emailChangeNeedsConfirmation = true
    const { user } = renderApp('/account', undefined, { auth, hasAccounts: true })
    const email = await screen.findByLabelText('Email')
    await user.clear(email)
    await user.type(email, 'new@example.com')
    await user.click(screen.getByRole('button', { name: 'Update account info' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'We sent a confirmation link to new@example.com. Your email changes once you open it.',
    )
  })

  it('asks for the missing details and does not save', async () => {
    const auth = createFakeAuth(NAMED)
    const { user } = renderApp('/account', undefined, { auth, hasAccounts: true })
    const last = await screen.findByLabelText('Last name')
    await user.clear(last)
    await user.clear(screen.getByLabelText('Email'))
    await user.click(screen.getByRole('button', { name: 'Update account info' }))

    expect(last).toBeInvalid()
    expect(last).toHaveFocus()
    expect(last).toHaveAccessibleDescription('Error: Enter your last name.')
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Error: Enter your email address.')
    expect(auth.updates).toEqual([])
  })

  it('says so when there is nothing to save', async () => {
    const auth = createFakeAuth(NAMED)
    const { user } = renderApp('/account', undefined, { auth, hasAccounts: true })
    await user.click(await screen.findByRole('button', { name: 'Update account info' }))
    expect(await screen.findByRole('status')).toHaveTextContent('There are no changes to save.')
    expect(auth.updates).toEqual([])
  })

  it('shows a friendly message when saving fails', async () => {
    const auth = createFakeAuth(NAMED)
    auth.updateAccount = () => Promise.reject(new AuthError('An account with that email already exists. Try signing in instead.'))
    const { user } = renderApp('/account', undefined, { auth, hasAccounts: true })
    const email = await screen.findByLabelText('Email')
    await user.clear(email)
    await user.type(email, 'taken@example.com')
    await user.click(screen.getByRole('button', { name: 'Update account info' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('already exists')
    expect(email).toHaveValue('taken@example.com')
  })

  it('signs out and returns to the sign-in page', async () => {
    const auth = createFakeAuth(GEORGE)
    const { user, router } = renderApp('/account', undefined, { auth, hasAccounts: true })

    const main = await screen.findByRole('main')
    await user.click(await within(main).findByRole('button', { name: 'Sign out' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/sign-in')
  })

  it('sends someone who is already signed in away from the sign-in page', async () => {
    const { router } = renderApp('/sign-in', undefined, { auth: createFakeAuth(GEORGE), hasAccounts: true })
    await waitFor(() => expect(router.state.location.pathname).toBe('/want-to-go'))
  })
})

describe('browser-storage mode (no account)', () => {
  it('goes straight to the app and explains where data is saved', async () => {
    renderApp('/account')
    expect(await screen.findByText('Saved in this browser only')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
  })
})
