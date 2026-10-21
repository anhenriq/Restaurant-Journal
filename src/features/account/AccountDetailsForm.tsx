import { useState, type FormEvent } from 'react'
import type { AccountChanges, AuthService, AuthUser } from '@/auth/auth'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { TextField } from '@/components/ui/TextField'
import { useFormSubmission } from '@/hooks/useFormSubmission'

interface AccountDetailsFormProps {
  user: AuthUser
  service: AuthService
}

type Errors = Partial<Record<'firstName' | 'lastName' | 'email', string>>

/** "Account details" card (first name, last name, email) and its "Update account info" button. */
export function AccountDetailsForm({ user, service }: AccountDetailsFormProps) {
  const [firstName, setFirstName] = useState(user.firstName ?? '')
  const [lastName, setLastName] = useState(user.lastName ?? '')
  const [email, setEmail] = useState(user.email)
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState<string | undefined>()
  const { formRef, saving, submitError, reportInvalid, submit } = useFormSubmission()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(undefined)
    const changes: AccountChanges = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() }
    const found: Errors = {}
    if (!changes.firstName) found.firstName = 'Enter your first name.'
    if (!changes.lastName) found.lastName = 'Enter your last name.'
    if (!changes.email.includes('@')) found.email = 'Enter your email address.'
    if (found.firstName || found.lastName || found.email) {
      setErrors(found)
      reportInvalid()
      return
    }
    setErrors({})
    if (
      changes.firstName === (user.firstName ?? '') &&
      changes.lastName === (user.lastName ?? '') &&
      changes.email === user.email
    ) {
      setNotice('There are no changes to save.')
      return
    }
    void submit(async () => {
      const { emailChangePending } = await service.updateAccount(changes)
      setNotice(
        emailChangePending
          ? `We sent a confirmation link to ${changes.email}. Your email changes once you open it.`
          : 'Your account info is updated.',
      )
      return 'stay'
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <section
        aria-labelledby="account-details-heading"
        className="rounded-lg border border-border bg-surface-raised p-5 shadow-card"
      >
        <h2 id="account-details-heading" className="text-xl text-ink">
          Account details
        </h2>
        <div className="mt-1 flex flex-col gap-5">
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
          <TextField
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
        </div>
      </section>

      {notice && <StatusMessage>{notice}</StatusMessage>}
      {submitError && <ErrorMessage message={submitError} />}
      <Button type="submit" loading={saving} fullWidth>
        Update account info
      </Button>
    </form>
  )
}
