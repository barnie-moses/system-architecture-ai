We need the base chrome that frame every editor screen - the top navbar and the left sidebar shell. These will be reusedand extended in every chapter that follows.

### Editor Navbar

Create `components/editor/editor-navbar.tsx`.

Requirements:

- fixed-height top navbar
- left, center, and right sections on the top navbar
- left section contains sidebar toggle button
- use `PanelLeftOpen` and `PanelLeftClose` icons based in the sidebar state
- right sectiona stays empty for now
- dark background with subtle bottom border


### Project Sidebar

Create `components/editor/project-sidebar.tsx`.

Requirements:

- Sidebar should float above the editor
- Opening it should not push page content
- slides in from the left
- accepts `isOpen` and `isClosed` props
- shows close button when when the sidebar is opened
- header with `Projects` title + close button
- shadcn `Tabs`
    - My Projects
    - Shared
- both tabs show empty placeholder state
- full-width `New Project` button at the bottom with `plus` icon


### Dialog Pattern

Use the existing color tokens from `globals.css` for dialog styling

support:

- title
- description
- footer actions

Do not build the actual dialogs yet

### Check when done

- new components compile without Typescript errors
- no lint errors
- dialog pattern is ready for future use