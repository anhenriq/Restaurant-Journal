import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

type ChipTone = 'accent' | 'olive' | 'neutral'

const TONES: Record<ChipTone, string> = {
  accent: 'bg-accent-soft text-accent-hover',
  olive: 'bg-olive-soft text-olive',
  neutral: 'bg-surface-sunken text-ink',
}

interface ChipProps {
  tone?: ChipTone
  children: ReactNode
}

/** Small read-only label, e.g. a vibe tag or "Would go back". For selectable tags see ChipToggleGroup. */
export function Chip({ tone = 'accent', children }: ChipProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        TONES[tone],
      )}
    >
      {children}
    </span>
  )
}
