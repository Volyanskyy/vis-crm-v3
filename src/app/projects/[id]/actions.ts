"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function normalizeRoleLabel(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function normalizeNullable(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export async function addProjectTeamMember(input: {
  projectId: string;
  userId: string;
  roleLabel?: string | null;
  isLead?: boolean;
}) {
  const projectId = input.projectId.trim();
  const userId = input.userId.trim();
  const roleLabel = normalizeRoleLabel(input.roleLabel);
  const isLead = Boolean(input.isLead);

  if (!projectId) {
    throw new Error("Не вказано проєкт.");
  }

  if (!userId) {
    throw new Error("Не вказано користувача.");
  }

  const existing = await prisma.projectTeam.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existing && !existing.leftAt) {
    throw new Error("Цей учасник уже доданий до проєкту.");
  }

  await prisma.$transaction(async (tx) => {
    if (isLead) {
      await tx.projectTeam.updateMany({
        where: {
          projectId,
          leftAt: null,
        },
        data:{
          isLead: false,
        },
      });
    }

    if (existing) {
      await tx.projectTeam.update({
        where: { id: existing.id },
        data: {
          roleLabel,
          isLead,
          leftAt: null,
          joinedAt: new Date(),
        },
      });
    } else {
      await tx.projectTeam.create({
        data: {
          projectId,
          userId,
          roleLabel,
          isLead,
        },
      });
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectTeamMember(input: {
  projectId: string;
  teamMemberId: string;
  roleLabel?: string | null;
}) {
  const projectId = input.projectId.trim();
  const teamMemberId = input.teamMemberId.trim();
  const roleLabel = normalizeRoleLabel(input.roleLabel);

  if (!projectId || !teamMemberId) {
    throw new Error("Недостатньо даних для оновлення учасника.");
  }

  await prisma.projectTeam.update({
    where: { id: teamMemberId },
    data: { roleLabel },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function setProjectTeamLead(input: {
  projectId: string;
  teamMemberId: string;
}) {
  const projectId = input.projectId.trim();
  const teamMemberId = input.teamMemberId.trim();

  if (!projectId || !teamMemberId) {
    throw new Error("Недостатньо даних для призначення Lead.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectTeam.updateMany({
      where: {
        projectId,
        leftAt: null,
      },
      data: {
        isLead: false,
      },
    });

    await tx.projectTeam.update({
      where: { id: teamMemberId },
      data: {
        isLead: true,
      },
    });
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectTeamMember(input: {
  projectId: string;
  teamMemberId: string;
}) {
  const projectId = input.projectId.trim();
  const teamMemberId = input.teamMemberId.trim();

  if (!projectId || !teamMemberId) {
    throw new Error("Недостатньо даних для видалення учасника.");
  }

  await prisma.projectTeam.update({
    where: { id: teamMemberId },
    data: {
      isLead: false,
      leftAt: new Date(),
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function searchProjectAssignableUsers(input: {
  projectId: string;
  query?: string;
}) {
  const projectId = input.projectId.trim();
  const query = normalizeNullable(input.query);

  if (!projectId) {
    throw new Error("Не вказано проєкт.");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      tenantId: true,
    },
  });

  if (!project) {
    throw new Error("Проєкт не знайдено.");
  }

  const users = await prisma.user.findMany({
    where: {
      tenantId: project.tenantId,
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      fullName: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
    },
    orderBy: [{ fullName: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    take: 20,
  });

  return users;
}
