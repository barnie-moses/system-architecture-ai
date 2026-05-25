"use client";

import * as React from "react";
import { Link2, Mail, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  ProjectAccessPerson,
  ProjectCollaborator,
  ProjectCollaboratorsResponse,
} from "@/types/collaborators";
import type { EditorProject } from "@/types/projects";

type ShareDialogProps = {
  isOpen: boolean;
  project: EditorProject | null;
  onOpenChange: (isOpen: boolean) => void;
};

type CollaboratorResponse = {
  collaborator?: ProjectCollaborator;
  error?: string;
};

type DeleteResponse = {
  success?: boolean;
  error?: string;
};

async function parseJsonResponse<T>(response: Response) {
  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? "Share request failed.");
  }

  return body as T;
}

function AccessAvatar({ person }: { person: ProjectAccessPerson }) {
  if (person.imageUrl) {
    return (
      <div
        aria-hidden="true"
        className="h-11 w-11 rounded-full border border-surface-border bg-cover bg-center"
        style={{ backgroundImage: `url(${person.imageUrl})` }}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-border bg-accent-dim text-sm font-semibold text-brand">
      {person.email.slice(0, 1).toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: ProjectAccessPerson["role"] }) {
  const isOwner = role === "owner";

  return (
    <span
      className={
        isOwner
          ? "rounded-xl border border-brand bg-accent-dim px-2 py-0.5 text-xs font-semibold text-brand"
          : "rounded-xl border border-surface-border bg-subtle px-2 py-0.5 text-xs font-medium text-copy-muted"
      }
    >
      {isOwner ? "OWNER" : "COLLABORATOR"}
    </span>
  );
}

function AccessRow({
  person,
  canManage,
  isRemoving,
  onRemove,
}: {
  person: ProjectAccessPerson;
  canManage: boolean;
  isRemoving: boolean;
  onRemove: (collaborator: ProjectAccessPerson) => void;
}) {
  const canRemove = canManage && person.role === "collaborator";

  return (
    <div className="flex min-h-20 items-center gap-4 rounded-3xl border border-surface-border bg-surface p-4">
      <AccessAvatar person={person} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-copy-primary">
            {person.displayName ?? person.email}
          </p>
          <RoleBadge role={person.role} />
        </div>
        <p className="mt-1 truncate text-sm text-copy-muted">
          {person.email}
        </p>
      </div>
      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${person.email}`}
          disabled={isRemoving}
          onClick={() => onRemove(person)}
        >
          <Trash2 className="h-4 w-4 text-state-error" />
        </Button>
      ) : null}
    </div>
  );
}

export function ShareDialog({
  isOpen,
  project,
  onOpenChange,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = React.useState<
    ProjectAccessPerson[]
  >([]);
  const [owner, setOwner] = React.useState<ProjectAccessPerson | null>(null);
  const [canManage, setCanManage] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [didCopy, setDidCopy] = React.useState(false);

  const projectId = project?.id;

  React.useEffect(() => {
    if (!isOpen || !projectId) {
      return;
    }

    const controller = new AbortController();

    async function loadCollaborators() {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
          {
            signal: controller.signal,
          }
        );
        const body = await parseJsonResponse<ProjectCollaboratorsResponse>(
          response
        );

        setOwner(body.owner);
        setCollaborators(body.collaborators);
        setCanManage(body.canManage);
        setErrorMessage(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Share request failed."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCollaborators();

    return () => controller.abort();
  }, [isOpen, projectId]);

  React.useEffect(() => {
    if (!didCopy) {
      return;
    }

    const timeout = window.setTimeout(() => setDidCopy(false), 1600);

    return () => window.clearTimeout(timeout);
  }, [didCopy]);

  async function inviteCollaborator() {
    if (!projectId || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await parseJsonResponse<CollaboratorResponse>(
        await fetch(`/api/projects/${projectId}/collaborators`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })
      );

      setEmail("");
      const response = await fetch(
        `/api/projects/${projectId}/collaborators`
      );
      const body = await parseJsonResponse<ProjectCollaboratorsResponse>(
        response
      );

      setCollaborators(body.collaborators);
      setOwner(body.owner);
      setCanManage(body.canManage);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Share request failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeCollaborator(collaborator: ProjectCollaborator) {
    if (!projectId) {
      return;
    }

    setRemovingId(collaborator.id);
    setErrorMessage(null);

    try {
      await parseJsonResponse<DeleteResponse>(
        await fetch(
          `/api/projects/${projectId}/collaborators/${collaborator.id}`,
          {
            method: "DELETE",
          }
        )
      );

      setCollaborators((currentCollaborators) =>
        currentCollaborators.filter((item) => item.id !== collaborator.id)
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Share request failed."
      );
    } finally {
      setRemovingId(null);
    }
  }

  async function copyProjectLink() {
    await navigator.clipboard.writeText(window.location.href);
    setDidCopy(true);
  }

  const peopleWithAccess = owner ? [owner, ...collaborators] : collaborators;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextIsOpen) => {
        if (!nextIsOpen) {
          setEmail("");
          setErrorMessage(null);
          setDidCopy(false);
          setIsLoading(false);
        }

        onOpenChange(nextIsOpen);
      }}
    >
      <DialogContent
        className="overflow-hidden rounded-3xl border border-surface-border bg-elevated p-0 text-copy-primary shadow-2xl sm:max-w-2xl"
      >
        <DialogHeader className="border-b border-surface-border p-6">
          <DialogTitle className="text-xl font-semibold text-copy-primary">
            Share project
          </DialogTitle>
          <DialogDescription className="text-base text-copy-muted">
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {canManage ? (
            <section className="flex items-center justify-between gap-4 rounded-3xl border border-surface-border bg-surface p-5">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-copy-primary">
                  Workspace link
                </h3>
                <p className="mt-2 text-sm leading-6 text-copy-muted">
                  Share a direct link with teammates after you grant them
                  access.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="shrink-0 gap-2 rounded-xl border border-surface-border bg-base px-4 text-copy-primary hover:bg-subtle"
                onClick={copyProjectLink}
              >
                <Link2 className="h-4 w-4" />
                {didCopy ? "Copied!" : "Copy link"}
              </Button>
            </section>
          ) : null}

          {canManage ? (
            <form
              className="flex items-center gap-3 rounded-3xl border border-surface-border bg-surface p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void inviteCollaborator();
              }}
            >
              <div className="relative min-w-0 flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-muted" />
                <Input
                  className="h-10 rounded-xl bg-base pl-9 text-copy-primary caret-brand placeholder:text-copy-muted"
                  type="email"
                  value={email}
                  placeholder="teammate@company.com"
                  disabled={isSubmitting}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="rounded-xl px-4"
                disabled={isSubmitting || email.trim().length === 0}
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </form>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-copy-primary">
                People with access
              </h3>
              <p className="text-sm text-copy-muted">
                {peopleWithAccess.length} total
              </p>
            </div>

            <ScrollArea className="max-h-80 rounded-3xl">
              <div className="space-y-3 pr-3">
                {isLoading ? (
                  <div className="rounded-3xl border border-surface-border bg-surface p-5 text-sm text-copy-muted">
                    Loading people...
                  </div>
                ) : peopleWithAccess.length > 0 ? (
                  peopleWithAccess.map((person) => (
                    <AccessRow
                      key={`${person.role}-${person.id}`}
                      canManage={canManage}
                      person={person}
                      isRemoving={removingId === person.id}
                      onRemove={(target) => void removeCollaborator(target)}
                    />
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-surface-border bg-surface p-5 text-sm text-copy-muted">
                    No one has access yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </section>

          {errorMessage ? (
            <p className="text-sm text-state-error">{errorMessage}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
