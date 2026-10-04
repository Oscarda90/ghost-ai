# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Project dialogs

## Current Goal

- Implement `context/feature-specs/04-project-dialogs.md`: editor home screen, Create/Rename/Delete project dialogs, sidebar project actions. Mock data only, no API/persistence.

## In Progress

- Project dialogs (04-project-dialogs.md):
  - [x] Editor home (`components/editor/editor-home.tsx`): centered heading, description, `New Project` button (`Plus`), no cards; opens Create dialog
  - [x] Create Project dialog (`create-project-dialog.tsx`): name input + live slug preview (`lib/slug.ts` `slugify`)
  - [x] Rename Project dialog (`rename-project-dialog.tsx`): prefilled + auto-focused (text selected) input, current name in description, Enter submits (form submit)
  - [x] Delete Project dialog (`delete-project-dialog.tsx`): confirmation only, no input, `variant="destructive"` confirm button
  - [x] Sidebar: mock project list (`lib/mock-projects.ts`, `types/project.ts`); rename/delete icon actions on owned projects only (hover/focus reveal on `md+`, always visible on mobile), none for shared
  - [x] Sidebar mobile: `md:hidden` backdrop scrim, tapping it closes sidebar
  - [x] Dedicated hook `hooks/use-project-dialogs.ts`: dialog state (type + target project), form state (name, slug preview, canSubmit), loading state (simulated 400ms delay); mutations applied to in-memory mock list only
  - [x] Wiring: home New Project → Create, sidebar create → Create, sidebar rename → Rename, sidebar delete → Delete (in `EditorWorkspace`)
  - [x] Verify: `tsc --noEmit`, `eslint .` pass; `slugify` sanity-checked. Not yet verified in browser (needs signed-in session).

## Completed

- Auth (03-auth.md):
  - [x] Install `@clerk/ui`
  - [x] Wrap root layout with `ClerkProvider` using Clerk `dark` theme, appearance variables mapped to app CSS vars (`lib/clerk-appearance.ts`)
  - [x] Sign-in / sign-up pages (`app/sign-in/[[...sign-in]]`, `app/sign-up/[[...sign-up]]`) via shared `components/auth/auth-shell.tsx` — two-panel on `lg+` (logo, tagline, text feature list | centered Clerk form), form-only below
  - [x] `proxy.ts` at root — public routes from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, everything else protected
  - [x] `/` redirects: authed → `/editor`, unauthed → `/sign-in`
  - [x] `UserButton` in editor navbar right section
  - [x] Verify: no hardcoded colors in auth pages, `tsc`, `eslint`, `npm run build` pass; `next start` confirms `/`, `/editor` → 307 `/sign-in`, `/sign-in` + `/sign-up` → 200
  - [x] Auth UI refresh (per user reference screenshot): 50/50 split, left panel `bg-bg-surface` with logo top / headline + description + 3 icon+title+description features / copyright footer; right `bg-bg-base` with centered Clerk form. Clerk `colorBorder` (too dark → invisible at Clerk's 7% alpha) replaced with `colorNeutral: var(--text-primary)` so borders/dividers render. Fonts verified Geist (app + Clerk).
  - [x] `/editor` route: `app/editor/page.tsx` (server) renders `components/editor/editor-workspace.tsx` (client; owns sidebar open state) — navbar + floating project sidebar + center "No project open" empty state. Verified signed in (Clerk dev sign-in token): sign-in → `/editor`, `/` → `/editor`, `UserButton` renders, sidebar toggles.

- Design system & UI primitives (01-design-system.md): shadcn/ui installed and configured (radix-nova style), Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added to `components/ui/`, `lucide-react` installed, `lib/utils.ts` provides `cn()`. Dark theme tokens from `ui-context.md` wired into `app/globals.css` and mapped onto shadcn's semantic CSS variables; `dark` class applied on `<html>` in `app/layout.tsx` since the app is dark-only.

- Editor chrome (02-editor.md):
  - [x] `components/editor/editor-navbar.tsx` — fixed-height (`h-14`) navbar, left/center/right sections, sidebar toggle (`PanelLeftOpen`/`PanelLeftClose`), empty right section, dark bg + subtle bottom border
  - [x] `components/editor/project-sidebar.tsx` — fixed floating overlay (no content push), slides in from left, `isOpen`/`onClose` props, `Projects` header + close button, Tabs (My Projects / Shared) with empty states, full-width `New Project` button with `Plus` icon
  - [x] Dialog pattern — `components/editor/editor-dialog.tsx` (`EditorDialog`): token-styled wrapper over shadcn Dialog with `title`, `description`, `footer` actions (no actual dialogs yet)
  - [x] Verify: no TypeScript errors, no lint errors
  - [x] Mounted in `/editor` via `EditorWorkspace`

## Next Up

- Add the next planned feature unit here.

## Open Questions

- `.env.local` had only the Clerk keys; `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` (Clerk's standard var names) were added so the proxy can read public routes from env. Confirm these match the Clerk dashboard / deploy env.

## Architecture Decisions

- shadcn/ui installed with the `radix-nova` preset (current shadcn CLI major version defaults to a Base UI-based preset; Radix was chosen to match this project's existing conventions). `lib/utils.ts` re-exports `cn` from the official `cn` package (shadcn's new recommended clsx+tailwind-merge replacement) rather than a hand-written implementation.
- Editor chrome components live in `components/editor/`. Sidebar is `position: fixed` below the navbar (`top-17`) and hidden via translate + `inert` when closed. Dialogs compose shadcn primitives through `EditorDialog` rather than editing `components/ui/dialog.tsx`.
- Auth: protected-first `clerkMiddleware` in root `proxy.ts` (Next 16 convention). Clerk appearance = `dark` theme + `variables` set to `var(--token)` from `globals.css`; defined once in `lib/clerk-appearance.ts` and passed to `ClerkProvider`. Clerk components otherwise left default.
- Project dialogs: state lives in `hooks/use-project-dialogs.ts` (also holds the in-memory mock project list until API exists); dialog components are presentational and compose `EditorDialog`. Closing keeps the target project in state so dialog text doesn't flash empty during exit animation. Project shape in `types/project.ts` (`role: "owner" | "collaborator"` drives action visibility).
- App is dark-only: theme tokens live in `:root`/`.dark` (kept identical) in `app/globals.css`, and `<html>` carries a permanent `dark` class rather than a toggle.

## Session Notes

- Verified via `tsc --noEmit`, `npm run build`, and a temporary dev-only route rendered with Playwright (removed after verification) that all 7 components render with the dark palette and no default light styling.
- 02-editor: verified `tsc --noEmit`, `eslint`, and a temporary preview route (removed) via Playwright — sidebar open/close, tabs empty states, dialog with title/description/footer. Fixed self-referential `--font-sans` in `globals.css` (now `var(--font-geist-sans)`, plus `--font-mono`) so Geist actually applies.
