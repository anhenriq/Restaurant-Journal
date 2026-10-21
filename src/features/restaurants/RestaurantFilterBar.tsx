import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ChipToggleGroup } from '@/components/ui/ChipToggleGroup'
import { Icon } from '@/components/ui/Icon'
import { PriceLevelPicker } from '@/components/ui/PriceLevelPicker'
import { SearchField } from '@/components/ui/SearchField'
import type { ListFilterControls } from '@/hooks/useListFilters'
import { cx } from '@/lib/cx'
import { VIBE_TAGS, VIBE_TAG_LABELS } from '@/types'

const VIBE_OPTIONS = VIBE_TAGS.map((value) => ({ value, label: VIBE_TAG_LABELS[value] }))

interface RestaurantFilterBarProps {
  controls: ListFilterControls
  /** Accessible name of the search region and field, e.g. "Search your saved places". */
  label: string
  placeholder: string
}

/** Search box plus collapsible vibe and price filters. Used above both the Want to Go and Journal lists. */
export function RestaurantFilterBar({ controls, label, placeholder }: RestaurantFilterBarProps) {
  const { filters, update, clear, isFiltering, activeFilterCount } = controls
  const [open, setOpen] = useState(activeFilterCount > 0)
  const panelId = useId()

  return (
    <search aria-label={label} className="mb-5 block">
      <SearchField
        label={label}
        placeholder={placeholder}
        value={filters.search}
        onChange={(search) => update({ search })}
        autoComplete="off"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-touch items-center gap-2 rounded border border-border-strong bg-surface-raised px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-accent px-2 text-xs text-ink-on-accent">
              {activeFilterCount}
              <span className="sr-only"> active</span>
            </span>
          )}
          <Icon name="chevron-down" size={18} className={cx('transition-transform', open && 'rotate-180')} />
        </button>
        {isFiltering && (
          <Button variant="ghost" onClick={clear}>
            Clear all
          </Button>
        )}
      </div>

      {/* `hidden` goes on a wrapper with no display class, so a utility like `flex` can't override it */}
      <div id={panelId} hidden={!open}>
        <div className="mt-4 flex flex-col gap-5 rounded-lg border border-border bg-surface-raised p-4">
          <ChipToggleGroup
            legend="Vibe"
            hint="Shows places with all of the vibes you pick."
            options={VIBE_OPTIONS}
            selected={filters.vibeTags}
            onChange={(vibeTags) => update({ vibeTags })}
          />
          <PriceLevelPicker
            legend="Price"
            hint="Shows places up to this price level."
            value={filters.maxPriceLevel}
            onChange={(maxPriceLevel) => update({ maxPriceLevel })}
            anyLabel="Any price"
          />
        </div>
      </div>
    </search>
  )
}
