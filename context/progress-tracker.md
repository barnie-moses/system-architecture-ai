# Progress Tracker

This document is intentionally lightweight during early
development.

Update this file after every meaningful implementation
change so future sessions can immediately resume with
full context.

---

# Current Phase

- Phase 1 — Core Foundation
- Design system and UI primitive foundation completed
- Clerk authentication foundation completed
- Prisma persistence foundation completed
- Project API route foundation completed
- Editor home project data wiring completed
- Auth page visual composition refined from reference screenshot
- Context specification finalized
- System boundaries established
- UI design language defined

---

# Current Goal

- Continue Phase 1 foundation after wiring the editor home to real project
  data from `context/feature-specs/07-wire-editor-home.md`.

Immediate priorities:

1. Configure remaining environment validation
2. Begin Liveblocks room lifecycle foundations when specified
3. Begin central canvas surface implementation when specified
4. Add project collaborator management when specified

---

# Completed

## Product Definition

- Defined code standards
- Defined architecture boundaries
- Defined storage model
- Defined collaboration model
- Defined auth and ownership rules
- Defined rendering constraints
- Defined persistence rules
- Defined UI language and design tokens
- Defined typography system
- Defined radius scale
- Defined component conventions
- Defined canvas color palette
- Defined file organization strategy
- Defined operational invariants

---

## UI Context

Completed:

- Dark-only design system
- Token-driven color architecture
- Typography standards
- Border radius scale
- Tailwind token mapping rules
- Canvas color palette
- Component styling conventions
- shadcn/ui configured with CSS variables
- Required UI primitives added:
  Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea
- `lib/utils.ts` added with the shared `cn()` helper
- Lucide React installed for icon usage
- Root layout explicitly opts into dark mode

---

## Design System Foundation

Spec:

- `context/feature-specs/01-design-specs.md`

Completed implementation:

- Configured shadcn/ui for the existing Next.js App Router project
- Added Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea without
  modifying generated `components/ui/*` files after installation
- Added `lib/utils.ts` with the shared `cn()` helper
- Added Lucide React icon support
- Mapped global CSS to the documented dark-only semantic tokens

Verification:

- `npm run lint` passed
- `npm run build` passed with network access for `next/font` Google font fetching

---

## Editor Shell Base Chrome

Spec:

- `context/feature-specs/02-editor.md`

Completed implementation:

- Added `components/editor/editor-navbar.tsx`
  - Fixed-height top navbar
  - Left, center, and right sections
  - Sidebar toggle button using `PanelLeftOpen` / `PanelLeftClose`
  - Dark surface background and subtle bottom border
- Added `components/editor/project-sidebar.tsx`
  - Floating fixed-position sidebar that does not push page content
  - Left slide-in animation controlled by `isOpen` and `isClosed`
  - Header with `Projects` title and close button
  - shadcn `Tabs` for `My Projects` and `Shared`
  - Empty placeholder state for both tabs
  - Full-width bottom `New Project` button with `Plus` icon
- Added `components/editor/editor-dialog.tsx`
  - Reusable future dialog content pattern with title, description,
    body content, and footer actions
  - Uses existing theme tokens and shadcn dialog primitives

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Authentication Foundation

Spec:

- `context/feature-specs/03-auth.md`

Completed implementation:

- Installed `@clerk/ui` for Clerk-provided themes
- Added shared Clerk route constants in `lib/auth-routes.ts`
  - Uses `NEXT_PUBLIC_CLERK_SIGN_IN_URL` when defined, otherwise `/sign-in`
  - Uses `NEXT_PUBLIC_CLERK_SIGN_UP_URL` when defined, otherwise `/sign-up`
- Added `lib/clerk-appearance.ts`
  - Uses Clerk's `dark` theme
  - Overrides Clerk appearance variables with existing app CSS variables
  - Avoids hardcoded application colors in auth styling
- Wrapped the root app with `ClerkProvider` inside `<body>`
  - Uses the shared Clerk dark appearance
  - Sets sign-in and sign-up URLs from shared route constants
  - Sends successful sign-in/sign-up fallback redirects to `/editor`
- Added root `proxy.ts`
  - Uses Next.js 16 Proxy convention rather than `middleware.ts`
  - Defines public auth routes from Clerk sign-in/sign-up route constants
  - Protects every non-auth route by default
  - Includes app and API/TRPC route matcher coverage
- Added Clerk catch-all auth routes:
  - `app/sign-in/[[...sign-in]]/page.tsx`
  - `app/sign-up/[[...sign-up]]/page.tsx`
- Added `components/auth/auth-page-shell.tsx`
  - Large-screen two-panel auth layout
  - Compact logo, tagline, and text-only feature list on the left
  - Centered Clerk form on the right
  - Mobile renders the form-focused layout only
