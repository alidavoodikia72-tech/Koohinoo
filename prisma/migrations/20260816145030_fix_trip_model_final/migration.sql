/*
  Warnings:

  - You are about to drop the column `destination` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `difficulty` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "location" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "clubId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trip_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("capacity", "clubId", "createdAt", "createdById", "endDate", "id", "price", "startDate", "status", "title", "updatedAt") SELECT "capacity", "clubId", "createdAt", "createdById", "endDate", "id", coalesce("price", 0) AS "price", "startDate", "status", "title", "updatedAt" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
CREATE INDEX "Trip_clubId_startDate_idx" ON "Trip"("clubId", "startDate");
CREATE INDEX "Trip_status_idx" ON "Trip"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
