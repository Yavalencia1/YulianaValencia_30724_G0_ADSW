/*
  Warnings:

  - You are about to drop the column `fecha` on the `Mantenimiento` table. All the data in the column will be lost.
  - Added the required column `fechaEntrega` to the `Mantenimiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaIngreso` to the `Mantenimiento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mantenimiento" DROP COLUMN "fecha",
ADD COLUMN     "fechaEntrega" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaIngreso" TIMESTAMP(3) NOT NULL;
