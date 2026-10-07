"use client";

import { Maximize, Redo2, Undo2, ZoomIn, ZoomOut, type LucideIcon } from "lucide-react";

type CanvasControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

/** Floating bottom-left pill with zoom and undo/redo controls. */
export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Canvas controls"
      className="absolute bottom-6 left-6 z-20 flex items-center gap-1 rounded-full border border-surface-border bg-bg-surface/90 p-1.5 shadow-lg backdrop-blur"
    >
      <ControlButton icon={ZoomOut} label="Zoom out" onClick={onZoomOut} />
      <ControlButton icon={Maximize} label="Fit view" onClick={onFitView} />
      <ControlButton icon={ZoomIn} label="Zoom in" onClick={onZoomIn} />
      <div aria-hidden className="mx-1 h-5 w-px bg-surface-border" />
      <ControlButton icon={Undo2} label="Undo" onClick={onUndo} disabled={!canUndo} />
      <ControlButton icon={Redo2} label="Redo" onClick={onRedo} disabled={!canRedo} />
    </div>
  );
}

type ControlButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

function ControlButton({ icon: Icon, label, onClick, disabled }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-bg-subtle hover:text-copy-primary disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
