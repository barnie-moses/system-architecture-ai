Add autosave and loading for the collaborative canvas so project state is persisted before adding AI generation. Canvas JSON should be stored in Vercel Blob, and the saved blob URL should be stored on the Prisma project record.

## What to Install

- `@vercel/blob`

## Implementation

1. Check the existing project schema.
   - review `prisma/model/project.prisma`
   - add or reuse a field for the canvas blob URL
   - keep Prisma responsible for metadata only

2. Add canvas save/load API routes.

   Create: `PUT /api/projects/[projectId]/canvas`

   This route should:
   - receive the latest canvas JSON
   - upload the JSON to Vercel Blob
   - store the returned blob URL on the matching Prisma project record
   - replace the previous blob URL if a newer save exists
   - return the latest saved metadata

   Create: `GET /api/projects/[projectId]/canvas`

   This route should:
   - read the project’s saved blob URL from Prisma
   - fetch the saved canvas JSON from Vercel Blob
   - return the canvas state to the editor
   - return an empty state if no saved canvas exists yet

3. Add an autosave hook in the `/hooks` folder.
   - watch the canvas nodes and edges
   - debounce saves to avoid excessive writes
   - save through the canvas API route
   - track save status: saving, saved, error
   - avoid duplicate saves when state has not changed
   - prevent autosave from firing during the initial canvas load

4. Load saved canvas state in the editor.
   - when the editor loads, check if the Liveblocks room has any existing nodes or edges
   - if the room is empty and the project has a saved canvas blob URL, fetch and load the saved canvas state
   - if the room already has nodes or edges, skip the load entirely to avoid overwriting active collaboration
   - hydrate both nodes and edges into the existing collaborative canvas state
   - keep loading behavior scoped to the editor room only

5. Add a small save status indicator in the editor Save button.
   - show saving, saved, or error states
   - keep the UI subtle and consistent with the dark editor theme
   - do not introduce toast spam for successful autosaves

6. Add lightweight save protections.
   - prevent overlapping save requests
   - handle temporary network failures gracefully
   - retry failed saves with a short backoff
   - avoid blocking editor interactions while saving

## Storage Pattern

- Prisma stores project metadata and the canvas blob URL.
- Vercel Blob stores the actual canvas JSON.
- Liveblocks remains responsible for real-time collaboration state only.

## Scope Limits

- don't add AI generation yet
- don't move canvas state fully into Prisma
- don't replace Liveblocks collaboration
- don't add full project version history yet
- don't add manual save slots or restore UI
- don't persist exported PNG or PDF files

## Check When Done

- Canvas state autosaves automatically.
- Saved canvas JSON is stored in Vercel Blob.
- Prisma stores the saved blob URL.
- Existing saved canvases load correctly.
- Active collaboration is not overwritten during load.
- Save status appears in the editor UI.
- Failed saves recover gracefully.
- `npm run build` passes without type errors.
