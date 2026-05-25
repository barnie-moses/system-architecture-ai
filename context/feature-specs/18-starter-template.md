Add a small starter template library so users can start a canvas from a pre-built diagram instead of building from scratch.

## Implementation

1. Create `components/editor/starter-templates.ts`.

   Include:
   - a `CanvasTemplate` type
   - a `CANVAS_TEMPLATES` array
   - at least three templates, such as microservices, CI/CD pipeline, and event-driven system

   Each template should include:
   - `id`
   - `name`
   - `description`
   - nodes
   - edges

   Use the shared canvas types and existing node color palette. Add small helper functions if needed to keep the template data readable.

2. Create `components/editor/starter-templates-modal.tsx`.

   The modal should:
   - open as a dialog
   - show template cards in a scrollable grid
   - show the template name and description
   - include an import button for each template
   - call `onImport` with the selected template, then close

3. Add a simple diagram preview to each template card.
   - fit the preview to a fixed-size viewport
   - calculate the preview bounds from the template node positions
   - draw edges as simple lines between node centers
   - draw nodes using their shape and color data
   - keep the preview lightweight, no React Flow instance needed

## Scope Limits

- don’t change existing node or edge rendering.
- don’t add a template editing UI.
- don’t change canvas creation outside of template import.
- template previews are read-only.
- keep this focused on template selection, preview, and import only.

## Check When Done

- At least three starter templates exist with names, descriptions, nodes, and edges.
- The starter templates modal opens from the navbar.
- Each template card shows a preview and an import button.
- Clicking import calls `onImport` and creates the template nodes and edges on the canvas.
- Template previews render correctly and fit the fixed-size viewport.
- `npm run build` passes.