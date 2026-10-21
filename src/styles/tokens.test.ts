import { describe, expect, it } from 'vitest'
import { colors, type ColorToken } from './tokens'

function channel(hex: string, start: number): number {
  const value = parseInt(hex.slice(start, start + 2), 16) / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
}

function contrast(a: ColorToken, b: ColorToken): number {
  const [light, dark] = [luminance(colors[a]), luminance(colors[b])].sort((x, y) => y - x)
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)
}

// [foreground, background, minimum ratio]. 4.5 for text, 3 for UI borders/focus.
const PAIRS: ReadonlyArray<[ColorToken, ColorToken, number]> = [
  ['ink', 'surface', 4.5],
  ['ink', 'surface-raised', 4.5],
  ['ink', 'surface-sunken', 4.5],
  ['ink-muted', 'surface', 4.5],
  ['ink-muted', 'surface-raised', 4.5],
  ['ink-muted', 'surface-sunken', 4.5],
  ['ink-on-accent', 'accent', 4.5],
  ['ink-on-accent', 'accent-hover', 4.5],
  ['accent', 'surface', 4.5],
  ['accent', 'surface-raised', 4.5],
  ['ink', 'accent-soft', 4.5],
  ['accent-hover', 'accent-soft', 4.5],
  ['olive', 'surface', 4.5],
  ['olive', 'olive-soft', 4.5],
  ['ink-on-accent', 'danger', 4.5],
  ['ink-on-accent', 'danger-hover', 4.5],
  ['danger', 'surface', 4.5],
  ['danger', 'surface-raised', 4.5],
  ['danger', 'danger-soft', 4.5],
  ['border-strong', 'surface', 3],
  ['border-strong', 'surface-raised', 3],
  ['focus', 'surface', 3],
  ['focus', 'surface-sunken', 3],
]

describe('design tokens meet WCAG AA contrast', () => {
  it.each(PAIRS)('%s on %s is at least %s:1', (foreground, background, minimum) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum)
  })
})
