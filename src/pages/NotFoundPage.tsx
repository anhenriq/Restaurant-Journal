import { LinkButton } from '@/components/ui/LinkButton'
import { PageHeader } from '@/components/ui/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <p className="mb-6 max-w-prose text-base text-ink-muted">
        That page doesn't exist. Use the menu, or head back to your list.
      </p>
      <LinkButton to="/want-to-go">Go to Want to Go</LinkButton>
    </>
  )
}
