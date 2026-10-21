import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { TextField } from '@/components/ui/TextField'
import { useFormSubmission } from '@/hooks/useFormSubmission'

type Mode = 'signIn' | 'signUp'

const MIN_PASSWORD_LENGTH = 8

function destinationFrom(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    // Only follow paths inside this app
    if (state.from.startsWith('/') && !state.from.startsWith('//')) return state.from
  }
  return '/want-to-go'
}

/** Sign in, or create an account, with email and password. Shown outside the main app frame. */
export function SignInPage() {
  const { state, service } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('signIn')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; password?: string }>({})
  const [notice, setNotice] = useState<string | undefined>()
  const { formRef, saving, submitError, reportInvalid, submit } = useFormSubmission()

  const creating = mode === 'signUp'

  useEffect(() => {
    document.title = `${creating ? 'Create account' : 'Sign in'} · Restaurant Journal`
  }, [creating])

  if (state.status === 'signedIn') return <Navigate to={destinationFrom(location.state)} replace />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found: typeof errors = {}
    if (creating && !firstName.trim()) found.firstName = 'Enter your first name.'
    if (creating && !lastName.trim()) found.lastName = 'Enter your last name.'
    if (!email.includes('@')) found.email = 'Enter your email address.'
    if (!password) found.password = 'Enter your password.'
    else if (creating && password.length < MIN_PASSWORD_LENGTH) {
      found.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    }
    if (found.firstName || found.lastName || found.email || found.password) {
      setErrors(found)
      reportInvalid()
      return
    }
    setErrors({})
    setNotice(undefined)
    void submit(async () => {
      if (creating) {
        const { needsConfirmation } = await service.signUp(email.trim(), password, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
        if (needsConfirmation) {
          setNotice(`We sent a confirmation link to ${email.trim()}. Open it, then come back and sign in.`)
          setMode('signIn')
          setPassword('')
          return 'stay'
        }
      } else {
        await service.signIn(email.trim(), password)
      }
      // On success the auth state changes and this page redirects (see above)
    })
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="font-serif text-xl font-semibold text-ink">Restaurant Journal</p>
      <h1 className="mt-6 text-3xl text-ink">{creating ? 'Create your account' : 'Sign in'}</h1>
      <p className="mt-2 text-base text-ink-muted">
        {creating
          ? 'Your journal is private to you.'
          : 'Welcome back. Your places and entries are waiting.'}
      </p>

      {notice && (
        <div className="mt-6">
          <StatusMessage>{notice}</StatusMessage>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        {creating && (
          <div className="grid grid-cols-2 gap-5">
            <TextField
              label="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              error={errors.firstName}
              autoComplete="given-name"
              maxLength={60}
              required
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              error={errors.lastName}
              autoComplete="family-name"
              maxLength={60}
              required
            />
          </div>
        )}
        <TextField
          type="email"
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <TextField
          type="password"
          label="Password"
          hint={creating ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          autoComplete={creating ? 'new-password' : 'current-password'}
          required
        />
        {submitError && <ErrorMessage message={submitError} />}
        <Button type="submit" loading={saving} fullWidth>
          {creating ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6">
        <Button
          variant="ghost"
          fullWidth
          onClick={() => {
            setMode(creating ? 'signIn' : 'signUp')
            setErrors({})
            setNotice(undefined)
          }}
        >
          {creating ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </Button>
      </div>
    </main>
  )
}
