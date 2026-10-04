"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: Project[];
  sharedProjects: Project[];
  onCreateProject: () => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Mobile-only scrim: tapping outside the sidebar closes it. */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-bg-base/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

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
          <TabsContent value="my-projects" className="min-h-0 overflow-y-auto">
            {ownedProjects.length > 0 ? (
              <ProjectList
                projects={ownedProjects}
                onRename={onRenameProject}
                onDelete={onDeleteProject}
              />
            ) : (
              <SidebarEmptyState
                icon={FolderOpen}
                title="No projects yet"
                description="Projects you create will appear here."
              />
            )}
          </TabsContent>
          <TabsContent value="shared" className="min-h-0 overflow-y-auto">
            {sharedProjects.length > 0 ? (
              <ProjectList projects={sharedProjects} />
            ) : (
              <SidebarEmptyState
                icon={Users}
                title="No shared projects"
                description="Projects others share with you will appear here."
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t border-surface-border p-4">
          <Button className="w-full rounded-xl" size="lg" onClick={onCreateProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}

interface ProjectListProps {
  projects: Project[];
  /** Rename/delete actions render only when handlers are provided (owned projects). */
  onRename?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

function ProjectList({ projects, onRename, onDelete }: ProjectListProps) {
  return (
    <ul className="flex flex-col gap-1 py-2">
      {projects.map((project) => (
        <li
          key={project.id}
          className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-bg-elevated"
        >
          <Link href={`/editor/${project.id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-copy-primary">{project.name}</p>
            <p className="truncate font-mono text-xs text-copy-faint">{project.id}</p>
          </Link>

          {project.role === "owner" && onRename && onDelete && (
            <div className="flex shrink-0 items-center gap-0.5 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onRename(project)}
                aria-label={`Rename ${project.name}`}
                className="rounded-xl text-copy-muted hover:text-copy-primary"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(project)}
                aria-label={`Delete ${project.name}`}
                className="rounded-xl text-copy-muted hover:text-state-error"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
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
