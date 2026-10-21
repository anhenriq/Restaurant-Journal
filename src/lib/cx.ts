/** Joins class names, skipping falsy values: cx('a', isOn && 'b') */
export function cx(...parts: ReadonlyArray<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
