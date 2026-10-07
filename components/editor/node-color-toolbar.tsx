"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { NODE_COLORS, type NodeColor } from "@/types/canvas";

const TOOLBAR_OFFSET = 10;

interface NodeColorToolbarProps {
  isVisible: boolean;
  activeFill: string;
  onSelect: (color: NodeColor) => void;
}

/** Floating swatch row above a selected node; one swatch per palette pair. */
export function NodeColorToolbar({ isVisible, activeFill, onSelect }: NodeColorToolbarProps) {
  return (
    <NodeToolbar isVisible={isVisible} position={Position.Top} offset={TOOLBAR_OFFSET}>
      {/* `nodrag nopan nowheel` keep toolbar interactions off the canvas. */}
      <div
        role="toolbar"
        aria-label="Node color"
        className="nodrag nopan nowheel flex items-center gap-1.5 rounded-full border border-surface-border bg-bg-surface/90 p-1.5 shadow-lg backdrop-blur"
      >
        {NODE_COLORS.map((color) => {
          const isActive = color.fill === activeFill;
          return (
            <button
              key={color.fill}
              type="button"
              aria-label={`Color ${color.text}`}
              aria-pressed={isActive}
              onClick={() => onSelect(color)}
              style={{ "--swatch-fill": color.fill, "--swatch-text": color.text } as CSSProperties}
              className={cn(
                "flex size-5 cursor-pointer items-center justify-center rounded-full border border-(--swatch-text)/50 bg-(--swatch-fill) transition-shadow outline-none",
                "hover:shadow-[0_0_0_1px_var(--swatch-text),0_0_6px_-1px_var(--swatch-text)]",
                "focus-visible:shadow-[0_0_0_1px_var(--swatch-text),0_0_6px_-1px_var(--swatch-text)]",
                isActive && "border-(--swatch-text) ring-2 ring-(--swatch-text) ring-offset-2 ring-offset-bg-surface",
              )}
            >
              {/* Inner dot previews the paired text color. */}
              <span className="size-1.5 rounded-full bg-(--swatch-text)" />
            </button>
          );
        })}
      </div>
    </NodeToolbar>
  );
}
