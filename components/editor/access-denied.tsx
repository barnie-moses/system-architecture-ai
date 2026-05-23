import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-elevated text-copy-secondary">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-copy-primary">
          Access denied
        </h1>
        <p className="mt-2 text-sm leading-6 text-copy-secondary">
          This workspace does not exist or you do not have access to it.
        </p>
        <Button asChild className="mt-6">
          <Link href="/editor">Back to editor</Link>
        </Button>
      </div>
    </main>
  );
}
