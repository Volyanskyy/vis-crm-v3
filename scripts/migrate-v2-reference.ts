import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_TENANT_SLUG } from "../src/modules/migration/config";
import { runV2ReferenceImport } from "../src/modules/migration/v2/reference-import";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: {
      slug: process.env.MIGRATION_TENANT_SLUG || DEFAULT_TENANT_SLUG,
    },
  });

  if (!tenant) {
    throw new Error(
      `Tenant not found for slug: ${process.env.MIGRATION_TENANT_SLUG || DEFAULT_TENANT_SLUG}`,
    );
  }

  const dryRun = process.argv.includes("--dry-run");

  const results = await runV2ReferenceImport({
    prisma,
    tenantId: tenant.id,
    mode: "upsert",
    dryRun,
  });


  console.log("\n=== V2 REFERENCE IMPORT SUMMARY ===");
  console.log(`tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`dryRun: ${dryRun ? "yes" : "no"}`);

  for (const result of results) {
    console.log(`\n[${result.key}]`);
    console.log(`source: ${result.source}`);
    console.log(`target: ${result.target}`);
    console.log(`read: ${result.counters.read}`);
    console.log(`created: ${result.counters.created}`);
    console.log(`updated: ${result.counters.updated}`);
    console.log(`skipped: ${result.counters.skipped}`);
    console.log(`failed: ${result.counters.failed}`);

    for (const note of result.notes) {
      console.log(`note: ${note}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
