"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react/suspense";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { CanvasErrorBoundary } from "@/components/editor/canvas-error-boundary";
import { CanvasFlow } from "@/components/editor/canvas-flow";
import type { CanvasAutosave } from "@/hooks/use-canvas-autosave";

interface CanvasRoomProps {
  roomId: string;
  /** Starter templates modal state; owned by the workspace (opened from the navbar). */
  isTemplatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
  onAutosaveChange: (autosave: CanvasAutosave) => void;
}

/** Connects to the project's Liveblocks room and renders the collaborative canvas. */
export function CanvasRoom({
  roomId,
  isTemplatesOpen,
  onTemplatesOpenChange,
  onAutosaveChange,
}: CanvasRoomProps) {
  return (
    <main className="relative min-h-0 min-w-0 flex-1 bg-bg-base">
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
          <CanvasErrorBoundary fallback={<CanvasError />}>
            <ConnectionErrorGate>
              <ClientSideSuspense fallback={<CanvasLoading />}>
                <CanvasFlow
                  projectId={roomId}
                  isTemplatesOpen={isTemplatesOpen}
                  onTemplatesOpenChange={onTemplatesOpenChange}
                  onAutosaveChange={onAutosaveChange}
                />
              </ClientSideSuspense>
            </ConnectionErrorGate>
          </CanvasErrorBoundary>
        </RoomProvider>
      </LiveblocksProvider>
    </main>
  );
}

/**
 * Room connection failures (auth rejected, no access, room full) don't throw;
 * they surface through the error listener, so swap in the fallback here.
 */
function ConnectionErrorGate({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") setHasError(true);
  });

  return hasError ? <CanvasError /> : children;
}

function CanvasLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-copy-faint" />
      <p className="text-sm text-copy-muted">Loading canvas…</p>
    </div>
  );
}

function CanvasError() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-state-error" />
      <p className="text-sm font-medium text-copy-secondary">Couldn&apos;t connect to the canvas</p>
      <p className="text-xs text-copy-muted">Check your connection and reload the page.</p>
    </div>
  );
}
