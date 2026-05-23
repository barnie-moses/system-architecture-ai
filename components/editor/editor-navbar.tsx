"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorNavbarProps = React.ComponentProps<"header"> & {
  isAiSidebarOpen?: boolean;
  isSidebarOpen: boolean;
  projectName?: string;
  showWorkspaceActions?: boolean;
  onAiSidebarToggle?: () => void;
  onShareClick?: () => void;
  onSidebarToggle?: () => void;
  onTemplatesClick?: () => void;
};

export function EditorNavbar({
  isAiSidebarOpen = true,
  isSidebarOpen,
  projectName,
  showWorkspaceActions = false,
  onAiSidebarToggle,
  onShareClick,
  onSidebarToggle,
  onTemplatesClick,
  className,
  ...props
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center border-b border-surface-border bg-surface px-3",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 shrink-0 items-center justify-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-xl border transition-[background-color,border-color,color,box-shadow]",
            isSidebarOpen
              ? "border-brand bg-accent-dim text-brand shadow-[0_0_0_1px_var(--accent-primary)] hover:bg-accent-dim hover:text-brand"
              : "border-transparent text-copy-secondary hover:border-surface-border hover:bg-subtle hover:text-copy-primary"
          )}
          aria-label={
            isSidebarOpen ? "Close project sidebar" : "Open project sidebar"
          }
          aria-pressed={isSidebarOpen}
          onClick={onSidebarToggle}
        >
          <SidebarIcon className="h-5 w-5" />
        </Button>

        {projectName ? (
          <div className="min-w-0 leading-none">
            <p className="truncate text-sm font-semibold text-copy-primary">
              {projectName}
            </p>
            <p className="mt-1 truncate text-xs font-medium text-copy-faint">
              Workspace
            </p>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center justify-end gap-2">
        {showWorkspaceActions ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl border border-surface-border bg-base/70 px-3 text-copy-primary shadow-[inset_0_0_0_1px_var(--border-subtle)] hover:border-surface-border-subtle hover:bg-subtle hover:text-copy-primary"
              aria-label="Open starter templates"
              onClick={onTemplatesClick}
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl border border-surface-border bg-base/70 px-3 text-copy-primary shadow-[inset_0_0_0_1px_var(--border-subtle)] hover:border-surface-border-subtle hover:bg-subtle hover:text-copy-primary"
              aria-label="Share workspace"
              onClick={onShareClick}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 rounded-xl border px-3 transition-[background-color,border-color,color,box-shadow]",
                isAiSidebarOpen
                  ? "border-brand bg-accent-dim text-brand shadow-[0_0_0_1px_var(--accent-primary)] hover:bg-accent-dim hover:text-brand"
                  : "border-surface-border bg-base/70 text-copy-primary shadow-[inset_0_0_0_1px_var(--border-subtle)] hover:border-surface-border-subtle hover:bg-subtle hover:text-copy-primary"
              )}
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-pressed={isAiSidebarOpen}
              onClick={onAiSidebarToggle}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
