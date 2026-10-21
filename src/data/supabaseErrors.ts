import type { PostgrestError } from '@supabase/supabase-js'
import { NotFoundError, StorageError } from './repository'

/** Postgres error codes we treat specially. */
const INVALID_TEXT_REPRESENTATION = '22P02' // e.g. "nope" is not a valid uuid
const FOREIGN_KEY_VIOLATION = '23503' // e.g. a visit for a restaurant that doesn't exist
const INSUFFICIENT_PRIVILEGE = '42501' // blocked by row-level security

/**
 * Turns a Supabase error into one of the repository's errors, with a message that is fine
 * to show to the person using the app.
 */
export function toRepositoryError(
  error: PostgrestError,
  missing?: { kind: 'restaurant' | 'visit'; id: string },
): Error {
  if (missing && (error.code === INVALID_TEXT_REPRESENTATION || error.code === FOREIGN_KEY_VIOLATION)) {
    return new NotFoundError(missing.kind, missing.id)
  }
  if (error.code === 'PGRST301' || error.code === 'PGRST303' || /jwt/i.test(error.message)) {
    return new StorageError('Your session has expired. Please sign in again.', { cause: error })
  }
  if (error.code === INSUFFICIENT_PRIVILEGE) {
    return new StorageError("You don't have permission to do that.", { cause: error })
  }
  if (!error.code && /fetch|network/i.test(error.message)) {
    return new StorageError("Couldn't reach your journal. Check your connection and try again.", { cause: error })
  }
  return new StorageError('Something went wrong talking to your journal. Please try again.', { cause: error })
}
