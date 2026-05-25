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
- Editor home project data wiring re-verified against spec 07
- Editor workspace shell completed
- Share dialog and collaborator management completed
- Liveblocks room lifecycle and auth foundation completed
- Base Liveblocks-backed React Flow canvas completed
- Bottom shape panel completed
- Node shape rendering and shape drag preview completed
- Canvas React Flow attribution/minimap removal and shape drop positioning fix
  completed
- Canvas shape drop origin correction completed
- Canvas shape default size reduction completed
- Editor sidebar transition refinement completed
- Node resizing and inline label editing completed
- Four-sided node connection handles completed
- Shape-aware resize minimums and connection handle geometry correction
  completed
- Connection handles hidden until node selection or hover completed
- Selected-node color toolbar completed
- Custom canvas edge behavior completed
- Canvas ergonomics control bar and keyboard shortcuts completed
- Canvas ergonomics implementation re-verified against spec 17
- Starter template library and import modal completed from spec 18
- Starter templates navbar placement and AI button active styling completed
- Presence avatar group and live cursor overlay completed from spec 19
- Share dialog invite email input text contrast fixed
- Workspace project title placement aligned beside navbar panel toggle
- Project sidebar rounded floating panel and active sidebar toggle styling
  completed
- AI sidebar rounded floating panel styling completed
- Prisma project schema drift repair applied to the configured database
- Auth page visual composition refined from reference screenshot
- Canvas export controls from spec 20 completed
- Canvas autosave from spec 21 completed
- Manual Save button ordering and click behavior completed
- Save button temporary Saved confirmation completed
- Context specification finalized
- System boundaries established
- UI design language defined

---

# Current Goal

- Continue Phase 1 foundation after completing canvas autosave from
  `context/feature-specs/21-canvas-autosave.md`.

Immediate priorities:

1. Configure remaining environment validation
2. Begin Trigger.dev workflow foundations when specified
3. Add AI generation only when specified
4. Add additional canvas behavior, editing, or persistence only when specified

---

## Canvas Autosave

Spec:

- `context/feature-specs/21-canvas-autosave.md`

Completed implementation:

- Confirmed `prisma/models/project.prisma` already includes
  `canvasJsonPath` for the saved canvas blob URL
- Installed `@vercel/blob`
- Added shared canvas state validation and normalization in
  `lib/canvas-state.ts`
  - Validates saved canvas payloads before persistence
  - Normalizes nodes and edges back to the canonical canvas node and edge types
  - Provides stable canvas state hashing for autosave deduplication
- Added `lib/canvas-persistence.ts`
  - Writes canvas JSON to Vercel Blob under `canvas/{projectId}.json`
  - Uses private blob access, overwrite semantics, and JSON content type
  - Stores the returned blob URL on `Project.canvasJsonPath`
  - Deletes stale previous blob URLs when the saved URL changes
  - Loads saved canvas snapshots from Blob through the server boundary
- Added `GET /api/projects/[projectId]/canvas`
  - Authenticates the current user
  - Verifies project access through the existing project membership helper
  - Reads the saved blob URL from Prisma
  - Returns the saved canvas state or an empty canvas state when none exists
- Added `PUT /api/projects/[projectId]/canvas`
  - Authenticates the current user
  - Verifies project access before mutation
  - Validates the incoming canvas JSON before writing
  - Uploads the snapshot to Blob and updates Prisma metadata
  - Returns the saved canvas state and latest saved metadata
- Added `hooks/use-canvas-autosave.ts`
  - Watches Liveblocks-backed React Flow nodes and edges
  - Debounces saves to avoid excessive writes
  - Deduplicates saves with a stable canvas hash
  - Prevents overlapping save requests
  - Retries failed saves with short backoff delays
  - Tracks `saving`, `saved`, and `error` status
  - Avoids autosaving during initial canvas hydration
- Updated the active editor canvas
  - Loads saved canvas state only when the Liveblocks room is empty
  - Re-checks the current room before hydrating so active collaboration is not
    overwritten by a late load response
  - Hydrates both nodes and edges into the existing collaborative canvas state
  - Fits the view after loading a non-empty saved snapshot
  - Keeps the load behavior scoped inside the editor room
- Updated the editor navbar
  - Adds a subtle Save status control next to Templates
  - Shows `Saving`, `Saved`, or `Error`
  - Avoids success toast spam
- Follow-up refinement:
  - Moved Save to be the first workspace action before Templates
  - Made Save clickable
  - Manual Save clicks force an immediate save through the existing canvas API,
    even when the latest autosave hash already matches
  - Save now returns to the `Save` label after briefly showing `Saved` on a
    successful save

