"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function normalizeNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const normalized = text.replace(",", ".");
  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error("Погодинна ставка має бути числом.");
  }

  return parsed.toFixed(2);
}

async function getDefaultTenantId() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error("Не знайдено tenant для створення працівника.");
  }

  return tenant.id;
}

function buildFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export async function createEmployeeAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();

  const firstName = clean(formData.get("firstName"));
  const lastName = clean(formData.get("lastName"));
  const email = clean(formData.get("email"));

  if (!firstName) {
    throw new Error("Імʼя обовʼязкове.");
  }

  if (!lastName) {
    throw new Error("Прізвище обовʼязкове.");
  }

  if (!email) {
    throw new Error("Email обовʼязковий.");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      tenantId,
      email,
    },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("Користувач з таким email уже існує.");
  }

  const roleIds = formData.getAll("roleIds").map((value) => String(value));
  const skillTagIds = formData.getAll("skillTagIds").map((value) => String(value));

  await prisma.user.create({
     data:{
      tenantId,
      email,
      phone: clean(formData.get("phone")),
      firstName,
      lastName,
      fullName: buildFullName(firstName, lastName),
      status: (clean(formData.get("status")) as
        | "INVITED"
        | "ACTIVE"
        | "SUSPENDED"
        | "ARCHIVED") ?? "INVITED",

      employeeProfile: {
        create: {
          tenantId,
          employeeCode: clean(formData.get("employeeCode")),
          positionTitle: clean(formData.get("positionTitle")),
          isResponsible: normalizeCheckbox(formData.get("isResponsible")),
          skillsSummary: clean(formData.get("skillsSummary")),
          notes: clean(formData.get("notes")),
          hourlyRate: normalizeNumber(formData.get("hourlyRate")),
          isArchived: normalizeCheckbox(formData.get("isArchived")),
          skillTags: {
            create: skillTagIds.map((skillTagId) => ({
              skillTagId,
            })),
          },
        },
      },

      userRoles: {
        create: roleIds.map((roleId) => ({
          roleId,
        })),
      },
    },
  });

  revalidatePath("/employees");
}

export async function updateEmployeeAction(formData: FormData) {
  const userId = clean(formData.get("userId"));
  const employeeProfileId = clean(formData.get("employeeProfileId"));
  const firstName = clean(formData.get("firstName"));
  const lastName = clean(formData.get("lastName"));
  const email = clean(formData.get("email"));

  if (!userId) {
    throw new Error("Не передано userId працівника.");
  }

  if (!employeeProfileId) {
    throw new Error("Не передано employeeProfileId працівника.");
  }

  if (!firstName) {
    throw new Error("Імʼя обовʼязкове.");
  }

  if (!lastName) {
    throw new Error("Прізвище обовʼязкове.");
  }

  if (!email) {
    throw new Error("Email обовʼязковий.");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true, email: true },
  });

  if (!currentUser) {
    throw new Error("Працівника не знайдено.");
  }

  if (currentUser.email !== email) {
    const duplicate = await prisma.user.findFirst({
      where: {
        tenantId: currentUser.tenantId,
        email,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new Error("Інший користувач з таким email уже існує.");
    }
  }

  const roleIds = formData.getAll("roleIds").map((value) => String(value));
  const skillTagIds = formData.getAll("skillTagIds").map((value) => String(value));

  await prisma.user.update({
    where: { id: userId },
     data:{
      email,
      phone: clean(formData.get("phone")),
      firstName,
      lastName,
      fullName: buildFullName(firstName, lastName),
      status: (clean(formData.get("status")) as
        | "INVITED"
        | "ACTIVE"
        | "SUSPENDED"
        | "ARCHIVED") ?? "INVITED",

      userRoles: {
        deleteMany: {},
        create: roleIds.map((roleId) => ({
          roleId,
        })),
      },

      employeeProfile: {
        update: {
          employeeCode: clean(formData.get("employeeCode")),
          positionTitle: clean(formData.get("positionTitle")),
          isResponsible: normalizeCheckbox(formData.get("isResponsible")),
          skillsSummary: clean(formData.get("skillsSummary")),
          notes: clean(formData.get("notes")),
          hourlyRate: normalizeNumber(formData.get("hourlyRate")),
          isArchived: normalizeCheckbox(formData.get("isArchived")),
          skillTags: {
            deleteMany: {},
            create: skillTagIds.map((skillTagId) => ({
              skillTagId,
            })),
          },
        },
      },
    },
  });

  revalidatePath("/employees");
}
