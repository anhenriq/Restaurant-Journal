import { Link } from 'react-router'
import { Chip } from '@/components/ui/Chip'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { formatVisitDate, splitParagraphs } from '@/lib/format'
import type { VisitWithRestaurant } from '@/types'

interface JournalEntryViewProps {
  visit: VisitWithRestaurant
}

/**
 * The reading view of one visit: the details at a glance, then the writing itself set in the
 * journal typeface with a comfortable line length, since this is the page George comes back to reread.
 */
export function JournalEntryView({ visit }: JournalEntryViewProps) {
  const { restaurant, wentWith, whatIOrdered, journalEntry, photos, wouldGoBack } = visit
  const paragraphs = splitParagraphs(journalEntry)
  const facts: Array<{ label: string; value: string }> = [
    ...(wentWith ? [{ label: 'Went with', value: wentWith }] : []),
    ...(whatIOrdered ? [{ label: 'Ordered', value: whatIOrdered }] : []),
  ]

  return (
    <article aria-label={`Journal entry for ${restaurant.name}, ${formatVisitDate(visit.visitDate)}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Chip tone={wouldGoBack ? 'olive' : 'neutral'}>
          {wouldGoBack ? 'Would go back' : 'Would not go back'}
        </Chip>
        <PriceDisplay level={restaurant.priceLevel} />
        <Link
          to={`/places/${restaurant.id}`}
          className="inline-flex min-h-touch items-center rounded text-sm font-medium text-accent-hover underline underline-offset-2"
        >
          About {restaurant.name}
        </Link>
      </div>

      {facts.length > 0 && (
        <dl className="mt-4 flex max-w-prose flex-col gap-3 rounded border border-border bg-surface-raised p-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-ink-muted">{fact.label}</dt>
              <dd className="text-base">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <section aria-label="Your writing" className="mt-8 max-w-prose">
        {paragraphs.length > 0 ? (
          <div className="flex flex-col gap-5">
            {paragraphs.map((paragraph, index) => (
              // Paragraphs have no identity beyond their position in the text
              <p key={index} className="whitespace-pre-line font-serif text-journal text-ink">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-base text-ink-muted">
            You didn't write anything for this visit. Choose Edit to add your thoughts.
          </p>
        )}
      </section>

      {photos.length > 0 && (
        <ul aria-label="Photos" className="mt-8 grid grid-cols-2 gap-3">
          {photos.map((url) => (
            <li key={url}>
              <img
                src={url}
                alt={`From your visit to ${restaurant.name}`}
                loading="lazy"
                className="aspect-square w-full rounded object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
