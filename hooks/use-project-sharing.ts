"use client";

import { useState } from "react";

import type { Collaborator } from "@/types/collaborator";

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : "Something went wrong";
}

async function readCollaborators(response: Response) {
  if (!response.ok) throw new Error(await readError(response));
  const body = (await response.json()) as { collaborators: Collaborator[] };
  return body.collaborators;
}

function toMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong";
}

/**
 * Owns share dialog state (open, invite form) and the collaborator list for
 * the open project, plus owner mutations (invite, remove) against the
 * collaborators API. The list reloads every time the dialog opens.
 */
export function useProjectSharing(projectId?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const endpoint = projectId
    ? `/api/projects/${encodeURIComponent(projectId)}/collaborators`
    : null;

  async function open() {
    if (!endpoint) return;

    setIsOpen(true);
    setEmail("");
    setInviteError(null);
    setListError(null);
    setCollaborators([]);
    setIsLoading(true);
    try {
      setCollaborators(await readCollaborators(await fetch(endpoint)));
    } catch (cause) {
      setListError(toMessage(cause));
    } finally {
      setIsLoading(false);
    }
  }

  function close() {
    setIsOpen(false);
  }

  const canInvite = !isInviting && email.trim().length > 0;

  async function invite() {
    if (!endpoint || !canInvite) return;

    setIsInviting(true);
    setInviteError(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setCollaborators(await readCollaborators(response));
      setEmail("");
    } catch (cause) {
      setInviteError(toMessage(cause));
    } finally {
      setIsInviting(false);
    }
  }

  async function remove(collaborator: Collaborator) {
    if (!endpoint) return;

    setRemovingId(collaborator.id);
    setListError(null);
    try {
      const response = await fetch(`${endpoint}/${encodeURIComponent(collaborator.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await readError(response));
      setCollaborators((current) => current.filter(({ id }) => id !== collaborator.id));
    } catch (cause) {
      setListError(toMessage(cause));
    } finally {
      setRemovingId(null);
    }
  }

  return {
    isOpen,
    open,
    close,
    collaborators,
    isLoading,
    listError,
    email,
    setEmail,
    isInviting,
    inviteError,
    canInvite,
    invite,
    removingId,
    remove,
  };
}
