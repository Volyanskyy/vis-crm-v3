import path from "node:path";
import { V2_REFERENCE_DIR } from "../../config";
import { parseCsvFile } from "../../csv/parse-csv";
import { nullable } from "../../csv/csv-utils";
import { ImportResult, ReferenceImportContext } from "../../types";
import { createCounters } from "../../utils/logging";
import { slugCode } from "../../utils/normalize";

export async function importSkillTags(
  context: ReferenceImportContext,
): Promise<ImportResult> {
  const source = path.join(V2_REFERENCE_DIR, "skills_catalog.csv");
  const rows = await parseCsvFile(source);
  const counters = createCounters();
  counters.read = rows.length;

  for (const row of rows) {
    try {
      const name = row.name?.trim();

      if (!name) {
        counters.failed += 1;
        continue;
      }

      if (context.dryRun) {
        counters.created += 1;
        continue;
      }

      await context.prisma.skillTag.upsert({
        where: {
          code: slugCode(row.code, name),
        },
        update: {
          name,
          description: nullable(row.description),
        },
        create: {
          code: slugCode(row.code, name),
          name,
          description: nullable(row.description),
        },
      });

      counters.created += 1;
    } catch (error) {
      counters.failed += 1;
      console.error("[IMPORT_ERROR]", {
        importer: "NAME_HERE",
        row,
        error,
      });
    }

  }

  return {
    key: "skill-tags",
    source,
    target: "SkillTag",
    counters,
    notes: ["Імпорт навичок працівників"],
  };
}
