import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LinkButton } from '@/components/ui/LinkButton'
import { Switch } from '@/components/ui/Switch'
import { TextArea } from '@/components/ui/TextArea'
import { TextField } from '@/components/ui/TextField'
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { todayISODate } from '@/lib/format'
import type { VisitInput } from '@/types'
import {
  toVisitFormValues,
  toVisitInput,
  validateVisit,
  type VisitFormErrors,
  type VisitFormValues,
} from './visitFormValues'

interface VisitFormProps {
  /** Pre-fills the form when editing an entry. */
  initialValues?: VisitInput
  submitLabel: string
  cancelTo: string
  /** Called with validated, trimmed input. If it rejects, the error message is shown on the form. */
  onSubmit: (input: VisitInput) => Promise<void>
}

/** Write or edit a journal entry for one visit. */
export function VisitForm({ initialValues, submitLabel, cancelTo, onSubmit }: VisitFormProps) {
  const [values, setValues] = useState<VisitFormValues>(() => toVisitFormValues(initialValues))
  const [errors, setErrors] = useState<VisitFormErrors>({})
  const { formRef, saving, submitError, reportInvalid, submit } = useFormSubmission()

  function update<K extends keyof VisitFormValues>(field: K, value: VisitFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    if (field === 'visitDate') setErrors({})
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validateVisit(values)
    if (found.visitDate) {
      setErrors(found)
      reportInvalid()
      return
    }
    void submit(() => onSubmit(toVisitInput(values, initialValues?.photos)))
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <TextField
        type="date"
        label="Date of visit"
        value={values.visitDate}
        onChange={(event) => update('visitDate', event.target.value)}
        max={todayISODate()}
        error={errors.visitDate}
        required
      />
      <TextField
        label="Who did you go with?"
        optional
        hint="Names, or “Solo”."
        value={values.wentWith}
        onChange={(event) => update('wentWith', event.target.value)}
        maxLength={100}
        autoComplete="off"
      />
      <TextArea
        label="What did you order?"
        optional
        value={values.whatIOrdered}
        onChange={(event) => update('whatIOrdered', event.target.value)}
        rows={2}
        maxLength={300}
      />
      <TextArea
        journal
        label="Your journal entry"
        optional
        hint="Write it the way you'd tell a friend. A blank line starts a new paragraph."
        value={values.journalEntry}
        onChange={(event) => update('journalEntry', event.target.value)}
        rows={9}
        maxLength={5000}
      />
      <Switch
        label="Would you go back?"
        description="Helps future you decide whether to return."
        checked={values.wouldGoBack}
        onChange={(wouldGoBack) => update('wouldGoBack', wouldGoBack)}
      />

      {submitError && <ErrorMessage message={submitError} />}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
        <LinkButton to={cancelTo} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  )
}