Architecture notes:

- Prisma remains responsible for project metadata and the saved blob URL only.
- Vercel Blob remains responsible for the canvas JSON payload.
- Liveblocks remains responsible for real-time collaborative state.
- Canvas save/load routes remain thin API orchestration layers.
- Autosave remains non-blocking and does not replace Liveblocks
  collaboration.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Signed-out `/editor` smoke check returns Clerk's expected sign-in redirect
- In-app browser automation could not be driven because the Node REPL browser
  control tool was not exposed through `tool_search` in this session

---

## Canvas Export Controls

Spec:

- `context/feature-specs/20-export-canvas.md`

Completed implementation:

- Added an Export action to the active editor navbar next to Templates, Share,
  and AI
- Added a compact Export menu with:
  - Download PNG
  - Download PDF
- Added `lib/canvas-export.ts`
  - Builds a standalone SVG from the current React Flow nodes and edges
  - Exports only diagram content, excluding navbar, side panels, shape toolbar,
    zoom controls, avatars, Liveblocks UI, and dotted canvas background
  - Preserves node shapes, node colors, node labels, edge paths, arrow markers,
    and non-empty edge labels
  - Fits exported bounds around visible nodes with padding
  - Uses a clean solid canvas background for readability instead of the dotted
    editor background
  - Generates PNG downloads fully in the browser
  - Generates landscape PDF downloads fully in the browser by embedding the
    rasterized diagram into a PDF page
  - Downloads files as `<project-name>-canvas.png` and
    `<project-name>-canvas.pdf`
- Added a canvas export request bridge from the navbar to the Liveblocks-backed
  canvas without changing canvas editing behavior
- Added an empty-canvas guard that shows `There is nothing to export.` and does
  not download a blank file
- Corrected PDF image embedding after PNG exported correctly but PDF output
  clipped wide diagrams
  - PDF export now declares the embedded JPEG with the actual rasterized image
    dimensions instead of the pre-scale SVG dimensions
  - PDF page height now adapts to wide diagram aspect ratios while keeping a
    landscape page

Architecture notes:

- Export remains fully client-side.
- No server-side export routes were added.
- No database, blob storage, API route, or durable workflow logic was changed.
- Existing node rendering and edge editing behavior remain unchanged.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Re-verified after PDF export correction:
  - `npm run lint` passed
  - `npm run build` passed
- Signed-out `/editor` smoke check returns Clerk's expected sign-in redirect
- Existing dev server is running on `http://localhost:3000`
- A second dev server was not started because Next reported an existing server
  for this repo on port 3000
- In-app browser automation could not be driven because no browser automation
  tool was exposed through `tool_search` in this session

---

## Presence Avatars And Live Cursors

Spec:

- `context/feature-specs/19-presence-avatars-cursor.md`

Completed implementation:

- Updated `liveblocks.config.ts`
  - Presence now includes `cursor: { x: number; y: number } | null`
  - Presence now includes the spec-defined `thinking: boolean`
- Updated the Liveblocks room initial presence in
  `components/editor/base-canvas.tsx`
  - Initializes `cursor` to `null`
  - Initializes `thinking` to `false`
- Added a canvas-only participant avatar group inside the active editor room
  view
  - The shared editor navbar remains unchanged
  - The editor home state does not render the presence group
  - The group is positioned in the top-right of the canvas area
  - The current Clerk user ID is read through the active Clerk session
  - Liveblocks participants are filtered so the current Clerk user is not
    rendered as a collaborator avatar
  - The current user is rendered separately with Clerk's existing `UserButton`
  - Collaborator avatars are display-only
  - The divider before the Clerk `UserButton` renders only when collaborators
    are present
  - Collaborator avatars render profile photos when available and initials as
    fallback
  - Up to five collaborators are shown in an overlapping stack
  - Additional collaborators render as a `+N` overflow chip
  - Avatar surfaces use subtle canvas-readable rings
- Added Liveblocks-backed live cursors inside the canvas room
  - Cursor positions are broadcast through `useMyPresence`
  - React Flow `onMouseMove` updates the current user's cursor position
  - React Flow `onMouseLeave` clears the cursor to `null`
  - Cursor rendering uses `useOthers`
  - Current user cursors are filtered out using the active Clerk user ID
  - Each remote cursor renders a colored pointer and attached name badge
  - Pointer and badge color use the participant's Liveblocks cursor color

Architecture notes:

- Presence remains transient Liveblocks state and does not touch persistence.
- The feature stays inside the canvas client component because it requires
  Clerk client hooks, Liveblocks hooks, and pointer events.
