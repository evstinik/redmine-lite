# Copilot Instructions — Redmine Lite

## Project Overview

Redmine Lite is a lightweight React client for Redmine that communicates via the Redmine REST API. It is primarily focused on **time tracking** with secondary support for browsing wiki pages. The app is deployed on **Netlify** with a redirect-based API proxy.

### Tech Stack

- **Runtime**: Vite 5 + React 18 + TypeScript 5.3
- **Routing**: react-router-dom v6 (BrowserRouter, nested Routes)
- **State**: React Context + `useState` for global app state; `@tanstack/react-query` used selectively (currently only Wiki page)
- **UI**: Plain CSS (no CSS Modules) + minimal MUI v5 (only `Autocomplete`, `TextField`, `ThemeProvider`)
- **HTTP**: Native `fetch` via a custom `RedmineService` class
- **Build/Deploy**: Vite → Netlify; dev server proxies `/api` to Redmine
- **Linting**: ESLint + Prettier
- **Package manager**: Yarn

---

## Project Structure

```
src/
├── components/       # Reusable UI components, grouped by feature domain
│   ├── AppShell/     # Layout wrapper with nav (Outlet-based)
│   ├── TimeEntries/  # Time entry CRUD, import, favourites, filters
│   ├── Issues/       # Issue search and display
│   ├── User/         # Greetings, user preferences
│   ├── Login/        # API key login form
│   ├── Icon/         # SVG icon components (IconBin, IconStar)
│   ├── IconButton/   # Reusable icon button
│   ├── AutocompleteSelect/ # Generic MUI Autocomplete wrapper
│   ├── RedmineLink/  # Link to Redmine entity
│   ├── StopEventPropagation/
│   └── index.ts      # Barrel exports for major components
├── hooks/            # Custom React hooks (one file per domain)
├── models/           # Data models and services
│   ├── AppState.ts   # Global app state shape + persistence
│   ├── RedmineService.ts  # API client class
│   └── api/          # Interfaces mirroring Redmine REST API JSON
├── pages/            # Route-level page components
│   ├── TimeTracking/ # Main time tracking page
│   └── Wiki/         # Wiki page viewer
├── App.tsx           # Root component with context providers
├── AppRoutes.tsx     # Route definitions
├── Router.tsx        # BrowserRouter wrapper
├── queryClient.ts    # React Query client instance
├── theme.ts          # MUI theme (primary: #e50914)
└── index.css         # Global styles + CSS custom properties
```

### Key Directories

- **`functions/`** — Netlify serverless functions (currently empty placeholder)
- **`plugins/`** — Netlify build plugin (`replace-redirect-env`) for injecting the Redmine URL into redirect rules
- **`scripts/`** — CLI scripts (e.g., `loadEntries.ts` for exporting time logs)

---

## Coding Conventions

### TypeScript

- **Strict mode** enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- `noImplicitAny` is set to `false` — implicit `any` is allowed
- Target: ES2020, module: ESNext, JSX: react-jsx
- **Use `interface` for all object shapes** — never `type` aliases for object types
- Props interfaces follow the naming pattern `ComponentNameProps`
- API model interfaces use **snake_case** property names matching the Redmine REST API exactly (e.g., `spent_on`, `issue_id`, `activity_id`)
- **Interface-class declaration merging** pattern is used for `AppState`, `TimeEntryActivity`, and `ImportSettings` — an interface defines the shape, and a same-named abstract class provides static methods/defaults. Requires `// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging`.

### Components

- Use **function declarations** (`export function MyComponent()`) as the dominant style
- **Arrow function `React.FC<Props>`** is also used in some components (`AppShell`, `Wiki`, `Router`, `AppRoutes`) — both styles coexist
- **Never use class components**
- Each component lives in its own directory: `ComponentName/ComponentName.tsx`
- Co-locate CSS with the component: `ComponentName/ComponentName.css`
- Include an `index.ts` barrel file re-exporting the component when it's part of the public components API

### Hooks

- One file per domain in `src/hooks/` (e.g., `timeEntries.ts`, `issues.ts`, `projects.ts`)
- Hook files use **camelCase** filenames
- Hook functions use the `use` prefix: `useTimeEntries`, `useAppState`, `useApiKey`
- Hooks use `function` declarations (not arrow functions)

### Imports

- **Path alias**: `@app/*` maps to `src/*` — prefer this for cross-directory imports
- Use **relative paths** only within the same directory or for closely related files
- **Barrel imports** from `@app/components` for major components listed in `src/components/index.ts`
- Import React as: `import * as React from 'react'` (preferred) or `import React from 'react'` — both are used
- Individual React hooks can be imported directly: `import { useCallback, useMemo } from 'react'`

### CSS

- **Plain CSS files** imported as side effects — no CSS Modules
- **CSS custom properties** defined in `:root` in `index.css`:
  - `--dark-bg-color: #0e1e24`
  - `--darker-bg-color: #091317`
  - `--light-fg-color: white`
  - `--action-fg-color: #e50914` (brand red)
