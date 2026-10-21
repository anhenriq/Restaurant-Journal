# Restaurant Journal

A private, mobile-first journal for food lovers. **Save a place → Visit it → Remember it.**

Keep a list of restaurants you want to try, then write about the visit in your own words once you've
been. It's a personal journal, not a public review site.

Data lives behind a typed repository interface, so the screens don't know where it's stored. Out of the
box it's kept in your browser (localStorage). Add your Supabase settings and it's stored online in your
own private account instead: see [Connecting to Supabase](#connecting-to-supabase).

## Run it

You need Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173). The app starts with seven fictional
sample places. To start over with the sample data, run this in the browser console and reload:

```js
localStorage.removeItem('restaurant-journal:v1')
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check, then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run all tests once (`npm run test:watch` re-runs on change) |
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint` | Lint (includes accessibility rules and a ban on `any`) |
| `npm run check` | Typecheck + lint + tests: run this before you commit |

## What it does

- **Want to Go:** save a place with its neighborhood, cuisine, who recommended it, why, vibe tags,
  and price level.
- **Mark as visited:** turn a saved place into a journal entry (date, who you went with, what you
  ordered, your writing, would you go back). A place can have many visits.
- **Journal:** a list of past visits and a reading view built for rereading (serif type, ~65
  character lines).
- **Search and filter** both lists by text, vibe tags (must match all), and price ("up to $$").
  Filters live in the URL, so Back restores them.
- Edit and delete places and entries, with friendly empty, loading, and error states everywhere.

Not built yet: photo upload (the data model has `photos`), maps, sharing, and reservations.

## How it's organized

```
src/
  types/        Every data type, in one module (index.ts)
  data/         The data layer: the repository interface, the localStorage and Supabase versions, seed data
  auth/         Sign-in: the AuthService interface, the Supabase version, a no-account stand-in, route guard
supabase/       schema.sql: the database tables, privacy rules and triggers to run in Supabase
  lib/          Pure helpers: filtering, formatting, ids, URL filter parsing (all unit-tested)
  hooks/        Data-loading and UI-state hooks (useRestaurants, useVisits, useListFilters…)
  components/
    ui/         Small, generic building blocks (Button, TextField, Chip, ConfirmDialog…)
    layout/     App frame: AppShell, bottom tab bar (phones), side nav (tablet and up)
  features/
    restaurants/  Place card, form, details, filter bar
    visits/       Entry card, form, reading view
  pages/        One component per route
  router/       Route table
  styles/       Design tokens (tokens.ts) and global CSS
  test/         Test helpers (renderApp, axe accessibility check, in-memory fake Supabase)
```

**Routes**

| Path | Screen |
| --- | --- |
| `/sign-in` | Sign in or create an account (only when connected to Supabase) |
| `/want-to-go` | Saved places list |
| `/places/new` | Add a place |
| `/places/:id` | Place detail, visit history, Mark as visited |
| `/places/:id/edit` | Edit a place |
| `/places/:id/visit` | Mark as visited / log another visit |
| `/journal` | Journal list |
| `/journal/:visitId` | Read an entry |
| `/journal/:visitId/edit` | Edit an entry |
| `/account` | Who's signed in, sign out; or a note that data is saved in this browser |

**Data flow:** pages call hooks (`useRestaurants`, …) and the repository (`useRepository()`); those go
through the `RestaurantRepository` interface. Which implementation is used is decided in exactly one
place, `createServices` in [`src/data/services.ts`](src/data/services.ts), based on your `.env.local`.
Sign-in works the same way through the `AuthService` interface.

## Data model

Defined in [`src/types/index.ts`](src/types/index.ts).

- **`Restaurant`**: `id`, `name`, `neighborhood`, `cuisine`, `status` (`want_to_go` | `visited`),
  `recommendedBy?`, `whySaved`, `vibeTags`, `priceLevel` (1-4), timestamps.
- **`Visit`**: `id`, `restaurantId`, `visitDate` (`YYYY-MM-DD`), `wentWith`, `whatIOrdered`,
  `journalEntry`, `photos` (URLs), `wouldGoBack`, timestamps.

A restaurant has zero or more visits. **Invariant (kept by the repository):** a restaurant is
`visited` exactly when it has at least one visit. Adding the first visit flips it; deleting the last
one flips it back. Deleting a restaurant deletes its visits.

## Connecting to Supabase

