"use client";

import { useState } from "react";

import { MOCK_PROJECTS } from "@/lib/mock-projects";
import { slugify } from "@/lib/slug";
import type { Project } from "@/types/project";

export type ProjectDialogType = "create" | "rename" | "delete";

interface ProjectDialogState {
  type: ProjectDialogType | null;
  /** Target project for rename/delete; null for create. */
  project: Project | null;
}

/** Simulated latency so the loading state is visible until real API calls exist. */
const MOCK_DELAY_MS = 400;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Owns project dialog state (which dialog, target project), form state
 * (project name), and loading state. Mutations apply to in-memory mock data only.
 */
export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [dialog, setDialog] = useState<ProjectDialogState>({ type: null, project: null });
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ownedProjects = projects.filter((project) => project.role === "owner");
  const sharedProjects = projects.filter((project) => project.role === "collaborator");

  function openCreate() {
    setName("");
    setDialog({ type: "create", project: null });
  }

  function openRename(project: Project) {
    setName(project.name);
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setDialog({ type: "delete", project });
  }

  // Keeps the target project so dialog content stays stable during the close animation.
  function hide() {
    setDialog((current) => ({ ...current, type: null }));
  }

  function close() {
    if (isSubmitting) return;
    hide();
  }

  const trimmedName = name.trim();
  const canSubmit =
    !isSubmitting && (dialog.type === "delete" || trimmedName.length > 0);

  async function submit() {
    if (!canSubmit || !dialog.type) return;

    setIsSubmitting(true);
    await wait(MOCK_DELAY_MS);

    const target = dialog.project;
    if (dialog.type === "create") {
      setProjects((current) => [
        {
          id: crypto.randomUUID(),
          name: trimmedName,
          slug: slugify(trimmedName),
          role: "owner",
        },
        ...current,
      ]);
    } else if (dialog.type === "rename" && target) {
      setProjects((current) =>
        current.map((project) =>
          project.id === target.id
            ? { ...project, name: trimmedName, slug: slugify(trimmedName) }
            : project
        )
      );
    } else if (dialog.type === "delete" && target) {
      setProjects((current) => current.filter((project) => project.id !== target.id));
    }

    setIsSubmitting(false);
    hide();
  }

  return {
    ownedProjects,
    sharedProjects,
    dialog,
    name,
    setName,
    slugPreview: slugify(name),
    isSubmitting,
    canSubmit,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}
