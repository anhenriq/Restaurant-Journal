import { NotFoundError } from '@/data/repository'
import { EmptyState } from './EmptyState'
import { ErrorMessage } from './ErrorMessage'
import { LinkButton } from './LinkButton'

interface LoadErrorProps {
  error: Error
  /** What to say, and where to go, when the thing being loaded doesn't exist. */
  notFound: { title: string; description: string; backTo: string; backLabel: string }
  onRetry: () => void
}

/** Shows a "not found" message for missing records, or a retryable error for anything else. */
export function LoadError({ error, notFound, onRetry }: LoadErrorProps) {
  if (error instanceof NotFoundError) {
    return (
      <EmptyState
        title={notFound.title}
        description={notFound.description}
        action={<LinkButton to={notFound.backTo}>{notFound.backLabel}</LinkButton>}
      />
    )
  }
  return <ErrorMessage message={error.message} onRetry={onRetry} />
}
