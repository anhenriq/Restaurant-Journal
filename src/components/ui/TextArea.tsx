import type { ComponentProps } from 'react'
import { cx } from '@/lib/cx'
import { Field } from './Field'
import { controlClasses } from './fieldStyles'
import { describedBy, useFieldIds } from './useFieldIds'

interface TextAreaProps extends Omit<ComponentProps<'textarea'>, 'className'> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  /** Uses the journal's reading typeface, for free-form writing. */
  journal?: boolean
}

export function TextArea({
  id: idProp,
  label,
  hint,
  error,
  optional,
  journal = false,
  rows = 4,
  ...textarea
}: TextAreaProps) {
  const ids = useFieldIds(idProp)
  return (
    <Field ids={ids} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        {...textarea}
        id={ids.id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        className={cx(
          controlClasses(Boolean(error)),
          'py-2',
          journal && 'font-serif text-journal',
        )}
      />
    </Field>
  )
}
