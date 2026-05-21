"use client";

import * as React from "react";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type EditorDialogContentProps = React.ComponentProps<typeof DialogContent> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
};

export function EditorDialogContent({
  title,
  description,
  footer,
  children,
  className,
  ...props
}: EditorDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "overflow-hidden rounded-3xl border border-surface-border bg-elevated p-0 text-copy-primary shadow-2xl sm:max-w-lg",
        className
      )}
      {...props}
    >
      <div className="space-y-4 p-6">
        <DialogHeader>
          <DialogTitle className="text-copy-primary">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-copy-muted">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {children}
      </div>

      {footer ? (
        <DialogFooter className="mx-0 mb-0 rounded-none border-t border-surface-border bg-surface p-4">
          {footer}
        </DialogFooter>
      ) : null}
    </DialogContent>
  );
}
