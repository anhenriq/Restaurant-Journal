import type { ComponentProps } from 'react'
import { Field } from './Field'
import { controlClasses } from './fieldStyles'
import { describedBy, useFieldIds } from './useFieldIds'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'className'> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

export function TextField({ id: idProp, label, hint, error, optional, ...input }: TextFieldProps) {
  const ids = useFieldIds(idProp)
  return (
    <Field ids={ids} label={label} hint={hint} error={error} optional={optional}>
      <input
        type="text"
        {...input}
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        className={controlClasses(Boolean(error))}
      />
    </Field>
  )
}
