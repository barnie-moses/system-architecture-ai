Prisma is already installed. Add the project data models, Prisma client singleton, and first migration.

## Models

Create `prisma/models/project.prisma`.

Add `Project`:

- Owner ID mapped to Clerk User
- name
- optional descriptions
- status enum: `DRAFT`, `ARCHIVE`
- `canvasJsonPath` for future canvas blob storage
- timestamps
- indexes on owner ID and Creation date

Add `ProjectCollaborators`:
- project relation with cascade delete
- collaborator email
- creation timestamp
- unique constraint on project/email
- indexes on email and project/data

Do not add extra fields unless required by prisma

## Prisma Client

Create `lib/prisma.ts` and a cached singleton

Branch by `DATABASE_URL`:

- if it starts with. `prisma+postgres://`, use Accelerate
- otherwise use direct `@prisma/adapter-pg`

Cache the client on the `global` in development for hot reloads.

## Migration

Run the migrations and generate the client.

## Dependencies

Already installed:

- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`


## Check When Done:

- schema has both models with correct relations and indexes
- `lib/prisma.ts` exports one cached Prisma instance
- migration runs successfully
- `npm run build` pass