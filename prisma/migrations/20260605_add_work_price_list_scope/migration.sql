CREATE TABLE "WorkPriceListScope" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkPriceListScope_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "WorkPriceList"
  ADD COLUMN "scopeId" TEXT,
  ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'UAH';

DROP INDEX IF EXISTS "WorkPriceList_tenantId_category_isCurrent_idx";

CREATE UNIQUE INDEX "WorkPriceListScope_tenantId_code_key"
  ON "WorkPriceListScope"("tenantId", "code");

CREATE INDEX "WorkPriceListScope_tenantId_isActive_idx"
  ON "WorkPriceListScope"("tenantId", "isActive");

CREATE INDEX "WorkPriceListScope_tenantId_sortOrder_idx"
  ON "WorkPriceListScope"("tenantId", "sortOrder");

CREATE INDEX "WorkPriceList_tenantId_scopeId_isCurrent_idx"
  ON "WorkPriceList"("tenantId", "scopeId", "isCurrent");

ALTER TABLE "WorkPriceListScope"
  ADD CONSTRAINT "WorkPriceListScope_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkPriceList"
  ADD CONSTRAINT "WorkPriceList_scopeId_fkey"
  FOREIGN KEY ("scopeId") REFERENCES "WorkPriceListScope"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
