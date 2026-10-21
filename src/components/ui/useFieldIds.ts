import { useId } from 'react'

/** Ids that tie a form control to its hint and error text. */
export function useFieldIds(idProp?: string) {
  const generated = useId()
  const id = idProp ?? generated
  return { id, hintId: `${id}-hint`, errorId: `${id}-error` }
}

export type FieldIds = ReturnType<typeof useFieldIds>

/** Value for aria-describedby: only references text that is actually rendered. */
export function describedBy(
  ids: FieldIds,
  { hint, error }: { hint?: string | undefined; error?: string | undefined },
): string | undefined {
  const parts = [hint && ids.hintId, error && ids.errorId].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
}
