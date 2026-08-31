-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placement" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Ad slot',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "linkUrl" TEXT NOT NULL DEFAULT '',
    "alt" TEXT NOT NULL DEFAULT 'Advertisement',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Ad_placement_key" ON "Ad"("placement");
