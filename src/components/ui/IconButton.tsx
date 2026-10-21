import type { ComponentProps } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from './Icon'

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'className' | 'children' | 'aria-label'> {
  icon: IconName
  /** Required: icon-only buttons need an accessible name. Also shown as a tooltip. */
  label: string
  tone?: 'default' | 'danger'
}

export function IconButton({ icon, label, tone = 'default', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-touch w-touch items-center justify-center rounded transition-colors',
        tone === 'danger'
          ? 'text-danger hover:bg-danger-soft'
          : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
      )}
    >
      <Icon name={icon} />
    </button>
  )
}
