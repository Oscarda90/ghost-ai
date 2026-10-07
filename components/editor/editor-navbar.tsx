"use client";

import { UserButton } from "@clerk/nextjs";
import {
  AlertCircle,
  Check,
  LayoutTemplate,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  /** Open project; when set, the navbar shows its name plus workspace actions. */
  projectName?: string;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  onShare?: () => void;
  onOpenTemplates?: () => void;
  /** Canvas autosave status shown on the Save button. */
  saveStatus?: SaveStatus;
  /** Manual save; the button is disabled while undefined (canvas not ready). */
  onSave?: () => void;
}

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "Save",
  saving: "Saving...",
  saved: "Saved",
  error: "Error",
};

const SAVE_ICONS: Record<SaveStatus, LucideIcon> = {
  idle: Save,
  saving: Loader2,
  saved: Check,
  error: AlertCircle,
};

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onShare,
  onOpenTemplates,
  saveStatus = "idle",
  onSave,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const SaveIcon = SAVE_ICONS[saveStatus];

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-surface-border bg-bg-base px-3">
      <div className="flex flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
          className="rounded-xl text-copy-muted hover:text-copy-primary"
        >
          <ToggleIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center">
        {projectName && (
          <h1 className="truncate text-sm font-medium text-copy-primary">{projectName}</h1>
        )}
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {projectName && (
          <>
            <Button
              variant="outline"
              size="sm"
              className={cn("rounded-xl", saveStatus === "error" && "text-state-error")}
              onClick={onSave}
              disabled={!onSave || saveStatus === "saving"}
              aria-label={SAVE_LABELS[saveStatus]}
              title={SAVE_LABELS[saveStatus]}
            >
              <SaveIcon
                className={cn(
                  "h-4 w-4",
                  saveStatus === "saving" && "animate-spin",
                  saveStatus === "saved" && "text-state-success"
                )}
              />
              <span className="hidden sm:inline">{SAVE_LABELS[saveStatus]}</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={onOpenTemplates}>
              <LayoutTemplate className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAiSidebar}
              aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
              aria-expanded={isAiSidebarOpen}
              className={cn(
                "rounded-xl text-copy-muted hover:text-ai-text",
                isAiSidebarOpen && "text-ai-text"
              )}
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </>
        )}
        {/* In a workspace the UserButton lives in the canvas presence group instead. */}
        {!projectName && <UserButton />}
      </div>
    </header>
  );
}
