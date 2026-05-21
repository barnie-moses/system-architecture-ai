<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# AGENTS.md

<!-- START:nextjs-agent-rules -->

# This is NOT the Next.js you know

This project may use framework capabilities, APIs, and file
structures that differ from older training data.

Before implementing anything:

- Read the relevant framework documentation from the installed
  version inside `node_modules/next/dist/`
- Follow current App Router conventions
- Respect server/client component boundaries
- Heed framework deprecation warnings immediately
- Avoid implementing outdated patterns from older Next.js versions

Never assume historical Next.js behavior is still correct.

<!-- END:nextjs-agent-rules -->

---

# Application Building Context

Read the following files in order before implementing
features, architectural changes, or persistence logic.

## Required Reading Order

1. `context/project-overview.md`
   - Product definition
   - Goals
   - Scope
   - Feature expectations

2. `context/architecture-context.md`
   - System structure
   - Layer ownership
   - Boundaries
   - Persistence rules
   - Invariants

3. `context/ui-context.md`
   - Theme system
   - Design language
   - Typography
   - Radius scale
   - Canvas styling
   - Token conventions

4. `context/code-standards.md`
   - Implementation rules
   - TypeScript constraints
   - API standards
   - File organization
   - Styling rules

5. `context/ai-workflow-rules.md`
   - AI orchestration workflow
   - Delivery process
   - Scoping rules
   - Build sequencing

6. `context/progress-tracker.md`
   - Current implementation phase
   - Active work
   - Open questions
   - Next planned steps

---

# Mandatory Development Workflow

## Before Writing Code

You must:

1. Read the relevant context files
2. Verify the implementation respects system boundaries
3. Confirm ownership of the layer you are modifying
4. Validate persistence placement
5. Check whether the feature belongs in:
   - `app/api`
   - `trigger`
   - `lib`
   - `components`
   - `prisma`
   - blob storage

Never begin implementation before understanding the
relevant architectural boundary.

---

# Progress Tracking Rules

Update:

- `context/progress-tracker.md`

after every meaningful implementation change.

Updates should include:

- Current phase
- Completed work
- Work in progress
- Next steps
- Open technical questions
- Important architecture decisions

The progress tracker is the canonical resume point
between implementation sessions.

---

# Context Mutation Rules

If implementation changes:

- architecture
- persistence strategy
- rendering strategy
- ownership model
- system boundaries
- workflow sequencing
- design tokens
- component conventions
- storage model
- code standards

then:

1. Update the relevant context document FIRST
2. Ensure all related documents remain consistent
3. Only continue implementation afterward

Context documents are authoritative.

Implementation must follow the documents —
not the other way around.

---

# Boundary Enforcement

## `app/api`

Owns:

- Validation
- Auth verification
- Ownership checks
- Thin orchestration
- Persistence coordination

Must NOT own:

- Long-running AI execution
- Complex orchestration
- Business-heavy workflows

---

## `trigger`

Owns:

- Durable background jobs
- AI orchestration
- Long-running workflows
- Retries
- Artifact generation

All expensive generation belongs here.

---

## `components`

Owns:

- UI composition
- Presentation
- Interaction surfaces
- Dialogs
- Panels
- Canvas controls

Must NOT own:

- Database logic
- Blob persistence
- Durable workflows
- Heavy orchestration

---

## `lib`

Owns:

- Shared infrastructure
- Prisma helpers
- Validation helpers
- Utility modules
- Shared services
- Shared constants

---

## `prisma`

Owns:

- Schema definitions
- Migrations
- Generated client

---

# Rendering Rules

Default to:

- React Server Components

Use `"use client"` only when required for:

- Browser APIs
- Hooks
- Interactive canvas behavior
- Real-time collaborative state
- Local component state

Do not introduce unnecessary client components.

---

# Persistence Rules

## PostgreSQL

Stores:

- Metadata
- Relationships
- Ownership
- Task runs
- Blob references

Never store:

- Large generated artifacts
- Canvas snapshot payloads
- Large markdown outputs

---

## Vercel Blob

Stores:

- Canvas snapshots
- Generated specs
- Export artifacts
- Large generated outputs

Blob storage is authoritative for generated artifacts.

---

# Collaboration Rules

Liveblocks owns:

- Presence
- Cursors
- Shared transient state
- Real-time synchronization

Durable persistence remains external.

All room token issuance must verify membership first.

---

# Styling Rules

All styling must use:

- CSS custom properties
- Tailwind token mappings

Never introduce:

- Raw Tailwind colors like `zinc-*`
- Hardcoded hex values
- One-off radius systems
- Inconsistent spacing systems

Use only approved tokens from:

- `context/ui-context.md`

---

# API Rules

All API routes must:

- Validate input before logic
- Enforce ownership before mutation
- Return predictable response shapes
- Remain thin

Push complexity into:

- `lib`
- `trigger`
- infrastructure services

---

# Database Rules

The database is authoritative for:

- Ownership
- Relationships
- Metadata
- Task tracking

Blob storage is authoritative for:

- Generated artifacts
- Canvas snapshots
- Markdown outputs

Never blur these responsibilities.

---

# Invariants

The following rules are absolute.

1. Request handlers never execute long-lived AI work.

2. Metadata and large artifacts remain in separate storage layers.

3. Ownership is enforced at every mutation boundary.

4. Client components exist only where interactivity requires them.

5. Canvas schema consistency must be maintained between:
   - imported templates
   - generated content
   - collaborative state
   - persisted snapshots

6. Components remain presentation-focused.

7. Route handlers remain thin orchestration layers.

8. Durable workflows belong exclusively in background execution systems.

9. Generated artifacts must be reproducible from persisted metadata and workflow inputs.

10. Architectural boundaries must remain explicit and enforceable.

---

# Implementation Philosophy

Prefer:

- Small focused modules
- Explicit boundaries
- Predictable ownership
- Durable workflows
- Shared abstractions
- Clear composition

Avoid:

- Hidden coupling
- Layer leakage
- Mixed concerns
- Persistence shortcuts
- Unbounded client state
- Business logic inside UI components

---

# File Organization Philosophy

Name files after:

- responsibility
- behavior
- ownership

Do NOT name files after:

- frameworks
- implementation details
- temporary patterns

Structure should communicate architectural intent.

---

# Final Rule

If uncertain:

- stop implementation
- consult the context files
- resolve the architectural boundary first

Correct structure is more important than implementation speed.

```