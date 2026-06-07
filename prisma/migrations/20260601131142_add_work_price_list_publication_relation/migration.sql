-- CreateTable
CREATE TABLE "WorkPriceListPublicationSettings" (
    "id" TEXT NOT NULL,
    "workPriceListId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "companyName" TEXT,
    "companySubtitle" TEXT,
    "headerServices" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phones" TEXT,
    "contactsLabel" TEXT,
    "documentTitle" TEXT,
    "introText" TEXT,
    "footerText" TEXT,
    "noteText" TEXT,
    "showDescription" BOOLEAN NOT NULL DEFAULT true,
    "showCategory" BOOLEAN NOT NULL DEFAULT true,
    "showPeriod" BOOLEAN NOT NULL DEFAULT true,
    "showFooter" BOOLEAN NOT NULL DEFAULT true,
    "showContacts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkPriceListPublicationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkPriceListPublicationSettings_workPriceListId_key" ON "WorkPriceListPublicationSettings"("workPriceListId");

-- AddForeignKey
ALTER TABLE "WorkPriceListPublicationSettings" ADD CONSTRAINT "WorkPriceListPublicationSettings_workPriceListId_fkey" FOREIGN KEY ("workPriceListId") REFERENCES "WorkPriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
