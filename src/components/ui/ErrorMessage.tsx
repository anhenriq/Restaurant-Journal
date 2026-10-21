import { Button } from './Button'

interface ErrorMessageProps {
  message: string
  /** When given, shows a "Try again" button. */
  onRetry?: () => void
}

/** Inline error block for failed loads or saves. Announced to screen readers when it appears. */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded border border-danger bg-danger-soft p-4 text-ink">
      <p className="font-medium text-danger">Something went wrong</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <div className="mt-3">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
