"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { slugify } from "@/lib/slug";
import type { Project } from "@/types/project";

export type ProjectDialogType = "create" | "rename" | "delete";

interface ProjectDialogState {
  type: ProjectDialogType | null;
  /** Target project for rename/delete; null for create. */
  project: Project | null;
}

const SUFFIX_LENGTH = 6;
const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const FALLBACK_ROOM_SLUG = "untitled-project";

/** Short random lowercase-alphanumeric suffix that keeps room IDs unique. */
function createSuffix() {
  const bytes = crypto.getRandomValues(new Uint8Array(SUFFIX_LENGTH));
  return Array.from(bytes, (byte) => SUFFIX_ALPHABET[byte % SUFFIX_ALPHABET.length]).join("");
}

/** Project ID and Liveblocks room ID are the same value. */
function toRoomId(name: string, suffix: string) {
  return `${slugify(name) || FALLBACK_ROOM_SLUG}-${suffix}`;
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : "Something went wrong";
}

/**
 * Owns project dialog state (which dialog, target project), form state
 * (name, room ID suffix), and create/rename/delete mutations against the
 * project API. `activeProjectId` is the workspace currently open, if any.
 */
export function useProjectActions(activeProjectId?: string) {
  const router = useRouter();
  const [dialog, setDialog] = useState<ProjectDialogState>({ type: null, project: null });
  const [name, setName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setName("");
    setSuffix(createSuffix());
    setError(null);
    setDialog({ type: "create", project: null });
  }

  function openRename(project: Project) {
    setName(project.name);
    setError(null);
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setError(null);
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
  const roomIdPreview = toRoomId(name, suffix);
  const canSubmit =
    !isSubmitting && (dialog.type === "delete" || trimmedName.length > 0);

  async function createProject() {
    const id = roomIdPreview;
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: trimmedName }),
    });
    if (!response.ok) throw new Error(await readError(response));

    hide();
    router.push(`/editor/${id}`);
  }

  async function renameProject(target: Project) {
    const response = await fetch(`/api/projects/${encodeURIComponent(target.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName }),
    });
    if (!response.ok) throw new Error(await readError(response));

    hide();
    router.refresh();
  }

  async function deleteProject(target: Project) {
    const response = await fetch(`/api/projects/${encodeURIComponent(target.id)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(await readError(response));

    hide();
    if (target.id === activeProjectId) {
      router.push("/editor");
    } else {
      router.refresh();
    }
  }

  async function submit() {
    if (!canSubmit || !dialog.type) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const target = dialog.project;
      if (dialog.type === "create") await createProject();
      else if (dialog.type === "rename" && target) await renameProject(target);
      else if (dialog.type === "delete" && target) await deleteProject(target);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    dialog,
    name,
    setName,
    roomIdPreview,
    isSubmitting,
    canSubmit,
    error,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}
