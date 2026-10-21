import type { ComponentProps } from 'react'
import { Field } from './Field'
import { controlClasses } from './fieldStyles'
import { Icon } from './Icon'
import { describedBy, useFieldIds } from './useFieldIds'

interface SelectProps extends Omit<ComponentProps<'select'>, 'className'> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

/** Native <select> (best keyboard and mobile behavior) with the app's styling. Pass <option>s as children. */
export function Select({ id: idProp, label, hint, error, optional, children, ...select }: SelectProps) {
  const ids = useFieldIds(idProp)
  return (
    <Field ids={ids} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        <select
          {...select}
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { hint, error })}
          className={`${controlClasses(Boolean(error))} appearance-none pr-10`}
        >
          {children}
        </select>
        <Icon
          name="chevron-down"
          size={20}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </Field>
  )
}