- **BEM-like naming** for CSS classes: `fav-entries__entry`, `time-entry-row`, `search-form__query`
- Use the `classnames` library for conditional class composition
- MUI `sx` prop only in `AutocompleteSelect` and `IssuesSearch` — avoid elsewhere
- Global utility classes in `index.css`: `.hours`, `.action`, `.tip`, `.errors`, `.contained`, `.bordered`, `.icon-plain`

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Component files | PascalCase | `TimeEntryRow.tsx` |
| Hook files | camelCase | `timeEntries.ts` |
| Model files | PascalCase | `AppState.ts`, `RedmineService.ts` |
| CSS files | PascalCase (matches component) | `TimeEntryRow.css` |
| Directories (components/pages) | PascalCase | `TimeEntries/`, `TimeTracking/` |
| Directories (hooks/models) | camelCase | `hooks/`, `models/` |
| Interfaces | PascalCase, no `I` prefix | `TimeEntry`, `AppState` |
| CSS classes | kebab-case / BEM | `time-entry-row`, `fav-entries__grid` |
| Variables | camelCase | `dayForTimeEntries` |

---

## Architecture & Patterns

### State Management

The global state uses a **single flat `AppState` object** provided via React Context:

1. `AppState` (model) defines the shape + static `load()`/`store()` for localStorage persistence
2. `useAppState()` hook returns the `[state, setState]` tuple from context
3. State updates use the immutable spread pattern: `setAppState(prev => ({ ...prev, ... }))`
4. `useAppStateAutosaver()` persists selected fields (`apiKey`, `primaryActivityId`, `activities`, `favouries`) to localStorage on `window.onunload`

**Note**: The key `favouries` (missing a 't') is an intentional legacy typo persisted to localStorage — do not rename without migration logic.

### API Layer

- **`RedmineService`** class in `src/models/RedmineService.ts` encapsulates all HTTP calls
- Uses native `fetch` with a private generic `request<T>()` method
- API key passed as parameter to every method (not stored in class)
- Base URL sourced from `import.meta.env.VITE_API_URL`
- Instance created once in `App.tsx`, provided via `RedmineServiceContext`
- Hooks access it via `useRedmineService()`

### Data Fetching

- **Primary pattern**: `useEffect` → `redmineService.method(apiKey)` → `.then(setState)` → `.catch()` with manual loading state
- **React Query**: Used only in the Wiki page (`useQuery`). Other pages use the manual pattern above.
- Manual `isCancelled` boolean in `useEffect` cleanup for cancellation (not `AbortController`)

### Mutation Pattern

Hooks like `useAddTimeEntry`, `useUpdateTimeEntry`, `useDeleteTimeEntry`:
1. Call the service method
2. On success, update `appState` cache (post-server-response, not optimistic)
3. Return the promise for the caller to handle `.then()`/`.catch()`

### Error Handling

- `UnprocessableEntityError` custom error class in `RedmineService` for HTTP 422 responses — carries `errors: string[]`
- 401 responses trigger `onUnauthorized` callback → logout
- Form-level errors rendered as `<ul className="errors">`
- Some hooks silently swallow errors in `.catch()` — be aware of this pattern
- Deletion confirms via `window.confirm()` and uses `alert()` for error feedback

### Authentication

- API key stored in `AppState` (and persisted to localStorage)
- Passed via `X-Redmine-API-Key` header on every request
- Login page (`Login.tsx`) collects the key; no OAuth or session-based auth

---

## Environment Configuration

### `.env.local` Variables

```env
# Redmine server URL (used by Vite dev proxy and scripts)
VITE_REDMINE_URL=https://redmine.example.com

# API subpath for the frontend to prefix requests with (e.g., /api)
VITE_API_URL=/api

# For CLI scripts only:
REDMINE_URL=https://redmine.example.com
SCRIPT_REDMINE_ACCESS_TOKEN=<your-token>
SCRIPT_REDMINE_PROJECT_ID=<project-id>          # optional
SCRIPT_REDMINE_TIME_SPAN=2023-02-01,2023-02-24  # optional
```

### Dev Server

- Port: **3000**
- Proxy: `/api` → `VITE_REDMINE_URL` (strips `/api` prefix via rewrite)

### Production (Netlify)

- Build: `tsc && vite build` → output in `dist/`
- Redirect plugin replaces `REDMINE_URL_PLACEHOLDER` in `netlify.toml` with the actual env var
- SPA fallback: `/* → /index.html` (status 200)

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server on port 3000 |
| `yarn build` | TypeScript check + Vite production build |
| `yarn lint` | ESLint check (zero warnings policy) |
| `yarn format` | Prettier formatting |
| `yarn timelog:export` | Export time entries via CLI script |

---

## Guidelines for AI Assistance

1. **Maintain existing patterns** — follow the interface-over-type, function-declaration-for-hooks, plain-CSS conventions already established
2. **Use `@app/` path alias** for imports across directories
3. **Keep API models in snake_case** matching Redmine API; do not add a transformation/mapping layer
4. **Prefer the existing state management approach** (AppState context + hooks) for new features unless migrating to React Query
5. **Co-locate CSS** with components; use CSS custom properties from `index.css`
6. **No new UI library components** — stick to plain HTML + CSS unless MUI usage is specifically justified
7. **Follow the component directory pattern**: `ComponentName/ComponentName.tsx` + `ComponentName.css` + `index.ts`
8. **ESM module system** — the project uses `"type": "module"` in package.json
9. **Keep the `RedmineService` class** as the single point for API calls; add new endpoints as methods there
10. **Error handling**: Use `UnprocessableEntityError` pattern for 422s; render form errors in `.errors` class
