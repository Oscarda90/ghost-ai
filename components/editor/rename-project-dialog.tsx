"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FORM_ID = "rename-project-form";

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  name: string;
  onNameChange: (name: string) => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  currentName,
  name,
  onNameChange,
  isSubmitting,
  canSubmit,
  error,
  onSubmit,
}: RenameProjectDialogProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rename project"
      description={`Enter a new name for "${currentName}".`}
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
            Rename
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="rename-project-name" className="text-sm font-medium text-copy-secondary">
          Project name
        </label>
        <Input
          id="rename-project-name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          autoComplete="off"
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          disabled={isSubmitting}
          className="rounded-xl"
        />
        {error && <p className="text-xs text-state-error">{error}</p>}
      </form>
    </EditorDialog>
  );
}
