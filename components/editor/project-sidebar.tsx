"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { EditorProject } from "@/types/projects";

type ProjectSidebarProps = React.ComponentProps<"aside"> & {
  activeProjectId?: string;
  isOpen: boolean;
  isClosed: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
  onDeleteProject?: (project: EditorProject) => void;
  onRenameProject?: (project: EditorProject) => void;
  ownedProjects: EditorProject[];
  sharedProjects: EditorProject[];
};

function EmptyProjectsState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-surface-border bg-elevated px-6 text-center text-sm text-copy-muted">
      {label}
    </div>
  );
}

function ProjectList({
  activeProjectId,
  emptyLabel,
  onDeleteProject,
  onRenameProject,
  projects,
}: {
  activeProjectId?: string;
  emptyLabel: string;
  onDeleteProject?: (project: EditorProject) => void;
  onRenameProject?: (project: EditorProject) => void;
  projects: EditorProject[];
}) {
  if (projects.length === 0) {
    return <EmptyProjectsState label={emptyLabel} />;
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isOwned = project.ownership === "owned";
        const isActive = project.id === activeProjectId;

        return (
          <div
            key={project.id}
            className={cn(
              "group/project flex min-h-16 items-center gap-3 rounded-2xl border border-surface-border bg-elevated px-3 py-2",
              isActive ? "border-brand bg-accent-dim" : null
            )}
          >
            <Link
              href={`/editor/${project.id}`}
              className="min-w-0 flex-1 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <p className="truncate text-sm font-medium text-copy-primary">
                {project.name}
              </p>
              <p className="mt-1 truncate font-mono text-xs text-copy-muted">
                {project.roomId}
              </p>
            </Link>

            {isOwned ? (
              <div className="pointer-events-none flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/project:pointer-events-auto group-hover/project:opacity-100 group-focus-within/project:pointer-events-auto group-focus-within/project:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Rename ${project.name}`}
                  onClick={() => onRenameProject?.(project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${project.name}`}
                  onClick={() => onDeleteProject?.(project)}
                >
                  <Trash2 className="h-4 w-4 text-state-error" />
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ProjectSidebar({
  activeProjectId,
  isOpen,
  isClosed,
  onClose,
  onDeleteProject,
  onNewProject,
  onRenameProject,
  ownedProjects,
  sharedProjects,
  className,
  ...props
}: ProjectSidebarProps) {
  const isVisible = isOpen && !isClosed;

  return (
    <>
      <button
        type="button"
        aria-label="Close project sidebar"
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
        className={cn(
          "fixed inset-0 z-30 bg-base/70 backdrop-blur-sm transition-opacity duration-300 ease-out md:hidden",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        aria-hidden={!isVisible}
        style={{ top: "calc(var(--navbar-height) + var(--sidebar-offset))" }}
        className={cn(
          "fixed bottom-2 left-2 z-40 flex w-96 max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface shadow-2xl will-change-transform transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isVisible
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-[calc(100%+2rem)] opacity-0",
          className
        )}
        {...props}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
          {isVisible && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close project sidebar"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-4 p-4">
          <TabsList className="grid w-full grid-cols-2 bg-subtle">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>

          <ScrollArea className="min-h-0 flex-1">
            <TabsContent value="my-projects" className="h-full">
              <ProjectList
                activeProjectId={activeProjectId}
                emptyLabel="No projects yet."
                projects={ownedProjects}
                onDeleteProject={onDeleteProject}
                onRenameProject={onRenameProject}
              />
            </TabsContent>
            <TabsContent value="shared" className="h-full">
              <ProjectList
                activeProjectId={activeProjectId}
                emptyLabel="No shared projects yet."
                projects={sharedProjects}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t border-surface-border p-4">
          <Button
            type="button"
            className="w-full"
            onClick={onNewProject}
          >
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
