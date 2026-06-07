"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function parseVersion(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  return Math.floor(parsed);
}

async function getDefaultTenantId() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  if (!tenant) {
    throw new Error("Не знайдено tenant для створення каталогу.");
  }

  return tenant.id;
}

export async function createMaterialCatalogAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();
  const name = clean(formData.get("name"));

  if (!name) {
    throw new Error("Назва каталогу обовʼязкова.");
  }

  const isCurrent = normalizeCheckbox(formData.get("isCurrent"));

  if (isCurrent) {
    await prisma.materialCatalog.updateMany({
      where: {
        tenantId,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });
  }

  await prisma.materialCatalog.create({
    data: {
      tenantId,
      code: clean(formData.get("code")),
      name,
      category: clean(formData.get("category")),
      description: clean(formData.get("description")),
      version: parseVersion(formData.get("version")),
      isCurrent,
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/material-catalogs");
}

export async function updateMaterialCatalogAction(formData: FormData) {
  const id = clean(formData.get("id"));

  if (!id) {
    throw new Error("Не передано id каталогу.");
  }

  const existing = await prisma.materialCatalog.findUnique({
    where: { id },
    select: {
      id: true,
      tenantId: true,
    },
  });

  if (!existing) {
    throw new Error("Каталог не знайдено.");
  }

  const name = clean(formData.get("name"));

  if (!name) {
    throw new Error("Назва каталогу обовʼязкова.");
  }

  const isCurrent = normalizeCheckbox(formData.get("isCurrent"));

  if (isCurrent) {
    await prisma.materialCatalog.updateMany({
      where: {
        tenantId: existing.tenantId,
        isCurrent: true,
        id: {
          not: id,
        },
      },
      data: {
        isCurrent: false,
      },
    });
  }

  await prisma.materialCatalog.update({
    where: { id },
    data: {
      code: clean(formData.get("code")),
      name,
      category: clean(formData.get("category")),
      description: clean(formData.get("description")),
      version: parseVersion(formData.get("version")),
      isCurrent,
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/material-catalogs");
}
