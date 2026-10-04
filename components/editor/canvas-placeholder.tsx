import { LayoutGrid } from "lucide-react";

interface CanvasPlaceholderProps {
  roomId: string;
}

/** Stand-in for the collaborative canvas; fills the remaining workspace space. */
export function CanvasPlaceholder({ roomId }: CanvasPlaceholderProps) {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-2 bg-bg-base px-4 text-center">
      <LayoutGrid className="h-8 w-8 text-copy-faint" />
      <p className="text-sm font-medium text-copy-secondary">Canvas coming soon</p>
      <p className="font-mono text-xs text-copy-faint">{roomId}</p>
    </main>
  );
}
