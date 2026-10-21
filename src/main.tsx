import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/lora'
import './styles/index.css'
import { AuthProvider } from './auth/AuthProvider'
import { RepositoryProvider } from './data/RepositoryProvider'
import { createServices, type Services } from './data/services'
import { router } from './router'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

// Where data lives (Supabase or this browser) is decided in createServices; see README.
let services: Services | undefined
let configProblem: string | undefined
try {
  services = await createServices(import.meta.env)
} catch (cause) {
  configProblem = cause instanceof Error ? cause.message : 'The app is not configured correctly.'
}

createRoot(root).render(
  <StrictMode>
    {services ? (
      <RepositoryProvider repository={services.repository}>
        <AuthProvider service={services.auth} hasAccounts={services.backend === 'supabase'}>
          <RouterProvider router={router} />
        </AuthProvider>
      </RepositoryProvider>
    ) : (
      <main className="mx-auto max-w-prose p-6">
        <h1 className="text-2xl text-ink">Setup problem</h1>
        <p className="mt-3 text-base text-ink">{configProblem}</p>
        <p className="mt-3 text-sm text-ink-muted">Fix your .env.local file, then reload the page.</p>
      </main>
    )}
  </StrictMode>,
)
