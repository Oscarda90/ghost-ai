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
import type { DragEvent } from "react";

import { SHAPE_DRAG_MIME, serializeShapePayload } from "@/lib/canvas-shapes";
import { NODE_SHAPES, type NodeShape } from "@/types/canvas";

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

function handleDragStart(event: DragEvent<HTMLButtonElement>, shape: NodeShape) {
  event.dataTransfer.setData(SHAPE_DRAG_MIME, serializeShapePayload(shape));
  event.dataTransfer.effectAllowed = "move";
}

/** Floating bottom-center toolbar of shapes that can be dragged onto the canvas. */
export function ShapePanel() {
  return (
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
  );
}
