import type { AuthService } from '@/auth/auth'
import { createLocalAuth } from '@/auth/localAuth'
import { createSupabaseAuth } from '@/auth/supabaseAuth'
import { createLocalStorageRepository } from './localStorageRepository'
import type { RestaurantRepository } from './repository'
import { readSupabaseConfig } from './supabaseConfig'
import { createSupabaseRepository } from './supabaseRepository'

export interface Services {
  repository: RestaurantRepository
  auth: AuthService
  /** Where data lives: 'supabase' (per-person accounts) or 'local' (this browser only). */
  backend: 'supabase' | 'local'
}

/**
 * The one place the app decides where its data lives. With Supabase settings in the environment
 * (.env.local) it uses Supabase and sign-in; without them it keeps data in this browser.
 * Throws if the settings are present but unsafe or malformed.
 */
export async function createServices(env: Record<string, string | undefined>): Promise<Services> {
  const config = readSupabaseConfig(env)
  if (!config) {
    return { repository: createLocalStorageRepository({ latencyMs: 150 }), auth: createLocalAuth(), backend: 'local' }
  }
  // Downloaded only when needed, so browser-storage mode doesn't pay for the Supabase library
  const { createSupabaseClient } = await import('./supabaseClient')
  const client = createSupabaseClient(config)
  return { repository: createSupabaseRepository(client), auth: createSupabaseAuth(client), backend: 'supabase' }
}
