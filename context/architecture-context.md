# Architecture Context

## Stack

| Layer            | Technology                     | Role |
| ---------------- | ------------------------------ | ---- |
| Framework        | Next.js 16 + TypeScript        | Full-stack application framework with explicit server/client boundaries |
| UI               | Tailwind CSS + shadcn/ui       | Component composition, styling, and interaction primitives |
| Auth             | Clerk                          | Authentication, user identity, and route protection |
| Database         | Prisma + PostgreSQL            | Relational metadata, ownership, collaborators, specs, and task runs |
| Canvas           | Liveblocks + React Flow        | Real-time collaborative canvas, cursors, and presence |
| Background Tasks | Trigger.dev                    | Durable long-running AI workflows and asynchronous generation |
| Artifact Storage | Vercel Blob                    | Canvas snapshots and generated Markdown specifications |

---

# System Boundaries

## `app/api`

Authenticated request handlers.

Responsibilities:

- Input validation
- Ownership verification
- Route protection
- Task triggering
- Persistence coordination
- Stable API response shapes

Does not own:

- Long-running AI work
- Complex orchestration logic
- UI composition

---

## `trigger`

Durable background jobs and AI workflows.

Responsibilities:

- AI generation pipelines
- Long-running orchestration
- Spec generation
- Canvas processing
- Retry-safe workflows
- Async execution

All expensive or durable work belongs here.

---

## `lib`

Shared infrastructure and reusable system utilities.

Responsibilities:

- Prisma client
- Access control helpers
- Validation helpers
- Shared utilities
- Service abstractions
- Shared constants

Must remain framework-light and reusable.

---

## `components`

UI composition layer.

Responsibilities:

- Canvas surfaces
- Sidebars
- Dialogs
- Panels
- Interactive controls
- Visual composition

Must not contain:

- Database access
- Persistence logic
- Business orchestration
- Durable workflow logic

---

## `prisma`

Database schema and generated Prisma client output.

Responsibilities:

- Schema definitions
- Migrations
- Generated Prisma client

---

## `data`

Legacy local directory.

Status:

- Legacy only
- Not used for new artifacts
- Avoid introducing new persistence logic here

---

# Storage Model

## Database (PostgreSQL via Prisma)

Stores:

- Project metadata
- Ownership
- Collaborators
- Relationships
- Spec records
- Task run records
- Blob references
- Access control state

The database owns metadata and relational state only.

Large generated artifacts must not be stored directly in PostgreSQL.

---

## Vercel Blob

Stores generated artifacts and large outputs.

Examples:

- Canvas snapshots
- Generated Markdown specifications
- Export artifacts

Storage structure:

- `canvas/{projectId}.json`
- `specs/{projectId}/{specId}.md`

The database stores only the blob reference path:

- `canvasJsonPath`
- `filePath`

---

# Auth and Collaboration Model

## Authentication

Authentication is handled through Clerk.

Rules:

- All protected routes require authenticated users
- Session state is verified at mutation boundaries
- Request handlers must validate authenticated identity before access

---

## Ownership Model

Every project has:

- A single owner (`Clerk user ID`)
- Optional collaborators

Ownership is authoritative for all mutations.

---

## Access Control

Rules:

- Only authenticated users may access protected routes
- Only the owner or collaborators may mutate project resources
- Membership must be verified before issuing Liveblocks room tokens
- Ownership checks occur before persistence or task execution

---

# Starter System Designs

## Template System

Prebuilt templates are static canvas snapshots stored in the codebase.

Behavior:

- Templates can be imported during project creation
- Templates can also be imported from inside the editor
- Imported templates are loaded into the active Liveblocks room
- Imported content must conform to the canonical canvas schema

---

# Real-Time Collaboration Model

The collaborative canvas layer is powered by:

- Liveblocks
- React Flow

Capabilities:

- Shared presence
- Cursor synchronization
- Real-time editing
- Shared canvas state

The collaborative layer owns transient collaborative state.

Durable persistence remains external.

---

# API Design Rules

All route handlers must:

- Validate input before executing logic
- Enforce ownership before mutation
- Return predictable response shapes
- Remain thin orchestration layers

Route handlers should delegate complex work to:

- Shared modules
- Trigger.dev workflows
- Infrastructure services

---

# Client/Server Rendering Rules

Default behavior:

- React Server Components first

Use `"use client"` only when required for:

- Browser interactivity
- React hooks
- Live state
- Canvas interactions
- Real-time collaboration

Avoid unnecessary client-side rendering.

---

# Persistence Rules

## Metadata

Metadata belongs in PostgreSQL.

Examples:

- IDs
- Relationships
- Ownership
- Task states
- References

---

## Generated Artifacts

Large artifacts belong in Vercel Blob.

Examples:

- Markdown specs
- Canvas exports
- Snapshots
- Generated documents

Never persist large generated blobs directly in PostgreSQL.

---

# Operational Boundaries

## Request Lifecycle

Request handlers may:

- Validate
- Authorize
- Persist metadata
- Trigger workflows

Request handlers may not:

- Execute long-lived AI work
- Block on durable orchestration
- Run expensive generation pipelines

---

## Background Workflow Lifecycle

Trigger.dev workflows own:

- Durable execution
- AI generation
- Retries
- Long-running orchestration
- Artifact generation

---

# Invariants

These rules are mandatory and must never be violated.

1. Request handlers do not run long-lived AI work — durable workflows own all expensive generation.

2. Metadata and large generated artifacts are stored in separate layers.

3. Auth and ownership are enforced at every mutation boundary.

4. Client components are used only where browser interactivity or real-time state requires them.

5. The canvas schema must remain consistent between user-created content and imported templates.

6. Components remain presentation-focused and do not own business orchestration.

7. Database records are authoritative for ownership and relationships.

8. Blob storage is authoritative for generated artifacts and large outputs.

9. Route handlers remain thin and compositional.

10. Shared infrastructure logic belongs in `lib`, not inside routes or UI components.

11. Canvas collaboration state is transient; durable persistence is externalized.

12. All generated artifacts must be reproducible from durable workflow inputs and persisted metadata.

13. Access tokens for collaborative rooms are issued only after membership verification.

14. All new features must respect the established system boundaries before implementation.
