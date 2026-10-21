import type { ComponentProps } from 'react'
import { cx } from '@/lib/cx'

interface SwitchProps
  extends Omit<ComponentProps<'button'>, 'className' | 'type' | 'role' | 'onClick' | 'onChange' | 'children' | 'aria-checked'> {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** On/off toggle. Space or Enter toggles it, and clicking the label text does too. */
export function Switch({ label, description, checked, onChange, ...button }: SwitchProps) {
  return (
    <label className="flex min-h-touch cursor-pointer items-center justify-between gap-4">
      <span className="flex flex-col">
        <span className="text-base font-medium text-ink">{label}</span>
        {description && <span className="text-sm text-ink-muted">{description}</span>}
      </span>
      <button
        {...button}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="inline-flex h-touch min-w-[3.25rem] shrink-0 items-center justify-center rounded-full"
      >
        {/* The 44px button is the touch target; the track inside is what you see */}
        <span
          aria-hidden="true"
          className={cx(
            'relative block h-7 w-12 rounded-full transition-colors',
            checked ? 'bg-accent' : 'bg-border-strong',
          )}
        >
          <span
            className={cx(
              'absolute left-1 top-1 h-5 w-5 rounded-full bg-surface-raised shadow-card transition-transform',
              checked && 'translate-x-5',
            )}
          />
        </span>
      </button>
    </label>
  )
}
