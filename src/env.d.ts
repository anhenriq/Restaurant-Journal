/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. With the key below, switches the app from browser storage to Supabase. */
  readonly VITE_SUPABASE_URL?: string
  /** Public anon (or publishable) key. Never the service_role / secret key. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
