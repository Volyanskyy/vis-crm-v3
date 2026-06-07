/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `FittingType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `LightingSystemType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `RoomType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workPriceListId,code]` on the table `WorkPriceItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name,version]` on the table `WorkPriceList` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Brand_tenantId_name_idx";

-- DropIndex
DROP INDEX "FittingType_tenantId_name_idx";

-- DropIndex
DROP INDEX "LightingSystemType_tenantId_name_idx";

-- DropIndex
DROP INDEX "RoomType_tenantId_name_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Brand_tenantId_name_key" ON "Brand"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FittingType_tenantId_name_key" ON "FittingType"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LightingSystemType_tenantId_name_key" ON "LightingSystemType"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_tenantId_name_key" ON "RoomType"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkPriceItem_workPriceListId_code_key" ON "WorkPriceItem"("workPriceListId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "WorkPriceList_tenantId_name_version_key" ON "WorkPriceList"("tenantId", "name", "version");
