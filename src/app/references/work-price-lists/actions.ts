"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

function cleanMultiline(value: FormDataEntryValue | null) {
  const text = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  return text.length > 0 ? text : null;
}

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeBoolean(value: FormDataEntryValue | null) {
  return value === "true" || value === "on" || value === "1";
}

function parseVersion(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  return Math.floor(parsed);
}

function parseDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
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
    throw new Error("Не знайдено tenant для створення прайса.");
  }

  return tenant.id;
}

async function ensureScopeForTenant(scopeId: string | null, tenantId: string) {
  if (!scopeId) {
    throw new Error("Потрібно вибрати scope прайса.");
  }

  const scope = await prisma.workPriceListScope.findFirst({
    where: {
      id: scopeId,
      tenantId,
    },
    select: {
      id: true,
      code: true,
      name: true,
    },
  });

  if (!scope) {
    throw new Error("Обраний scope не знайдено.");
  }

  return scope;
}

async function unsetCurrentInScope(params: {
  tenantId: string;
  scopeId: string;
  excludeId?: string;
}) {
  const { tenantId, scopeId, excludeId } = params;

  await prisma.workPriceList.updateMany({
    where: {
      tenantId,
      scopeId,
      isCurrent: true,
      ...(excludeId
        ? {
            id: {
              not: excludeId,
            },
          }
        : {}),
    },
    data: {
      isCurrent: false,
    },
  });
}

function revalidateWorkPriceListPaths(workPriceListId?: string) {
  revalidatePath("/references");
  revalidatePath("/references/work-price-lists");
  revalidatePath("/references/work-price-list-scopes");

  if (workPriceListId) {
    revalidatePath(`/references/work-price-lists/${workPriceListId}`);
    revalidatePath(
      `/references/work-price-lists/${workPriceListId}/publication`,
    );
  }
}

export async function upsertWorkPriceListPublicationSettingsAction(
  formData: FormData,
) {
  const workPriceListId = clean(formData.get("workPriceListId"));

  if (!workPriceListId) {
    throw new Error("Не передано id прайса для publication settings.");
  }

  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id: workPriceListId },
    select: { id: true },
  });

  if (!workPriceList) {
    throw new Error("Прайс не знайдено.");
  }

  await prisma.workPriceListPublicationSettings.upsert({
    where: {
      workPriceListId,
    },
    create: {
      workPriceListId,
      logoUrl: clean(formData.get("logoUrl")),
      companyName: clean(formData.get("companyName")),
      companySubtitle: clean(formData.get("companySubtitle")),
      headerServices: cleanMultiline(formData.get("headerServices")),
      website: clean(formData.get("website")),
      email: clean(formData.get("email")),
      phones: cleanMultiline(formData.get("phones")),
      contactsLabel: clean(formData.get("contactsLabel")),
      directorLabel: clean(formData.get("directorLabel")),
      directorName: clean(formData.get("directorName")),
      addressLabel: clean(formData.get("addressLabel")),
      addressValue: cleanMultiline(formData.get("addressValue")),
      note: cleanMultiline(formData.get("note")),
      showLogo: normalizeBoolean(formData.get("showLogo")),
      showCompanySubtitle: normalizeBoolean(formData.get("showCompanySubtitle")),
      showHeaderServices: normalizeBoolean(formData.get("showHeaderServices")),
      showWebsite: normalizeBoolean(formData.get("showWebsite")),
      showEmail: normalizeBoolean(formData.get("showEmail")),
      showPhones: normalizeBoolean(formData.get("showPhones")),
      showContactsLabel: normalizeBoolean(formData.get("showContactsLabel")),
      showDirectorBlock: normalizeBoolean(formData.get("showDirectorBlock")),
      showAddressBlock: normalizeBoolean(formData.get("showAddressBlock")),
      showFooterNote: normalizeBoolean(formData.get("showFooterNote")),
    },
    update: {
      logoUrl: clean(formData.get("logoUrl")),
      companyName: clean(formData.get("companyName")),
      companySubtitle: clean(formData.get("companySubtitle")),
      headerServices: cleanMultiline(formData.get("headerServices")),
      website: clean(formData.get("website")),
      email: clean(formData.get("email")),
      phones: cleanMultiline(formData.get("phones")),
      contactsLabel: clean(formData.get("contactsLabel")),
      directorLabel: clean(formData.get("directorLabel")),
      directorName: clean(formData.get("directorName")),
      addressLabel: clean(formData.get("addressLabel")),
      addressValue: cleanMultiline(formData.get("addressValue")),
      note: cleanMultiline(formData.get("note")),
      showLogo: normalizeBoolean(formData.get("showLogo")),
      showCompanySubtitle: normalizeBoolean(formData.get("showCompanySubtitle")),
      showHeaderServices: normalizeBoolean(formData.get("showHeaderServices")),
      showWebsite: normalizeBoolean(formData.get("showWebsite")),
      showEmail: normalizeBoolean(formData.get("showEmail")),
      showPhones: normalizeBoolean(formData.get("showPhones")),
      showContactsLabel: normalizeBoolean(formData.get("showContactsLabel")),
      showDirectorBlock: normalizeBoolean(formData.get("showDirectorBlock")),
      showAddressBlock: normalizeBoolean(formData.get("showAddressBlock")),
      showFooterNote: normalizeBoolean(formData.get("showFooterNote")),
    },
  });

  revalidateWorkPriceListPaths(workPriceListId);
}