- Updated `/`
  - Authenticated users redirect to `/editor`
  - Unauthenticated users redirect to the Clerk sign-in path
- Added a minimal protected `/editor` route and `EditorShell`
  - Reuses the existing editor navbar and project sidebar
  - Provides the redirect target required by the auth spec
- Added Clerk's built-in `UserButton` to the editor navbar right section
  - Keeps Clerk's default profile and logout flow intact
- Adjusted `components/editor/editor-navbar.tsx` after auth integration
  - Left and right sections now size to their contents
  - Center section owns the remaining flexible space
  - Clerk `UserButton` is pinned to the far-right edge of the navbar

Verification:

- `npm run lint` passed
- `npm run build` passed
- Local route smoke checks against the running dev server:
  - `/` redirects signed-out document requests to the local Clerk sign-in route
  - `/editor` redirects signed-out document requests to the local Clerk sign-in route
  - `/sign-in` returns `200 OK`
  - `/sign-up` returns `200 OK`

---

## Authentication UI Refinement

Completed implementation:

- Updated `components/auth/auth-page-shell.tsx`
  - Left panel now occupies slightly less than half the large-screen layout
  - Brand mark and product name are positioned high-left
  - Headline and supporting copy sit in the middle-left content area
  - Feature rows use compact Lucide icon tiles with text to the right
  - Copyright text is pinned to the lower-left area
  - Mobile remains form-focused with the left information panel hidden
- Updated sign-in and sign-up page copy so each page uses similar positioning
  with distinct, non-identical text
- Expanded Clerk appearance overrides in `lib/clerk-appearance.ts`
  - Wider card treatment
  - Dark elevated card surface
  - Token-based borders, inputs, buttons, footer, and text colors
  - No raw Tailwind palette classes or hardcoded application colors added

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Project Dialogs and Sidebar Actions

Spec:

- `context/feature-specs/04-project-dialogs.md`

Completed implementation:

- Updated the `/editor` home screen with the specified heading, description,
  and `New Project` button using a Lucide `Plus` icon
  - Removed the small `Editor` eyebrow label from the empty state
  - Widened the empty-state copy area so the heading remains on one line on
    desktop viewports
- Added `components/editor/use-project-dialogs.ts`
  - Centralizes mock project data
  - Manages dialog state, form state, slug preview, validation, and loading
    state
  - Supports mock create, rename, and delete mutations without API calls or
    persistence
- Added `components/editor/project-dialogs.tsx`
  - Create project dialog with project name input and live slug preview
  - Rename project dialog with prefilled name, current name in the description,
    autofocus, and Enter-submit behavior
  - Delete project dialog with destructive confirmation only and destructive
    button styling
- Updated `components/editor/project-sidebar.tsx`
  - Renders mock owned and shared project sections
  - Shows rename and delete icon actions only for owned projects
  - Reveals owned-project rename and delete actions only on project-row hover
    or keyboard focus
  - Hides actions for shared/collaborator projects
  - Wires sidebar `New Project`, rename, and delete actions into the dialog
    controller
  - Adds mobile-only outside-click close behavior with a backdrop scrim

Verification:

- `npm run lint` passed
- `npm run build` passed
- Existing local dev server on `http://localhost:3000` responds for `/editor`
  and correctly redirects signed-out requests to Clerk sign-in

Notes:

- No API routes, database schema, blob storage, or persistence behavior were
  added for this spec.
- Browser automation could not be driven because the required Node REPL browser
  control tool was not available in this session.

---

## Prisma Persistence Foundation

Spec:

- `context/feature-specs/05-prisma.md`

Completed implementation:

- Added `prisma/models/project.prisma`
  - Defines `ProjectStatus` enum with `DRAFT` and `ARCHIVE`
  - Defines `Project` with Clerk owner ID, name, optional description,
    status, future canvas blob path, timestamps, and collaborator relation
  - Defines `ProjectCollborators` with cascade project relation,
    collaborator email, creation timestamp, unique project/email constraint,
    and required indexes
- Added `lib/prisma.ts`
  - Exports one cached Prisma instance
  - Uses `accelerateUrl` when `DATABASE_URL` starts with
    `prisma+postgres://`
  - Uses direct `@prisma/adapter-pg` for standard PostgreSQL URLs
  - Caches the Prisma client on `globalThis` outside production for hot reloads
- Created and applied initial migration:
  - `prisma/migrations/20260522194238_init_project_models/migration.sql`
- Regenerated Prisma Client to `app/generated/prisma`

Verification:

- `npx prisma format` passed
- `npx prisma validate` passed
- `npx prisma generate` passed
- `npx prisma migrate dev --name init_project_models` created and applied the
  migration successfully
- `npm run build` passed

Notes:

