import { clerkClient } from "@clerk/nextjs/server";

import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProjectAccessIdentity } from "@/lib/project-access";
import type {
  ProjectAccessPerson,
} from "@/types/collaborators";

const collaboratorSelect = {
  id: true,
  email: true,
  createdAt: true,
} as const;

type CollaboratorRecord = {
  id: string;
  email: string;
  createdAt: Date;
};

type ProjectShareAccess = {
  id: string;
  ownerId: string;
  createdAt: Date;
};

type EmailParseResult =
  | {
      ok: true;
      email: string;
    }
  | {
      ok: false;
      error: string;
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeCollaboratorEmail(value: string) {
  return value.trim().toLowerCase();
}

export function parseCollaboratorEmail(value: unknown): EmailParseResult {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("email" in value)
  ) {
    return { ok: false, error: "Email is required." };
  }

  const rawEmail = value.email;

  if (typeof rawEmail !== "string") {
    return { ok: false, error: "Email is required." };
  }

  const email = normalizeCollaboratorEmail(rawEmail);

  if (!emailPattern.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  return { ok: true, email };
}

export async function getProjectShareAccess(
  projectId: string,
  identity: ProjectAccessIdentity
): Promise<ProjectShareAccess | null> {
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
      id: projectId,
      OR: accessConditions,
    },
    select: {
      id: true,
      ownerId: true,
      createdAt: true,
    },
  });
}

export function canManageProjectCollaborators(
  project: ProjectShareAccess,
  identity: ProjectAccessIdentity
) {
  return project.ownerId === identity.userId;
}

export async function listProjectCollaboratorRecords(projectId: string) {
  return prisma.projectCollaborators.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: collaboratorSelect,
  });
}

export async function addProjectCollaborator(
  projectId: string,
  email: string
) {
  return prisma.projectCollaborators.upsert({
    where: {
      projectId_email: {
        projectId,
        email,
      },
    },
    create: {
      projectId,
      email,
    },
    update: {},
    select: collaboratorSelect,
  });
}

export async function removeProjectCollaborator(
  projectId: string,
  collaboratorId: string
) {
  const result = await prisma.projectCollaborators.deleteMany({
    where: {
      id: collaboratorId,
      projectId,
    },
  });

  return result.count > 0;
}

export async function enrichCollaboratorsWithClerk(
  collaborators: CollaboratorRecord[]
): Promise<ProjectAccessPerson[]> {
  const emails = collaborators.map((collaborator) => collaborator.email);
  const usersByEmail = new Map<
    string,
    {
      displayName: string | null;
      imageUrl: string | null;
    }
  >();

  if (emails.length > 0) {
    try {
      const client = await clerkClient();
      const users = await client.users.getUserList({
        emailAddress: emails,
        limit: Math.min(emails.length, 500),
      });

      for (const user of users.data) {
        const displayName =
          user.fullName ??
          [user.firstName, user.lastName].filter(Boolean).join(" ") ??
          null;

        for (const emailAddress of user.emailAddresses) {
          const email = normalizeCollaboratorEmail(emailAddress.emailAddress);

          if (emails.includes(email) && !usersByEmail.has(email)) {
            usersByEmail.set(email, {
              displayName: displayName || null,
              imageUrl: user.imageUrl || null,
            });
          }
        }
      }
    } catch {
      // If Clerk lookup is unavailable, the UI still shows stored emails.
    }
  }

  return collaborators.map((collaborator) => {
    const clerkUser = usersByEmail.get(collaborator.email);

    return {
      id: collaborator.id,
      email: collaborator.email,
      displayName: clerkUser?.displayName ?? null,
      imageUrl: clerkUser?.imageUrl ?? null,
      createdAt: collaborator.createdAt.toISOString(),
      role: "collaborator",
    };
  });
}

export async function enrichOwnerWithClerk(
  ownerId: string,
  createdAt: Date
): Promise<ProjectAccessPerson> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(ownerId);
    const primaryEmail =
      user.emailAddresses.find(
        (emailAddress) => emailAddress.id === user.primaryEmailAddressId
      )?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      ownerId;
    const displayName =
      user.fullName ??
      [user.firstName, user.lastName].filter(Boolean).join(" ") ??
      null;

    return {
      id: ownerId,
      email: primaryEmail,
      displayName: displayName || null,
      imageUrl: user.imageUrl || null,
      createdAt: createdAt.toISOString(),
      role: "owner",
    };
  } catch {
    return {
      id: ownerId,
      email: "Project owner",
      displayName: null,
      imageUrl: null,
      createdAt: createdAt.toISOString(),
      role: "owner",
    };
  }
}
