"use client";

import { useCanRedo, useCanUndo, useRedo, useRoom, useUndo } from "@liveblocks/react/suspense";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, type DragEvent } from "react";

import { CanvasControls } from "@/components/editor/canvas-controls";
import { CanvasEdgeView } from "@/components/editor/canvas-edge";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import { instantiateTemplate, type CanvasTemplate } from "@/components/editor/starter-templates";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { ZOOM_ANIMATION_MS, useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { SHAPE_DRAG_MIME, createShapeNode, parseShapePayload } from "@/lib/canvas-shapes";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

// Module-level so React Flow doesn't see a new object every render.
const nodeTypes: NodeTypes = { canvasNode: CanvasNodeView };
const edgeTypes: EdgeTypes = { canvasEdge: CanvasEdgeView };

const EDGE_COLOR = "var(--edge-default)";

// Merged into each new connection by React Flow before `onConnect`, so these
// are stored with the edge in Liveblocks.
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "canvasEdge",
  style: { stroke: EDGE_COLOR, strokeWidth: 1.5, strokeLinecap: "round" },
  markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR, width: 16, height: 16 },
};

interface CanvasFlowProps {
  isTemplatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
}

/** React Flow canvas whose nodes and edges are synced through Liveblocks Storage. */
export function CanvasFlow(props: CanvasFlowProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner {...props} />
    </ReactFlowProvider>
  );
}

function CanvasFlowInner({ isTemplatesOpen, onTemplatesOpenChange }: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });
  const flow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition } = flow;
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const room = useRoom();
  const fitViewPendingRef = useRef(false);

  useKeyboardShortcuts({ flow, onUndo: undo, onRedo: redo });

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const payload = parseShapePayload(event.dataTransfer.getData(SHAPE_DRAG_MIME));
      if (!payload) return;
      event.preventDefault();

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      onNodesChange([{ type: "add", item: createShapeNode(payload, position) }]);
    },
    [screenToFlowPosition, onNodesChange],
  );

  // Replaces the canvas: deletes every node/edge, then adds the template's.
  // Note: `remove` changes are no-ops in `useLiveblocksFlow`; deletion goes
  // through `onDelete`. One batch → one undo step, one update for other clients.
  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      const imported = instantiateTemplate(template);
      room.batch(() => {
        onDelete({ nodes, edges });
        onNodesChange(imported.nodes.map((item) => ({ type: "add", item })));
        onEdgesChange(imported.edges.map((item) => ({ type: "add", item })));
      });
      fitViewPendingRef.current = true;
    },
    [room, nodes, edges, onDelete, onNodesChange, onEdgesChange],
  );

  // Fit once the imported nodes have reached React Flow.
  useEffect(() => {
    if (!fitViewPendingRef.current) return;
    fitViewPendingRef.current = false;
    void flow.fitView({ duration: ZOOM_ANIMATION_MS });
  }, [nodes, flow]);

  return (
    <div className="relative h-full w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <CanvasControls
        onZoomIn={() => void flow.zoomIn({ duration: ZOOM_ANIMATION_MS })}
        onZoomOut={() => void flow.zoomOut({ duration: ZOOM_ANIMATION_MS })}
        onFitView={() => void flow.fitView({ duration: ZOOM_ANIMATION_MS })}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <ShapePanel />
      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={onTemplatesOpenChange}
        onImport={handleImportTemplate}
      />
    </div>
  );
}
