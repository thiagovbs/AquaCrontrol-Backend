/*
  Warnings:

  - You are about to drop the column `proprietario` on the `Unidade` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Unidade" DROP COLUMN "proprietario",
ADD COLUMN     "proprietarioId" INTEGER;

-- CreateTable
CREATE TABLE "Proprietario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proprietario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proprietario_email_key" ON "Proprietario"("email");

-- AddForeignKey
ALTER TABLE "Unidade" ADD CONSTRAINT "Unidade_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
