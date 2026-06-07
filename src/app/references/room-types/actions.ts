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
    throw new Error("Не знайдено tenant для створення типу приміщення.");
  }

  return tenant.id;
}

export async function createRoomTypeAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();
  const name = clean(formData.get("name"));

  if (!name) {
    throw new Error("Назва типу приміщення обовʼязкова.");
  }

  // Перевірка на дубль
  const existing = await prisma.roomType.findFirst({
    where: { tenantId, name },
  });

  if (existing) {
    throw new Error("Тип приміщення з такою назвою вже існує.");
  }

  await prisma.roomType.create({
     data:{
      tenantId,
      name,
      code: clean(formData.get("code")),
      description: clean(formData.get("description")),
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/room-types");
}

export async function updateRoomTypeAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id типу приміщення.");
  }

  if (!name) {
    throw new Error("Назва типу приміщення обовʼязкова.");
  }

  // Отримуємо tenantId для перевірки дублів
  const current = await prisma.roomType.findUnique({
    where: { id },
    select: { tenantId: true, name: true },
  });

  if (!current) {
    throw new Error("Тип приміщення не знайдено.");
  }

  // Перевірка на дубль, якщо ім'я змінилося
  if (current.name !== name) {
    const existing = await prisma.roomType.findFirst({
      where: { tenantId: current.tenantId, name },
    });

    if (existing) {
      throw new Error("Інший тип приміщення з такою назвою вже існує.");
    }
  }

  await prisma.roomType.update({
    where: { id },
     data:{
      name,
      code: clean(formData.get("code")),
      description: clean(formData.get("description")),
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/room-types");
}
