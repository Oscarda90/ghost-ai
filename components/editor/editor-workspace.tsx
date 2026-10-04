"use client";

import { useState } from "react";

import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export function EditorWorkspace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectDialogs = useProjectDialogs();
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
        ownedProjects={projectDialogs.ownedProjects}
        sharedProjects={projectDialogs.sharedProjects}
        onCreateProject={projectDialogs.openCreate}
        onRenameProject={projectDialogs.openRename}
        onDeleteProject={projectDialogs.openDelete}
      />

      <EditorHome onCreateProject={projectDialogs.openCreate} />

      <CreateProjectDialog
        open={dialog.type === "create"}
        onOpenChange={handleOpenChange}
        name={projectDialogs.name}
        onNameChange={projectDialogs.setName}
        slugPreview={projectDialogs.slugPreview}
        isSubmitting={projectDialogs.isSubmitting}
        canSubmit={projectDialogs.canSubmit}
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
        onSubmit={projectDialogs.submit}
      />
      <DeleteProjectDialog
        open={dialog.type === "delete"}
        onOpenChange={handleOpenChange}
        projectName={dialog.project?.name ?? ""}
        isSubmitting={projectDialogs.isSubmitting}
        onConfirm={projectDialogs.submit}
      />
    </div>
  );
}
