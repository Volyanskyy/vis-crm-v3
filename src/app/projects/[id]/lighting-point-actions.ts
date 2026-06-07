"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parseRequiredInt(value: FormDataEntryValue | null, fallback: number) {
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

function normalizeCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function normalizeStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "DRAFT").trim().toUpperCase();

  if (status === "ACTIVE" || status === "ARCHIVED" || status === "DRAFT") {
    return status;
  }

  return "DRAFT";
}

async function resolveProjectIdByRoom(projectRoomId: string) {
  const room = await prisma.projectRoom.findUnique({
    where: { id: projectRoomId },
    select: { projectId: true },
  });

  if (!room) {
    throw new Error("Кімнату не знайдено.");
  }

  return room.projectId;
}

export async function createLightingPointAction(formData: FormData) {
  const projectRoomId = clean(formData.get("projectRoomId"));

  if (!projectRoomId) {
    throw new Error("Не передано кімнату для точки освітлення.");
  }

  const projectId = await resolveProjectIdByRoom(projectRoomId);

  await prisma.lightingPoint.create({
     data:{
      projectRoomId,
      lightingSystemTypeId: clean(formData.get("lightingSystemTypeId")),
      pointCode: clean(formData.get("pointCode")),
      zoneLabel: clean(formData.get("zoneLabel")),
      quantity: parseRequiredInt(formData.get("quantity"), 1),
      switchGroup: clean(formData.get("switchGroup")),
      dimmable: normalizeCheckbox(formData.get("dimmable")),
      note: clean(formData.get("note")),
      status: normalizeStatus(formData.get("status")) as
        | "DRAFT"
        | "ACTIVE"
        | "ARCHIVED",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/rooms`);
  revalidatePath("/projects");
}

export async function updateLightingPointAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectRoomId = clean(formData.get("projectRoomId"));

  if (!id) {
    throw new Error("Не передано id точки освітлення.");
  }

  if (!projectRoomId) {
    throw new Error("Не передано кімнату для точки освітлення.");
  }

  const projectId = await resolveProjectIdByRoom(projectRoomId);

  const current = await prisma.lightingPoint.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Точку освітлення не знайдено.");
  }

  await prisma.lightingPoint.update({
    where: { id },
     data:{
      lightingSystemTypeId: clean(formData.get("lightingSystemTypeId")),
      pointCode: clean(formData.get("pointCode")),
      zoneLabel: clean(formData.get("zoneLabel")),
      quantity: parseRequiredInt(formData.get("quantity"), 1),
      switchGroup: clean(formData.get("switchGroup")),
      dimmable: normalizeCheckbox(formData.get("dimmable")),
      note: clean(formData.get("note")),
      status: normalizeStatus(formData.get("status")) as
        | "DRAFT"
        | "ACTIVE"
        | "ARCHIVED",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/rooms`);
  revalidatePath("/projects");
}

export async function archiveLightingPointAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectRoomId = clean(formData.get("projectRoomId"));

  if (!id) {
    throw new Error("Не передано id точки освітлення.");
  }

  if (!projectRoomId) {
    throw new Error("Не передано кімнату для точки освітлення.");
  }

  const projectId = await resolveProjectIdByRoom(projectRoomId);

  const current = await prisma.lightingPoint.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Точку освітлення не знайдено.");
  }

  await prisma.lightingPoint.update({
    where: { id },
     data:{
      status: "ARCHIVED",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/rooms`);
  revalidatePath("/projects");
}
