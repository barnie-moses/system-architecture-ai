"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MockProject } from "@/components/editor/use-project-dialogs";
import { cn } from "@/lib/utils";

type ProjectSidebarProps = React.ComponentProps<"aside"> & {
  isOpen: boolean;
  isClosed: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
  onDeleteProject?: (project: MockProject) => void;
  onRenameProject?: (project: MockProject) => void;
  projects?: MockProject[];
};

function EmptyProjectsState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-surface-border bg-elevated px-6 text-center text-sm text-copy-muted">
      {label}
    </div>
  );
}

function ProjectList({
  emptyLabel,
  onDeleteProject,
  onRenameProject,
  projects,
}: {
  emptyLabel: string;
  onDeleteProject?: (project: MockProject) => void;
  onRenameProject?: (project: MockProject) => void;
  projects: MockProject[];
}) {
  if (projects.length === 0) {
    return <EmptyProjectsState label={emptyLabel} />;
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isOwned = project.ownership === "owned";

        return (
          <div
            key={project.id}
            className="group/project flex min-h-16 items-center gap-3 rounded-2xl border border-surface-border bg-elevated px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-copy-primary">
                {project.name}
              </p>
              <p className="mt-1 truncate font-mono text-xs text-copy-muted">
                {project.slug}
              </p>
            </div>

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
  isOpen,
  isClosed,
  onClose,
  onDeleteProject,
  onNewProject,
  onRenameProject,
  projects = [],
  className,
  ...props
}: ProjectSidebarProps) {
  const isVisible = isOpen && !isClosed;
  const ownedProjects = projects.filter((project) => project.ownership === "owned");
  const sharedProjects = projects.filter(
    (project) => project.ownership === "shared"
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close project sidebar"
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
        className={cn(
          "fixed inset-0 z-30 bg-base/70 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        aria-hidden={!isVisible}
        className={cn(
          "fixed bottom-4 left-4 top-16 z-40 flex w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-surface-border bg-surface shadow-2xl transition-[opacity,transform] duration-200 ease-out",
          isVisible
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-[calc(100%+1rem)] opacity-0",
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
                emptyLabel="No projects yet."
                projects={ownedProjects}
                onDeleteProject={onDeleteProject}
                onRenameProject={onRenameProject}
              />
            </TabsContent>
            <TabsContent value="shared" className="h-full">
              <ProjectList
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
