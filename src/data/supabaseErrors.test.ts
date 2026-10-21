import type { PostgrestError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { NotFoundError, StorageError } from './repository'
import { toRepositoryError } from './supabaseErrors'

const error = (code: string, message = 'boom'): PostgrestError =>
  ({ code, message, details: '', hint: '', name: 'PostgrestError', toJSON: () => ({}) }) as PostgrestError

describe('toRepositoryError', () => {
  it('treats a malformed id or a missing parent as "not found" when we know what was being looked up', () => {
    const missing = { kind: 'restaurant' as const, id: 'nope' }
    expect(toRepositoryError(error('22P02'), missing)).toBeInstanceOf(NotFoundError)
    expect(toRepositoryError(error('23503'), missing)).toBeInstanceOf(NotFoundError)
    expect(toRepositoryError(error('22P02'))).toBeInstanceOf(StorageError)
  })

  it('explains an expired session', () => {
    const result = toRepositoryError(error('PGRST301', 'JWT expired'))
    expect(result).toBeInstanceOf(StorageError)
    expect(result.message).toMatch(/sign in again/)
    expect(toRepositoryError(error('', 'invalid JWT')).message).toMatch(/sign in again/)
  })

  it('explains blocked access and network failures', () => {
    expect(toRepositoryError(error('42501')).message).toMatch(/permission/)
    expect(toRepositoryError(error('', 'TypeError: Failed to fetch')).message).toMatch(/Check your connection/)
  })

  it('falls back to a generic message and keeps the original error as the cause', () => {
    const original = error('XX000', 'internal detail the user should not see')
    const result = toRepositoryError(original)
    expect(result.message).not.toMatch(/internal detail/)
    expect(result.cause).toBe(original)
  })
})
