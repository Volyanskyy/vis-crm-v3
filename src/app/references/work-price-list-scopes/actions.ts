"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function cleanMultiline(value: FormDataEntryValue | null) {
  const text = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  return text.length > 0 ? text : null;
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const raw = String(value ?? "").trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function revalidateScopePaths() {
  revalidatePath("/references");
  revalidatePath("/references/work-price-lists");
  revalidatePath("/references/work-price-list-scopes");
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
    throw new Error("Не знайдено tenant для scope.");
  }

  return tenant.id;
}

export async function createWorkPriceListScopeAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();
  const code = clean(formData.get("code"));
  const name = clean(formData.get("name"));

  if (!code) {
    throw new Error("Код scope обовʼязковий.");
  }

  if (!name) {
    throw new Error("Назва scope обовʼязкова.");
  }

  await prisma.workPriceListScope.create({
    data: {
      tenantId,
      code,
      name,
      description: cleanMultiline(formData.get("description")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
      isActive: true,
    },
  });

  revalidateScopePaths();
}

export async function updateWorkPriceListScopeAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id scope.");
  }

  if (!name) {
    throw new Error("Назва scope обовʼязкова.");
  }

  const existing = await prisma.workPriceListScope.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Scope не знайдено.");
  }

  await prisma.workPriceListScope.update({
    where: { id },
    data: {
      name,
      description: cleanMultiline(formData.get("description")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
    },
  });

  revalidateScopePaths();
}

export async function deleteWorkPriceListScopeAction(id: string) {
  const scope = await prisma.workPriceListScope.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          workPriceLists: true,
        },
      },
    },
  });

  if (!scope) {
    throw new Error("Scope не знайдено.");
  }

  if (scope._count.workPriceLists > 0) {
    throw new Error("Не можна видалити scope, до якого вже прив’язані прайси.");
  }

  await prisma.workPriceListScope.delete({
    where: { id },
  });

  revalidateScopePaths();
}
