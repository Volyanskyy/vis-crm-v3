"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const WORK_PRICE_LIST_SCOPE_CSV_PATH =
  "/Users/volyanskyy/Projects/db_exports/v2/data/reference/work_price_list_scopes_catalog.csv";

function parseBoolean(value: string | null | undefined) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();

  return raw === "t" || raw === "true" || raw === "1" || raw === "yes";
}

function parseNumber(value: string | null | undefined, fallback = 0) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result.map((item) => item.trim());
}

function parseCsv(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce<Record<string, string>>((accumulator, header, index) => {
      accumulator[header] = values[index] ?? "";
      return accumulator;
    }, {});
  });
}

function revalidateWorkPriceListPaths() {
  revalidatePath("/references");
  revalidatePath("/references/work-price-lists");
  revalidatePath("/references/work-price-list-scopes");
}

async function getDefaultTenant() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!tenant) {
    throw new Error("Не знайдено tenant для виконання операції.");
  }

  return tenant;
}

export async function importWorkPriceListScopesFromCsvAction() {
  const tenant = await getDefaultTenant();
  const absolutePath = path.resolve(WORK_PRICE_LIST_SCOPE_CSV_PATH);

  let content: string;

  try {
    content = await fs.readFile(absolutePath, "utf8");
  } catch {
    throw new Error(`CSV файл не знайдено: ${absolutePath}`);
  }

  const rows = parseCsv(content);

  if (rows.length === 0) {
    throw new Error("CSV порожній або не містить жодного валідного рядка.");
  }

  let importedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const code = String(row.code ?? "").trim();
    const name = String(row.name ?? "").trim();

    if (!code || !name) {
      skippedCount += 1;
      continue;
    }

    await prisma.workPriceListScope.upsert({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code,
        },
      },
      update: {
        name,
        description: String(row.description ?? "").trim() || null,
        sortOrder: parseNumber(row.sort_order, 0),
        isActive: parseBoolean(row.is_active),
      },
      create: {
        tenantId: tenant.id,
        code,
        name,
        description: String(row.description ?? "").trim() || null,
        sortOrder: parseNumber(row.sort_order, 0),
        isActive: parseBoolean(row.is_active),
      },
    });

    importedCount += 1;
  }

  revalidateWorkPriceListPaths();

  return {
    ok: true,
    tenant: `${tenant.name} (${tenant.slug})`,
    importedCount,
    skippedCount,
    csvPath: absolutePath,
  };
}

export async function backfillWorkPriceListScopeIdsAction() {
  const workPriceLists = await prisma.workPriceList.findMany({
    where: {
      scopeId: null,
      category: {
        not: null,
      },
    },
    select: {
      id: true,
      tenantId: true,
      name: true,
      category: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let updatedCount = 0;
  let skippedCount = 0;
  const missingScopes: Array<{ id: string; name: string; category: string }> = [];

  for (const item of workPriceLists) {
    const categoryCode = String(item.category ?? "").trim();

    if (!categoryCode) {
      skippedCount += 1;
      continue;
    }

    const scope = await prisma.workPriceListScope.findFirst({
      where: {
        tenantId: item.tenantId,
        code: categoryCode,
      },
      select: {
        id: true,
      },
    });

    if (!scope) {
      missingScopes.push({
        id: item.id,
        name: item.name,
        category: categoryCode,
      });
      skippedCount += 1;
      continue;
    }

    await prisma.workPriceList.update({
      where: {
        id: item.id,
      },
    data:   {
        scopeId: scope.id,
      },
    });

    updatedCount += 1;
  }

  revalidateWorkPriceListPaths();

  return {
    ok: true,
    foundWithoutScope: workPriceLists.length,
    updatedCount,
    skippedCount,
    missingScopes,
  };
}
