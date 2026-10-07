"use client";

import { useState } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CanvasRoom } from "@/components/editor/canvas-room";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { ShareDialog } from "@/components/editor/share-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import { useProjectSharing } from "@/hooks/use-project-sharing";
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
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const projectDialogs = useProjectActions(activeProject?.id);
  const sharing = useProjectSharing(activeProject?.id);
  const { dialog } = projectDialogs;

  function handleOpenChange(open: boolean) {
    if (!open) projectDialogs.close();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        projectName={activeProject?.name}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
        onShare={() => void sharing.open()}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={activeProject?.id}
        onCreateProject={projectDialogs.openCreate}
        onRenameProject={projectDialogs.openRename}
        onDeleteProject={projectDialogs.openDelete}
      />

      {activeProject ? (
        <>
          <CanvasRoom roomId={activeProject.id} />
          <AiSidebar isOpen={isAiSidebarOpen} onClose={() => setIsAiSidebarOpen(false)} />
          <ShareDialog
            open={sharing.isOpen}
            onOpenChange={(open) => !open && sharing.close()}
            project={activeProject}
            sharing={sharing}
          />
        </>
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
