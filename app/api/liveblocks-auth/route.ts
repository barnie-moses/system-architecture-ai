import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  authorizeLiveblocksProjectSession,
  ensureLiveblocksProjectRoom,
  getLiveblocksCursorColor,
  parseLiveblocksRoomId,
} from "@/lib/liveblocks";
import {
  getAccessibleProjectByRoomId,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { readJsonBody } from "@/lib/projects";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return jsonError(body.error, 400);
  }

  const liveblocksRoom = parseLiveblocksRoomId(body.value);

  if (!liveblocksRoom.ok) {
    return jsonError(liveblocksRoom.error, 400);
  }

  const project = await getAccessibleProjectByRoomId(
    liveblocksRoom.roomId,
    identity
  );

  if (!project) {
    return jsonError("Forbidden", 403);
  }

  const user = await currentUser();
  const displayName =
    user?.fullName ||
    user?.username ||
    identity.primaryEmail ||
    "Workspace member";
  const avatarUrl = user?.imageUrl || null;
  const cursorColor = getLiveblocksCursorColor(identity.userId);

  try {
    await ensureLiveblocksProjectRoom(project.id, project.name);

    const { status, body: authBody } = await authorizeLiveblocksProjectSession(
      identity.userId,
      project.id,
      {
        displayName,
        avatarUrl,
        cursorColor,
      }
    );

    return new Response(authBody, {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Liveblocks auth failed", error);

    return jsonError("Liveblocks authentication failed.", 500);
  }
}
