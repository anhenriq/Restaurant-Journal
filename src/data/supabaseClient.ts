import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SupabaseConfig } from './supabaseConfig'

/** Kept in its own file so the Supabase library is only downloaded when the app is configured to use it. */
export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.anonKey)
}
