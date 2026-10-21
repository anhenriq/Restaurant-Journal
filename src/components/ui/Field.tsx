import type { ReactNode } from 'react'
import type { FieldIds } from './useFieldIds'

interface FieldProps {
  ids: FieldIds
  label: string
  hint?: string | undefined
  error?: string | undefined
  /** Appends "(optional)" to the label. Required fields use the native `required` attribute. */
  optional?: boolean | undefined
  children: ReactNode
}

/** Label + hint + control + error text. Shared by TextField, TextArea and Select. */
export function Field({ ids, label, hint, error, optional, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={ids.id} className="text-sm font-medium text-ink">
        {label}
        {optional && (
          <>
            {' '}
            <span className="font-normal text-ink-muted">(optional)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={ids.hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={ids.errorId} className="text-sm font-medium text-danger">
          <span className="sr-only">Error:</span> {error}
        </p>
      )}
    </div>
  )
}
