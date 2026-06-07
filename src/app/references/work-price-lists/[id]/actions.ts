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

function parsePrice(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim().replace(",", ".");
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return "0";
  }

  return parsed.toFixed(2);
}

function parseSortOrder(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.floor(parsed);
}

async function assertDraftWorkPriceList(workPriceListId: string) {
  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id: workPriceListId },
    select: {
      id: true,
      status: true,
      isArchived: true,
      name: true,
    },
  });

  if (!workPriceList) {
    throw new Error("Прайс не знайдено.");
  }

  if (workPriceList.status !== "DRAFT" || workPriceList.isArchived) {
    throw new Error(
      "Редагування позицій дозволене тільки для прайсу у статусі Чернетка.",
    );
  }

  return workPriceList;
}

async function getNextSortOrder(workPriceListId: string) {
  const lastItem = await prisma.workPriceItem.findFirst({
    where: { workPriceListId },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    select: { sortOrder: true },
  });

  return (lastItem?.sortOrder ?? 0) + 1;
}

export async function createWorkPriceItemAction(formData: FormData) {
  const workPriceListId = clean(formData.get("workPriceListId"));
  const name = clean(formData.get("name"));

  if (!workPriceListId) {
    throw new Error("Не передано workPriceListId.");
  }

  if (!name) {
    throw new Error("Назва позиції обовʼязкова.");
  }

  await assertDraftWorkPriceList(workPriceListId);

  const rawSortOrder = formData.get("sortOrder");
  const sortOrder =
    rawSortOrder === null || String(rawSortOrder).trim() === ""
      ? await getNextSortOrder(workPriceListId)
      : parseSortOrder(rawSortOrder);

  await prisma.workPriceItem.create({
    data: {
      workPriceListId,
      code: clean(formData.get("code")),
      category: clean(formData.get("category")),
      subcategory: clean(formData.get("subcategory")),
      name,
      description: clean(formData.get("description")),
      unit: clean(formData.get("unit")),
      basePrice: parsePrice(formData.get("basePrice")),
      isActive: !normalizeCheckbox(formData.get("isInactive")),
      sortOrder,
    },
  });

  revalidatePath("/references/work-price-lists");
  revalidatePath(`/references/work-price-lists/${workPriceListId}`);
}

export async function updateWorkPriceItemAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const workPriceListId = clean(formData.get("workPriceListId"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id позиції.");
  }

  if (!workPriceListId) {
    throw new Error("Не передано workPriceListId.");
  }

  if (!name) {
    throw new Error("Назва позиції обовʼязкова.");
  }

  await assertDraftWorkPriceList(workPriceListId);

  await prisma.workPriceItem.update({
    where: { id },
    data: {
      code: clean(formData.get("code")),
      category: clean(formData.get("category")),
      subcategory: clean(formData.get("subcategory")),
      name,
      description: clean(formData.get("description")),
      unit: clean(formData.get("unit")),
      basePrice: parsePrice(formData.get("basePrice")),
      isActive: !normalizeCheckbox(formData.get("isInactive")),
      sortOrder: parseSortOrder(formData.get("sortOrder")),
    },
  });

  revalidatePath("/references/work-price-lists");
  revalidatePath(`/references/work-price-lists/${workPriceListId}`);
}

export async function reorderWorkPriceItemsAction(input: {
  workPriceListId: string;
  orderedIds: string[];
}) {
  const workPriceListId = input.workPriceListId?.trim();

  if (!workPriceListId) {
    throw new Error("Не передано workPriceListId.");
  }

  if (!Array.isArray(input.orderedIds) || input.orderedIds.length === 0) {
    throw new Error("Не передано порядок позицій.");
  }

  await assertDraftWorkPriceList(workPriceListId);

  const existingItems = await prisma.workPriceItem.findMany({
    where: { workPriceListId },
    select: { id: true },
  });

  const existingIds = new Set(existingItems.map((item) => item.id));

  for (const id of input.orderedIds) {
    if (!existingIds.has(id)) {
      throw new Error("Список позицій для сортування містить некоректний id.");
    }
  }

  await prisma.$transaction(
    input.orderedIds.map((id, index) =>
      prisma.workPriceItem.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  revalidatePath("/references/work-price-lists");
  revalidatePath(`/references/work-price-lists/${workPriceListId}`);
}
