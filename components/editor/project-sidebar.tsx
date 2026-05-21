"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ProjectSidebarProps = React.ComponentProps<"aside"> & {
  isOpen: boolean;
  isClosed: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
};

function EmptyProjectsState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-surface-border bg-elevated px-6 text-center text-sm text-copy-muted">
      {label}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  isClosed,
  onClose,
  onNewProject,
  className,
  ...props
}: ProjectSidebarProps) {
  const isVisible = isOpen && !isClosed;

  return (
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
            <EmptyProjectsState label="No projects yet." />
          </TabsContent>
          <TabsContent value="shared" className="h-full">
            <EmptyProjectsState label="No shared projects yet." />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button type="button" className="w-full" onClick={onNewProject}>
          <Plus className="h-5 w-5" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
