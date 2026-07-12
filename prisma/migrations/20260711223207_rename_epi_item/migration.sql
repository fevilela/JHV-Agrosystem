/*
  Warnings:

  - You are about to drop the column `item` on the `epi_issuances` table. All the data in the column will be lost.
  - Added the required column `itemName` to the `epi_issuances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "epi_issuances" DROP COLUMN "item",
ADD COLUMN     "itemName" TEXT NOT NULL;
