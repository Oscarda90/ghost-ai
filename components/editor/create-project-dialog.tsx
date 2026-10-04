"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FORM_ID = "create-project-form";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  slugPreview: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  slugPreview,
  isSubmitting,
  canSubmit,
  onSubmit,
}: CreateProjectDialogProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create project"
      description="Give your new architecture workspace a name."
      footer={
        <>
          <Button
            variant="ghost"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} className="rounded-xl" disabled={!canSubmit}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="create-project-name" className="text-sm font-medium text-copy-secondary">
          Project name
        </label>
        <Input
          id="create-project-name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="My system design"
          autoComplete="off"
          autoFocus
          disabled={isSubmitting}
          className="rounded-xl"
        />
        <p className="text-xs text-copy-muted">
          Slug:{" "}
          <span className="font-mono text-copy-secondary">{slugPreview || "your-project-slug"}</span>
        </p>
      </form>
    </EditorDialog>
  );
}