- No navbar actions, node behavior, edge behavior, APIs, database code, or
  durable workflows were changed.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Signed-out `/editor` smoke check still redirects through Clerk protection
- In-app browser automation could not be driven because the Node REPL browser
  control tool was not exposed in this session

---

## Share Dialog Input Contrast

Completed implementation:

- Updated `components/editor/share-dialog.tsx`
  - Invite email input now uses `text-copy-primary` for typed text
  - Placeholder remains muted with `placeholder:text-copy-muted`
  - Caret uses the brand token with `caret-brand`

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Starter Templates

Spec:

- `context/feature-specs/18-starter-template.md`

Completed implementation:

- Added `components/editor/starter-templates.ts`
  - Exports the `CanvasTemplate` type
  - Exports `CANVAS_TEMPLATES`
  - Includes microservices, CI/CD pipeline, and event-driven system templates
  - Uses shared canvas node and edge types, canonical canvas element types,
    shared shape sizes, and the existing node color palette
- Added `components/editor/starter-templates-modal.tsx`
  - Renders a dialog with template cards in a scrollable responsive grid
  - Shows each template name and description
  - Provides an import button for each template
  - Calls `onImport` with the selected template and then closes the dialog
  - Draws fixed-viewport lightweight SVG previews by calculating bounds from
    template node positions, drawing simple center-to-center edge lines, and
    rendering nodes from their shape and color data without React Flow
- Wired the active workspace navbar to open the starter templates modal with a
  top-right Templates button matching the Share/AI action group
- Removed the Templates action from the bottom canvas control bar
- Imported templates are cloned with unique node and edge IDs before being
  added to the Liveblocks-backed React Flow canvas
- The canvas fits the view after a template import
- Updated the AI navbar button to render as a transparent workspace action when
  inactive and use highlighted brand styling only while the AI sidebar is open
- The AI sidebar now starts closed so the button begins in its inactive state
- Moved the active project name from the centered navbar slot to the left
  navbar identity area immediately beside the project sidebar toggle
- Added the muted `Workspace` subtitle under the active project name to match
  the screenshot reference
- Updated the left Projects sidebar to use a rounded floating overlay shell
  with clipped rounded corners, tighter viewport margins, and a wider panel
  matching the screenshot treatment
- Updated the left sidebar toggle button to use the same transparent inactive
  and highlighted active behavior as the right-side AI sidebar control
- Updated the AI sidebar to open as a rounded floating panel with inset margins,
  clipped rounded corners, full border, and matching slide-out spacing

Verification:

- `npm run lint` passed
- `npm run build` passed
- Re-verified after navbar and AI button refinement on 2026-05-23:
  - `npm run lint` passed
  - `npm run build` passed
- Re-verified after project title placement update on 2026-05-23:
  - `npm run lint` passed
  - `npm run build` passed
- Re-verified after project sidebar rounded shell update on 2026-05-23:
  - `npm run lint` passed
  - `npm run build` passed
- Re-verified after AI sidebar rounded shell update on 2026-05-23:
  - `npm run lint` passed
  - `npm run build` passed
- Existing dev server is running on `http://localhost:3000`
- Signed-out `/editor` smoke check redirects through Clerk protection as
  expected
- Browser automation could not be driven because the in-app browser JavaScript
  execution tool was not exposed in this session

---

## Canvas Ergonomics

Spec:

- `context/feature-specs/17-canvas-ergonomics.md`

Completed implementation:

- Added a bottom-left floating canvas control bar above the shape panel
  with zoom out, fit view, zoom in, undo, and redo controls
- Zoom controls call the active React Flow instance with short animated
  viewport transitions
- Undo and redo are wired to Liveblocks history through `useUndo`,
  `useRedo`, `useCanUndo`, and `useCanRedo`
- Undo and redo buttons are disabled and visually dimmed when no matching
  Liveblocks history entry is available
- Added `hooks/useKeyboardShortcuts.ts`
  - `+` and `=` zoom in
  - `-` zooms out
  - `Cmd/Ctrl + Z` triggers undo
  - `Cmd/Ctrl + Shift + Z` and `Cmd/Ctrl + Y` trigger redo
  - Shortcut handling skips inputs, textareas, selects, contenteditable
    elements, and role-textbox fields

Verification:

- `npm run lint` passed
- `npm run build` passed
- Re-verified on 2026-05-23:
  - `npm run lint` passed
  - `npm run build` passed

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

## Editor Home Project Data Wiring

Spec:

- `context/feature-specs/07-wire-editor-home.md`

Completed implementation:

- `/editor` remains a server component route that authenticates with Clerk,
  fetches owned and shared projects server-side through `listEditorProjectsForUser`,
  and passes the project lists into `EditorShell`
