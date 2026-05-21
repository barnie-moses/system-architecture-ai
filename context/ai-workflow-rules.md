# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. Context files define what to build, how to build it, and the current implementation progress. Always implement against these specifications instead of inventing behavior from scratch.

Every feature should map back to a documented requirement, architecture decision, or scoped implementation unit. Prioritize predictable, verifiable progress over speculative expansion.

---

## Scoping Rules

- Work on one feature unit or subsystem at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.
- Keep implementation units independently testable whenever possible.
- Complete and verify the current scope before introducing new abstractions.

---

## When To Split Work

Split an implementation step if it combines:

- UI changes and background task changes
- Real-time canvas state and database persistence
- Multiple unrelated API routes
- Infrastructure setup and feature implementation
- Authentication logic and collaboration logic
- Behavior that is not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad and must be split into smaller implementation units.

---

## Handling Missing Requirements

- Do not invent product behavior that is not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.
- Document assumptions explicitly before implementation.
- Avoid introducing hidden architecture decisions during implementation.

---

## Protected Foundation Components

Do not modify generated third-party foundation components unless explicitly instructed.

This includes:

- `components/ui/*` (shadcn/ui components)
- Third-party library internals
- Generated framework boilerplate
- Vendor-managed configuration defaults

These components should remain reusable and framework-aligned.

Project-specific styling, feature logic, and layout customization must be implemented in application-level components instead of modifying foundation components directly.

Only modify protected files when a task explicitly requires it.

---

## Keeping Docs In Sync

Update the relevant context files whenever implementation changes:

- System architecture or system boundaries
- Storage model decisions
- Real-time synchronization strategies
- API contracts or route structure
- Code conventions or standards
- Feature scope or implementation status
- Background job behavior
- Persistence strategies

Documentation must reflect the actual implementation state, not the intended future state.

---

## Before Moving To The Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture-context.md` has been violated.
3. `progress-tracker.md` reflects the completed implementation work.
4. Relevant documentation has been updated.
5. The implementation is testable and verifiable.
6. `npm run build` passes successfully.
7. No unrelated systems were modified outside the scoped implementation unit.

---

## Development Principles

### Spec-Driven Development

- Implement only behavior defined in the specification files.
- Treat context documents as the source of truth.
- Resolve uncertainty in documentation before writing code.

### Incremental Delivery

- Ship small working units frequently.
- Validate each subsystem independently.
- Avoid broad refactors during active feature implementation.

### Separation of Concerns

- Keep UI, persistence, AI orchestration, and collaboration layers isolated.
- Avoid coupling background workflows directly to UI rendering logic.
- Maintain clear ownership boundaries between subsystems.

### Verification First

- Prefer implementation paths that can be verified quickly.
- Ensure every feature has a clear success condition.
- Avoid speculative architecture without measurable requirements.

---

## Real-Time Collaboration Rules

- Shared canvas state must remain synchronized across connected users.
- Presence indicators and live cursors should not block canvas interactions.
- Real-time updates must degrade gracefully under network instability.
- Persistence should not directly block collaborative editing responsiveness.

---

## AI Generation Rules

- AI-generated output must always map into structured graph data.
- Generated nodes and edges should remain editable by collaborators.
- AI generation workflows should execute as isolated background tasks.
- Generated specifications must reflect the current persisted graph state.

---

## Persistence Rules

- Project metadata, graph state, and generated artifacts must persist independently.
- File generation should not overwrite previous persisted artifacts unless explicitly requested.
- Persistence layers should remain abstracted from UI components.

---

## Documentation Standards

- Use Markdown for all context and specification files.
- Keep naming conventions consistent across files and directories.
- Prefer explicit technical descriptions over vague summaries.
- Document architectural decisions when introducing new boundaries or infrastructure.

```