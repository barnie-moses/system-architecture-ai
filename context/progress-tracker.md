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
- Context specification finalized
- System boundaries established
- UI design language defined

---

# Current Goal

- Continue the application foundation after completing
  `context/feature-specs/01-design-specs.md`.

Immediate priorities:

1. Establish base layout and editor shell
2. Configure authentication
3. Establish Prisma schema
4. Configure PostgreSQL connection
5. Add protected route middleware
6. Configure environment validation

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

- Not started yet

---

# Next Up

## Phase 1 — Core Foundation

Priority order:

1. Initialize repository structure
2. Configure TypeScript strict mode
3. Establish base layout
4. Configure authentication
5. Establish Prisma schema
6. Configure PostgreSQL connection
7. Add protected route middleware
8. Configure environment validation

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

The project is currently in architecture-finalization stage.

Completed documents:

- `code-standards.md`
- `ui-context.md`
- `architecture-context.md`
- `progress-tracker.md`

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

1. Repository bootstrap
2. Tailwind token setup
3. shadcn/ui initialization
4. Prisma schema creation
5. Clerk integration
6. Base application shell

After foundation setup, begin editor layout implementation.

```
