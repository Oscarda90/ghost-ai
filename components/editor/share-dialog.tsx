"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Link2, Loader2, Trash2, Users } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { useProjectSharing } from "@/hooks/use-project-sharing";
import type { Collaborator } from "@/types/collaborator";
import type { Project } from "@/types/project";

const COPIED_FEEDBACK_MS = 2000;

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  sharing: ReturnType<typeof useProjectSharing>;
}

/** Owners invite/remove collaborators and copy the link; collaborators see the list read-only. */
export function ShareDialog({ open, onOpenChange, project, sharing }: ShareDialogProps) {
  const isOwner = project.role === "owner";

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sharing.invite();
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Share "${project.name}"`}
      description={
        isOwner
          ? "Invite collaborators by email and manage who has access."
          : "Only the project owner can manage access."
      }
      footer={isOwner ? <CopyLinkButton projectId={project.id} /> : undefined}
    >
      {isOwner && (
        <form onSubmit={handleInvite} className="flex flex-col gap-2">
          <label htmlFor="share-invite-email" className="text-sm font-medium text-copy-secondary">
            Invite by email
          </label>
          <div className="flex gap-2">
            <Input
              id="share-invite-email"
              type="email"
              placeholder="name@example.com"
              value={sharing.email}
              onChange={(event) => sharing.setEmail(event.target.value)}
              autoComplete="off"
              disabled={sharing.isInviting}
              className="rounded-xl"
            />
            <Button type="submit" className="rounded-xl" disabled={!sharing.canInvite}>
              {sharing.isInviting && <Loader2 className="h-4 w-4 animate-spin" />}
              Invite
            </Button>
          </div>
          {sharing.inviteError && (
            <p className="text-xs text-state-error">{sharing.inviteError}</p>
          )}
        </form>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-copy-secondary">Collaborators</h3>
        {sharing.isLoading && sharing.collaborators.length === 0 ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
          </div>
        ) : sharing.collaborators.length > 0 ? (
          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {sharing.collaborators.map((collaborator) => (
              <CollaboratorRow
                key={collaborator.id}
                collaborator={collaborator}
                isRemoving={sharing.removingId === collaborator.id}
                onRemove={isOwner ? () => void sharing.remove(collaborator) : undefined}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Users className="h-6 w-6 text-copy-faint" />
            <p className="text-xs text-copy-muted">No collaborators yet.</p>
          </div>
        )}
        {sharing.listError && <p className="text-xs text-state-error">{sharing.listError}</p>}
      </section>
    </EditorDialog>
  );
}

interface CollaboratorRowProps {
  collaborator: Collaborator;
  isRemoving: boolean;
  /** Remove action renders only when provided (owner view). */
  onRemove?: () => void;
}

function CollaboratorRow({ collaborator, isRemoving, onRemove }: CollaboratorRowProps) {
  const { name, email, avatarUrl } = collaborator;
  const label = name ?? email;

  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-bg-elevated">
      {avatarUrl ? (
        // Clerk avatar hosts vary per instance; a plain <img> avoids next/image remote config.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-xs font-medium text-copy-secondary uppercase"
        >
          {label.charAt(0)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-copy-primary">{label}</p>
        {name && <p className="truncate text-xs text-copy-muted">{email}</p>}
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          disabled={isRemoving}
          aria-label={`Remove ${label}`}
          className="rounded-xl text-copy-muted hover:text-state-error"
        >
          {isRemoving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </li>
  );
}

function CopyLinkButton({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  async function handleCopy() {
    const url = `${window.location.origin}/editor/${encodeURIComponent(projectId)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }

  return (
    <Button variant="outline" className="rounded-xl" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? "Copied!" : "Copy link"}
    </Button>
  );
}