- The Prisma spec used the names `canvasJasonPath` and
  `ProjectCollborators`; the implementation preserves those names exactly.

---

## Project API Routes

Spec:

- `context/feature-specs/06-preoject-api.md`

Completed implementation:

- Added `lib/projects.ts`
  - Centralizes project API validation helpers
  - Reads JSON request bodies safely, including empty bodies
  - Defaults missing create names to `Untiled Project`
  - Provides Prisma-backed project list, create, owner-only rename, and
    owner-only delete helpers
- Added `app/api/projects/route.ts`
  - `GET /api/projects` lists authenticated current-user projects
  - `POST /api/projects` creates a project for the authenticated Clerk user
  - Unauthenticated requests return `401`
- Added `app/api/projects/[projectId]/route.ts`
  - `PATCH /api/projects/[projectId]` renames owner-owned projects only
  - `DELETE /api/projects/[projectId]` deletes owner-owned projects only
  - Missing ownership returns `403`
- Kept the implementation backend-only with no UI wiring changes.

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Wire Editor Home To Project API

Spec:

- `context/feature-specs/07-wire-editor-home.md`

Completed implementation:

- Added `types/projects.ts`
  - Defines the serializable editor project shape and owned/shared list shape
- Updated `lib/projects.ts`
  - Adds `listEditorProjectsForUser()` for server-side owned and shared
    project loading
  - Maps Prisma project IDs to editor room IDs so project ID and Liveblocks
    room ID remain aligned
  - Adds create payload validation for an optional client-generated project ID
- Updated `POST /api/projects`
  - Accepts a validated client-generated `id`
  - Returns `409` when the requested project ID already exists
- Added `hooks/use-project-actions.ts`
  - Manages create, rename, and delete dialog state
  - Generates a slug-based room ID with a short unique suffix during create
  - Calls `POST /api/projects`, `PATCH /api/projects/[projectId]`, and
    `DELETE /api/projects/[projectId]`
  - Navigates to `/editor/{projectId}` after create
  - Refreshes after rename and after deleting non-active projects
  - Redirects to `/editor` after deleting the active workspace
- Updated `app/editor/page.tsx`
  - Remains a server component
  - Fetches owned and shared projects server-side using Clerk identity and
    Prisma helpers
  - Passes project lists into the editor shell with no initial client fetch
- Added `app/editor/[projectId]/page.tsx`
  - Provides the workspace route used after project creation
  - Passes the active project ID into the editor shell
- Updated `components/editor/editor-shell.tsx`
  - Receives real project lists through props
  - Uses the new project action hook
  - Keeps UI composition separate from persistence
- Removed the obsolete `components/editor/use-project-dialogs.ts` mock hook
- Updated `components/editor/project-sidebar.tsx`
  - Renders real owned and shared projects
  - Links project rows to `/editor/{projectId}`
  - Keeps rename/delete actions owner-only
- Updated `components/editor/project-dialogs.tsx`
  - Shows create room ID preview
  - Prefills rename names
  - Shows delete target project names

Architecture notes:

- No new storage model is introduced.
- API routes remain the mutation boundary.
- Components remain presentation-focused and receive project data via props.

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Architecture Context

Completed:

- Layer ownership model
- Request lifecycle rules
- Background workflow boundaries
- Blob storage strategy
- Real-time collaboration model
- Authorization rules
- Persistence separation model
- Invariant enforcement rules

---

# In Progress

## Foundation Setup

Planned setup sequence:

- Next.js application bootstrap
- TypeScript strict configuration
- Tailwind configuration
- shadcn/ui initialization
- Prisma schema initialization
- Clerk integration
- Liveblocks integration
- Trigger.dev integration
- Blob storage adapter setup

Status:

- Design system and UI primitive setup completed
- Clerk authentication setup completed
- UI-only project dialogs and sidebar project actions completed with mock data
- Prisma foundation from `context/feature-specs/05-prisma.md` completed
- Project API routes from `context/feature-specs/06-preoject-api.md`
  completed
- Editor home wiring from `context/feature-specs/07-wire-editor-home.md`
  completed

---

## Editor Shell

Planned editor foundation:

- Full viewport layout
- Left navigation sidebar
- Central canvas surface
- Right properties panel
- Shared layout primitives
- Theme token integration

Status:

- Base editor chrome from `context/feature-specs/02-editor.md` completed
- Minimal protected `/editor` route added for authenticated redirects
- `/editor` now server-loads owned and shared projects from Prisma
- `/editor/[projectId]` exists as the project workspace route
- Central canvas surface and right properties panel remain pending future
  implementation specs

---

# Next Up

## Phase 1 — Core Foundation

Priority order:

1. Configure environment validation
2. Add project collaborator management when specified
3. Begin Liveblocks room lifecycle foundations
4. Begin editor canvas data loading and central canvas surface
5. Add blob-backed canvas snapshot persistence when specified

