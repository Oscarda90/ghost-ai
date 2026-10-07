"use client";

import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useRoom,
  useUndo,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  getConnectedEdges,
  useEdges,
  useNodes,
  useReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent } from "react";

import { CanvasControls } from "@/components/editor/canvas-controls";
import { CanvasEdgeView } from "@/components/editor/canvas-edge";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import { LiveCursors } from "@/components/editor/live-cursors";
import { PresenceAvatars } from "@/components/editor/presence-avatars";
import { ShapePanel } from "@/components/editor/shape-panel";
import { instantiateTemplate, type CanvasTemplate } from "@/components/editor/starter-templates";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { useCanvasAutosave, type CanvasAutosave } from "@/hooks/use-canvas-autosave";
import { useCanvasRestore } from "@/hooks/use-canvas-restore";
import {
  ZOOM_ANIMATION_MS,
  isEditableTarget,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import { SHAPE_DRAG_MIME, createShapeNode, parseShapePayload } from "@/lib/canvas-shapes";
import type { CanvasSnapshot } from "@/lib/canvas-snapshot";
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
  /** Project ID (= room ID) used for canvas save/load. */
  projectId: string;
  isTemplatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
  /** Reports save status + manual save to the workspace (navbar Save button). */
  onAutosaveChange: (autosave: CanvasAutosave) => void;
}

/** React Flow canvas whose nodes and edges are synced through Liveblocks Storage. */
export function CanvasFlow(props: CanvasFlowProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner {...props} />
    </ReactFlowProvider>
  );
}

function CanvasFlowInner({
  projectId,
  isTemplatesOpen,
  onTemplatesOpenChange,
  onAutosaveChange,
}: CanvasFlowProps) {
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
  const updateMyPresence = useUpdateMyPresence();
  const fitViewPendingRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // React Flow's `fitView` prop stays queued until the first node is measured,
  // so on an empty room it would zoom on the first drop. Only fit on mount when
  // there is something to fit; restores/imports fit explicitly below.
  const [fitViewOnInit] = useState(() => nodes.length > 0);
  const selectedNodes = useNodes<CanvasNode>().filter((node) => node.selected);
  const selectedEdges = useEdges<CanvasEdge>().filter((edge) => edge.selected);

  useKeyboardShortcuts({ flow, onUndo: undo, onRedo: redo });

  // Delete/Backspace removes the selection through Liveblocks (`onDelete`), so
  // it syncs to every client. React Flow's own key deletion is off
  // (`deleteKeyCode={null}`). `onDelete` doesn't cascade, so edges attached to
  // deleted nodes are removed explicitly.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      // Focus is on the canvas (node/edge/pane) or nowhere in particular.
      const target = event.target;
      const onCanvas =
        target === document.body ||
        (target instanceof Node && wrapperRef.current?.contains(target));
      if (!onCanvas) return;
      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

      event.preventDefault();
      const edgeIds = new Set(selectedEdges.map((edge) => edge.id));
      const attachedEdges = getConnectedEdges(selectedNodes, edges).filter(
        (edge) => !edgeIds.has(edge.id),
      );
      onDelete({ nodes: selectedNodes, edges: [...selectedEdges, ...attachedEdges] });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodes, selectedEdges, edges, onDelete]);

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

  // Cursor is broadcast in flow coordinates so it lands on the same diagram
  // spot for every viewer, whatever their pan/zoom.
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      updateMyPresence({ cursor: screenToFlowPosition({ x: event.clientX, y: event.clientY }) });
    },
    [screenToFlowPosition, updateMyPresence],
  );

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

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

  // Saved canvas → empty room, as one batch (one undo step, one remote update).
  const handleRestore = useCallback(
    (snapshot: CanvasSnapshot) => {
      room.batch(() => {
        onNodesChange(snapshot.nodes.map((item) => ({ type: "add", item })));
        onEdgesChange(snapshot.edges.map((item) => ({ type: "add", item })));
      });
      // An empty snapshot adds nothing; a pending fit would fire on the first drop.
      if (snapshot.nodes.length > 0) fitViewPendingRef.current = true;
    },
    [room, onNodesChange, onEdgesChange],
  );

  const restorePhase = useCanvasRestore({
    projectId,
    isRoomEmpty: nodes.length === 0 && edges.length === 0,
    restore: handleRestore,
  });
  // Autosave waits for the load so an empty room can't overwrite the saved canvas.
  const autosave = useCanvasAutosave({
    projectId,
    nodes,
    edges,
    enabled: restorePhase === "ready",
  });
  const saveStatus = restorePhase === "error" ? "error" : autosave.status;
  const { saveNow } = autosave;

  useEffect(() => {
    onAutosaveChange({ status: saveStatus, saveNow });
  }, [saveStatus, saveNow, onAutosaveChange]);

  // Fit once imported/restored nodes have reached React Flow.
  useEffect(() => {
    if (!fitViewPendingRef.current) return;
    fitViewPendingRef.current = false;
    void flow.fitView({ duration: ZOOM_ANIMATION_MS });
  }, [nodes, flow]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        deleteKeyCode={null}
        fitView={fitViewOnInit}
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <LiveCursors />
      <PresenceAvatars />
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
