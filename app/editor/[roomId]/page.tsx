import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorShell } from "@/components/editor/editor-shell";
import { signInPath } from "@/lib/auth-routes";
import {
  getAccessibleProjectByRoomId,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { listEditorProjectsForUser } from "@/lib/projects";

type ProjectWorkspacePageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    redirect(signInPath);
  }

  const { roomId } = await params;
  const project = await getAccessibleProjectByRoomId(roomId, identity);

  if (!project) {
    return <AccessDenied />;
  }

  const projectLists = await listEditorProjectsForUser(
    identity.userId,
    identity.primaryEmail ? [identity.primaryEmail] : []
  );

  return <EditorShell {...projectLists} activeProjectId={project.id} />;
}
