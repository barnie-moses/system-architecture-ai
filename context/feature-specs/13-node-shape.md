Replace the placeholder node renderer with proper shape rendering and a drag preview.

## Dependencies

- Canvas Type System: provides node shape type definitions and contracts for rectangle, pill, circle, diamond, hexagon, and cylinder shapes, including the shared rendering contracts used by imported templates, generated content, and collaborative canvas updates.

## Implementation

1. Replace the placeholder node shape rendering.
   - rectangle, pill, and circle should use CSS styling
   - diamond, hexagon, and cylinder should render with SVG shapes
   - SVG shapes should scale with node size
   - keep borders subtle at rest and brighter when selected

2. Add a shape drag preview.
   - when dragging a shape from the shape panel, show a ghost preview of that shape
   - keep the preview attached to the cursor while dragging
   - use the same shape type and default size that will be used on drop
   - hide the preview after the shape is dropped or the drag is cancelled
   - keep this limited to drag preview behavior only

3. Keep node rendering connected to the existing collaborative canvas state.
   - validate node shape rendering against a canonical canvas schema for imported templates, generated content, collaborative updates, and persisted snapshots
   - enforce invariants during imports and node edits so shape variants remain consistent across template import, live collaboration, and saved snapshot playback
   - include schema versioning and automatic migration/validation behavior for mismatched schema versions

## Scope Limits

- don't rebuild shape panel layout
- don't change how dropped nodes are created
- don't add resize or label editing yet
- keep drag/drop changes limited to the ghost preview only

## Check When Done

- Nodes render the correct shape variant for each type.
- CSS shapes render correctly for rectangle, pill, and circle.
- SVG shapes render and scale correctly for diamond, hexagon, and cylinder.
- Shape dragging shows a ghost preview matching the dragged shape.
- `npm run build` passes without type errors.