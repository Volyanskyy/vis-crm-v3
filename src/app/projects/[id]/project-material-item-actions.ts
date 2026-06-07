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

export async function createProjectMaterialItemAction(formData: FormData) {
  const projectId = clean(formData.get("projectId"));
  const sourceMaterialItemId = clean(formData.get("sourceMaterialItemId"));

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  if (!sourceMaterialItemId) {
    throw new Error("Оберіть матеріал із довідника.");
  }

  const sourceItem = await prisma.materialItem.findUnique({
    where: { id: sourceMaterialItemId },
    include: {
      materialCatalog: true,
      brand: true,
    },
  });

  if (!sourceItem || !sourceItem.isActive) {
    throw new Error("Матеріал не знайдено або він неактивний.");
  }

  if (sourceItem.materialCatalog.status !== "ACTIVE") {
    throw new Error("Матеріал належить до неактивного довідника.");
  }

  const quantity = toDecimal(formData.get("quantity"), "1");
  const totalCost = multiply(quantity, String(sourceItem.costPrice));
  const totalRetail = multiply(quantity, String(sourceItem.recommendedRetail));

  await prisma.projectMaterialItem.create({
    data: {
      projectId,
      sourceMaterialCatalogId: sourceItem.materialCatalogId,
      sourceMaterialItemId: sourceItem.id,
      category: sourceItem.category ?? sourceItem.materialCatalog.category,
      subcategory: sourceItem.subcategory,
      code: sourceItem.code,
      sku: sourceItem.sku,
      brandName: sourceItem.brand?.name ?? null,
      name: sourceItem.name,
      displayName: sourceItem.displayName ?? sourceItem.name,
      specType: sourceItem.specType ?? null,
      specParams: sourceItem.specParams ?? undefined,
      description: sourceItem.description,
      technicalSpec: sourceItem.technicalSpec,
      unit: sourceItem.unit,
      quantity,
      costPrice: String(sourceItem.costPrice),
      retailPrice: String(sourceItem.recommendedRetail),
      totalCost,
      totalRetail,
      note: clean(formData.get("note")),
      sortOrder: toInt(formData.get("sortOrder"), sourceItem.sortOrder),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-materials`);
  revalidatePath(`/projects/${projectId}/estimate`);
  revalidatePath(`/projects/${projectId}/procurement`);
  revalidatePath("/projects");
}

export async function updateProjectMaterialItemAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));

  if (!id) {
    throw new Error("Не передано id матеріалу.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  const current = await prisma.projectMaterialItem.findUnique({
    where: { id },
  });

  if (!current) {
    throw new Error("Позицію матеріалу не знайдено.");
  }

  const quantity = toDecimal(formData.get("quantity"), String(current.quantity));
  const costPrice = toDecimal(formData.get("costPrice"), String(current.costPrice));
  const retailPrice = toDecimal(
    formData.get("retailPrice"),
    String(current.retailPrice),
  );
  const totalCost = multiply(quantity, costPrice);
  const totalRetail = multiply(quantity, retailPrice);

  await prisma.projectMaterialItem.update({
    where: { id },
    data: {
      quantity,
      costPrice,
      retailPrice,
      totalCost,
      totalRetail,
      note: clean(formData.get("note")),
      technicalSpec: clean(formData.get("technicalSpec")),
      sortOrder: toInt(formData.get("sortOrder"), current.sortOrder),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-materials`);
  revalidatePath(`/projects/${projectId}/estimate`);
  revalidatePath(`/projects/${projectId}/procurement`);
  revalidatePath("/projects");
}

export async function archiveProjectMaterialItemAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const projectId = clean(formData.get("projectId"));

  if (!id) {
    throw new Error("Не передано id матеріалу.");
  }

  if (!projectId) {
    throw new Error("Не передано projectId.");
  }

  const current = await prisma.projectMaterialItem.findUnique({
    where: { id },
    select: { id: true, isArchived: true },
  });

  if (!current) {
    throw new Error("Позицію матеріалу не знайдено.");
  }

  await prisma.projectMaterialItem.update({
    where: { id },
    data: {
      isArchived: !current.isArchived,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/work-materials`);
  revalidatePath(`/projects/${projectId}/estimate`);
  revalidatePath(`/projects/${projectId}/procurement`);
  revalidatePath("/projects");
}
