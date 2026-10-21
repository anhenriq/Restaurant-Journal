import { Link } from 'react-router'
import { CARD_LINK_CLASS, CardItem } from '@/components/ui/CardItem'
import { Chip } from '@/components/ui/Chip'
import { formatVisitDate } from '@/lib/format'
import type { Visit, VisitWithRestaurant } from '@/types'

interface VisitCardProps {
  visit: Visit | VisitWithRestaurant
  /** Heading level for the card title, so lists nest correctly under the page's headings. */
  headingLevel?: 'h2' | 'h3'
}

function hasRestaurant(visit: Visit | VisitWithRestaurant): visit is VisitWithRestaurant {
  return 'restaurant' in visit
}

/** One journal entry in a list. When the visit carries its restaurant, the place name leads. */
export function VisitCard({ visit, headingLevel: Heading = 'h2' }: VisitCardProps) {
  const date = formatVisitDate(visit.visitDate)
  const snippet = visit.journalEntry.replace(/\s+/g, ' ').trim()
  const title = hasRestaurant(visit) ? visit.restaurant.name : date

  return (
    <CardItem>
      <Heading className="break-words text-xl text-ink">
        <Link to={`/journal/${visit.id}`} className={CARD_LINK_CLASS}>
          {title}
        </Link>
      </Heading>
      <p className="mt-0.5 text-sm text-ink-muted">
        {hasRestaurant(visit) && `${date} · `}
        {visit.wentWith ? `With ${visit.wentWith}` : 'No companions noted'}
      </p>
      {snippet && <p className="mt-2 line-clamp-3 font-serif text-base text-ink">{snippet}</p>}
      <div className="mt-3">
        <Chip tone={visit.wouldGoBack ? 'olive' : 'neutral'}>
          {visit.wouldGoBack ? 'Would go back' : 'Would not go back'}
        </Chip>
      </div>
    </CardItem>
  )
}
