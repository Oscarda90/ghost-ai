"use client";

import { Download } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DEFAULT_NODE_COLOR, type CanvasNode } from "@/types/canvas";

const PREVIEW_PADDING = 24;

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

/** Dialog listing the predefined canvas templates, each with a preview and an import button. */
export function StarterTemplatesModal({ open, onOpenChange, onImport }: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Starter templates"
      description="Start from a pre-built diagram. Importing replaces everything on the current canvas."
      className="sm:max-w-3xl"
    >
      <ScrollArea className="-mx-2 max-h-[60vh]">
        <div className="grid gap-4 px-2 pb-1 sm:grid-cols-2">
          {CANVAS_TEMPLATES.map((template) => (
            <article
              key={template.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-bg-elevated/60"
            >
              <TemplatePreview template={template} />
              <div className="flex flex-1 flex-col gap-3 border-t border-surface-border p-4">
                <div className="flex flex-1 flex-col gap-1">
                  <h3 className="text-sm font-medium text-copy-primary">{template.name}</h3>
                  <p className="text-xs text-copy-muted">{template.description}</p>
                </div>
                <Button
                  size="sm"
                  className="self-start rounded-xl"
                  onClick={() => handleImport(template)}
                >
                  <Download className="h-4 w-4" />
                  Import
                </Button>
              </div>
            </article>
          ))}
        </div>
      </ScrollArea>
    </EditorDialog>
  );
}

function nodeSize(node: CanvasNode) {
  return { width: node.width ?? 0, height: node.height ?? 0 };
}

function nodeCenter(node: CanvasNode) {
  const { width, height } = nodeSize(node);
  return { x: node.position.x + width / 2, y: node.position.y + height / 2 };
}

/**
 * Static SVG of a template: the viewBox spans the node bounds (plus padding) and
 * `preserveAspectRatio` fits it into the fixed-size viewport. No React Flow instance.
 */
function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template;
  const minX = Math.min(...nodes.map((node) => node.position.x));
  const minY = Math.min(...nodes.map((node) => node.position.y));
  const maxX = Math.max(...nodes.map((node) => node.position.x + nodeSize(node).width));
  const maxY = Math.max(...nodes.map((node) => node.position.y + nodeSize(node).height));
  const viewBox = [
    minX - PREVIEW_PADDING,
    minY - PREVIEW_PADDING,
    maxX - minX + PREVIEW_PADDING * 2,
    maxY - minY + PREVIEW_PADDING * 2,
  ].join(" ");
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="h-40 w-full bg-bg-base"
      role="img"
      aria-label={`${template.name} preview`}
    >
      {edges.map((edge) => {
        const source = nodesById.get(edge.source);
        const target = nodesById.get(edge.target);
        if (!source || !target) return null;
        const from = nodeCenter(source);
        const to = nodeCenter(target);
        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-edge opacity-60"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {nodes.map((node) => (
        <PreviewNode key={node.id} node={node} />
      ))}
    </svg>
  );
}

function PreviewNode({ node }: { node: CanvasNode }) {
  const { x, y } = node.position;
  const { width: w, height: h } = nodeSize(node);
  const common = {
    fill: node.data.color || DEFAULT_NODE_COLOR.fill,
    className: "stroke-surface-border-subtle",
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke" as const,
  };

  switch (node.data.shape) {
    case "pill":
      return <rect x={x} y={y} width={w} height={h} rx={h / 2} {...common} />;
    case "circle":
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
    case "diamond":
      return (
        <polygon
          points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
          {...common}
        />
      );
    case "hexagon":
      return (
        <polygon
          points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`}
          {...common}
        />
      );
    case "cylinder": {
      // Same proportions as the canvas cylinder: cap ellipse is 12% of the height.
      const ry = h * 0.12;
      return (
        <g>
          <path
            d={`M${x},${y + ry} L${x},${y + h - ry} A${w / 2},${ry} 0 0,0 ${x + w},${y + h - ry} L${x + w},${y + ry} A${w / 2},${ry} 0 0,1 ${x},${y + ry} Z`}
            {...common}
          />
          <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} {...common} />
        </g>
      );
    }
    default:
      return <rect x={x} y={y} width={w} height={h} rx={8} {...common} />;
  }
}