---

## Phase 2 — Canvas Foundation

Planned features:

- React Flow canvas
- Liveblocks room connection
- Shared node schema
- Presence system
- Cursor rendering
- Node selection
- Canvas persistence
- Import/export support

---

## Phase 3 — AI Workflow Layer

Planned features:

- Trigger.dev orchestration
- Async generation pipelines
- Markdown spec generation
- Artifact persistence
- Workflow retry support
- Job progress tracking

---

# Open Questions

## Product Questions

- What is the minimum viable canvas node set?
- Will projects support version history at launch?
- Should collaborative cursors include user avatars?
- What export formats are required initially?
- Should generated specs support regeneration diffs?

---

## Technical Questions

- Final Prisma schema structure for canvas entities beyond the completed
  project metadata foundation
- Liveblocks room lifecycle strategy
- Canvas persistence frequency strategy
- Snapshot versioning approach
- Trigger.dev workflow partitioning strategy
- Blob cleanup lifecycle rules
- Optimistic UI strategy for collaborative edits
- `context/architecture-context.md` is referenced by `AGENTS.md`,
  but the available architecture context file is `context/architecture.md`.
- Local auth paths currently default to `/sign-in` and `/sign-up` when
  `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` are not
  defined. If custom auth paths are introduced, the App Router auth route
  folders must be kept consistent with those values.

---

# Architecture Decisions

## Storage Separation

Decision:

- Metadata lives in PostgreSQL
- Large generated artifacts live in Vercel Blob

Reason:

- Prevent database bloat
- Keep relational queries efficient
- Improve artifact scalability

---

## Background Execution Model

Decision:

- Long-running AI work executes exclusively in Trigger.dev

Reason:

- Prevent request timeouts
- Support retries and durability
- Isolate expensive orchestration logic

---

## Rendering Strategy

Decision:

- Default to React Server Components
- Use `"use client"` only when required

Reason:

- Reduce client bundle size
- Improve rendering performance
- Maintain explicit server/client boundaries

---

## UI Token System

Decision:

- All colors and surfaces use CSS custom properties

Reason:

- Centralized theming
- Consistent visual language
- Prevent hardcoded styling drift

---

## Authentication Routing

Decision:

- Use Next.js 16 `proxy.ts` with Clerk protected-first route protection.
- Keep only Clerk sign-in and sign-up paths public.
- Keep `/` protected by Proxy and also redirect from the page as a fallback.

Reason:

- Matches the auth spec requirement to protect everything except auth pages.
- Keeps request-time auth checks at the framework boundary.
- Preserves a simple root redirect flow into `/editor`.

---

## Icon Package

Decision:

- Use `lucide-react` for icons.

Reason:

- The UI context requires Lucide React, shadcn's selected preset imports
  `lucide-react`, and the package name `lucid-react` from the feature spec
  is not published in the npm registry.

---

## Real-Time Collaboration

Decision:

- Liveblocks owns transient collaborative state
- Durable persistence remains external

Reason:

- Separate collaboration concerns from persistence
- Improve synchronization reliability
- Maintain recoverable storage model

---

## API Design

Decision:

- Route handlers remain thin orchestration layers

Reason:

- Improve maintainability
- Keep business logic centralized
- Reduce duplication across routes

---

# Session Notes

## Current State

The project is currently in Phase 1 foundation implementation.

Completed documents:

- `code-standards.md`
- `ui-context.md`
- `architecture.md`
- `progress-tracker.md`

Completed implementation foundations:

- Design tokens and shadcn/ui primitives
- Base editor chrome components
- Clerk authentication, auth pages, protected Proxy, and `/editor` redirect target
- Prisma project metadata schema, migration, generated client, and shared
  cached Prisma singleton
- Prisma-backed project API routes
- Server-loaded editor home project lists and API-backed create, rename, and
  delete actions

These documents are considered the canonical implementation
constraints for the codebase.

---

## Critical Constraints

Must maintain:

- Strict server/client boundaries
- Thin API routes
- Background-only AI execution
- Token-based styling
- Storage separation
- Ownership enforcement
- Consistent canvas schema

---

## Important Implementation Notes

- Do not introduce raw Tailwind colors
- Do not persist large artifacts in PostgreSQL
- Do not place orchestration logic inside components
- Do not run AI generation inside request handlers
- Do not bypass ownership validation
- Do not introduce uncontrolled client components

---

## Resume Point For Next Session

Next implementation session should begin with:

1. Environment validation
2. Project collaborator management, if specified
3. Liveblocks room lifecycle foundations, if specified
4. Central canvas surface implementation, if specified

Project metadata persistence and editor home wiring are complete for the
current Phase 1 scope.

```
