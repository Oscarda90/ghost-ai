"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const LABEL_PLACEHOLDER = "Add label";
/** Invisible stroke width for hover/click; the visible line stays thin. */
const INTERACTION_WIDTH = 24;

/**
 * Renderer for `canvasEdge`: right-angle (smooth-step) path, dimmed at rest and
 * bright when hovered or selected, with an inline label edited on double-click.
 */
export function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;
  const isActive = selected || isEditing;
  const label = data?.label ?? "";

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const startEditing = () => setDraft(label);

  const save = () => {
    if (draft === null) return;
    const next = draft.trim();
    // Emits a `replace` edge change through `onEdgesChange` → Liveblocks Storage.
    if (next !== label) updateEdgeData(id, { label: next });
    setDraft(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur(); // → `save` via onBlur
    }
  };

  // Faint hint only while active; saved labels always show.
  const showLabel = label !== "" || isActive;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={style}
        markerEnd={markerEnd}
        interactionWidth={0}
        data-active={isActive}
        className="opacity-60 transition-opacity data-[active=true]:opacity-100 in-[.react-flow\_\_edge:hover]:opacity-100"
      />
      {/* Own hit area (instead of BaseEdge's) so it can take the double-click; `nopan` stops dblclick zoom. */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={INTERACTION_WIDTH}
        className="react-flow__edge-interaction nopan"
        onDoubleClick={startEditing}
      />
      {showLabel && (
        <EdgeLabelRenderer>
          {/* Midpoint from `getSmoothStepPath`; `nodrag nopan` keeps label clicks/typing off the canvas. */}
          <div
            className="nodrag nopan pointer-events-auto absolute text-xs"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            onDoubleClick={startEditing}
          >
            {isEditing ? (
              // Grid stacks an invisible sizer under the input so the input grows with the text.
              <div className="inline-grid rounded-full border border-brand bg-bg-elevated px-2 py-0.5 text-copy-primary">
                <span className="invisible col-start-1 row-start-1 whitespace-pre">
                  {draft || LABEL_PLACEHOLDER}
                </span>
                <input
                  autoFocus
                  value={draft}
                  placeholder={LABEL_PLACEHOLDER}
                  aria-label="Edge label"
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={save}
                  onFocus={(event) => event.currentTarget.select()}
                  className="nowheel col-start-1 row-start-1 w-full min-w-0 bg-transparent p-0 [font:inherit] text-inherit outline-none placeholder:text-copy-faint"
                />
              </div>
            ) : label ? (
              <div
                className={cn(
                  "rounded-full border bg-bg-elevated px-2 py-0.5 whitespace-pre text-copy-secondary",
                  selected ? "border-brand" : "border-surface-border-subtle",
                )}
              >
                {label}
              </div>
            ) : (
              <div className="rounded-full px-2 py-0.5 text-copy-faint">{LABEL_PLACEHOLDER}</div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
