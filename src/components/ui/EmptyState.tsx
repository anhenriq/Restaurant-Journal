import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface EmptyStateProps {
  icon?: IconName
  title: string
  description: string
  /** Usually a LinkButton or Button that fixes the emptiness ("Add a place"). */
  action?: ReactNode
}

/** Friendly message for a list with nothing in it (or nothing matching the filters). */
export function EmptyState({ icon = 'plate', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border-strong bg-surface-raised px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="mt-4 text-xl text-ink">{title}</h2>
      <p className="mt-2 max-w-prose text-base text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
