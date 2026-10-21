import { useEffect, useRef, useState } from 'react'

/**
 * Shared behavior for forms that save something: a saving flag (blocks double submits),
 * a save-error message, and moving focus to the first invalid field after a failed validation.
 * Attach `formRef` to the <form>, and mark invalid fields with aria-invalid="true".
 */
export function useFormSubmission() {
  const formRef = useRef<HTMLFormElement>(null)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const [invalidAttempts, setInvalidAttempts] = useState(0)

  useEffect(() => {
    if (invalidAttempts > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [invalidAttempts])

  /** Call when validation fails, after the errors have been put into state. */
  function reportInvalid() {
    setInvalidAttempts((n) => n + 1)
  }

  /**
   * Runs the save. On failure the message is shown and the form becomes usable again.
   * On success the form stays busy (the page is expected to navigate away) unless `save`
   * returns 'stay', which makes the form usable again.
   */
  async function submit(save: () => Promise<void | 'stay'>) {
    if (saving) return
    setSaving(true)
    setSubmitError(undefined)
    try {
      if ((await save()) === 'stay') setSaving(false)
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Something went wrong while saving.')
      setSaving(false)
    }
  }

  return { formRef, saving, submitError, reportInvalid, submit }
}
