import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  type CanvasNode,
  type NodeShape,
  type ShapeDragPayload,
  type ShapeSize,
} from "@/types/canvas";

/** Drag-and-drop MIME type for shape payloads (shape panel → canvas). */
export const SHAPE_DRAG_MIME = "application/x-canvas-shape";

/** Default node size per shape, in canvas units. */
export const SHAPE_DEFAULT_SIZES: Record<NodeShape, ShapeSize> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 140, height: 140 },
  circle: { width: 100, height: 100 },
  pill: { width: 160, height: 60 },
  cylinder: { width: 120, height: 100 },
  hexagon: { width: 140, height: 100 },
};

export function serializeShapePayload(shape: NodeShape): string {
  const payload: ShapeDragPayload = { shape, size: SHAPE_DEFAULT_SIZES[shape] };
  return JSON.stringify(payload);
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Parses a dropped shape payload; returns `null` for anything that isn't one. */
export function parseShapePayload(raw: string): ShapeDragPayload | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== "object" || value === null) return null;
  const { shape, size } = value as Record<string, unknown>;
  if (!NODE_SHAPES.includes(shape as NodeShape)) return null;
  if (typeof size !== "object" || size === null) return null;
  const { width, height } = size as Record<string, unknown>;
  if (!isPositiveNumber(width) || !isPositiveNumber(height)) return null;

  return { shape: shape as NodeShape, size: { width, height } };
}

let nodeIdCounter = 0;

/** Node ID from shape name, timestamp, and a per-session counter. */
export function createNodeId(shape: NodeShape): string {
  nodeIdCounter += 1;
  return `${shape}-${Date.now()}-${nodeIdCounter}`;
}

/** New canvas node with an empty label and the default color, centered on `center`. */
export function createShapeNode(
  { shape, size }: ShapeDragPayload,
  center: { x: number; y: number },
): CanvasNode {
  return {
    id: createNodeId(shape),
    type: "canvasNode",
    position: { x: center.x - size.width / 2, y: center.y - size.height / 2 },
    width: size.width,
    height: size.height,
    data: { label: "", color: DEFAULT_NODE_COLOR.fill, shape },
  };
}