export async function createWorkPriceListAction(formData: FormData) {
  const tenantId = await getDefaultTenantId();
  const scope = await ensureScopeForTenant(
    clean(formData.get("scopeId")),
    tenantId,
  );

  const workPriceList = await prisma.workPriceList.create({
    data: {
      tenantId,
      scopeId: scope.id,
      category: scope.code,
      code: clean(formData.get("code")),
      name: clean(formData.get("name")) ?? "Новий прайс",
      description: cleanMultiline(formData.get("description")),
      version: parseVersion(formData.get("version")),
      status: "DRAFT",
      isArchived: false,
      isCurrent: false,
      validFrom: parseDate(formData.get("validFrom")),
      validTo: parseDate(formData.get("validTo")),
    },
    select: {
      id: true,
    },
  });

  revalidateWorkPriceListPaths(workPriceList.id);
  redirect(`/references/work-price-lists/${workPriceList.id}`);
}

export async function updateWorkPriceListAction(
  formData: FormData,
): Promise<ActionResult> {
  const id = clean(formData.get("id"));

  if (!id) {
    return { ok: false, message: "Не передано id прайса." };
  }

  const existing = await prisma.workPriceList.findUnique({
    where: { id },
    select: {
      id: true,
      tenantId: true,
      status: true,
      scopeId: true,
    },
  });

  if (!existing) {
    return { ok: false, message: "Прайс не знайдено." };
  }

  if (existing.status !== "DRAFT") {
    return {
      ok: false,
      message: "Редагувати можна лише прайс у статусі чернетки.",
    };
  }

  const scope = await ensureScopeForTenant(
    clean(formData.get("scopeId")) ?? existing.scopeId,
    existing.tenantId,
  );

  await prisma.workPriceList.update({
    where: { id },
    data: {
      scopeId: scope.id,
      category: scope.code,
      code: clean(formData.get("code")),
      name: clean(formData.get("name")) ?? "Прайс без назви",
      description: cleanMultiline(formData.get("description")),
      version: parseVersion(formData.get("version")),
      validFrom: parseDate(formData.get("validFrom")),
      validTo: parseDate(formData.get("validTo")),
    },
  });

  revalidateWorkPriceListPaths(id);

  return { ok: true, message: "Прайс оновлено." };
}

