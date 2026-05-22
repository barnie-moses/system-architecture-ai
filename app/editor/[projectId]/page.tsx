import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import { signInPath } from "@/lib/auth-routes";
import { listEditorProjectsForUser } from "@/lib/projects";

type ProjectWorkspacePageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect(signInPath);
  }

  const [{ projectId }, user] = await Promise.all([params, currentUser()]);
  const collaboratorEmails =
    user?.emailAddresses.map((email) => email.emailAddress) ?? [];
  const projectLists = await listEditorProjectsForUser(
    userId,
    collaboratorEmails
  );

  return <EditorShell {...projectLists} activeProjectId={projectId} />;
}
