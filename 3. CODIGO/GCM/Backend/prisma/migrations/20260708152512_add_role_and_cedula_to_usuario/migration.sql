-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cedula" TEXT,
ADD COLUMN     "rol" TEXT NOT NULL DEFAULT 'Cliente';
