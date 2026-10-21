import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from './Icon'

interface PageHeaderProps {
  /** The page's single <h1>. */
  title: string
  subtitle?: string
  /** A link back to the parent screen, shown above the title. */
  backTo?: { to: string; label: string }
  /** Buttons for this page (Edit, Delete…), aligned to the right when there is room. */
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {backTo && (
        <Link
          to={backTo.to}
          className="-ml-2 mb-1 inline-flex min-h-touch items-center gap-1 rounded px-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <Icon name="chevron-left" size={18} />
          {backTo.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="break-words text-3xl text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-base text-ink-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
