"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function toInt(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return 0;
  }

  const parsed = Number.parseInt(text, 10);

  if (Number.isNaN(parsed)) {
    throw new Error("Порядок сортування має бути числом.");
  }

  return parsed;
}

function ensureFormData(formData: FormData | unknown) {
  if (formData instanceof FormData) {
    return formData;
  }

  throw new Error("Форма кімнати не передала дані.");
}

export async function createProjectRoomAction(input: FormData | unknown) {
  const formData = ensureFormData(input);
  const projectId = clean(formData.get("projectId"));
  const name = clean(formData.get("name"));

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  if (!name) {
    throw new Error("Назва кімнати обовʼязкова.");
  }

  await prisma.projectRoom.create({
    data: {
      projectId,
      roomTypeId: clean(formData.get("roomTypeId")),
      name,
      floor: clean(formData.get("floor")),
      sortOrder: toInt(formData.get("sortOrder")),
      notes: clean(formData.get("notes")),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/rooms`);
  revalidatePath("/projects");
}

export async function updateProjectRoomAction(input: FormData | unknown) {
  const formData = ensureFormData(input);
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id кімнати.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  if (!name) {
    throw new Error("Назва кімнати обовʼязкова.");
  }

  const current = await prisma.projectRoom.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Кімнату не знайдено.");
  }

  await prisma.projectRoom.update({
    where: { id },
    data: {
      roomTypeId: clean(formData.get("roomTypeId")),
      name,
      floor: clean(formData.get("floor")),
      sortOrder: toInt(formData.get("sortOrder")),
      notes: clean(formData.get("notes")),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/rooms`);
  revalidatePath("/projects");
}

export async function deleteProjectRoomAction(input: FormData | unknown) {
  const formData = ensureFormData(input);
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));

  if (!id) {
    throw new Error("Не передано id кімнати.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  const current = await prisma.projectRoom.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Кімнату не знайдено.");
  }

  await prisma.projectRoom.delete({
    where: { id },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/rooms`);
  revalidatePath("/projects");
}
