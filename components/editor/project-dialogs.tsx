"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { EditorDialogContent } from "@/components/editor/editor-dialog";
import type { ProjectDialogKind } from "@/hooks/use-project-actions";
import type { EditorProject } from "@/types/projects";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ProjectDialogsProps = {
  canSubmitName: boolean;
  dialogKind: ProjectDialogKind | null;
  errorMessage: string | null;
  isLoading: boolean;
  isOpen: boolean;
  isRoomIdValid: boolean;
  name: string;
  project: EditorProject | null;
  roomIdPreview: string;
  onCreate: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onRename: () => void;
};

function ProjectNameFields({
  canSubmitName,
  errorMessage,
  inputLabel,
  isRoomIdValid,
  name,
  roomIdPreview,
  onNameChange,
  showRoomIdPreview,
  shouldAutoFocus = false,
}: {
  canSubmitName: boolean;
  errorMessage: string | null;
  inputLabel: string;
  isRoomIdValid: boolean;
  name: string;
  roomIdPreview: string;
  onNameChange: (name: string) => void;
  showRoomIdPreview: boolean;
  shouldAutoFocus?: boolean;
}) {
  const hasName = name.trim().length > 0;
  const previewText = roomIdPreview || "project-room-id";
  const showInvalidState = hasName && !isRoomIdValid;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-copy-primary"
          htmlFor="project-name"
        >
          {inputLabel}
        </label>
        <Input
          id="project-name"
          value={name}
          autoFocus={shouldAutoFocus}
          aria-invalid={showInvalidState}
          placeholder="Architecture workspace"
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      {showRoomIdPreview ? (
        <div className="rounded-2xl border border-surface-border bg-surface p-3">
          <p className="text-xs font-medium text-copy-muted">
            Room ID preview
          </p>
          <p className="mt-1 break-words font-mono text-sm text-copy-primary">
            {previewText}
          </p>
          {!canSubmitName ? (
            <p className="mt-2 text-xs text-copy-muted">
              Use a project name that produces a lowercase room ID with
              letters, numbers, and hyphens.
            </p>
          ) : null}
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-state-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function CreateProjectDialog({
  canSubmitName,
  errorMessage,
  isLoading,
  isRoomIdValid,
  name,
  roomIdPreview,
  onCreate,
  onNameChange,
}: Pick<
  ProjectDialogsProps,
  | "canSubmitName"
  | "errorMessage"
  | "isLoading"
  | "isRoomIdValid"
  | "name"
  | "roomIdPreview"
  | "onCreate"
  | "onNameChange"
>) {
  return (
    <EditorDialogContent
      title="Create project"
      description="Start a new architecture workspace with a readable room ID."
      footer={
        <Button
          type="submit"
          form="create-project-form"
          disabled={!canSubmitName || isLoading}
        >
          Create Project
        </Button>
      }
    >
      <form
        id="create-project-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate();
        }}
      >
        <ProjectNameFields
          canSubmitName={canSubmitName}
          errorMessage={errorMessage}
          inputLabel="Project name"
          isRoomIdValid={isRoomIdValid}
          name={name}
          roomIdPreview={roomIdPreview}
          onNameChange={onNameChange}
          showRoomIdPreview
        />
      </form>
    </EditorDialogContent>
  );
}

function RenameProjectDialog({
  canSubmitName,
  errorMessage,
  isLoading,
  isRoomIdValid,
  name,
  project,
  roomIdPreview,
  onNameChange,
  onRename,
}: Pick<
  ProjectDialogsProps,
  | "canSubmitName"
  | "errorMessage"
  | "isLoading"
  | "isRoomIdValid"
  | "name"
  | "project"
  | "roomIdPreview"
  | "onNameChange"
  | "onRename"
>) {
  return (
    <EditorDialogContent
      title="Rename project"
      description={`Current project name: ${project?.name ?? "Unknown project"}`}
      footer={
        <Button
          type="submit"
          form="rename-project-form"
          disabled={!canSubmitName || isLoading}
        >
          Rename Project
        </Button>
      }
    >
      <form
        id="rename-project-form"
        onSubmit={(event) => {
          event.preventDefault();
          onRename();
        }}
      >
        <ProjectNameFields
          canSubmitName={canSubmitName}
          errorMessage={errorMessage}
          inputLabel="Project name"
          isRoomIdValid={isRoomIdValid}
          name={name}
          shouldAutoFocus
          roomIdPreview={roomIdPreview}
          onNameChange={onNameChange}
          showRoomIdPreview={false}
        />
      </form>
    </EditorDialogContent>
  );
}

function DeleteProjectDialog({
  errorMessage,
  isLoading,
  project,
  onDelete,
}: Pick<
  ProjectDialogsProps,
  "errorMessage" | "isLoading" | "project" | "onDelete"
>) {
  return (
    <EditorDialogContent
      title="Delete project"
      description="This removes the project and returns the editor home if it is the active workspace."
      footer={
        <Button
          type="button"
          variant="destructive"
          disabled={isLoading}
          onClick={onDelete}
        >
          Delete Project
        </Button>
      }
    >
      <div className="flex gap-3 rounded-2xl border border-surface-border bg-surface p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-state-error" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-copy-primary">
            {project?.name ?? "Unknown project"}
          </p>
          <p className="mt-2 text-sm leading-6 text-copy-muted">
            This action does not ask for extra text confirmation.
          </p>
          {errorMessage ? (
            <p className="mt-3 text-sm text-state-error">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </EditorDialogContent>
  );
}

export function ProjectDialogs({
  canSubmitName,
  dialogKind,
  errorMessage,
  isLoading,
  isOpen,
  isRoomIdValid,
  name,
  project,
  roomIdPreview,
  onCreate,
  onDelete,
  onNameChange,
  onOpenChange,
  onRename,
}: ProjectDialogsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {dialogKind === "create" ? (
        <CreateProjectDialog
          canSubmitName={canSubmitName}
          errorMessage={errorMessage}
          isLoading={isLoading}
          isRoomIdValid={isRoomIdValid}
          name={name}
          roomIdPreview={roomIdPreview}
          onCreate={onCreate}
          onNameChange={onNameChange}
        />
      ) : null}

      {dialogKind === "rename" ? (
        <RenameProjectDialog
          canSubmitName={canSubmitName}
          errorMessage={errorMessage}
          isLoading={isLoading}
          isRoomIdValid={isRoomIdValid}
          name={name}
          project={project}
          roomIdPreview={roomIdPreview}
          onNameChange={onNameChange}
          onRename={onRename}
        />
      ) : null}

      {dialogKind === "delete" ? (
        <DeleteProjectDialog
          errorMessage={errorMessage}
          isLoading={isLoading}
          project={project}
          onDelete={onDelete}
        />
      ) : null}
    </Dialog>
  );
}
