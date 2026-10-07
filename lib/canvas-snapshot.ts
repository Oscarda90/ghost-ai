import { NODE_SHAPES, type CanvasEdge, type CanvasNode } from "@/types/canvas";

/** Persisted canvas state: the node/edge graph without per-client UI state. */
export interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_NODES = 2000;
const MAX_EDGES = 4000;

/**
 * Strips local React Flow state (selection, drag/resize flags, measurements)
 * so the snapshot only changes when the shared diagram does.
 */
export function toCanvasSnapshot(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasSnapshot {
  return {
    nodes: nodes.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ selected, dragging, resizing, measured, ...node }) => node,
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    edges: edges.map(({ selected, ...edge }) => edge),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCanvasNode(value: unknown): value is CanvasNode {
  if (!isRecord(value) || typeof value.id !== "string") return false;
  const { position, data } = value;
  return (
    isRecord(position) &&
    isFiniteNumber(position.x) &&
    isFiniteNumber(position.y) &&
    isRecord(data) &&
    typeof data.label === "string" &&
    typeof data.color === "string" &&
    NODE_SHAPES.includes(data.shape as CanvasNode["data"]["shape"])
  );
}

function isCanvasEdge(value: unknown): value is CanvasEdge {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.source === "string" &&
    typeof value.target === "string"
  );
}

/** Validates an untrusted `{ nodes, edges }` value (request body or stored blob). */
export function parseCanvasSnapshot(value: unknown): ParseResult<CanvasSnapshot> {
  if (!isRecord(value)) return { ok: false, error: "Canvas must be a JSON object" };
  const { nodes, edges } = value;

  if (!Array.isArray(nodes) || nodes.length > MAX_NODES || !nodes.every(isCanvasNode)) {
    return { ok: false, error: "`nodes` must be an array of canvas nodes" };
  }
  if (!Array.isArray(edges) || edges.length > MAX_EDGES || !edges.every(isCanvasEdge)) {
    return { ok: false, error: "`edges` must be an array of canvas edges" };
  }
  return { ok: true, value: { nodes, edges } };
}
