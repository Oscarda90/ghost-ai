"use client";

import type { LucideIcon } from "lucide-react";
import { FolderOpen, Plus, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      aria-label="Projects"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "fixed top-17 bottom-3 left-3 z-40 flex w-72 flex-col rounded-2xl border border-surface-border bg-bg-surface/90 shadow-2xl backdrop-blur-md transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
      )}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close sidebar"
          className="rounded-xl text-copy-muted hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="min-h-0 flex-1 px-4">
        <TabsList className="w-full">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects">
          <SidebarEmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Projects you create will appear here."
          />
        </TabsContent>
        <TabsContent value="shared">
          <SidebarEmptyState
            icon={Users}
            title="No shared projects"
            description="Projects others share with you will appear here."
          />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button className="w-full rounded-xl" size="lg">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}

interface SidebarEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function SidebarEmptyState({ icon: Icon, title, description }: SidebarEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <Icon className="h-8 w-8 text-copy-faint" />
      <p className="text-sm font-medium text-copy-secondary">{title}</p>
      <p className="text-xs text-copy-muted">{description}</p>
    </div>
  );
}
