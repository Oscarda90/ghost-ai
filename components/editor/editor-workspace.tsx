"use client";

import { useState } from "react";
import { LayoutDashboard } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export function EditorWorkspace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />

      <ProjectSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <LayoutDashboard className="h-8 w-8 text-copy-faint" />
        <p className="text-sm font-medium text-copy-secondary">No project open</p>
        <p className="text-xs text-copy-muted">Open the sidebar to select or create a project.</p>
      </main>
    </div>
  );
}
