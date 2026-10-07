import type { Edge, Node } from "@xyflow/react";

/** Supported node shapes (see `ui-context.md` → Node Shapes). */
export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type NodeShape = (typeof NODE_SHAPES)[number];

export interface NodeColor {
  /** Dark node fill. */
  fill: string;
  /** Contrasting label color. */
  text: string;
}

/** Node color palette (see `ui-context.md` → Node Color Palette). First entry is the default. */
export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const satisfies readonly NodeColor[];

export const DEFAULT_NODE_COLOR: NodeColor = NODE_COLORS[0];

export interface ShapeSize {
  width: number;
  height: number;
}

/** Data carried by a shape dragged from the shape panel onto the canvas. */
export interface ShapeDragPayload {
  shape: NodeShape;
  size: ShapeSize;
}

// `type` (not `interface`): React Flow requires node data to be assignable to
// `Record<string, unknown>`, which interfaces are not.
export type CanvasNodeData = {
  label: string;
  /** Node fill color. */
  color: string;
  shape: NodeShape;
};

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">;
