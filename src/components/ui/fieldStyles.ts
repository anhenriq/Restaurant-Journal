import { cx } from '@/lib/cx'

/** Shared look for text inputs, textareas and selects. */
export function controlClasses(invalid: boolean): string {
  return cx(
    'min-h-touch w-full rounded border bg-surface-raised px-3 text-base text-ink placeholder:text-ink-muted',
    invalid ? 'border-danger border-2' : 'border-border-strong',
  )
}
