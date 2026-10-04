"use client";

import { useState } from "react";

import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/types/project";

interface EditorWorkspaceProps {
  ownedProjects: Project[];
  sharedProjects: Project[];
  /** Workspace currently open; omitted on the editor home. */
  activeProject?: Project;
}

export function EditorWorkspace({
  ownedProjects,
  sharedProjects,
  activeProject,
}: EditorWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectDialogs = useProjectActions(activeProject?.id);
  const { dialog } = projectDialogs;

  function handleOpenChange(open: boolean) {
    if (!open) projectDialogs.close();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={projectDialogs.openCreate}
        onRenameProject={projectDialogs.openRename}
        onDeleteProject={projectDialogs.openDelete}
      />

      {activeProject ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <h1 className="text-2xl font-semibold text-copy-primary">{activeProject.name}</h1>
          <p className="font-mono text-xs text-copy-faint">{activeProject.id}</p>
        </main>
      ) : (
        <EditorHome onCreateProject={projectDialogs.openCreate} />
      )}

      <CreateProjectDialog
        open={dialog.type === "create"}
        onOpenChange={handleOpenChange}
        name={projectDialogs.name}
        onNameChange={projectDialogs.setName}
        roomIdPreview={projectDialogs.roomIdPreview}
        isSubmitting={projectDialogs.isSubmitting}
        canSubmit={projectDialogs.canSubmit}
        error={projectDialogs.error}
        onSubmit={projectDialogs.submit}
      />
      <RenameProjectDialog
        open={dialog.type === "rename"}
        onOpenChange={handleOpenChange}
        currentName={dialog.project?.name ?? ""}
        name={projectDialogs.name}
        onNameChange={projectDialogs.setName}
        isSubmitting={projectDialogs.isSubmitting}
        canSubmit={projectDialogs.canSubmit}
        error={projectDialogs.error}
        onSubmit={projectDialogs.submit}
      />
      <DeleteProjectDialog
        open={dialog.type === "delete"}
        onOpenChange={handleOpenChange}
        projectName={dialog.project?.name ?? ""}
        isSubmitting={projectDialogs.isSubmitting}
        error={projectDialogs.error}
        onConfirm={projectDialogs.submit}
      />
    </div>
  );
}
