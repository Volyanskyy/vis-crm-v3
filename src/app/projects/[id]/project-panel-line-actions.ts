"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function toInt(value: FormDataEntryValue | null, fallback = 0) {
  const text = String(value ?? "").trim();

  if (!text) {
    return fallback;
  }

  const parsed = Number.parseInt(text, 10);

  if (Number.isNaN(parsed)) {
    throw new Error("Числове поле містить некоректне значення.");
  }

  return parsed;
}

export async function createProjectPanelLineAction(formData: FormData) {
  const projectId = clean(formData.get("projectId"));

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  await prisma.projectPanelLine.create({
    data: {
      projectId,
      lineCode: clean(formData.get("lineCode")),
      roomName: clean(formData.get("roomName")),
      destination: clean(formData.get("destination")),
      cableType: clean(formData.get("cableType")),
      cableSection: clean(formData.get("cableSection")),
      phases: clean(formData.get("phases")),
      breaker: clean(formData.get("breaker")),
      rcd: clean(formData.get("rcd")),
      note: clean(formData.get("note")),
      sortOrder: toInt(formData.get("sortOrder"), 0),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/shield`);
  revalidatePath("/projects");
}

export async function updateProjectPanelLineAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));

  if (!id) {
    throw new Error("Не передано id лінії щита.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  const current = await prisma.projectPanelLine.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Лінію щита не знайдено.");
  }

  await prisma.projectPanelLine.update({
    where: { id },
    data: {
      lineCode: clean(formData.get("lineCode")),
      roomName: clean(formData.get("roomName")),
      destination: clean(formData.get("destination")),
      cableType: clean(formData.get("cableType")),
      cableSection: clean(formData.get("cableSection")),
      phases: clean(formData.get("phases")),
      breaker: clean(formData.get("breaker")),
      rcd: clean(formData.get("rcd")),
      note: clean(formData.get("note")),
      sortOrder: toInt(formData.get("sortOrder"), 0),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/shield`);
  revalidatePath("/projects");
}

export async function deleteProjectPanelLineAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));

  if (!id) {
    throw new Error("Не передано id лінії щита.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  const current = await prisma.projectPanelLine.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Лінію щита не знайдено.");
  }

  await prisma.projectPanelLine.delete({
    where: { id },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/shield`);
  revalidatePath("/projects");
}
