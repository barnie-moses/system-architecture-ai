import { auth, currentUser } from "@clerk/nextjs/server";

import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ProjectAccessIdentity = {
  userId: string;
  primaryEmail: string | null;
};

export type AccessibleProject = {
  id: string;
  name: string;
  ownerId: string;
};

const accessibleProjectSelect = {
  id: true,
  name: true,
  ownerId: true,
} as const;

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null;
}

export async function getCurrentProjectIdentity(): Promise<ProjectAccessIdentity | null> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress ??
    null;

  return {
    userId,
    primaryEmail: normalizeEmail(primaryEmail),
  };
}

export async function getAccessibleProjectByRoomId(
  roomId: string,
  identity: ProjectAccessIdentity
): Promise<AccessibleProject | null> {
  const accessConditions: Prisma.ProjectWhereInput[] = [
    {
      ownerId: identity.userId,
    },
  ];

  if (identity.primaryEmail) {
    accessConditions.push({
      collaborators: {
        some: {
          email: identity.primaryEmail,
        },
      },
    });
  }

  return prisma.project.findFirst({
    where: {
      id: roomId,
      OR: accessConditions,
    },
    select: accessibleProjectSelect,
  });
}
