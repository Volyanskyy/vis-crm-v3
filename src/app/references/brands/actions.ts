"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
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
    throw new Error("Не знайдено tenant для створення бренду.");
  }

  return tenant.id;
}

export async function createBrandAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();
  const name = clean(formData.get("name"));

  if (!name) {
    throw new Error("Назва бренду обовʼязкова.");
  }

  await prisma.brand.create({
     data:{
      tenantId,
      name,
      category: clean(formData.get("category")),
      country: clean(formData.get("country")),
      website: clean(formData.get("website")),
      notes: clean(formData.get("notes")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/brands");
}

export async function updateBrandAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id бренду.");
  }

  if (!name) {
    throw new Error("Назва бренду обовʼязкова.");
  }

  await prisma.brand.update({
    where: { id },
     data:{
      name,
      category: clean(formData.get("category")),
      country: clean(formData.get("country")),
      website: clean(formData.get("website")),
      notes: clean(formData.get("notes")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/brands");
}
