"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Download,
  FileImage,
  FileText,
  LoaderCircle,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Share2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";

type EditorNavbarProps = React.ComponentProps<"header"> & {
  isAiSidebarOpen?: boolean;
  isSidebarOpen: boolean;
  projectName?: string;
  saveStatus?: CanvasSaveStatus;
  showWorkspaceActions?: boolean;
  onAiSidebarToggle?: () => void;
  onExportPdfClick?: () => void;
  onExportPngClick?: () => void;
  onSaveClick?: () => void;
  onShareClick?: () => void;
  onSidebarToggle?: () => void;
  onTemplatesClick?: () => void;
};

export function EditorNavbar({
  isAiSidebarOpen = true,
  isSidebarOpen,
  projectName,
  saveStatus = "idle",
  showWorkspaceActions = false,
  onAiSidebarToggle,
  onExportPdfClick,
  onExportPngClick,
  onSaveClick,
  onShareClick,
  onSidebarToggle,
  onTemplatesClick,
  className,
  ...props
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isExportMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        exportMenuRef.current &&
        event.target instanceof Node &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExportMenuOpen]);

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
            <SaveStatusButton status={saveStatus} onClick={onSaveClick} />
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
            <div ref={exportMenuRef} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 rounded-xl border border-surface-border bg-base/70 px-3 text-copy-primary shadow-[inset_0_0_0_1px_var(--border-subtle)] hover:border-surface-border-subtle hover:bg-subtle hover:text-copy-primary"
                aria-expanded={isExportMenuOpen}
                aria-haspopup="menu"
                aria-label="Export canvas"
                onClick={() => setIsExportMenuOpen((isOpen) => !isOpen)}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              {isExportMenuOpen ? (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 overflow-hidden rounded-2xl border border-surface-border bg-surface p-1.5 shadow-2xl"
                  role="menu"
                >
                  <ExportMenuItem
                    label="Download PNG"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportPngClick?.();
                    }}
                  >
                    <FileImage className="h-4 w-4" />
                  </ExportMenuItem>
                  <ExportMenuItem
                    label="Download PDF"
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportPdfClick?.();
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </ExportMenuItem>
                </div>
              ) : null}
            </div>
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

function SaveStatusButton({
  status,
  onClick,
}: {
  status: CanvasSaveStatus;
  onClick?: () => void;
}) {
  const statusConfig = getSaveStatusConfig(status);
  const Icon = statusConfig.icon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2 rounded-xl border bg-base/70 px-3 shadow-[inset_0_0_0_1px_var(--border-subtle)] transition-[background-color,border-color,color,box-shadow]",
        statusConfig.className
      )}
      aria-label={statusConfig.label}
      aria-live="polite"
      onClick={onClick}
    >
      <Icon
        className={cn("h-4 w-4", status === "saving" ? "animate-spin" : "")}
      />
      {statusConfig.text}
    </Button>
  );
}

function getSaveStatusConfig(status: CanvasSaveStatus) {
  if (status === "saving") {
    return {
      className:
        "border-surface-border text-copy-secondary hover:border-surface-border-subtle hover:bg-subtle hover:text-copy-primary",
      icon: LoaderCircle,
      label: "Saving canvas",
      text: "Saving",
    };
  }

  if (status === "error") {
    return {
      className:
        "border-state-error text-state-error hover:border-state-error hover:bg-subtle hover:text-state-error",
      icon: TriangleAlert,
      label: "Retry canvas save",
      text: "Error",
    };
  }

  if (status === "saved") {
    return {
      className:
        "border-surface-border text-copy-primary hover:border-surface-border-subtle hover:bg-subtle hover:text-copy-primary",
      icon: Save,
      label: "Canvas saved",
      text: "Saved",
    };
  }

  return {
    className:
      "border-surface-border text-copy-primary hover:border-surface-border-subtle hover:bg-subtle hover:text-copy-primary",
    icon: Save,
    label: "Save canvas",
    text: "Save",
  };
}

function ExportMenuItem({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-9 w-full items-center gap-2 rounded-xl px-2.5 text-left text-sm font-medium text-copy-secondary transition hover:bg-subtle hover:text-copy-primary focus-visible:ring-3 focus-visible:ring-ring/50"
      role="menuitem"
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
