import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { ChipToggleGroup } from '@/components/ui/ChipToggleGroup'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LinkButton } from '@/components/ui/LinkButton'
import { PriceLevelPicker } from '@/components/ui/PriceLevelPicker'
import { TextArea } from '@/components/ui/TextArea'
import { TextField } from '@/components/ui/TextField'
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { VIBE_TAGS, VIBE_TAG_LABELS, type PriceLevel, type RestaurantInput } from '@/types'
import {
  toFormValues,
  toRestaurantInput,
  validateRestaurant,
  type RestaurantFormErrors,
  type RestaurantFormValues,
} from './formValues'

const VIBE_OPTIONS = VIBE_TAGS.map((value) => ({ value, label: VIBE_TAG_LABELS[value] }))

interface RestaurantFormProps {
  /** Pre-fills the form when editing. */
  initialValues?: RestaurantInput
  submitLabel: string
  /** Where "Cancel" goes. */
  cancelTo: string
  /** Called with validated, trimmed input. If it rejects, the error message is shown on the form. */
  onSubmit: (input: RestaurantInput) => Promise<void>
}

/** Add / edit form for a saved place. */
export function RestaurantForm({ initialValues, submitLabel, cancelTo, onSubmit }: RestaurantFormProps) {
  const [values, setValues] = useState<RestaurantFormValues>(() => toFormValues(initialValues))
  const [errors, setErrors] = useState<RestaurantFormErrors>({})
  const { formRef, saving, submitError, reportInvalid, submit } = useFormSubmission()

  function update<K extends keyof RestaurantFormValues>(field: K, value: RestaurantFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    if (field === 'name' || field === 'neighborhood') {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validateRestaurant(values)
    if (found.name || found.neighborhood) {
      setErrors(found)
      reportInvalid()
      return
    }
    void submit(() => onSubmit(toRestaurantInput(values)))
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <p className="text-sm text-ink-muted">Only the name and neighborhood are required.</p>

      <TextField
        label="Restaurant name"
        value={values.name}
        onChange={(event) => update('name', event.target.value)}
        error={errors.name}
        required
        maxLength={100}
        autoComplete="off"
      />
      <TextField
        label="Neighborhood or city"
        value={values.neighborhood}
        onChange={(event) => update('neighborhood', event.target.value)}
        error={errors.neighborhood}
        required
        maxLength={60}
        autoComplete="off"
      />
      <TextField
        label="Cuisine"
        optional
        hint="For example Mexican, Italian, or Taiwanese."
        value={values.cuisine}
        onChange={(event) => update('cuisine', event.target.value)}
        maxLength={40}
        autoComplete="off"
      />
      <TextField
        label="Recommended by"
        optional
        hint="A friend, a coworker, a favorite blog…"
        value={values.recommendedBy}
        onChange={(event) => update('recommendedBy', event.target.value)}
        maxLength={60}
        autoComplete="off"
      />
      <TextArea
        label="Why do you want to go?"
        optional
        hint="A line or two, so future you remembers."
        value={values.whySaved}
        onChange={(event) => update('whySaved', event.target.value)}
        rows={3}
        maxLength={300}
      />
      <ChipToggleGroup
        legend="Vibe"
        hint="Pick any that fit."
        options={VIBE_OPTIONS}
        selected={values.vibeTags}
        onChange={(vibeTags) => update('vibeTags', vibeTags)}
      />
      <PriceLevelPicker
        legend="Price level"
        value={values.priceLevel}
        onChange={(level: PriceLevel | undefined) => {
          if (level !== undefined) update('priceLevel', level)
        }}
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
