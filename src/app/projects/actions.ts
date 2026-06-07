"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parseDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Некоректна дата.");
  }

  return parsed;
}

async function getDefaultTenantId() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error("Не знайдено tenant для створення проєкту.");
  }

  return tenant.id;
}

export async function createProjectAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();

  const clientId = clean(formData.get("clientId"));
  const name = clean(formData.get("name"));

  if (!clientId) {
    throw new Error("Потрібно вибрати клієнта.");
  }

  if (!name) {
    throw new Error("Назва проєкту обовʼязкова.");
  }

  await prisma.project.create({
     data:{
      tenantId,
      clientId,
      code: clean(formData.get("code")),
      name,
      description: clean(formData.get("description")),
      address: clean(formData.get("address")),
      city: clean(formData.get("city")),
      status:
        (clean(formData.get("status")) as
          | "DRAFT"
          | "ACTIVE"
          | "ON_HOLD"
          | "COMPLETED"
          | "CANCELLED"
          | "ARCHIVED") ?? "DRAFT",
      startDate: parseDate(formData.get("startDate")),
      plannedEndDate: parseDate(formData.get("plannedEndDate")),
      endDate: parseDate(formData.get("endDate")),
      managerId: clean(formData.get("managerId")),
    },
  });

  revalidatePath("/projects");
}

export async function updateProjectAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const clientId = clean(formData.get("clientId"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id проєкту.");
  }

  if (!clientId) {
    throw new Error("Потрібно вибрати клієнта.");
  }

  if (!name) {
    throw new Error("Назва проєкту обовʼязкова.");
  }

  const current = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!current) {
    throw new Error("Проєкт не знайдено.");
  }

  await prisma.project.update({
    where: { id },
     data:{
      clientId,
      code: clean(formData.get("code")),
      name,
      description: clean(formData.get("description")),
      address: clean(formData.get("address")),
      city: clean(formData.get("city")),
      status:
        (clean(formData.get("status")) as
          | "DRAFT"
          | "ACTIVE"
          | "ON_HOLD"
          | "COMPLETED"
          | "CANCELLED"
          | "ARCHIVED") ?? "DRAFT",
      startDate: parseDate(formData.get("startDate")),
      plannedEndDate: parseDate(formData.get("plannedEndDate")),
      endDate: parseDate(formData.get("endDate")),
      managerId: clean(formData.get("managerId")),
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}
