import { useId } from 'react'
import { PRICE_LEVEL_DESCRIPTIONS, priceSymbols } from '@/lib/format'
import { PRICE_LEVELS, type PriceLevel } from '@/types'
import { ChoiceChip } from './ChoiceChip'
import { ChoiceGroup } from './ChoiceGroup'

interface PriceLevelPickerProps {
  legend: string
  hint?: string
  error?: string
  value: PriceLevel | undefined
  onChange: (value: PriceLevel | undefined) => void
  /** Adds a first option with this label that clears the choice (for filters, e.g. "Any"). */
  anyLabel?: string
}

/** Choose one price level, $ to $$$$. A radio group styled as chips. */
export function PriceLevelPicker({ legend, hint, error, value, onChange, anyLabel }: PriceLevelPickerProps) {
  const name = useId()
  return (
    <ChoiceGroup legend={legend} hint={hint} error={error}>
      {anyLabel && (
        <ChoiceChip
          type="radio"
          name={name}
          label={anyLabel}
          checked={value === undefined}
          onChange={() => onChange(undefined)}
        />
      )}
      {PRICE_LEVELS.map((level) => (
        <ChoiceChip
          key={level}
          type="radio"
          name={name}
          checked={value === level}
          onChange={() => onChange(level)}
          label={
            <>
              <span aria-hidden="true">{priceSymbols(level)}</span>
              <span className="sr-only">
                {priceSymbols(level)} {PRICE_LEVEL_DESCRIPTIONS[level]}
              </span>
            </>
          }
        />
      ))}
    </ChoiceGroup>
  )
}
