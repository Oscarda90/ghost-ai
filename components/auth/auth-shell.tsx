import type { ReactNode } from "react";
import { FileText, Ghost, Share2, Sparkles, type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen flex-1 bg-bg-base lg:grid-cols-2">
      <section className="hidden flex-col justify-between border-r border-surface-border bg-bg-surface px-12 py-12 lg:flex xl:px-16">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-bg-base">
            <Ghost className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold text-copy-primary">Ghost AI</span>
        </div>

        <div className="flex max-w-lg flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-copy-primary">
              Design systems at the speed of thought.
            </h1>
            <p className="text-base leading-relaxed text-copy-muted">
              Describe your architecture in plain English. Ghost AI maps it to a shared canvas
              your whole team can refine in real time.
            </p>
          </div>

          <ul className="flex flex-col gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-accent-dim text-brand">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-copy-primary">{title}</span>
                  <span className="text-sm text-copy-muted">{description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-copy-faint">© {new Date().getFullYear()} Ghost AI. All rights reserved.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">{children}</section>
    </main>
  );
}
