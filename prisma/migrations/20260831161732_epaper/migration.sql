-- CreateTable
CREATE TABLE "Edition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'The Chronicle',
    "strapline" TEXT NOT NULL DEFAULT 'Digital Edition',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EditionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "prominence" TEXT NOT NULL DEFAULT 'standard',
    "editionId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    CONSTRAINT "EditionItem_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EditionItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Edition_date_key" ON "Edition"("date");

-- CreateIndex
CREATE INDEX "EditionItem_editionId_page_order_idx" ON "EditionItem"("editionId", "page", "order");

-- CreateIndex
CREATE UNIQUE INDEX "EditionItem_editionId_articleId_key" ON "EditionItem"("editionId", "articleId");
