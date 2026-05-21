Clerk is already installed and connected. Wire it into the Next.js app: provideer, auth pages, redirects, route protection, and user menu.

## Design 

Use Clerk's `@cleark/ui/themes` as the base.

overridr Clerk appearance variable using the apps's existing CSS variables. Do not hardcode colors.

## Sing-in and Sign-up Pages:

- large screen: Siple two-panel layout
- left half : compact logo, tagline, short text-only feature list
- right half: centered Clerk form
- small scrrens:  form only
- no gradients
- not oversized hero sections
- no feature cards
- no scroll-heavy layouts

Keep the layout minimal and professional.


## Implementation

Wrap the root layout with `ClerkProvider` using Clerk's `dark` theme.

Create sign-in and sign-up pages using Clerk components.

Use `proxy.ts` at the project root, not `middleware.ts`.

Definr public routes using the existing sign-in and sign-up env vars. Protect everything else by default.

Update `/`:

- authenticated users redirect to `/editor`
- unauthenticated users redirect to `sign-in`

Use Clerk's Buil-in `UserButton` to the editor navbar right section for profile settings and logout.

Keep Clerk's default user menu and profile flow intact. Do not rebuild or heavily customize Clerk internals.

Use existing Clerks env var. Do not rename or invent new ones.

## Dependecies

install: @clerk/ui

For Clerk's best practices refer to `@clerk.skils` skills.

## Check When Done:
- `proxy.ts` exists at the root
- all routes are protected except public auth paths
- auth pages use CSS variables with not hardcoded colors
- `ClerkProvideer` wraps the root layout
- `npm run build` passes.
