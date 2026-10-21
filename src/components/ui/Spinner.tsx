/** Decorative spinning ring. Use inside something that already announces its state (e.g. a busy Button). */
export function SpinnerIcon() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}

interface SpinnerProps {
  /** Announced to screen readers. */
  label?: string
}

/** Loading indicator for a region of the page. */
export function Spinner({ label = 'Loading' }: SpinnerProps) {
  return (
    <output className="inline-flex items-center gap-2 text-ink-muted">
      <SpinnerIcon />
      <span className="text-sm">{label}…</span>
    </output>
  )
}
