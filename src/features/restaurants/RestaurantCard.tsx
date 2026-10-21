import { Link } from 'react-router'
import { CARD_LINK_CLASS, CardItem } from '@/components/ui/CardItem'
import { Chip } from '@/components/ui/Chip'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { VIBE_TAG_LABELS, type Restaurant } from '@/types'

interface RestaurantCardProps {
  restaurant: Restaurant
}

/** One saved place in a list. The whole card is clickable through the name link. */
export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { id, name, neighborhood, cuisine, recommendedBy, whySaved, vibeTags, priceLevel, status } = restaurant
  const where = [neighborhood, cuisine].filter(Boolean).join(' · ')

  return (
    <CardItem>
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 break-words text-xl text-ink">
          <Link to={`/places/${id}`} className={CARD_LINK_CLASS}>
            {name}
          </Link>
        </h2>
        <PriceDisplay level={priceLevel} />
      </div>
      {where && <p className="mt-0.5 text-sm text-ink-muted">{where}</p>}
      {whySaved && <p className="mt-2 line-clamp-2 text-base text-ink">{whySaved}</p>}
      {recommendedBy && <p className="mt-2 text-sm text-ink-muted">Recommended by {recommendedBy}</p>}
      {(vibeTags.length > 0 || status === 'visited') && (
        <ul aria-label="Tags" className="mt-3 flex flex-wrap gap-1.5">
          {status === 'visited' && (
            <li>
              <Chip tone="olive">Visited</Chip>
            </li>
          )}
          {vibeTags.map((tag) => (
            <li key={tag}>
              <Chip>{VIBE_TAG_LABELS[tag]}</Chip>
            </li>
          ))}
        </ul>
      )}
    </CardItem>
  )
}
