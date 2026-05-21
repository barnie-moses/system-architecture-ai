# UI Context

## Theme

Dark mode only. No light mode support.

The visual language is a dark technical workspace designed for focused building, graph editing, and AI-assisted workflows.

Core characteristics:

- Near-black layered backgrounds
- Elevated panels and surfaces
- Bright accent colors for interactivity
- Soft borders with subtle separation
- High readability on dark canvases
- Minimal visual noise
- Strong spatial hierarchy through surface depth

All colors are defined as CSS custom properties in `globals.css` and mapped into Tailwind tokens using `@theme inline`.

Components must use semantic tokens only.

Do not use:

- Hardcoded hex values
- Raw Tailwind palette classes such as `zinc-*`
- Ad-hoc inline color styling

---

# Colors

## Surface Tokens

| Role              | CSS Variable             | Hex / Value           |
| ----------------- | ------------------------ | --------------------- |
| Page background   | `--bg-base`              | `#080809`             |
| Surface            | `--bg-surface`          | `#111114`             |
| Elevated surface   | `--bg-elevated`         | `#18181c`             |
| Subtle surface     | `--bg-subtle`           | `#1e1e23`             |
| Default border     | `--border-default`      | `#2a2a30`             |
| Subtle border      | `--border-subtle`       | `#3a3a42`             |

---

## Text Tokens

| Role            | CSS Variable         | Hex / Value |
| --------------- | -------------------- | ------------ |
| Primary text    | `--text-primary`     | `#f0f0f4`    |
| Secondary text  | `--text-secondary`   | `#c0c0cc`    |
| Muted text      | `--text-muted`       | `#808090`    |
| Faint text      | `--text-faint`       | `#505060`    |

---

## Accent Tokens

| Role            | CSS Variable               | Hex / Value               |
| --------------- | -------------------------- | ------------------------- |
| Brand accent    | `--accent-primary`         | `#00c8d4`                 |
| Brand dim       | `--accent-primary-dim`     | `rgba(0, 200, 212, 0.12)` |
| AI accent       | `--accent-ai`              | `#6457f9`                 |
| AI text         | `--accent-ai-text`         | `#8b82ff`                 |

---

## State Tokens

| Role    | CSS Variable       | Hex / Value |
| ------- | ------------------ | ------------ |
| Error   | `--state-error`    | `#ff4d4f`    |
| Success | `--state-success`  | `#34d399`    |
| Warning | `--state-warning`  | `#fbbf24`    |

---

## Tailwind Utility Mapping

Tailwind utility names map directly to these semantic tokens.

Use semantic utility classes such as:

- `bg-base`
- `bg-surface`
- `bg-elevated`
- `text-copy-primary`
- `text-copy-muted`
- `border-surface-border`
- `text-brand`
- `bg-accent-dim`

Do not use raw palette classes such as:

- `zinc-*`
- `slate-*`
- `gray-*`

---

# Typography

Both fonts are loaded using `next/font/google` and attached as CSS variables on the root `<html>` element.

The base `<body>` uses Geist Sans with antialiasing enabled.

| Role      | Font        | CSS Variable         |
| ----------| ------------ | -------------------- |
| UI text   | Geist Sans  | `--font-geist-sans`  |
| Code/mono | Geist Mono  | `--font-geist-mono`  |

---

# Border Radius

Radius increases with surface depth.

Smaller interactive elements use tighter radii.
Larger containers and overlays use softer, more pronounced rounding.

| Context            | Class           |
| ------------------ | --------------- |
| Inline / small UI  | `rounded-xl`    |
| Cards / panels     | `rounded-2xl`   |
| Modals / overlays  | `rounded-3xl`   |

---

# Canvas

## Node Color Palette

The canvas uses 8 predefined node color pairs.

Each pair defines:

- A dark node fill color
- A vivid contrasting text color
- Readability optimized for dark mode

Defined in:

- `types/canvas.ts`
- `NODE_COLORS`

---

## Node Colors

| Node Fill | Text Color | Character |
| ---------- | ----------- | ---------- |
| `#1F1F1F` | `#EDEDED` | Neutral dark (default) |
| `#10233D` | `#52A8FF` | Blue |
| `#2E1938` | `#BF7AF0` | Purple |
| `#331B00` | `#FF990A` | Orange |
| `#3C1618` | `#FF6166` | Red |
| `#3A1726` | `#F75F8F` | Pink |
| `#0F2E18` | `#62C073` | Green |
| `#062822` | `#0AC7B4` | Teal |

Default node color:

- Fill: `#1F1F1F`
- Text: `#EDEDED`

---

# Component Library

The UI stack uses:

- Next.js
- Tailwind CSS
- shadcn/ui
- Lucide React

## Rules

- Components live in `components/ui/`
- Use the shadcn CLI to add components
- Do not rewrite existing foundation primitives
- Extend behavior through composition
- Keep business logic outside reusable UI primitives

---

# Layout Patterns

## Editor Layout

Full viewport workspace layout:

- Left sidebar
- Center canvas/editor surface
- Right contextual inspector/sidebar

---

## Sidebars

- Fixed width
- Full-height columns
- Surface background
- Border separator
- Independent scrolling regions

---

## Canvas Area

- Occupies remaining viewport space
- Supports pan and zoom
- Dark infinite workspace aesthetic
- Minimal chrome and distractions

---

## Panels and Cards

- Use elevated surfaces
- `rounded-2xl`
- Soft borders
- Layered depth hierarchy

---

## Modals

- Centered overlays
- Backdrop blur
- `rounded-3xl`
- Elevated surface background
- Focus-trapped interactions

---

## Navbar

- Top-aligned workspace bar
- Bottom border separator
- Persistent navigation and actions
- Compact vertical spacing

---

# Icons

Uses Lucide React exclusively.

## Icon Rules

- Stroke-based icons only
- Consistent visual weight
- No filled icon sets
- Match surrounding typography scale

## Icon Sizes

| Usage Context | Class      |
| ------------- | ---------- |
| Inline text   | `h-4 w-4`  |
| Buttons       | `h-5 w-5`  |
| Large actions | `h-6 w-6`  |

---

# Motion and Interaction

## Motion Principles

- Motion should reinforce hierarchy and feedback
- Avoid decorative or excessive animation
- Favor subtle opacity and transform transitions

## Standard Motion

- Fast hover transitions
- Smooth panel expansion
- Fade + scale modal entry
- Soft drag and canvas interactions

## Avoid

- Bouncy animations
- Overscaled transforms
- Long easing durations
- Distracting motion loops

---

# Accessibility

- Maintain strong contrast ratios across all surfaces
- Interactive states must remain visually obvious
- Focus states should use accent outlines
- Keyboard navigation must work across all workflows
- Avoid relying solely on color to communicate state

---

# UI Invariants

The following rules are mandatory across the system:

- Dark mode only
- Semantic color tokens only
- No raw Tailwind palette usage
- No hardcoded colors
- Surface hierarchy must remain visually consistent
- Business logic must remain outside UI primitives
- Shared UI primitives remain reusable and framework-agnostic

```