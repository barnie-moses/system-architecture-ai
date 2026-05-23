import { Liveblocks } from "@liveblocks/node";

export type LiveblocksUserInfo = {
  displayName: string;
  avatarUrl: string | null;
  cursorColor: string;
};

type LiveblocksRoomResult =
  | {
      ok: true;
      roomId: string;
    }
  | {
      ok: false;
      error: string;
    };

const cursorColors = [
  "#52A8FF",
  "#BF7AF0",
  "#FF990A",
  "#FF6166",
  "#F75F8F",
  "#62C073",
  "#0AC7B4",
  "#8B82FF",
] as const;

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocksClient?: Liveblocks;
};

export function getLiveblocksCursorColor(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return cursorColors[hash % cursorColors.length];
}

export function getLiveblocksClient() {
  if (globalForLiveblocks.liveblocksClient) {
    return globalForLiveblocks.liveblocksClient;
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is required.");
  }

  const client = new Liveblocks({ secret });
  globalForLiveblocks.liveblocksClient = client;

  return client;
}

export function parseLiveblocksRoomId(value: unknown): LiveblocksRoomResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, error: "Liveblocks auth payload must be an object." };
  }

  if (!("room" in value) || typeof value.room !== "string") {
    return { ok: false, error: "Liveblocks room is required." };
  }

  const roomId = value.room.trim();

  if (!roomId) {
    return { ok: false, error: "Liveblocks room is required." };
  }

  return { ok: true, roomId };
}

export async function ensureLiveblocksProjectRoom(
  roomId: string,
  projectName: string
) {
  const liveblocks = getLiveblocksClient();

  return liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
    metadata: {
      projectId: roomId,
      name: projectName.slice(0, 256),
    },
  });
}

export function authorizeLiveblocksProjectSession(
  userId: string,
  roomId: string,
  userInfo: LiveblocksUserInfo
) {
  const liveblocks = getLiveblocksClient();
  const session = liveblocks.prepareSession(userId, { userInfo });

  session.allow(roomId, session.FULL_ACCESS);

  return session.authorize();
}
