import { Position } from "@xyflow/react";

import { SHAPE_DEFAULT_SIZES } from "@/lib/canvas-shapes";
import { NODE_COLORS, type CanvasEdge, type CanvasNode, type NodeShape } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

type ColorName = "gray" | "blue" | "purple" | "orange" | "red" | "pink" | "green" | "teal";

// Names for `NODE_COLORS` entries, in palette order.
const COLOR_INDEX: Record<ColorName, number> = {
  gray: 0,
  blue: 1,
  purple: 2,
  orange: 3,
  red: 4,
  pink: 5,
  green: 6,
  teal: 7,
};

/** Template node at its shape's default size, centered on (`x`, `y`). */
function node(
  id: string,
  label: string,
  shape: NodeShape,
  color: ColorName,
  x: number,
  y: number,
): CanvasNode {
  const { width, height } = SHAPE_DEFAULT_SIZES[shape];
  return {
    id,
    type: "canvasNode",
    position: { x: x - width / 2, y: y - height / 2 },
    width,
    height,
    data: { label, color: NODE_COLORS[COLOR_INDEX[color]].fill, shape },
  };
}

interface EdgeOptions {
  label?: string;
  from?: Position;
  to?: Position;
}

/** Template edge; connects `source`'s right handle to `target`'s left handle by default. */
function edge(
  source: string,
  target: string,
  { label, from = Position.Right, to = Position.Left }: EdgeOptions = {},
): CanvasEdge {
  return {
    id: `${source}-${target}`,
    type: "canvasEdge",
    source,
    target,
    sourceHandle: from,
    targetHandle: to,
    data: label ? { label } : {},
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "Client traffic routed through an API gateway to services with their own databases.",
    nodes: [
      node("client", "Client", "pill", "gray", 0, 200),
      node("gateway", "API Gateway", "rectangle", "blue", 260, 200),
      node("auth", "Auth Service", "rectangle", "purple", 520, 40),
      node("orders", "Order Service", "rectangle", "orange", 520, 200),
      node("users", "User Service", "rectangle", "green", 520, 360),
      node("auth-db", "Auth DB", "cylinder", "purple", 780, 40),
      node("orders-db", "Orders DB", "cylinder", "orange", 780, 200),
      node("users-db", "Users DB", "cylinder", "green", 780, 360),
    ],
    edges: [
      edge("client", "gateway", { label: "HTTPS" }),
      edge("gateway", "auth"),
      edge("gateway", "orders"),
      edge("gateway", "users"),
      edge("auth", "auth-db"),
      edge("orders", "orders-db"),
      edge("users", "users-db"),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description: "Commit to production: build, test, a quality gate, and staged deployments.",
    nodes: [
      node("commit", "Commit", "circle", "gray", 0, 100),
      node("build", "Build", "rectangle", "blue", 220, 100),
      node("test", "Test", "rectangle", "purple", 440, 100),
      node("gate", "Checks pass?", "diamond", "orange", 660, 100),
      node("staging", "Deploy Staging", "rectangle", "teal", 880, 100),
      node("production", "Deploy Production", "rectangle", "green", 1100, 100),
      node("notify", "Notify Team", "hexagon", "red", 660, 320),
    ],
    edges: [
      edge("commit", "build"),
      edge("build", "test"),
      edge("test", "gate"),
      edge("gate", "staging", { label: "yes" }),
      edge("staging", "production", { label: "approve" }),
      edge("gate", "notify", { label: "no", from: Position.Bottom, to: Position.Top }),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Producers publish events to a bus; independent consumers react and persist them.",
    nodes: [
      node("order-service", "Order Service", "rectangle", "blue", 0, 80),
      node("payment-service", "Payment Service", "rectangle", "blue", 0, 280),
      node("event-bus", "Event Bus", "hexagon", "orange", 280, 180),
      node("email-worker", "Email Worker", "rectangle", "purple", 560, 20),
      node("analytics", "Analytics", "rectangle", "teal", 560, 180),
      node("shipping", "Shipping", "rectangle", "green", 560, 340),
      node("event-store", "Event Store", "cylinder", "gray", 820, 180),
    ],
    edges: [
      edge("order-service", "event-bus", { label: "OrderPlaced" }),
      edge("payment-service", "event-bus", { label: "PaymentCaptured" }),
      edge("event-bus", "email-worker"),
      edge("event-bus", "analytics"),
      edge("event-bus", "shipping"),
      edge("analytics", "event-store"),
    ],
  },
];

/**
 * Copy of a template's nodes and edges with IDs unique to this import, so a
 * re-import never collides with nodes/edges another client is still editing.
 */
export function instantiateTemplate(template: CanvasTemplate): {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
} {
  const prefix = `${template.id}-${Date.now()}`;
  const scoped = (id: string) => `${prefix}-${id}`;

  return {
    nodes: template.nodes.map((item) => ({ ...item, id: scoped(item.id), data: { ...item.data } })),
    edges: template.edges.map((item) => ({
      ...item,
      id: scoped(item.id),
      source: scoped(item.source),
      target: scoped(item.target),
      data: { ...item.data },
    })),
  };
}
