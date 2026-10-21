import type { ReactNode } from 'react'

interface StatusMessageProps {
  children: ReactNode
}

/** Brief confirmation ("Saved La Ramada Verde"). Announced politely to screen readers. */
export function StatusMessage({ children }: StatusMessageProps) {
  return (
    <output className="mb-4 block rounded border border-olive bg-olive-soft px-4 py-3 text-base font-medium text-olive">
      {children}
    </output>
  )
}
