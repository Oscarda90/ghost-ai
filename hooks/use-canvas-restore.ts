"use client";

import { useEffect, useRef, useState } from "react";

import { parseCanvasSnapshot, type CanvasSnapshot } from "@/lib/canvas-snapshot";

/** `loading`: fetching the saved canvas; `ready`: done or skipped; `error`: the fetch failed. */
export type CanvasRestorePhase = "loading" | "ready" | "error";

interface UseCanvasRestoreOptions {
  projectId: string;
  /** Whether the Liveblocks room has no nodes and no edges. */
  isRoomEmpty: boolean;
  /** Writes the saved snapshot into the room. */
  restore: (snapshot: CanvasSnapshot) => void;
}

/**
 * On editor load, fills an empty room from the project's saved canvas
 * (`GET /api/projects/[projectId]/canvas`). A room that already has nodes or
 * edges is live collaboration state and is never overwritten.
 */
export function useCanvasRestore({
  projectId,
  isRoomEmpty,
  restore,
}: UseCanvasRestoreOptions): CanvasRestorePhase {
  // Storage is already loaded (suspense), so the first render knows whether the room is empty.
  const [phase, setPhase] = useState<CanvasRestorePhase>(() =>
    isRoomEmpty ? "loading" : "ready",
  );
  const isRoomEmptyRef = useRef(isRoomEmpty);
  const restoreRef = useRef(restore);

  useEffect(() => {
    isRoomEmptyRef.current = isRoomEmpty;
    restoreRef.current = restore;
  });

  const shouldLoad = phase === "loading";

  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (!response.ok) throw new Error(`Load failed (${response.status})`);
        const { canvas } = (await response.json()) as { canvas: unknown };
        if (cancelled) return;

        const snapshot = canvas === null ? null : parseCanvasSnapshot(canvas);
        // Re-check: a collaborator may have started drawing during the fetch.
        if (snapshot?.ok && isRoomEmptyRef.current) restoreRef.current(snapshot.value);
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [shouldLoad, projectId]);

  return phase;
}
