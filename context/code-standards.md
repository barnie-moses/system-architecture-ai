# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes instead of layering temporary workarounds.
- Do not mix unrelated concerns in a single component, module, or route.
- Respect the system boundaries defined in `architecture-context.md`.
- Prefer explicit behavior over hidden abstractions.
- Keep implementation complexity localized and composable.
- Write code that is predictable, testable, and easy to reason about.

---

## TypeScript

- TypeScript strict mode is required throughout the project.
- Avoid `any`; prefer explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Prefer discriminated unions and typed contracts over loose object structures.
- Export shared types from centralized domain modules.
- Avoid implicit nullable behavior.
- Keep types colocated with the feature or domain they belong to.

---

## Next.js

- Default to React Server Components.
- Add `"use client"` only when browser interactivity, hooks, or real-time state are required.
- Keep route handlers focused on a single responsibility.
- Long-running work belongs in background tasks, not request handlers.
- Avoid unnecessary client-side hydration.
- Fetch data as close to the server boundary as possible.
- Keep server actions and route handlers isolated from UI concerns.

---

## Styling

- Use CSS custom property tokens defined in `globals.css`.
- Do not use raw Tailwind color classes like `zinc-*` or hardcoded hex values.
- Reference tokens through Tailwind utility names such as:
  - `bg-base`
  - `text-copy-primary`
  - `border-surface-border`
  - `text-brand`
- Maintain the border radius scale:
  - `rounded-xl` for small elements
  - `rounded-2xl` for cards
  - `rounded-3xl` for modals
- Maintain consistent spacing and typography scales across the application.
- Prefer reusable layout primitives over duplicated styling patterns.

---

## API Routes

- Validate and parse request input before any business logic runs.
- Enforce authentication and project ownership checks before mutations.
- Return consistent and predictable response shapes.
- Keep route handlers thin and delegate complexity into shared modules or background tasks.
- Avoid embedding business rules directly inside request handlers.
- Use explicit HTTP status codes and typed responses.
- Never trust client-provided identifiers without ownership verification.

---

## Data and Storage

- Project metadata and relationships belong in PostgreSQL through Prisma.
- Canvas snapshots and generated specifications belong in Vercel Blob storage.
- Prisma stores only blob URL references and metadata.
- Do not store large generated content directly in the database.
- Task run records are first-class relational entities.
- Treat ownership and run identifiers as verified security boundaries before token issuance.
- Persist graph state independently from generated specifications.

---

## File Organization

- `lib/`
  - Shared infrastructure utilities
  - Prisma client setup
  - Authentication helpers
  - Shared validation and utility modules

- `trigger/`
  - Durable background tasks
  - AI workflows
  - Async orchestration logic
  - Specification generation workflows

- `components/`
  - UI composition only
  - Presentation-focused React components
  - No business logic or persistence logic

- `app/api/`
  - Route handlers for authentication
  - Triggering background workflows
  - Persistence endpoints
  - External API boundaries

- `app/`
  - Next.js application routes
  - Server components
  - Layout composition

- `features/`
  - Feature-scoped business logic
  - Domain-specific orchestration
  - Shared feature state and contracts

- `types/`
  - Shared TypeScript types and interfaces
  - Domain contracts
  - API schemas

- `styles/`
  - Global styling configuration
  - Design tokens
  - Shared visual primitives

- `prisma/`
  - Prisma schema
  - Database migrations
  - Seed scripts

- `docs/`
  - Architecture documents
  - Context files
  - Progress tracking
  - Technical specifications

---

## Real-Time Collaboration Standards

- Shared canvas updates must remain conflict-safe.
- Presence state should remain lightweight and ephemeral.
- Real-time synchronization must not block persistence workflows.
- Collaborative state updates should remain deterministic.
- Canvas interactions must remain responsive under concurrent edits.

---

## AI Workflow Standards

- AI-generated output must map into typed graph structures.
- AI workflows must remain isolated from UI rendering logic.
- Generated graph nodes and edges must always remain editable.
- Background task execution must be retry-safe and resumable.
- Specification generation must use persisted graph state, not transient UI state.

---

## Security Standards

- Never trust client-provided ownership claims.
- Validate authorization at every mutation boundary.
- Protect background task endpoints against unauthorized triggering.
- Avoid exposing internal storage paths or implementation details.
- Sanitize and validate all external inputs before persistence.

---

## Performance Standards

- Avoid unnecessary client-side rendering.
- Minimize real-time payload sizes.
- Prevent excessive database round trips.
- Lazy load non-critical UI where appropriate.
- Keep long-running workflows outside request-response cycles.

---

## Documentation Standards

- Keep documentation synchronized with implementation changes.
- Prefer explicit technical descriptions over vague summaries.
- Document architectural decisions when boundaries change.
- Update progress tracking after completing implementation units.
- Treat context files as the source of truth for implementation behavior.

```