import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CSV_PATH =
  "/Users/volyanskyy/Projects/db_exports/v2/data/reference/work_price_list_scopes_catalog.csv";

function parseBoolean(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  return raw === "t" || raw === "true" || raw === "1" || raw === "yes";
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
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

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

async function main() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    throw new Error("Не знайдено tenant для імпорту scope-ів.");
  }

  const absolutePath = path.resolve(CSV_PATH);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`CSV не знайдено: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, "utf8");
  const rows = parseCsv(content);

  if (rows.length === 0) {
    throw new Error("CSV порожній або не вдалося прочитати жодного рядка.");
  }

  console.log(`Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`CSV rows: ${rows.length}`);

  for (const row of rows) {
    const code = String(row.code ?? "").trim();
    const name = String(row.name ?? "").trim();

    if (!code || !name) {
      console.warn("Пропущено рядок без code/name:", row);
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

    console.log(`✓ ${code} → ${name}`);
  }

  console.log("Імпорт scope-ів завершено.");
}

main()
  .catch((error) => {
    console.error("Помилка імпорту scope-ів:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
