"use client";

import { Handle, NodeResizer, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";

import { NodeColorToolbar } from "@/components/editor/node-color-toolbar";
import { NodeShapeFrame } from "@/components/editor/node-shape";
import { cn } from "@/lib/utils";
import { DEFAULT_NODE_COLOR, NODE_COLORS, type CanvasEdge, type CanvasNode } from "@/types/canvas";

const MIN_NODE_WIDTH = 60;
const MIN_NODE_HEIGHT = 40;
const LABEL_PLACEHOLDER = "Add label";
const HANDLE_POSITIONS = [Position.Top, Position.Right, Position.Bottom, Position.Left] as const;

/**
 * Renderer for `canvasNode`: shape variant from `data.shape`, centered label,
 * connection handles on all sides (revealed on hover), resize handles + color
 * toolbar when selected, and inline label editing on double-click.
 */
export function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const color = NODE_COLORS.find((c) => c.fill === data.color) ?? DEFAULT_NODE_COLOR;
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  // Local draft keeps the caret stable while each keystroke syncs to Liveblocks.
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;
  const text = isEditing ? draft : data.label;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
    // Emits a `replace` node change through `onNodesChange` → Liveblocks Storage.
    updateNodeData(id, { label: event.target.value });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(null);
    }
  };

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        handleClassName="size-2! rounded-xs! border-brand! bg-bg-elevated!"
        lineClassName="border-brand/40!"
      />
      <NodeColorToolbar
        isVisible={selected}
        activeFill={color.fill}
        // Text color is derived from the fill's palette pair, so one update changes both.
        onSelect={(next) => updateNodeData(id, { color: next.fill })}
      />
      <NodeShapeFrame shape={data.shape} fill={color.fill} textColor={color.text} selected={selected}>
        {/* `nopan` stops double-click from zooming the canvas. */}
        <div className="nopan relative w-full" onDoubleClick={() => setDraft(data.label)}>
          {/* Sizes the label box; hidden under the textarea while editing so nothing shifts. */}
          <span
            className={cn(
              "block whitespace-pre-wrap wrap-break-word",
              isEditing && "invisible",
              !text && !isEditing && "opacity-50",
            )}
          >
            {text || (isEditing ? "" : LABEL_PLACEHOLDER)}
            {/* Zero-width space keeps the box one line tall when empty or ending in a newline. */}
            {isEditing && "​"}
          </span>
          {isEditing && (
            <textarea
              autoFocus
              value={draft}
              placeholder={LABEL_PLACEHOLDER}
              aria-label="Node label"
              rows={1}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setDraft(null)}
              onFocus={(event) => {
                const end = event.currentTarget.value.length;
                event.currentTarget.setSelectionRange(end, end);
              }}
              className="nodrag nopan nowheel absolute inset-0 m-0 resize-none overflow-hidden border-0 bg-transparent p-0 text-center wrap-break-word [font:inherit] text-inherit outline-none placeholder:text-current placeholder:opacity-50"
            />
          )}
        </div>
      </NodeShapeFrame>
      {/* All `source` handles: `ConnectionMode.Loose` lets any handle connect to any other. */}
      {HANDLE_POSITIONS.map((position) => (
        <Handle
          key={position}
          id={position}
          type="source"
          position={position}
          className="size-2! border-bg-base! bg-edge! opacity-0 transition-opacity in-[.react-flow\_\_node:hover]:opacity-100"
        />
      ))}
    </>
  );
}
