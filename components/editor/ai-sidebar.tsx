"use client";

import { Bot, X } from "lucide-react";

import { AiArchitectTab } from "@/components/editor/ai-architect-tab";
import { AiSpecsTab } from "@/components/editor/ai-specs-tab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAB_TRIGGER_CLASS =
  "text-copy-muted hover:text-copy-primary data-active:bg-ai/15 data-active:text-ai-text dark:data-active:border-transparent dark:data-active:bg-ai/15 dark:data-active:text-ai-text";

/** Right slide-over with the AI chat (AI Architect) and generated specs. */
export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  return (
    <aside
      aria-label="AI workspace"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "fixed top-17 right-3 bottom-3 z-40 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border border-surface-border bg-bg-base/95 shadow-2xl backdrop-blur-md transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-ai/15">
            <Bot className="h-4 w-4 text-ai-text" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-copy-primary">
              AI Workspace
            </h2>
            <p className="truncate text-xs text-copy-muted">
              Collaborate with Ghost AI
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close AI sidebar"
          className="rounded-xl text-copy-muted hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="architect" className="min-h-0 flex-1 gap-0">
        <div className="px-4 pb-3">
          <TabsList className="w-full bg-bg-surface">
            <TabsTrigger value="architect" className={TAB_TRIGGER_CLASS}>
              AI Architect
            </TabsTrigger>
            <TabsTrigger value="specs" className={TAB_TRIGGER_CLASS}>
              Specs
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="architect" className="flex min-h-0 flex-col">
          <AiArchitectTab />
        </TabsContent>
        <TabsContent value="specs" className="min-h-0 overflow-y-auto">
          <AiSpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
