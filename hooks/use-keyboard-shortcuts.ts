"use client";

import type { ReactFlowInstance } from "@xyflow/react";
import { useEffect } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export const ZOOM_ANIMATION_MS = 200;

type KeyboardShortcutOptions = {
  flow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  onUndo: () => void;
  onRedo: () => void;
};

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/** Window-level canvas shortcuts: zoom (`+`/`=`, `-`) and history (Mod+Z, Mod+Shift+Z, Mod+Y). */
export function useKeyboardShortcuts({ flow, onUndo, onRedo }: KeyboardShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && !event.altKey) {
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) onRedo();
          else onUndo();
        } else if (key === "y" && !event.shiftKey) {
          event.preventDefault();
          onRedo();
        }
        return;
      }

      // Unmodified only, so the browser's own Ctrl/Cmd +/- page zoom still works.
      if (event.altKey) return;
      if (key === "+" || key === "=") {
        event.preventDefault();
        void flow.zoomIn({ duration: ZOOM_ANIMATION_MS });
      } else if (key === "-") {
        event.preventDefault();
        void flow.zoomOut({ duration: ZOOM_ANIMATION_MS });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flow, onUndo, onRedo]);
}
