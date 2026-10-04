import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4 bg-bg-base px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-bg-surface">
        <Lock className="h-8 w-8 text-copy-muted" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-copy-primary">Access denied</h1>
        <p className="max-w-sm text-sm text-copy-muted">
          This project doesn&apos;t exist or you don&apos;t have permission to open it.
        </p>
      </div>
      <Button asChild variant="outline" className="rounded-xl">
        <Link href="/editor">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </Button>
    </main>
  );
}
