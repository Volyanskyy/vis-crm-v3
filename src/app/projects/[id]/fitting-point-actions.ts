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

export async function createFittingPointAction(formData: FormData) {
  const projectRoomId = clean(formData.get("projectRoomId"));

  if (!projectRoomId) {
    throw new Error("Не передано кімнату для точки фурнітури.");
  }

  const projectId = await resolveProjectIdByRoom(projectRoomId);
  const frameSize = parseRequiredInt(formData.get("frameSize"), 1);

  await prisma.fittingPoint.create({
     data:{
      projectRoomId,
      wallLabel: clean(formData.get("wallLabel")),
      quantity: parseRequiredInt(formData.get("quantity"), 1),
      frameSize,
      installHeightMm: clean(formData.get("installHeightMm"))
        ? parseRequiredInt(formData.get("installHeightMm"), 0)
        : null,
      note: clean(formData.get("note")),
      status: normalizeStatus(formData.get("status")),
      fittingTypeId1: frameSize >= 1 ? clean(formData.get("mechanism_1")) : null,
      fittingTypeId2: frameSize >= 2 ? clean(formData.get("mechanism_2")) : null,
      fittingTypeId3: frameSize >= 3 ? clean(formData.get("mechanism_3")) : null,
      fittingTypeId4: frameSize >= 4 ? clean(formData.get("mechanism_4")) : null,
      fittingTypeId5: frameSize >= 5 ? clean(formData.get("mechanism_5")) : null,
      fittingTypeId6: frameSize >= 6 ? clean(formData.get("mechanism_6")) : null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function updateFittingPointAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectRoomId = clean(formData.get("projectRoomId"));

  if (!id) {
    throw new Error("Не передано id точки фурнітури.");
  }

  if (!projectRoomId) {
    throw new Error("Не передано кімнату для точки фурнітури.");
  }

  const projectId = await resolveProjectIdByRoom(projectRoomId);

  const current = await prisma.fittingPoint.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Точку фурнітури не знайдено.");
  }

  const frameSize = parseRequiredInt(formData.get("frameSize"), 1);

  await prisma.fittingPoint.update({
    where: { id },
     data:{
      wallLabel: clean(formData.get("wallLabel")),
      quantity: parseRequiredInt(formData.get("quantity"), 1),
      frameSize,
      installHeightMm: clean(formData.get("installHeightMm"))
        ? parseRequiredInt(formData.get("installHeightMm"), 0)
        : null,
      note: clean(formData.get("note")),
      status: normalizeStatus(formData.get("status")),
      fittingTypeId1: frameSize >= 1 ? clean(formData.get("mechanism_1")) : null,
      fittingTypeId2: frameSize >= 2 ? clean(formData.get("mechanism_2")) : null,
      fittingTypeId3: frameSize >= 3 ? clean(formData.get("mechanism_3")) : null,
      fittingTypeId4: frameSize >= 4 ? clean(formData.get("mechanism_4")) : null,
      fittingTypeId5: frameSize >= 5 ? clean(formData.get("mechanism_5")) : null,
      fittingTypeId6: frameSize >= 6 ? clean(formData.get("mechanism_6")) : null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function archiveFittingPointAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectRoomId = clean(formData.get("projectRoomId"));

  if (!id) {
    throw new Error("Не передано id точки фурнітури.");
  }

  if (!projectRoomId) {
    throw new Error("Не передано кімнату для точки фурнітури.");
  }

  const projectId = await resolveProjectIdByRoom(projectRoomId);

  const current = await prisma.fittingPoint.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Точку фурнітури не знайдено.");
  }

  await prisma.fittingPoint.update({
    where: { id },
     data:{
      status: "ARCHIVED",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}
