"use client";

import { useAuth } from "@clerk/nextjs";
import { shallow, useOthersMapped } from "@liveblocks/react/suspense";
import { useViewport } from "@xyflow/react";

/**
 * Other participants' cursors. Presence stores flow coordinates, so each
 * cursor is mapped through the local viewport and stays on the same spot of
 * the diagram regardless of each user's pan/zoom.
 */
export function LiveCursors() {
  const { userId } = useAuth();
  const { x: viewX, y: viewY, zoom } = useViewport();
  const others = useOthersMapped(
    (other) => ({
      id: other.id,
      cursor: other.presence.cursor,
      name: other.info.name,
      color: other.info.color,
    }),
    shallow,
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {others.map(([connectionId, other]) => {
        if (!other.cursor || other.id === userId) return null;
        return (
          <Cursor
            key={connectionId}
            x={other.cursor.x * zoom + viewX}
            y={other.cursor.y * zoom + viewY}
            name={other.name}
            color={other.color}
          />
        );
      })}
    </div>
  );
}

interface CursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
}

function Cursor({ x, y, name, color }: CursorProps) {
  return (
    <div
      className="absolute top-0 left-0 transition-transform duration-75 ease-linear"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" className="drop-shadow">
        <path
          d="M2 1.5 L16 8.5 L9.5 10 L6.5 16.5 Z"
          fill={color}
          stroke="var(--bg-base)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute top-4 left-3.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-bg-base shadow"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
}
