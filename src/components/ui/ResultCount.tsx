interface ResultCountProps {
  /** Shown (and announced) only while a search or filter is narrowing the list. */
  message: string | undefined
}

/** Polite live region that tells screen reader users how many results the current filters give. */
export function ResultCount({ message }: ResultCountProps) {
  return (
    <div aria-live="polite" aria-atomic="true" className="mb-3 min-h-0 text-sm text-ink-muted">
      {message && <p>{message}</p>}
    </div>
  )
}
