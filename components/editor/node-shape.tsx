import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { NodeShape } from "@/types/canvas";

type SvgShape = "diamond" | "hexagon" | "cylinder";

const CSS_SHAPE_CLASSES: Record<Exclude<NodeShape, SvgShape>, string> = {
  rectangle: "rounded-lg",
  pill: "rounded-full",
  circle: "rounded-full",
};

// Horizontal padding keeps labels inside the narrower parts of each shape.
const LABEL_PADDING: Record<NodeShape, string> = {
  rectangle: "px-3",
  pill: "px-5",
  circle: "px-4",
  diamond: "px-[22%]",
  hexagon: "px-[20%]",
  cylinder: "px-3 pt-[12%]",
};

function isSvgShape(shape: NodeShape): shape is SvgShape {
  return shape === "diamond" || shape === "hexagon" || shape === "cylinder";
}

/**
 * SVG outline drawn in a 100×100 viewBox stretched to the node box
 * (`preserveAspectRatio="none"`), so it scales with any node size. Strokes use
 * `non-scaling-stroke` to stay 1px regardless of the stretch.
 */
function ShapeSvg({ shape, fill, strokeClass }: { shape: SvgShape; fill: string; strokeClass: string }) {
  const common = { fill, vectorEffect: "non-scaling-stroke" as const, strokeWidth: 1 };

  return (
    <svg
      className={cn("absolute inset-0 h-full w-full overflow-visible", strokeClass)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {shape === "diamond" && <polygon points="50,0 100,50 50,100 0,50" {...common} />}
      {shape === "hexagon" && <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" {...common} />}
      {shape === "cylinder" && (
        <>
          <path d="M0,12 L0,88 A50,12 0 0,0 100,88 L100,12 A50,12 0 0,1 0,12 Z" {...common} />
          <ellipse cx="50" cy="12" rx="50" ry="12" {...common} />
        </>
      )}
    </svg>
  );
}

interface NodeShapeFrameProps {
  shape: NodeShape;
  fill: string;
  textColor: string;
  selected?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Shape body shared by canvas nodes and the drag preview. Fills its parent box;
 * rectangle/pill/circle are CSS, diamond/hexagon/cylinder are SVG.
 */
export function NodeShapeFrame({
  shape,
  fill,
  textColor,
  selected = false,
  children,
  className,
}: NodeShapeFrameProps) {
  const label = (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center text-center text-sm",
        LABEL_PADDING[shape],
      )}
    >
      {children}
    </div>
  );

  if (isSvgShape(shape)) {
    return (
      <div className={cn("relative h-full w-full", className)} style={{ color: textColor }}>
        <ShapeSvg
          shape={shape}
          fill={fill}
          strokeClass={selected ? "stroke-brand" : "stroke-surface-border-subtle"}
        />
        {label}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full border",
        CSS_SHAPE_CLASSES[shape],
        selected ? "border-brand" : "border-surface-border-subtle",
        className,
      )}
      style={{ backgroundColor: fill, color: textColor }}
    >
      {label}
    </div>
  );
}
