import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'

interface ChoiceChipProps {
  type: 'checkbox' | 'radio'
  /** Radio buttons sharing a name form one group. */
  name?: string
  label: ReactNode
  checked: boolean
  onChange: () => void
}

/** A pill-shaped checkbox or radio button. Internal building block for ChipToggleGroup and PriceLevelPicker. */
export function ChoiceChip({ type, name, label, checked, onChange }: ChoiceChipProps) {
  return (
    <label className="relative cursor-pointer">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cx(
          'focus-target inline-flex min-h-touch items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors',
          checked
            ? 'border-accent bg-accent text-ink-on-accent hover:bg-accent-hover'
            : 'border-border-strong bg-surface-raised text-ink hover:bg-surface-sunken',
        )}
      >
        {checked && <Icon name="check" size={16} />}
        {label}
      </span>
    </label>
  )
}
