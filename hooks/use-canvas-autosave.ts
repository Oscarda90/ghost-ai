"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toCanvasSnapshot } from "@/lib/canvas-snapshot";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface CanvasAutosave {
  status: SaveStatus;
  /** Saves immediately (skipping the debounce); undefined while autosave is disabled. */
  saveNow?: () => void;
}

const AUTOSAVE_DELAY_MS = 1500;
const STATUS_RESET_MS = 2000;

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  /** Off until the initial canvas load has finished, so an empty room never overwrites a saved canvas. */
  enabled: boolean;
}

/**
 * Debounced canvas persistence through `PUT /api/projects/[projectId]/canvas`.
 * The canvas present when autosave is enabled is the baseline; only later
 * changes are saved. Saves run one at a time so writes land in order.
 */
export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
}: UseCanvasAutosaveOptions): CanvasAutosave {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const serialized = useMemo(
    () => JSON.stringify(toCanvasSnapshot(nodes, edges)),
    [nodes, edges],
  );

  const latestRef = useRef(serialized);
  /** Last body the server accepted (or the baseline); null until enabled. */
  const savedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  const url = `/api/projects/${projectId}/canvas`;

  const save = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;

    // The running save's loop picks up whatever changed while it was in flight.
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      while (latestRef.current !== savedRef.current) {
        const body = latestRef.current;
        setStatus("saving");
        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (!response.ok) throw new Error(`Save failed (${response.status})`);
        savedRef.current = body;
      }
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [url]);

  useEffect(() => {
    latestRef.current = serialized;
    if (!enabled) return;
    if (savedRef.current === null) {
      savedRef.current = serialized;
      return;
    }
    if (serialized === savedRef.current) return;

    timerRef.current = setTimeout(() => void save(), AUTOSAVE_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [serialized, enabled, save]);

  // Leaving the editor mid-debounce: flush the pending change. `keepalive`
  // lets the request outlive the page (browsers cap such bodies at 64 KB).
  useEffect(
    () => () => {
      const body = latestRef.current;
      if (savedRef.current === null || body === savedRef.current) return;
      void fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    },
    [url],
  );

  // "Saved" / "error" are transient: fall back to idle after a short beat.
  useEffect(() => {
    if (status !== "saved" && status !== "error") return;
    const timer = setTimeout(() => setStatus("idle"), STATUS_RESET_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const saveNow = useCallback(() => void save(), [save]);
  return { status, saveNow: enabled ? saveNow : undefined };
}
