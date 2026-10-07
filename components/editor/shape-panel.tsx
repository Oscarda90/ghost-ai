"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useRef, type DragEvent } from "react";

import { NodeShapeFrame } from "@/components/editor/node-shape";
import { SHAPE_DEFAULT_SIZES, SHAPE_DRAG_MIME, serializeShapePayload } from "@/lib/canvas-shapes";
import { DEFAULT_NODE_COLOR, NODE_SHAPES, type NodeShape } from "@/types/canvas";

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

/** Floating bottom-center toolbar of shapes that can be dragged onto the canvas. */
export function ShapePanel() {
  // Off-screen ghost per shape, used as the native drag image. The browser keeps
  // it under the cursor and removes it on drop or cancel.
  const previewRefs = useRef<Partial<Record<NodeShape, HTMLDivElement | null>>>({});

  function handleDragStart(event: DragEvent<HTMLButtonElement>, shape: NodeShape) {
    event.dataTransfer.setData(SHAPE_DRAG_MIME, serializeShapePayload(shape));
    event.dataTransfer.effectAllowed = "move";

    const preview = previewRefs.current[shape];
    if (preview) {
      const { width, height } = SHAPE_DEFAULT_SIZES[shape];
      // Centered on the cursor, matching where the node lands on drop.
      event.dataTransfer.setDragImage(preview, width / 2, height / 2);
    }
  }

  return (
    <>
      <div
        role="toolbar"
        aria-label="Shapes"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-bg-surface/90 p-1.5 shadow-lg backdrop-blur"
      >
        {NODE_SHAPES.map((shape) => {
          const Icon = SHAPE_ICONS[shape];
          return (
            <button
              key={shape}
              type="button"
              draggable
              onDragStart={(event) => handleDragStart(event, shape)}
              aria-label={`Drag ${shape} onto canvas`}
              title={shape}
              className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-bg-subtle hover:text-copy-primary active:cursor-grabbing"
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>

      {/* Drag images must be rendered (not display:none), so park them off-screen. */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px]">
        {NODE_SHAPES.map((shape) => (
          <div
            key={shape}
            ref={(el) => {
              previewRefs.current[shape] = el;
            }}
            className="opacity-70"
            style={SHAPE_DEFAULT_SIZES[shape]}
          >
            <NodeShapeFrame
              shape={shape}
              fill={DEFAULT_NODE_COLOR.fill}
              textColor={DEFAULT_NODE_COLOR.text}
            />
          </div>
        ))}
      </div>
    </>
  );
}