export async function duplicateWorkPriceListToDraftAction(
  id: string,
): Promise<ActionResult> {
  const source = await prisma.workPriceList.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      },
      publicationSettings: true,
    },
  });

  if (!source) {
    return { ok: false, message: "Батьківський прайс не знайдено." };
  }

  const duplicated = await prisma.$transaction(async (tx) => {
    const created = await tx.workPriceList.create({
      data: {
        tenantId: source.tenantId,
        scopeId: source.scopeId,
        category: source.category,
        code: source.code,
        name: `${source.name} — копія`,
        description: source.description,
        version: source.version + 1,
        status: "DRAFT",
        isArchived: false,
        isCurrent: false,
        validFrom: null,
        validTo: null,
        currencyCode: source.currencyCode,
        isDefault: false,
      },
      select: {
        id: true,
      },
    });

    if (source.items.length > 0) {
  await tx.workPriceItem.createMany({
    data: source.items.map((item) => ({
      workPriceListId: created.id,
      code: item.code,
      category: item.category,
      subcategory: item.subcategory,
      name: item.name,
      description: item.description,
      unit: item.unit,
      basePrice: item.basePrice,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      notes: item.notes,
    })),
  });
}


    if (source.publicationSettings) {
      await tx.workPriceListPublicationSettings.create({
        data: {
          workPriceListId: created.id,
          logoUrl: source.publicationSettings.logoUrl,
          companyName: source.publicationSettings.companyName,
          companySubtitle: source.publicationSettings.companySubtitle,
          headerServices: source.publicationSettings.headerServices,
          website: source.publicationSettings.website,
          email: source.publicationSettings.email,
          phones: source.publicationSettings.phones,
          contactsLabel: source.publicationSettings.contactsLabel,
          directorLabel: source.publicationSettings.directorLabel,
          directorName: source.publicationSettings.directorName,
          addressLabel: source.publicationSettings.addressLabel,
          addressValue: source.publicationSettings.addressValue,
          note: source.publicationSettings.note,
          showLogo: source.publicationSettings.showLogo,
          showCompanySubtitle: source.publicationSettings.showCompanySubtitle,
          showHeaderServices: source.publicationSettings.showHeaderServices,
          showWebsite: source.publicationSettings.showWebsite,
          showEmail: source.publicationSettings.showEmail,
          showPhones: source.publicationSettings.showPhones,
          showContactsLabel: source.publicationSettings.showContactsLabel,
          showDirectorBlock: source.publicationSettings.showDirectorBlock,
          showAddressBlock: source.publicationSettings.showAddressBlock,
          showFooterNote: source.publicationSettings.showFooterNote,
        },
      });
    }

    return created;
  });

  revalidateWorkPriceListPaths(duplicated.id);

  return {
    ok: true,
    message: "Створено чернетку-копію прайса з позиціями.",
  };
}

export async function moveWorkPriceListToDraftAction(
  id: string,
): Promise<ActionResult> {
  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      isCurrent: true,
    },
  });

  if (!workPriceList) {
    return { ok: false, message: "Прайс не знайдено." };
  }

  if (workPriceList.status === "DRAFT") {
    return { ok: true, message: "Прайс уже перебуває у статусі чернетки." };
  }

  await prisma.workPriceList.update({
    where: { id },
    data: {
      status: "DRAFT",
      isArchived: false,
      isCurrent: false,
      validTo: null,
    },
  });

  revalidateWorkPriceListPaths(id);

  return { ok: true, message: "Прайс переведено у чернетку." };
}

