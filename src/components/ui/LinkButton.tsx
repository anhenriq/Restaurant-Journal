import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import { buttonClasses, type ButtonVariant } from './buttonStyles'

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

/** A link (navigates) that looks like a Button. Use <Button> for actions, this for destinations. */
export function LinkButton({ variant = 'primary', fullWidth, ...rest }: LinkButtonProps) {
  return <Link {...rest} className={buttonClasses(variant, fullWidth)} />
}
