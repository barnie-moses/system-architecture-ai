Wire the editor sidebar and dialogs to the real project API.

### Data Fetching

The editor home page is server component.

Fetch owned and shared projects server-side using the existing project data and helper and pass both list to the sidebar.

No client-side fetching for initial load.

### `Use Project Actions`

Create a hook in the `hooks/` that manages dialog state and project mutations

**Create**

- manage create dialog state
- manage project name input
- generate a short unique suffix
- slugify the name to create the room ID
- call `POST /api/projects`
- navigate to the new workspace

The project ID and Liveblocks room ID should stay aligned.

**Rename**

- store target project id + current name
- call `PATCH /api/projects/[id]`
- refresh on success

**Delete**

- Store target project
- call `DELETE /api/projects/[id]`
- redirect to `/editor` if deleting the active workspace
- otherwise refresh

### Wiring

Connect the hook to the sidebar and dialogs.

- create dialog shows room ID preview
- rename dialog pre-fills current name
- delete dialog shows project name

## Checks when Done:

- sidebar uses real project data
- Create navigates to workspace
- rename update correctly
- delete refreshes or redirects correctly
- `npm run build` passes.