- `/editor/[projectId]` fetches the same server-side project lists and passes
  the active project ID into `EditorShell`
- `hooks/use-project-actions.ts` owns create, rename, and delete dialog state
  plus client-side project mutation calls
- Create generates a slugified room ID with a short suffix, sends it as the
  project ID to `POST /api/projects`, and navigates to the new workspace so the
  project ID and room ID remain aligned
- Rename calls `PATCH /api/projects/[projectId]` and refreshes the route on
  success
- Delete calls `DELETE /api/projects/[projectId]`, redirects to `/editor` when
  deleting the active workspace, and refreshes otherwise
- Sidebar and dialogs consume real project data and display project names,
  room IDs, rename prefill state, delete target names, and create room ID
  previews

Verification:

- `npm run lint` passed
- `npm run build` passed

Notes:

- No additional implementation changes were required during this verification
  pass because the spec behavior was already present.

---

## Prisma Persistence Foundation

Spec:

- `context/feature-specs/05-prisma.md`

Completed implementation:

- Added `prisma/models/project.prisma`
  - Defines `ProjectStatus` enum with `DRAFT` and `ARCHIVE`
  - Defines `Project` with Clerk owner ID, name, optional description,
    status, future canvas blob path, timestamps, and collaborator relation
  - Defines `ProjectCollaborators` with cascade project relation,
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

- The Prisma spec used the name `canvasJsonPath` and
  `ProjectCollaborators`; the implementation preserves those names exactly.

---

## Prisma Project Schema Drift Repair

Completed implementation:

- Updated the pending `20260522210000_fix_project_collaborators` migration to
  repair early project-model schema drift safely
- The migration now renames an existing `Project.canvasJasonPath` column to
  `Project.canvasJsonPath` when present, otherwise adds `Project.canvasJsonPath`
  if the column is missing
- Preserved the existing repair for renaming `ProjectCollborators` to
  `ProjectCollaborators`
- Applied the pending migration to the configured PostgreSQL database with
  `npx prisma migrate deploy`
- Updated `lib/prisma.ts` to normalize legacy PostgreSQL SSL modes
  (`prefer`, `require`, and `verify-ca`) to `verify-full` before initializing
  the `pg` adapter, preserving the current security behavior while removing
  the runtime warning

Verification:

- `npx prisma migrate status` reports the database schema is up to date
- Direct Prisma read selecting `Project.canvasJsonPath` succeeded without the
  PostgreSQL SSL mode warning
- `npm run lint` passed
- `npm run build` passed

Notes:

- The Clerk development-key warning can still appear in local development and
  is expected until production Clerk keys are configured.

---

## Project API Routes

Spec:

- `context/feature-specs/06-project-api.md`

Completed implementation:

- Added `lib/projects.ts`
  - Centralizes project API validation helpers
  - Reads JSON request bodies safely, including empty bodies
  - Defaults missing create names to `Untitled Project`
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

## Editor Workspace Shell

Spec:

- `context/feature-specs/08-editor-workspace-shell.md`

Completed implementation:

- Replaced the previous `/editor/[projectId]` workspace segment with
  `/editor/[roomId]`
- Added `lib/project-access.ts`
  - Provides `getCurrentProjectIdentity()` for the current Clerk user ID and
    primary email
  - Provides `getAccessibleProjectByRoomId()` for owner-or-collaborator project
    access checks
- Added `components/editor/access-denied.tsx`
  - Centered denied state with a Lock icon, short message, and link back to
    `/editor`
- Updated `/editor/[roomId]`
  - Remains a server component
  - Redirects unauthenticated users to the sign-in path
  - Renders `AccessDenied` for missing projects and projects the user cannot
    access
  - Loads the editor project lists only after access is verified
- Updated the editor shell and navbar
  - Workspace navbar displays the active project name
  - Workspace navbar exposes a reference-aligned Share pill and AI pill
  - Sidebar continues highlighting the current room
  - Central canvas placeholder fills the remaining workspace area
  - Right sidebar placeholder is present for future AI chat

Verification:

- `npm run lint` passed
- `npm run build` passed
- Build output includes `/editor/[roomId]`

Notes:

- No real canvas logic, Liveblocks integration, AI chat, or sharing behavior was
  added for this spec.

---

## Editor Sidebar Transition Refinement

Completed implementation:

- Updated `components/editor/project-sidebar.tsx`
  - Increased the project sidebar slide/fade duration
  - Uses a smoother transform easing curve while remaining a floating overlay
    that does not push editor content
