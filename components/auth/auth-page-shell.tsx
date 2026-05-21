import type { ReactNode } from "react";
import { FileText, Network, Sparkles } from "lucide-react";

type AuthPageShellProps = {
  children: ReactNode;
  description: string;
  title: string;
};

const features = [
  {
    description: "Turn prompts into nodes and edges on a live canvas.",
    icon: Sparkles,
    title: "AI architecture drafting",
  },
  {
    description: "Share presence, cursors, and edits while the system evolves.",
    icon: Network,
    title: "Real-time collaboration",
  },
  {
    description: "Carry the final graph into durable Markdown documentation.",
    icon: FileText,
    title: "Specification handoff",
  },
];

export function AuthPageShell({
  children,
  description,
  title,
}: AuthPageShellProps) {
  return (
    <main className="grid min-h-screen bg-base text-copy-primary lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
      <section className="hidden min-h-screen border-r border-surface-border bg-surface lg:grid lg:grid-rows-[auto_1fr_auto] lg:px-14 lg:py-12 xl:px-16">
        <header className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand font-mono text-sm font-semibold text-primary-foreground">
            SA
          </div>
          <span className="text-lg font-semibold tracking-normal text-copy-primary">
            SystemArc AI
          </span>
        </header>

        <div className="flex max-w-[39rem] flex-col justify-center pb-8 pt-14">
          <div className="max-w-[34rem] space-y-5">
            <h1 className="text-4xl font-semibold leading-tight text-copy-primary xl:text-5xl">
              {title}
            </h1>
            <p className="max-w-[38rem] text-lg leading-8 text-copy-muted">
              {description}
            </p>
          </div>

          <ul className="mt-16 space-y-9">
            {features.map(({ description: featureDescription, icon: Icon, title: featureTitle }) => (
              <li key={featureTitle} className="flex gap-5">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-accent-dim text-brand">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="space-y-1">
                  <span className="block text-base font-semibold text-copy-secondary">
                    {featureTitle}
                  </span>
                  <span className="block max-w-[35rem] text-sm leading-6 text-copy-muted">
                    {featureDescription}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="text-sm text-copy-faint">
          © 2026 SystemArc AI. All rights reserved.
        </footer>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-base px-4 py-10 lg:px-14">
        <div className="flex w-full max-w-[35rem] justify-center">{children}</div>
      </section>
    </main>
  );
}
