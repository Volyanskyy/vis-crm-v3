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
    throw new Error("Не знайдено tenant для створення типу фурнітури.");
  }

  return tenant.id;
}

export async function createFittingTypeAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();
  const name = clean(formData.get("name"));

  if (!name) {
    throw new Error("Назва типу фурнітури обовʼязкова.");
  }

  const existing = await prisma.fittingType.findFirst({
    where: { tenantId, name },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Тип фурнітури з такою назвою вже існує.");
  }

  await prisma.fittingType.create({
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
  revalidatePath("/references/fitting-types");
}

export async function updateFittingTypeAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id типу фурнітури.");
  }

  if (!name) {
    throw new Error("Назва типу фурнітури обовʼязкова.");
  }

  const current = await prisma.fittingType.findUnique({
    where: { id },
    select: { tenantId: true, name: true },
  });

  if (!current) {
    throw new Error("Тип фурнітури не знайдено.");
  }

  if (current.name !== name) {
    const existing = await prisma.fittingType.findFirst({
      where: {
        tenantId: current.tenantId,
        name,
      },
      select: { id: true },
    });

    if (existing) {
      throw new Error("Інший тип фурнітури з такою назвою вже існує.");
    }
  }

  await prisma.fittingType.update({
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
  revalidatePath("/references/fitting-types");
}