- Updated `components/editor/editor-shell.tsx`
  - The right AI sidebar no longer toggles through `display: none` on desktop
  - The AI sidebar is positioned as an overlay above the editor surface instead
    of a flex child, so it no longer pushes or resizes the canvas/editor area
  - The AI sidebar stays mounted and animates opacity, border color, and
    horizontal offset between open and closed states

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Share Dialog And Collaborator Management

Spec:

- `context/feature-specs/09-share-dialog.md`

Completed implementation:

- Added `types/collaborators.ts`
  - Defines the serializable collaborator shape returned to the share dialog
- Added `lib/project-collaborators.ts`
  - Normalizes and validates collaborator emails
  - Checks project share access by owner ID or collaborator email
  - Lists, upserts, and removes `ProjectCollaborators` records with Prisma
  - Enriches stored collaborator emails through Clerk Backend API user lookup
  - Falls back to email-only display when Clerk lookup is unavailable or no
    matching Clerk user exists
- Added collaborator API routes:
  - `GET /api/projects/[projectId]/collaborators`
    - Allows owners and collaborators to view collaborators
    - Returns `canManage` for owner-only UI behavior
  - `POST /api/projects/[projectId]/collaborators`
    - Owner-only invite by email
    - Stores collaborators by normalized email
  - `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]`
    - Owner-only collaborator removal
- Added `components/editor/share-dialog.tsx`
  - Opens from the workspace Share button
  - Owners can invite by email, view enriched collaborator profiles, remove
    collaborators, and copy the current project link with temporary `Copied!`
    feedback
  - Collaborators can view the collaborator list only
  - Dialog visual treatment was refined to match the reference share modal:
    header divider, workspace link card, invite card, `People with access`
    section, access count, owner row, role badges, and compact remove action
- Updated the editor navbar and shell
  - The Share button now opens the share dialog for the active workspace
  - The dialog remains scoped to active project context

Verification:

- `npm run lint` passed
- `npm run build` passed
- Build output includes:
  - `/api/projects/[projectId]/collaborators`
  - `/api/projects/[projectId]/collaborators/[collaboratorId]`
- Signed-out smoke check to the collaborator API redirects to `/sign-in` via
  Clerk protection

Notes:

- No local user table was added.
- No Liveblocks, invitation email delivery, or sharing workflow beyond database
  collaborator access was added.

---

## Liveblocks Setup

Spec:

- `context/feature-specs/10-liveblocks-setup.md`

Completed implementation:

- Added `@liveblocks/node` for server-side room lifecycle and token issuance
- Updated `liveblocks.config.ts`
  - Defines presence with cursor position and `thinking`
  - Defines `UserMeta` with user ID, display name, avatar URL, and cursor
    color metadata
  - Replaced placeholder empty object types with strict empty records/events
- Added `lib/liveblocks.ts`
  - Provides a cached Liveblocks Node client using `LIVEBLOCKS_SECRET_KEY`
  - Provides deterministic Clerk user ID to cursor color mapping from a fixed
    palette
  - Parses Liveblocks auth payloads
  - Ensures project rooms exist through `getOrCreateRoom` with private default
    access
  - Authorizes a Liveblocks session for exactly the requested project room
- Added `POST /api/liveblocks-auth`
  - Requires Clerk authentication through `getCurrentProjectIdentity()`
  - Reads the Liveblocks `room` payload as the project room ID
  - Verifies access with `getAccessibleProjectByRoomId()`
  - Returns `403` when the authenticated user cannot access the project
  - Creates the Liveblocks room only when missing
  - Returns a Liveblocks token containing display name, avatar URL, and
    deterministic cursor color

Architecture notes:

- Project ID and Liveblocks room ID remain aligned.
- The route remains a thin API boundary and delegates Liveblocks behavior to
  `lib/liveblocks.ts`.
- Liveblocks room token issuance is gated by the existing project access
  helper before any room or token operation runs.
- Rooms are private by default; user access is granted through the returned
  room-scoped session token.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Build output includes `/api/liveblocks-auth`

---

## Base Collaborative Canvas

Spec:

- `context/feature-specs/11-base-canvas.md`

Completed implementation:

- Added `types/canvas.ts`
  - Defines shared `CanvasNode` and `CanvasEdge` types
  - Defines the `canvasNode` and `canvasEdge` custom type identifiers
  - Defines node data with `label`, `color`, and `shape`
  - Defines the documented `NODE_COLORS` palette and default node color
