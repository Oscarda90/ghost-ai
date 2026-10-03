# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor chrome

## Current Goal

- Implement `context/feature-specs/02-editor.md`: editor navbar, floating project sidebar shell, and reusable dialog pattern.

## Completed

- Design system & UI primitives (01-design-system.md): shadcn/ui installed and configured (radix-nova style), Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added to `components/ui/`, `lucide-react` installed, `lib/utils.ts` provides `cn()`. Dark theme tokens from `ui-context.md` wired into `app/globals.css` and mapped onto shadcn's semantic CSS variables; `dark` class applied on `<html>` in `app/layout.tsx` since the app is dark-only.

- Editor chrome (02-editor.md):
  - [x] `components/editor/editor-navbar.tsx` — fixed-height (`h-14`) navbar, left/center/right sections, sidebar toggle (`PanelLeftOpen`/`PanelLeftClose`), empty right section, dark bg + subtle bottom border
  - [x] `components/editor/project-sidebar.tsx` — fixed floating overlay (no content push), slides in from left, `isOpen`/`onClose` props, `Projects` header + close button, Tabs (My Projects / Shared) with empty states, full-width `New Project` button with `Plus` icon
  - [x] Dialog pattern — `components/editor/editor-dialog.tsx` (`EditorDialog`): token-styled wrapper over shadcn Dialog with `title`, `description`, `footer` actions (no actual dialogs yet)
  - [x] Verify: no TypeScript errors, no lint errors
  - [ ] Not yet mounted in any route — navbar/sidebar wiring lands with the editor workspace page

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- shadcn/ui installed with the `radix-nova` preset (current shadcn CLI major version defaults to a Base UI-based preset; Radix was chosen to match this project's existing conventions). `lib/utils.ts` re-exports `cn` from the official `cn` package (shadcn's new recommended clsx+tailwind-merge replacement) rather than a hand-written implementation.
- Editor chrome components live in `components/editor/`. Sidebar is `position: fixed` below the navbar (`top-17`) and hidden via translate + `inert` when closed. Dialogs compose shadcn primitives through `EditorDialog` rather than editing `components/ui/dialog.tsx`.
- App is dark-only: theme tokens live in `:root`/`.dark` (kept identical) in `app/globals.css`, and `<html>` carries a permanent `dark` class rather than a toggle.

## Session Notes

- Verified via `tsc --noEmit`, `npm run build`, and a temporary dev-only route rendered with Playwright (removed after verification) that all 7 components render with the dark palette and no default light styling.
- 02-editor: verified `tsc --noEmit`, `eslint`, and a temporary preview route (removed) via Playwright — sidebar open/close, tabs empty states, dialog with title/description/footer. Fixed self-referential `--font-sans` in `globals.css` (now `var(--font-geist-sans)`, plus `--font-mono`) so Geist actually applies.
