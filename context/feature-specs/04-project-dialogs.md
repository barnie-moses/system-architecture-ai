## Goal

Build the `/editor` home screen and add the project dialogs/sidebars actions. No api calls or persistence yet

## Editor Home

Reuse the existing editor layout. Do not modify the navbar or side bar behavior.

In the center of the page, add:

- heading: `Create a project or Open an existing one`
- description: `Start a new architecture workspace, or choose a project from sidebar.`
- `New Project` button with a `Plus` icon

Keep the layout minimal. Do not wrap this content in cards.

Clicking `New Project` should open the Create Project dialog.

## Dialogs

### Create Project

- project name input
- live slug preview based on the name
- preview updates as the user types
- input name should be verified based on valid slug

### Rename Project

- prefilled project name input
- Current project name shown in the description
- input auto-focuses
- Enter submits

### Delete Project

- destructive confirmation only
- no input
- confirm button uses destructive styling


## Sidebar

Add the project item section:

- rename
- delete

Show actions only for owned projects.

Hide actions for shared/collaborator projects.

On mobile:

- tapping outside the sidebar closes it
- add a backdrop scrim


## Implementation

Create a dedicated hook to manage :

- dialog state
- form state
- loading state

Wire:

- editor home `New Project` -> Create dialog
- sidebar create -> Create dialog
- sidebar rename -> Rename dialog
- sidebar delete -> Delete Dialog

Use mock project data only. Do not add API calls or persistence.

## Check when Done

- sidebar actions are wired
- slug preview works
- no TypeScript errors
- no lint errors