- Added `components/editor/base-canvas.tsx`
  - Client-side Liveblocks and React Flow canvas wrapper
  - Uses `LiveblocksProvider` with `/api/liveblocks-auth`
  - Uses `RoomProvider` with the current project room ID
  - Initializes presence with `cursor: null` and `thinking: false`
  - Uses `ClientSideSuspense` with a simple loading state
  - Adds Liveblocks error handling and a canvas connection fallback
  - Wires `useLiveblocksFlow` with suspense and empty initial nodes/edges
  - Passes synced nodes, edges, and change handlers into `ReactFlow`
  - Enables loose connection behavior, `fitView`, and a dot-pattern background
- Updated `components/editor/editor-shell.tsx`
  - Replaced the workspace canvas placeholder with `BaseCanvas`
  - Kept the existing workspace shell, navbar, share dialog, and AI sidebar
    composition intact
- Updated `app/globals.css`
  - Imports React Flow and Liveblocks React Flow styles globally

Architecture notes:

- `/editor/[roomId]` remains a server component page.
- Liveblocks and React Flow browser interactivity is isolated to the canvas
  client component.
- No canvas controls, custom node/edge rendering, persistence, or AI behavior
  were added.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Build output includes `/editor/[roomId]`

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
- Project API routes from `context/feature-specs/06-project-api.md`
  completed
- Editor home wiring from `context/feature-specs/07-wire-editor-home.md`
  completed
- Share dialog and collaborator management from
  `context/feature-specs/09-share-dialog.md` completed
- Liveblocks setup from `context/feature-specs/10-liveblocks-setup.md`
  completed
- Base canvas from `context/feature-specs/11-base-canvas.md` completed
- Shape panel from `context/feature-specs/12-shape-panel.md` completed
- Node shape rendering from `context/feature-specs/13-node-shape.md`
  completed
- Current canvas UI issue from `context/feature-specs/00-current-issue.md`
  completed
- Canvas shape default size reduction completed
- Node color toolbar from `context/feature-specs/15-nodes-color-toolbar.md`
  completed

---

## Canvas Shape Size Reduction

Completed implementation:

- Reduced the default dimensions in `types/canvas.ts` for all draggable canvas
  shapes
- Kept the existing bottom shape toolbar layout and available shapes unchanged
- Preserved the existing shape proportions:
  - Rectangles and pills remain wider than tall
  - Circles and diamonds remain square
  - Cylinders and hexagons remain compact but readable
- Because the drag payload uses `CANVAS_SHAPE_DEFAULT_SIZES`, both the drag
  preview and the dropped canvas nodes now use the smaller dimensions

Architecture notes:

- Scope remained in the shared canvas type contract.
- No API routes, database schema, blob storage, Trigger.dev workflows,
  persistence behavior, toolbar layout changes, or shape inventory changes were
  introduced.

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Canvas UI Drop Fix

Spec:

- `context/feature-specs/00-current-issue.md`

Completed implementation:

- Removed the React Flow minimap/radar from the canvas surface without adding
  another overview widget
- Hid React Flow's default top-left attribution label shown in the current
  issue screenshot
- Updated shape drop positioning so the created node is centered on the drop
  pointer, matching the drag preview behavior
- Converted the clamped screen-space top-left position through React Flow's
  `screenToFlowPosition()` so zoom and pan are accounted for
- Clamped edge drops to the visible canvas bounds so nodes do not unexpectedly
  jump outside the viewport
- Refined drop positioning to use React Flow node center origin
  (`origin: [0.5, 0.5]`) so the stored node position is the converted drop
  point rather than a manually offset top-left coordinate
- Clamped the dropped node center in screen space before converting to flow
  coordinates, preserving correct placement under pan and zoom while keeping
  new nodes visible
- Kept the bottom shape toolbar, available shapes, drag payloads, and node
  creation contract unchanged

Architecture notes:

- Scope remained inside the client-side canvas component.
- No API routes, database schema, blob storage, Trigger.dev workflows, or
  persistence behavior were added.

Verification:

- `npm run lint` passed
- `npm run build` passed
- The spec-referenced screenshot path `context/screenshots/03-image-spec14.png`
  was not present; `context/screenshots/03-image-spev14.png` was used as the
  available visual reference.

---

## Node Shape Rendering

Spec:

- `context/feature-specs/13-node-shape.md`

Completed implementation:

- Replaced the placeholder custom canvas node renderer with shape-specific
  rendering connected to the existing Liveblocks-backed React Flow node state
- CSS-rendered rectangle, pill, and circle nodes using the existing node color
  palette and token-based borders
- SVG-rendered diamond, hexagon, and cylinder nodes that scale with the stored
  React Flow node dimensions
- Kept node borders subtle at rest and brighter when selected
- Added a cursor-following drag ghost for shape panel drags
  - Uses the dragged shape type and default size from the existing drag payload
  - Hides after drop or drag cancellation
  - Does not change the existing dropped-node creation behavior

