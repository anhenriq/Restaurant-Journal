import type { ComponentProps } from 'react'
import { buttonClasses, type ButtonVariant } from './buttonStyles'
import { SpinnerIcon } from './Spinner'

interface ButtonProps extends Omit<ComponentProps<'button'>, 'className'> {
  variant?: ButtonVariant
  fullWidth?: boolean
  /** Shows a spinner and blocks clicks while an action is in progress. */
  loading?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth,
  loading = false,
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, fullWidth)}
    >
      {loading && <SpinnerIcon />}
      {children}
    </button>
  )
}
