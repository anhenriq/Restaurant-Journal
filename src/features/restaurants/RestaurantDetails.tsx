import { Chip } from '@/components/ui/Chip'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { VIBE_TAG_LABELS, type Restaurant } from '@/types'

interface RestaurantDetailsProps {
  restaurant: Restaurant
}

/** The facts about a saved place: price, who recommended it, why it was saved, and its vibe. */
export function RestaurantDetails({ restaurant }: RestaurantDetailsProps) {
  const { priceLevel, recommendedBy, whySaved, vibeTags } = restaurant

  return (
    <section
      aria-label="About this place"
      className="rounded-lg border border-border bg-surface-raised p-5 shadow-card"
    >
      <dl className="flex flex-col gap-4">
        <div>
          <dt className="text-sm text-ink-muted">Price</dt>
          <dd className="text-lg">
            <PriceDisplay level={priceLevel} />
          </dd>
        </div>
        {recommendedBy && (
          <div>
            <dt className="text-sm text-ink-muted">Recommended by</dt>
            <dd className="text-base">{recommendedBy}</dd>
          </div>
        )}
        {whySaved && (
          <div>
            <dt className="text-sm text-ink-muted">Why you saved it</dt>
            <dd className="mt-0.5 max-w-prose font-serif text-lg">{whySaved}</dd>
          </div>
        )}
        {vibeTags.length > 0 && (
          <div>
            <dt className="text-sm text-ink-muted">Vibe</dt>
            <dd className="mt-1">
              <ul className="flex flex-wrap gap-1.5">
                {vibeTags.map((tag) => (
                  <li key={tag}>
                    <Chip>{VIBE_TAG_LABELS[tag]}</Chip>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