export async function publishWorkPriceListDraftAction(
  id: string,
): Promise<ActionResult> {
  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id },
    select: {
      id: true,
      tenantId: true,
      scopeId: true,
      status: true,
    },
  });

  if (!workPriceList) {
    return { ok: false, message: "Прайс не знайдено." };
  }

  if (workPriceList.status !== "DRAFT") {
    return {
      ok: false,
      message: "Активувати можна лише чернетку.",
    };
  }

  if (!workPriceList.scopeId) {
    return {
      ok: false,
      message: "Для прайса не задано scope. Активувати неможливо.",
    };
  }

  await unsetCurrentInScope({
    tenantId: workPriceList.tenantId,
    scopeId: workPriceList.scopeId,
    excludeId: workPriceList.id,
  });

  await prisma.workPriceList.update({
    where: { id },
    data: {
      status: "ACTIVE",
      isArchived: false,
      isCurrent: true,
      validFrom: new Date(),
      validTo: null,
    },
  });

  revalidateWorkPriceListPaths(id);

  return { ok: true, message: "Чернетку активовано." };
}

export async function archiveWorkPriceListAction(
  id: string,
): Promise<ActionResult> {
  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!workPriceList) {
    return { ok: false, message: "Прайс не знайдено." };
  }

  if (workPriceList.status !== "ACTIVE") {
    return {
      ok: false,
      message: "В архів можна перенести лише активний прайс.",
    };
  }

  await prisma.workPriceList.update({
    where: { id },
    data: {
      status: "ARCHIVED",
      isArchived: true,
      isCurrent: false,
      validTo: new Date(),
    },
  });

  revalidateWorkPriceListPaths(id);

  return { ok: true, message: "Прайс перенесено в архів." };
}

export async function activateArchivedWorkPriceListAction(
  id: string,
): Promise<ActionResult> {
  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id },
    select: {
      id: true,
      tenantId: true,
      scopeId: true,
      status: true,
    },
  });

  if (!workPriceList) {
    return { ok: false, message: "Прайс не знайдено." };
  }

  if (workPriceList.status !== "ARCHIVED") {
    return {
      ok: false,
      message: "Активувати можна лише архівний прайс.",
    };
  }

  if (!workPriceList.scopeId) {
    return {
      ok: false,
      message: "Для прайса не задано scope. Активувати неможливо.",
    };
  }

  await unsetCurrentInScope({
    tenantId: workPriceList.tenantId,
    scopeId: workPriceList.scopeId,
    excludeId: workPriceList.id,
  });

  await prisma.workPriceList.update({
    where: { id },
    data: {
      status: "ACTIVE",
      isArchived: false,
      isCurrent: true,
      validTo: null,
      validFrom: new Date(),
    },
  });

  revalidateWorkPriceListPaths(id);

  return { ok: true, message: "Архівний прайс активовано." };
}

export async function deleteWorkPriceListAction(
  id: string,
): Promise<ActionResult> {
  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      isCurrent: true,
      _count: {
        select: {
          projectWorkItems: true,
        },
      },
    },
  });

  if (!workPriceList) {
    return { ok: false, message: "Прайс не знайдено." };
  }

  if (workPriceList.status === "ACTIVE") {
    return {
      ok: false,
      message:
        "Активний прайс видаляти не можна. Спочатку перенесіть його в архів.",
    };
  }

  if (workPriceList.status === "ARCHIVED") {
    return {
      ok: false,
      message:
        "Архівний прайс видаляти не можна. Архів зберігає історію змін і версій.",
    };
  }

  if (workPriceList.status !== "DRAFT") {
    return {
      ok: false,
      message: "Видалити можна лише прайс у статусі чернетки.",
    };
  }

  if (workPriceList.isCurrent) {
    return {
      ok: false,
      message: "Поточну версію прайса видаляти не можна.",
    };
  }

  if (workPriceList._count.projectWorkItems > 0) {
    return {
      ok: false,
      message:
        "Чернетка вже використовується в проектах. Видалення заборонено.",
    };
  }

  await prisma.workPriceList.delete({
    where: { id },
  });

  revalidateWorkPriceListPaths();

  return {
    ok: true,
    message: `Чернетку "${workPriceList.name}" видалено.`,
  };
}
