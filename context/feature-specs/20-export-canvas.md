```md
Add export controls so users can download the current canvas as a PNG image or PDF.

## Implementation

1. Add an export button to the editor navbar.
   - place it near the existing Templates, Share, and AI actions
   - use the same pill/button style as the other navbar actions
   - label it `Export`
   - clicking it opens a small menu with:
     - Download PNG
     - Download PDF

2. Export only the canvas content.
   - include visible nodes and edges
   - include node colors, labels, shapes, and edge labels
   - do not include the navbar, shape toolbar, zoom controls, avatars, or Liveblocks badge
   - do not include the dark dotted canvas background unless needed for readability

3. PNG export behavior.
   - generate a clean image of the current diagram
   - fit the exported image bounds around all nodes and edges with padding
   - preserve the current visual styling of nodes and edges
   - download the file as `<project-name>-canvas.png`

4. PDF export behavior.
   - generate a PDF containing the current diagram
   - fit the diagram neatly on the PDF page with padding
   - use landscape orientation by default
   - download the file as `<project-name>-canvas.pdf`

5. Handle empty canvases.
   - if there are no nodes, show a small message saying there is nothing to export
   - do not download a blank file

## Scope Limits

- don’t change canvas editing behavior
- don’t change node or edge rendering
- don’t add server-side export logic
- don’t save exports to the database
- keep export fully client-side for now

## Check When Done

- Export button appears in the editor navbar.
- Users can download the canvas as PNG.
- Users can download the canvas as PDF.
- Exported files include only the diagram content.
- Empty canvases do not export blank files.
- `npm run build` passes without type errors.
