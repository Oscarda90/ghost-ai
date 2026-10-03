import { dark } from "@clerk/ui/themes";

/** Clerk dark theme with variables mapped onto the app's CSS tokens (see app/globals.css). */
export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorBackground: "var(--bg-surface)",
    colorForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorInput: "var(--bg-elevated)",
    colorInputForeground: "var(--text-primary)",
    // Clerk derives borders/dividers as low-alpha tints of the neutral color.
    colorNeutral: "var(--text-primary)",
    colorRing: "var(--accent-primary)",
    fontFamily: "var(--font-geist-sans)",
    borderRadius: "var(--radius)",
  },
};
