import type { ReactNode } from 'react'
import { describedBy, useFieldIds } from './useFieldIds'

interface ChoiceGroupProps {
  legend: string
  hint?: string | undefined
  error?: string | undefined
  children: ReactNode
}

/** Fieldset with legend, hint, error and a wrapping row of chips. Internal. */
export function ChoiceGroup({ legend, hint, error, children }: ChoiceGroupProps) {
  const ids = useFieldIds()
  return (
    <fieldset
      className="min-w-0"
      aria-describedby={describedBy(ids, { hint, error })}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-1.5 text-sm font-medium text-ink">{legend}</legend>
      {hint && (
        <p id={ids.hintId} className="mb-2 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      <div className="flex flex-wrap gap-2">{children}</div>
      {error && (
        <p id={ids.errorId} className="mt-1.5 text-sm font-medium text-danger">
          <span className="sr-only">Error:</span> {error}
        </p>
      )}
    </fieldset>
  )
}
