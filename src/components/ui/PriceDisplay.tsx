import { PRICE_LEVEL_DESCRIPTIONS, priceSymbols } from '@/lib/format'
import type { PriceLevel } from '@/types'

interface PriceDisplayProps {
  level: PriceLevel
}

/** "$$" with the unused dollar signs dimmed (so $$ reads as 2 of 4). */
export function PriceDisplay({ level }: PriceDisplayProps) {
  return (
    <span className="font-medium">
      <span aria-hidden="true" className="text-ink">
        {priceSymbols(level)}
      </span>
      <span aria-hidden="true" className="text-border-strong">
        {'$'.repeat(4 - level)}
      </span>
      <span className="sr-only">
        Price: {PRICE_LEVEL_DESCRIPTIONS[level]}, {level} of 4
      </span>
    </span>
  )
}