Architecture notes:

- Scope remained inside the client-side canvas component.
- No API routes, database schema, blob storage, Trigger.dev workflows, or
  persistence behavior were added.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Browser automation could not be driven because the required in-app browser
  control runtime was unavailable in this session.

---

## Node Editing

Spec:

- `context/feature-specs/14-node-editing.md`

Completed implementation:

- Added resize controls to selected canvas nodes with `NodeResizer`
  - Resize handles and guide lines use existing semantic CSS variables
  - Minimum node size is enforced at 80 by 48 pixels
  - Resize changes flow through React Flow node dimension changes already
    synchronized by `useLiveblocksFlow`
- Added centered inline label editing for canvas nodes
  - Double-clicking the center label area opens a textarea over the label
  - Empty labels show a centered placeholder in the same label position
  - Label updates are written as users type via `reactFlow.updateNodeData`
  - Editing closes on blur or `Escape`
  - Text editing interactions stop propagation and use `nodrag`, `nopan`, and
    `nowheel` classes so the canvas does not drag or pan while editing
  - Editing textarea chrome is visually transparent so selected-node styling
    remains only around the actual node shape
- Selected node shape outlines, resize guide lines, and resize handles use the
  light grey text-secondary token instead of the brand cyan accent
- Kept existing shape rendering, shape panel layout, drag preview behavior, and
  dropped-node creation behavior unchanged

Architecture notes:

- Scope remained inside the client-side canvas component.
- No API routes, database schema, blob storage, Trigger.dev workflows, or
  persistence behavior were added.
- Collaborative canvas state remains owned by Liveblocks through the existing
  React Flow controlled node update path.

Verification:

- `npm run lint` passed
- `npm run build` passed
- A dev server is already running for this project on `http://localhost:3000`
- Signed-out `/editor` smoke check reaches Clerk protection as expected
- Browser automation could not be driven because the in-app browser control
  runtime was unavailable in this session.

---

## Node Connection Handles

Completed implementation:

- Replaced the two top/bottom-only node connection points with four connection
  handles on every canvas node:
  - Top
  - Right
  - Bottom
  - Left
- Handles are positioned by React Flow against the node wrapper, so they remain
  attached to the resized node bounds as width and height change
- Resize minimums are now shape-aware so nodes cannot be shrunk below a size
  where connection handles visually detach from the shape
- Cylinder and hexagon handles use shape-specific offsets so their connection
  points sit on the drawn SVG geometry rather than the outer wrapper bounds
- Connection handles remain mounted for edge positioning but are visually hidden
  and non-interactive until the node is selected or hovered
- Kept `ConnectionMode.Loose`, allowing the four handles to be used naturally
  for drawing connections between shapes
- Kept handle styling token-based and consistent with the dark canvas UI

Architecture notes:

- Scope remained inside the client-side canvas component.
- No API routes, database schema, blob storage, Trigger.dev workflows, or
  persistence behavior were added.

Verification:

- `npm run lint` passed
- `npm run build` passed

---

## Node Color Toolbar

Spec:

- `context/feature-specs/15-nodes-color-toolbar.md`

Completed implementation:

- Added a selected-node floating color toolbar with React Flow `NodeToolbar`
  positioned above the node with a small offset
- Rendered one compact swatch per predefined `NODE_COLORS` background/text
  color pair from `types/canvas.ts`
- Active swatches use the paired text color for border and a tight selected
  glow so the current color pair is clear
- Hovered swatches show a controlled glow based on the paired text color
- Swatch selection updates the node's `data.color` through
  `reactFlow.updateNodeData`, so the existing Liveblocks-backed React Flow
  state updates immediately and remains collaborative
- Existing node rendering continues deriving both fill and text color from the
  selected palette entry, so background and label color update together
- Toolbar interactions use `nodrag`, `nopan`, and stopped pointer/click/wheel
  propagation so choosing a swatch does not drag nodes or pan the canvas

Architecture notes:

- Scope remained inside the client-side canvas component.
- No API routes, database schema, blob storage, Trigger.dev workflows, server
  calls, selection logic changes, drag/drop behavior changes, or full color
  picker behavior were added.
- The predefined color palette remains centralized in `types/canvas.ts` as
  documented by `context/ui-context.md`.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Dev server started successfully on `http://localhost:3000`
- Browser automation could not be driven because the required in-app browser
  JavaScript execution tool was not exposed in this session.

---

## Custom Edge Behavior

Spec:

- `context/feature-specs/16-edge-behavior.md`

Completed implementation:

