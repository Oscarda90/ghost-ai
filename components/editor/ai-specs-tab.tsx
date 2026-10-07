import { Download, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Specs tab — static demo card until spec generation exists. */
export function AiSpecsTab() {
  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <Button className="w-full rounded-xl bg-ai text-white hover:bg-ai/90">
        <Sparkles className="h-4 w-4" />
        Generate Spec
      </Button>

      <article className="rounded-xl border border-surface-border bg-bg-elevated p-3">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai/15">
            <FileText className="h-4 w-4 text-ai-text" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-copy-primary">
              E-commerce Backend Spec
            </h3>
            <p className="mt-1 line-clamp-3 text-xs text-copy-muted">
              API gateway routes traffic to catalog, cart, and order services.
              Orders publish events to a queue consumed by payment and
              notification workers. PostgreSQL per service, Redis for sessions.
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="rounded-lg text-copy-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </article>
    </div>
  );
}
