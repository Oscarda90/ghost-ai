"use client";

import type { NodeProps } from "@xyflow/react";

import { DEFAULT_NODE_COLOR, NODE_COLORS, type CanvasNode } from "@/types/canvas";

/**
 * Basic renderer for `canvasNode`: every shape is a bordered rectangle with a
 * centered label. Shape-specific visuals come later.
 */
export function CanvasNodeView({ data, selected }: NodeProps<CanvasNode>) {
  const color = NODE_COLORS.find((c) => c.fill === data.color) ?? DEFAULT_NODE_COLOR;

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-xl border px-3 text-center text-sm ${
        selected ? "border-brand" : "border-surface-border-subtle"
      }`}
      style={{ backgroundColor: color.fill, color: color.text }}
    >
      <span className="break-words">{data.label}</span>
    </div>
  );
}
