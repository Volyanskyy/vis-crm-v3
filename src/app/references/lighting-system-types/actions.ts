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

async function getDefaultTenantId() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error("Не знайдено tenant для створення типу системи освітлення.");
  }

  return tenant.id;
}

export async function createLightingSystemTypeAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();
  const name = clean(formData.get("name"));

  if (!name) {
    throw new Error("Назва типу системи освітлення обовʼязкова.");
  }

  const existing = await prisma.lightingSystemType.findFirst({
    where: { tenantId, name },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Тип системи освітлення з такою назвою вже існує.");
  }

  await prisma.lightingSystemType.create({
     data:{
      tenantId,
      brandId: clean(formData.get("brandId")),
      code: clean(formData.get("code")),
      name,
      category: clean(formData.get("category")),
      description: clean(formData.get("description")),
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/lighting-system-types");
}

export async function updateLightingSystemTypeAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id типу системи освітлення.");
  }

  if (!name) {
    throw new Error("Назва типу системи освітлення обовʼязкова.");
  }

  const current = await prisma.lightingSystemType.findUnique({
    where: { id },
    select: { tenantId: true, name: true },
  });

  if (!current) {
    throw new Error("Тип системи освітлення не знайдено.");
  }

  if (current.name !== name) {
    const existing = await prisma.lightingSystemType.findFirst({
      where: {
        tenantId: current.tenantId,
        name,
      },
      select: { id: true },
    });

    if (existing) {
      throw new Error("Інший тип системи освітлення з такою назвою вже існує.");
    }
  }

  await prisma.lightingSystemType.update({
    where: { id },
     data:{
      brandId: clean(formData.get("brandId")),
      code: clean(formData.get("code")),
      name,
      category: clean(formData.get("category")),
      description: clean(formData.get("description")),
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/lighting-system-types");
}
