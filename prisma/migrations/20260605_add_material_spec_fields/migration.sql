-- prisma/migrations/20260605_add_material_spec_fields/migration.sql

ALTER TABLE "MaterialItem"
  ADD COLUMN "displayName" TEXT,
  ADD COLUMN "specType" TEXT,
  ADD COLUMN "specParams" JSONB;

ALTER TABLE "ProjectMaterialItem"
  ADD COLUMN "displayName" TEXT,
  ADD COLUMN "specType" TEXT,
  ADD COLUMN "specParams" JSONB;

CREATE INDEX "MaterialItem_materialCatalogId_displayName_idx"
  ON "MaterialItem"("materialCatalogId", "displayName");
