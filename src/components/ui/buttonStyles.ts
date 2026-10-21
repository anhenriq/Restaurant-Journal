import { cx } from '@/lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-ink-on-accent hover:bg-accent-hover',
  secondary: 'border border-border-strong bg-surface-raised text-ink hover:bg-surface-sunken',
  danger: 'bg-danger text-ink-on-accent hover:bg-danger-hover',
  ghost: 'text-accent-hover hover:bg-accent-soft',
}

/** Shared look for <Button> and <LinkButton>. Always at least 44px tall. */
export function buttonClasses(variant: ButtonVariant, fullWidth = false): string {
  return cx(
    'inline-flex min-h-touch items-center justify-center gap-2 rounded px-5 text-base font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    fullWidth && 'w-full',
  )
}
