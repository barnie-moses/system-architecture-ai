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
- Auth page visual composition refined from reference screenshot
- Context specification finalized
- System boundaries established
- UI design language defined

---

# Current Goal

- Continue Phase 1 foundation after completing the UI-only project dialog and
  sidebar action flow from `context/feature-specs/04-project-dialogs.md`.

Immediate priorities:

1. Establish Prisma schema
2. Configure PostgreSQL connection
3. Configure environment validation
4. Begin project ownership and persistence foundations

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
- Central canvas surface and right properties panel remain pending future
  implementation specs

---

# Next Up

## Phase 1 — Core Foundation

Priority order:

1. Initialize repository structure
2. Configure TypeScript strict mode
3. Establish base layout
4. Establish Prisma schema
5. Configure PostgreSQL connection
6. Configure environment validation
7. Begin project ownership and persistence foundations

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

- Final Prisma schema structure for canvas entities
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

1. Prisma schema creation
2. PostgreSQL connection setup
3. Environment validation
4. Project ownership and persistence foundations

After persistence foundations, continue into project list and editor data
loading work.

```