With no Supabase settings the app keeps everything in this browser and there is no sign-in. With them,
it uses Supabase: each person signs in with an email and password and sees only their own places and
entries (enforced by the database, not just the app).

1. **Create the tables.** In the Supabase dashboard open **SQL Editor → New query**, paste the whole of
   [`supabase/schema.sql`](supabase/schema.sql), and run it once. It creates the `restaurants` and
   `visits` tables, the privacy rules (row-level security), and two triggers: one keeps each place's
   status correct ("visited" exactly when it has a visit) and one keeps `updated_at` current.

2. **Add your settings.** Copy `.env.example` to `.env.local` (git-ignored) and fill in:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=<your public key>
   ```

   Find the key under **Project Settings → API Keys**: use the **anon** key (legacy tab) or the
   **publishable** key (`sb_publishable_…`). **Never use the `service_role` or `secret` key.** Everything
   in a `VITE_` variable is visible to anyone who opens the app, so the app refuses to start if it sees a
   secret key.

3. **Tell Supabase where the app lives.** In **Authentication → URL Configuration**, set **Site URL** to
   `http://localhost:5173` for local development (and add your real address when you deploy). The
   confirmation link in sign-up emails sends people there.

4. **Decide on email confirmation.** By default Supabase makes new people click a link in an email before
   they can sign in. That's the right setting for a real journal. For quick local testing you can turn it off
   under **Authentication → Sign In / Providers → Email → Confirm email**. (Supabase's built-in email sender
   is limited to a few messages per hour; add your own email provider for anything beyond testing.)

5. **Restart the dev server** (`Ctrl+C`, then `npm run dev`), because environment settings are read at start.
   Open the app: you'll land on the sign-in page. Create an account, and add your first place.

Your existing browser-only data is not copied over; the Supabase journal starts empty.

**How it's wired**

- [`src/data/supabaseRepository.ts`](src/data/supabaseRepository.ts) implements the same
  `RestaurantRepository` interface as the localStorage version, and both run the same shared test suite
  ([`repositoryContract.ts`](src/data/repositoryContract.ts)), so they behave identically. The Supabase
  version runs against an in-memory fake database in tests, so **try the real thing once yourself** after
  setup (add, edit, mark as visited, delete).
- Rows coming back from the database are shape-checked; if the tables don't match the app you get a clear
  error rather than wrong data.
- Search and filtering run in the browser after fetching, using the same functions as before. That's fine
  for a personal journal; if it ever grows large, move filters into the queries.
- Errors are turned into friendly messages (expired session, no connection, and so on).
- The Supabase library is downloaded only when Supabase is configured.

**Still to do:** photo upload. `Visit.photos` already holds URLs; add an `uploadPhoto(file)` method to the
repository that stores the file in Supabase Storage and returns its URL, then add an upload control to
`VisitForm`.

## Design tokens

Colors, fonts, type sizes, radii, shadows, and the 44px touch-target size all live in
[`src/styles/tokens.ts`](src/styles/tokens.ts). `tailwind.config.ts` reads that file, and components
only use token-based classes (`bg-accent`, `text-ink-muted`, `min-h-touch`, …), so restyling the app
means editing one file. The mood is a warm evening patio: parchment surfaces, espresso text, terracotta
accent, with Lora for headings and journal writing and Inter for the interface (both self-hosted).

A test (`tokens.test.ts`) checks that every text/background and UI color pair meets WCAG AA contrast,
so a bad color change fails `npm test`.

## Accessibility

- Touch targets are at least 44px; keyboard focus is always visible.
- Semantic landmarks and one `h1` per page; every field has a real label with hint and error text
  attached for screen readers.
- Moving between screens updates the page title and moves focus to the main content; a skip link is
  the first tab stop.
- Selected chips show a checkmark as well as a color, and dialogs trap focus and close on Escape.
- `npm test` runs an automated axe-core scan of every screen. It cannot judge everything (for example,
  how a page reads in a screen reader), so also try the app with VoiceOver or similar.

## Testing

Tests use Vitest and Testing Library. They cover the data layer rules (for both storage backends),
filtering, form validation, sign-in, every screen's main flows, the design token contrast checks, and the axe accessibility scans.
`renderApp(path)` in `src/test/renderApp.tsx` renders the whole app at a URL with a fresh repository.

## Built with

React 19 · TypeScript (strict) · Vite · React Router · Tailwind CSS 3 · Vitest · Supabase (optional). No UI
component library.
