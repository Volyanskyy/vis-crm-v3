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
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  if (!tenant) {
    throw new Error("Не знайдено tenant для створення клієнта.");
  }

  return tenant.id;
}

export async function createClientAction(formData: FormData) {
  const name = clean(formData.get("name"));

  if (!name) {
    throw new Error("Імʼя або назва клієнта обовʼязкові.");
  }

  const tenantId = await getDefaultTenantId();

  await prisma.client.create({
     data: {
      tenantId,
      name,
      companyName: clean(formData.get("companyName")),
      phone: clean(formData.get("phone")),
      email: clean(formData.get("email")),
      address: clean(formData.get("address")),
      taxNumber: clean(formData.get("taxNumber")),
      notes: clean(formData.get("notes")),
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/clients");
  revalidatePath("/");
}

export async function updateClientAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id клієнта.");
  }

  if (!name) {
    throw new Error("Імʼя або назва клієнта обовʼязкові.");
  }

  await prisma.client.update({
    where: { id },
     data:{
      name,
      companyName: clean(formData.get("companyName")),
      phone: clean(formData.get("phone")),
      email: clean(formData.get("email")),
      address: clean(formData.get("address")),
      taxNumber: clean(formData.get("taxNumber")),
      notes: clean(formData.get("notes")),
      isArchived: normalizeCheckbox(formData.get("isArchived")),
    },
  });

  revalidatePath("/clients");
  revalidatePath("/");
}
