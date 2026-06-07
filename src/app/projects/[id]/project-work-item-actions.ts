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

function toDecimal(value: FormDataEntryValue | null, fallback = "0") {
  const text = String(value ?? "").trim();

  if (!text) {
    return fallback;
  }

  const normalized = text.replace(",", ".");
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error("Десяткове поле містить некоректне значення.");
  }

  return normalized;
}

function multiply(quantityText: string, priceText: string) {
  const quantity = Number.parseFloat(quantityText);
  const price = Number.parseFloat(priceText);

  if (Number.isNaN(quantity) || Number.isNaN(price)) {
    return "0";
  }

  return (quantity * price).toFixed(2);
}

export async function createProjectWorkItemAction(formData: FormData) {
  const projectId = clean(formData.get("projectId"));
  const sourceWorkPriceItemId = clean(formData.get("sourceWorkPriceItemId"));

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  if (!sourceWorkPriceItemId) {
    throw new Error("Оберіть позицію з прайсу робіт.");
  }

  const sourceItem = await prisma.workPriceItem.findUnique({
    where: { id: sourceWorkPriceItemId },
    include: {
      workPriceList: true,
    },
  });

  if (!sourceItem || !sourceItem.isActive) {
    throw new Error("Позицію прайсу робіт не знайдено або вона неактивна.");
  }

  if (
    sourceItem.workPriceList.status !== "ACTIVE" ||
    !sourceItem.workPriceList.isCurrent
  ) {
    throw new Error("Обрана позиція не належить до актуального прайсу робіт.");
  }

  const quantity = toDecimal(formData.get("quantity"), "1");
  const totalPrice = multiply(quantity, String(sourceItem.basePrice));

  await prisma.projectWorkItem.create({
     data:{
      projectId,
      sourceWorkPriceListId: sourceItem.workPriceListId,
      sourceWorkPriceItemId: sourceItem.id,
      category: sourceItem.category ?? sourceItem.workPriceList.category,
      subcategory: sourceItem.subcategory,
      code: sourceItem.code,
      name: sourceItem.name,
      description: sourceItem.description,
      unit: sourceItem.unit,
      quantity,
      unitPrice: String(sourceItem.basePrice),
      totalPrice,
      note: clean(formData.get("note")),
      sortOrder: toInt(formData.get("sortOrder"), sourceItem.sortOrder),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-materials`);
  revalidatePath(`/projects/${projectId}/estimate`);
  revalidatePath("/projects");
}

export async function updateProjectWorkItemAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));

  if (!id) {
    throw new Error("Не передано id роботи.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  const current = await prisma.projectWorkItem.findUnique({
    where: { id },
  });

  if (!current) {
    throw new Error("Позицію роботи не знайдено.");
  }

  const quantity = toDecimal(formData.get("quantity"), String(current.quantity));
  const unitPrice = toDecimal(formData.get("unitPrice"), String(current.unitPrice));
  const totalPrice = multiply(quantity, unitPrice);

  await prisma.projectWorkItem.update({
    where: { id },
     data:{
      quantity,
      unitPrice,
      totalPrice,
      note: clean(formData.get("note")),
      sortOrder: toInt(formData.get("sortOrder"), current.sortOrder),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-materials`);
  revalidatePath(`/projects/${projectId}/estimate`);
  revalidatePath("/projects");
}

export async function archiveProjectWorkItemAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));

  if (!id) {
    throw new Error("Не передано id роботи.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  const current = await prisma.projectWorkItem.findUnique({
    where: { id },
    select: { id: true, isArchived: true },
  });

  if (!current) {
    throw new Error("Позицію роботи не знайдено.");
  }

  await prisma.projectWorkItem.update({
    where: { id },
     data:{
      isArchived: !current.isArchived,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-materials`);
  revalidatePath(`/projects/${projectId}/estimate`);
  revalidatePath("/projects");
}
