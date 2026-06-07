/*
  Warnings:

  - You are about to drop the column `fittingTypeId` on the `FittingPoint` table. All the data in the column will be lost.
  - You are about to drop the column `pointCode` on the `FittingPoint` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FittingPoint" DROP CONSTRAINT "FittingPoint_fittingTypeId_fkey";

-- DropIndex
DROP INDEX "FittingPoint_fittingTypeId_idx";

-- AlterTable
ALTER TABLE "FittingPoint" DROP COLUMN "fittingTypeId",
DROP COLUMN "pointCode",
ADD COLUMN     "fittingTypeId1" TEXT,
ADD COLUMN     "fittingTypeId2" TEXT,
ADD COLUMN     "fittingTypeId3" TEXT,
ADD COLUMN     "fittingTypeId4" TEXT,
ADD COLUMN     "fittingTypeId5" TEXT,
ADD COLUMN     "fittingTypeId6" TEXT,
ADD COLUMN     "frameSize" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "MaterialItem" ADD COLUMN     "technicalSpec" TEXT;

-- CreateTable
CREATE TABLE "ProjectWorkItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceWorkPriceListId" TEXT,
    "sourceWorkPriceItemId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isTransferred" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "subcategory" TEXT,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectWorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMaterialItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceMaterialCatalogId" TEXT,
    "sourceMaterialItemId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isTransferred" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "subcategory" TEXT,
    "code" TEXT,
    "sku" TEXT,
    "brandName" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "technicalSpec" TEXT,
    "unit" TEXT,
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 1,
    "costPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "retailPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalRetail" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMaterialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPanelLine" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "lineCode" TEXT,
    "roomName" TEXT,
    "destination" TEXT,
    "cableType" TEXT,
    "cableSection" TEXT,
    "phases" TEXT,
    "breaker" TEXT,
    "rcd" TEXT,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPanelLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectWorkItem_projectId_sortOrder_idx" ON "ProjectWorkItem"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectWorkItem_projectId_isArchived_idx" ON "ProjectWorkItem"("projectId", "isArchived");

-- CreateIndex
CREATE INDEX "ProjectWorkItem_projectId_isTransferred_idx" ON "ProjectWorkItem"("projectId", "isTransferred");

-- CreateIndex
CREATE INDEX "ProjectWorkItem_sourceWorkPriceListId_idx" ON "ProjectWorkItem"("sourceWorkPriceListId");

-- CreateIndex
CREATE INDEX "ProjectWorkItem_sourceWorkPriceItemId_idx" ON "ProjectWorkItem"("sourceWorkPriceItemId");

-- CreateIndex
CREATE INDEX "ProjectMaterialItem_projectId_sortOrder_idx" ON "ProjectMaterialItem"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectMaterialItem_projectId_isArchived_idx" ON "ProjectMaterialItem"("projectId", "isArchived");

-- CreateIndex
CREATE INDEX "ProjectMaterialItem_projectId_isTransferred_idx" ON "ProjectMaterialItem"("projectId", "isTransferred");

-- CreateIndex
CREATE INDEX "ProjectMaterialItem_sourceMaterialCatalogId_idx" ON "ProjectMaterialItem"("sourceMaterialCatalogId");

-- CreateIndex
CREATE INDEX "ProjectMaterialItem_sourceMaterialItemId_idx" ON "ProjectMaterialItem"("sourceMaterialItemId");

-- CreateIndex
CREATE INDEX "ProjectPanelLine_projectId_sortOrder_idx" ON "ProjectPanelLine"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "FittingPoint_fittingTypeId1_idx" ON "FittingPoint"("fittingTypeId1");

-- AddForeignKey
ALTER TABLE "ProjectWorkItem" ADD CONSTRAINT "ProjectWorkItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkItem" ADD CONSTRAINT "ProjectWorkItem_sourceWorkPriceListId_fkey" FOREIGN KEY ("sourceWorkPriceListId") REFERENCES "WorkPriceList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectWorkItem" ADD CONSTRAINT "ProjectWorkItem_sourceWorkPriceItemId_fkey" FOREIGN KEY ("sourceWorkPriceItemId") REFERENCES "WorkPriceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMaterialItem" ADD CONSTRAINT "ProjectMaterialItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMaterialItem" ADD CONSTRAINT "ProjectMaterialItem_sourceMaterialCatalogId_fkey" FOREIGN KEY ("sourceMaterialCatalogId") REFERENCES "MaterialCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMaterialItem" ADD CONSTRAINT "ProjectMaterialItem_sourceMaterialItemId_fkey" FOREIGN KEY ("sourceMaterialItemId") REFERENCES "MaterialItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPanelLine" ADD CONSTRAINT "ProjectPanelLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingPoint" ADD CONSTRAINT "FittingPoint_fittingTypeId1_fkey" FOREIGN KEY ("fittingTypeId1") REFERENCES "FittingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingPoint" ADD CONSTRAINT "FittingPoint_fittingTypeId2_fkey" FOREIGN KEY ("fittingTypeId2") REFERENCES "FittingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingPoint" ADD CONSTRAINT "FittingPoint_fittingTypeId3_fkey" FOREIGN KEY ("fittingTypeId3") REFERENCES "FittingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingPoint" ADD CONSTRAINT "FittingPoint_fittingTypeId4_fkey" FOREIGN KEY ("fittingTypeId4") REFERENCES "FittingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingPoint" ADD CONSTRAINT "FittingPoint_fittingTypeId5_fkey" FOREIGN KEY ("fittingTypeId5") REFERENCES "FittingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingPoint" ADD CONSTRAINT "FittingPoint_fittingTypeId6_fkey" FOREIGN KEY ("fittingTypeId6") REFERENCES "FittingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
