"use server";

import {
    buildMaterialDisplayName,
    inferMaterialSpecType,
    normalizeMaterialSpecType,
    parseSpecParams,
} from "@/lib/material-specs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type MaterialItemActionResult = {
  ok: boolean;
  error?: string;
};

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const raw = String(value ?? "").trim().replace(",", ".");
  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function parsePrice(value: FormDataEntryValue | null) {
  const parsed = parseNumber(value, 0);

  if (parsed < 0) {
    return "0.00";
  }

  return parsed.toFixed(2);
}

function parseSortOrder(value: FormDataEntryValue | null) {
  return Math.floor(parseNumber(value, 0));
}

function revalidateMaterialCatalogPaths(materialCatalogId: string) {
  revalidatePath(`/references/material-catalogs/${materialCatalogId}`);
  revalidatePath("/references/material-catalogs");
}

function resolveSpecType(
  explicitSpecType: string | null,
  category: string | null,
) {
  return (
    normalizeMaterialSpecType(explicitSpecType) ??
    inferMaterialSpecType(category) ??
    "generic"
  );
}

async function getNextMaterialSortOrder(materialCatalogId: string) {
  const lastItem = await prisma.materialItem.findFirst({
    where: {
      materialCatalogId,
    },
    orderBy: {
      sortOrder: "desc",
    },
    select: {
      sortOrder: true,
    },
  });

  return (lastItem?.sortOrder ?? 0) + 1;
}

export async function createMaterialItemAction(
  formData: FormData,
): Promise<MaterialItemActionResult> {
  try {
    const materialCatalogId = clean(formData.get("materialCatalogId"));
    const name = clean(formData.get("name"));
    const brandId = clean(formData.get("brandId"));
    const category = clean(formData.get("category"));
    const specParams = parseSpecParams(formData.get("specParams"));
    const specType = resolveSpecType(clean(formData.get("specType")), category);

    if (!materialCatalogId) {
      return { ok: false, error: "Не передано materialCatalogId." };
    }

    if (!name) {
      return { ok: false, error: "Назва матеріалу обовʼязкова." };
    }

    const displayName = buildMaterialDisplayName({
      name,
      specType,
      specParams,
    });

    const nextSortOrder = await getNextMaterialSortOrder(materialCatalogId);

    await prisma.materialItem.create({
      data: {
        materialCatalogId,
        brand: brandId ? { connect: { id: brandId } } : undefined,
        code: clean(formData.get("code")),
        sku: clean(formData.get("sku")),
        name,
        displayName,
        specType,
        specParams: specParams ?? undefined,
        category,
        subcategory: clean(formData.get("subcategory")),
        unit: clean(formData.get("unit")),
        costPrice: parsePrice(formData.get("costPrice")),
        recommendedRetail: parsePrice(formData.get("recommendedRetail")),
        description: clean(formData.get("description")),
        technicalSpec: clean(formData.get("technicalSpec")),
        sortOrder: nextSortOrder,
        isActive: !normalizeCheckbox(formData.get("isInactive")),
      },
    });

    revalidateMaterialCatalogPaths(materialCatalogId);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити матеріал.",
    };
  }
}

export async function updateMaterialItemAction(
  formData: FormData,
): Promise<MaterialItemActionResult> {
  try {
    const id = clean(formData.get("id"));
    const materialCatalogId = clean(formData.get("materialCatalogId"));
    const name = clean(formData.get("name"));
    const brandId = clean(formData.get("brandId"));
    const category = clean(formData.get("category"));
    const specParams = parseSpecParams(formData.get("specParams"));
    const specType = resolveSpecType(clean(formData.get("specType")), category);

    if (!id) {
      return { ok: false, error: "Не передано id матеріалу." };
    }

    if (!materialCatalogId) {
      return { ok: false, error: "Не передано materialCatalogId." };
    }

    if (!name) {
      return { ok: false, error: "Назва матеріалу обовʼязкова." };
    }

    const displayName = buildMaterialDisplayName({
      name,
      specType,
      specParams,
    });

    await prisma.materialItem.update({
      where: { id },
      data: {
        brand: brandId
          ? { connect: { id: brandId } }
          : { disconnect: true },
        code: clean(formData.get("code")),
        sku: clean(formData.get("sku")),
        name,
        displayName,
        specType,
        specParams: specParams ?? undefined,
        category,
        subcategory: clean(formData.get("subcategory")),
        unit: clean(formData.get("unit")),
        costPrice: parsePrice(formData.get("costPrice")),
        recommendedRetail: parsePrice(formData.get("recommendedRetail")),
        description: clean(formData.get("description")),
        technicalSpec: clean(formData.get("technicalSpec")),
        sortOrder: parseSortOrder(formData.get("sortOrder")),
        isActive: !normalizeCheckbox(formData.get("isInactive")),
      },
    });

    revalidateMaterialCatalogPaths(materialCatalogId);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити матеріал.",
    };
  }
}

export async function duplicateMaterialItemAction(input: {
  id: string;
  materialCatalogId: string;
}): Promise<MaterialItemActionResult> {
  try {
    const source = await prisma.materialItem.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!source) {
      return { ok: false, error: "Матеріал для копіювання не знайдено." };
    }

    const nextSortOrder = await getNextMaterialSortOrder(input.materialCatalogId);

    await prisma.materialItem.create({
      data: {
        materialCatalogId: input.materialCatalogId,
        brandId: source.brandId,
        code: source.code,
        sku: source.sku,
        name: source.name,
        displayName: source.displayName,
        specType: source.specType,
        specParams: source.specParams ?? undefined,
        category: source.category,
        subcategory: source.subcategory,
        unit: source.unit,
        costPrice: source.costPrice,
        recommendedRetail: source.recommendedRetail,
        description: source.description,
        technicalSpec: source.technicalSpec,
        sortOrder: nextSortOrder,
        isActive: source.isActive,
      },
    });

    revalidateMaterialCatalogPaths(input.materialCatalogId);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося скопіювати матеріал.",
    };
  }
}

export async function deleteMaterialItemAction(
  id: string,
  materialCatalogId: string,
): Promise<MaterialItemActionResult> {
  try {
    await prisma.materialItem.delete({
      where: { id },
    });

    revalidateMaterialCatalogPaths(materialCatalogId);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити матеріал.",
    };
  }
}

export async function reorderMaterialItemsAction(input: {
  materialCatalogId: string;
  itemIds: string[];
}): Promise<MaterialItemActionResult> {
  try {
    const materialCatalogId = clean(input.materialCatalogId);
    const itemIds = Array.isArray(input.itemIds) ? input.itemIds : [];

    if (!materialCatalogId) {
      return { ok: false, error: "Не передано materialCatalogId." };
    }

    if (itemIds.length === 0) {
      return { ok: false, error: "Не передано список позицій для сортування." };
    }

    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.materialItem.update({
          where: { id },
          data: {
            sortOrder: index + 1,
          },
        }),
      ),
    );

    revalidateMaterialCatalogPaths(materialCatalogId);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося зберегти новий порядок матеріалів.",
    };
  }
}