- Added a custom `canvasEdge` renderer for React Flow edges
  - Uses `getSmoothStepPath()` for right-angle routing
  - Uses the returned label coordinates from `getSmoothStepPath()` for inline
    label placement
  - Keeps visible edge strokes slim while using a wider invisible interaction
    path for easier hover and click targeting
  - Dims edges at rest and brightens them when hovered, selected, or being
    edited
- Updated default edge options for new connections
  - New edges use the `canvasEdge` type
  - New edges include empty label data
  - New edges render with a light rounded stroke and a closed arrowhead marker
- Added inline edge label editing
  - Double-clicking an edge starts label editing
  - The edge label input is rendered through `EdgeLabelRenderer`
  - The input grows based on the current label text length
  - Label edits update edge `data.label` through React Flow edge data updates
    so the existing Liveblocks-backed canvas edge state remains collaborative
- Updated canvas edge typing so `CanvasEdgeData` explicitly owns a string
  `label`
- Adjusted node connection handle styling to the spec's subtle white-dot,
  dark-border treatment while preserving the existing four-sided handle
  behavior

Architecture notes:

- Scope remained inside the client-side canvas component and shared canvas
  types.
- No API routes, database schema, blob storage, Trigger.dev workflows, server
  calls, or persistence behavior were added.
- Existing edges are normalized at render time to the custom canvas edge type so
  older room state still renders through the new custom edge renderer.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Local dev server on `http://localhost:3000` responds for `/editor` and
  redirects signed-out requests through Clerk protection
- Browser automation could not be driven because the required in-app browser
  JavaScript execution tool was not exposed in this session

---

## Shape Panel

Spec:

- `context/feature-specs/12-shape-panel.md`

Completed implementation:

- Added canvas shape constants and default sizes in `types/canvas.ts`
  - Shapes: rectangle, diamond, circle, pill, cylinder, and hexagon
  - Default sizes keep rectangles and pills wider than tall, circles square,
    and diamonds large enough for labels
- Updated `components/editor/base-canvas.tsx`
  - Wraps the synced React Flow canvas in `ReactFlowProvider`
  - Adds a bottom-center floating pill toolbar with draggable icon buttons
  - Writes drag payloads with the shape name and default size
  - Handles canvas dragover and drop events
  - Converts dropped screen coordinates to React Flow canvas coordinates with
    `screenToFlowPosition`
  - Creates new `canvasNode` nodes with an empty label, default node color,
    dragged shape value, default dimensions, and IDs generated from shape name,
    timestamp, and a counter
  - Adds a basic custom canvas node renderer that displays every shape as a
    simple bordered rectangle with centered label text

Architecture notes:

- Scope remained inside the client-side canvas component and shared canvas
  types.
- No API, database, blob storage, Trigger.dev, or persistence strategy changes
  were introduced.

Verification:

- `npm run lint` passed
- `npm run build` passed
- Local dev server starts on `http://localhost:3000`
- Signed-out `/editor` smoke check reaches Clerk protection as expected

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
- `/editor/[roomId]` exists as the server-gated project workspace route
- Editor workspace shell from `context/feature-specs/08-editor-workspace-shell.md`
  completed
- Share dialog from `context/feature-specs/09-share-dialog.md` opens from the
  workspace navbar and uses owner-aware collaborator management APIs
- Liveblocks auth route and room lifecycle helpers are available for future
  canvas connection work
- Project sidebar and right AI sidebar transitions now animate smoothly instead
  of appearing abruptly
- Base Liveblocks-backed React Flow canvas from
  `context/feature-specs/11-base-canvas.md` completed
- Bottom shape panel from `context/feature-specs/12-shape-panel.md` completed
- AI chat remains pending future implementation specs

---

# Next Up

## Phase 1 — Core Foundation

Priority order:

1. Configure environment validation
2. Add blob-backed canvas snapshot persistence when specified
3. Begin Trigger.dev workflow foundations when specified
4. Add canvas controls, custom rendering, or persistence only when specified

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
- Server-gated workspace route with share dialog and collaborator management
- Liveblocks room lifecycle and auth route foundation
- Base Liveblocks-backed React Flow canvas foundation
- Canvas shape rendering, drag preview, resizing, and inline label editing
- Selected-node canvas color toolbar
- Custom canvas edge rendering and inline edge label editing

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
2. Blob-backed canvas snapshot persistence, if specified
3. Trigger.dev workflow foundations, if specified
4. Additional canvas behavior, editing, or persistence only when specified

Project metadata persistence, editor home wiring, workspace shell access,
collaborator sharing, Liveblocks room auth, and the base canvas are complete
for the current Phase 1 scope.

```
