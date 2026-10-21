/**
 * Design tokens: the single source of truth for colors, type, spacing and radii.
 * tailwind.config.ts reads this file, and tokens.test.ts checks the color pairs
 * for WCAG AA contrast. To restyle the app, change values here.
 */

export const colors = {
  // Surfaces: warm parchment, like a table by lamplight
  surface: '#FBF5EA',
  'surface-raised': '#FFFCF5',
  'surface-sunken': '#F2E8D5',

  // Text
  ink: '#2B1D14',
  'ink-muted': '#6B5646',
  'ink-on-accent': '#FFFCF5',

  // Brand: terracotta (primary) and olive (secondary)
  accent: '#A4421F',
  'accent-hover': '#86331A',
  'accent-soft': '#F3DCCB',
  olive: '#4F5B2E',
  'olive-soft': '#E3E6CF',

  // Lines and states
  border: '#E2D4BC',
  'border-strong': '#8A7560',
  focus: '#1E4F8C',
  danger: '#A32619',
  'danger-hover': '#861E13',
  'danger-soft': '#F8DAD5',
} as const

export type ColorToken = keyof typeof colors

export const fontFamily = {
  // Serif for headings and journal writing; sans for UI
  serif: ['"Lora Variable"', 'Georgia', 'serif'],
  sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
}

/** [fontSize, { lineHeight }] pairs. `journal` is the reading size for entries. */
export const fontSize: Record<string, [string, { lineHeight: string }]> = {
  xs: ['0.8125rem', { lineHeight: '1.25rem' }],
  sm: ['0.9375rem', { lineHeight: '1.375rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.375rem', { lineHeight: '1.875rem' }],
  '2xl': ['1.75rem', { lineHeight: '2.25rem' }],
  '3xl': ['2.125rem', { lineHeight: '2.5rem' }],
  journal: ['1.1875rem', { lineHeight: '1.85rem' }],
}

export const borderRadius = {
  sm: '0.375rem',
  DEFAULT: '0.625rem',
  lg: '1rem',
  full: '9999px',
} as const

export const boxShadow = {
  card: '0 1px 2px rgb(43 29 20 / 0.06), 0 2px 8px rgb(43 29 20 / 0.06)',
  raised: '0 4px 16px rgb(43 29 20 / 0.12)',
} as const

/** 44px minimum touch target (WCAG 2.5.5 / platform guidelines). */
export const touchTarget = '2.75rem'

export const maxWidth = {
  /** Comfortable line length for reading journal entries (~65 characters). */
  prose: '65ch',
  /** Max width of the main content column on large screens. */
  content: '48rem',
} as const
