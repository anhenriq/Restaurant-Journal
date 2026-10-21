import { useState } from 'react'
import { useAuth } from '@/auth/authContext'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LinkButton } from '@/components/ui/LinkButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { AccountDetailsForm } from '@/features/account/AccountDetailsForm'

export function AccountPage() {
  const { state, service, hasAccounts } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleSignOut() {
    setSigningOut(true)
    setError(undefined)
    try {
      await service.signOut()
      // The auth state change sends you to the sign-in page
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't sign you out. Please try again.")
      setSigningOut(false)
    }
  }

  if (!hasAccounts || state.status !== 'signedIn') {
    return (
      <>
        <PageHeader title="Account" />
        <section
          aria-label="Where your journal is saved"
          className="max-w-prose rounded-lg border border-border bg-surface-raised p-5 shadow-card"
        >
          <p className="text-lg text-ink">Saved in this browser only</p>
          <p className="mt-2 text-base text-ink-muted">
            This copy of the app isn't connected to an online account, so your journal stays on this
            device. Connect it to Supabase (see the README) to sign in and keep your journal across devices.
          </p>
        </section>
      </>
    )
  }

  const { user } = state
  return (
    <>
      <PageHeader title="Account" />
      <div className="flex max-w-prose flex-col gap-6">
        <section
          aria-labelledby="welcome-heading"
          className="rounded-lg border border-border bg-surface-raised p-5 shadow-card"
        >
          <h2 id="welcome-heading" className="text-xl text-ink">
            {user.firstName ? `Welcome back, ${user.firstName}` : 'Welcome back'}
          </h2>
          <p className="mt-1 text-base text-ink-muted">
            Your places and entries are saved to your account and are private to you.
          </p>
          {error && (
            <div className="mt-4">
              <ErrorMessage message={error} />
            </div>
          )}
          <div className="mt-1 flex gap-3 pt-4">
            <LinkButton to="/places/new">Add a place</LinkButton>
            <Button variant="secondary" onClick={handleSignOut} loading={signingOut}>
              Sign out
            </Button>
          </div>
        </section>

        {/* Keyed by user so the fields reset if someone else signs in */}
        <AccountDetailsForm key={user.id} user={user} service={service} />
      </div>
    </>
  )
}
