import type { ComponentProps } from 'react'
import { useId } from 'react'
import { controlClasses } from './fieldStyles'
import { Icon } from './Icon'

interface SearchFieldProps
  extends Omit<ComponentProps<'input'>, 'className' | 'type' | 'value' | 'onChange' | 'id'> {
  /** Accessible name. Visually hidden; the placeholder and icon carry the meaning for sighted users. */
  label: string
  value: string
  onChange: (value: string) => void
}

export function SearchField({ label, value, onChange, ...input }: SearchFieldProps) {
  const id = useId()
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon
        name="search"
        size={20}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
      />
      <input
        {...input}
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClasses(false)} pl-10`}
      />
    </div>
  )
}
