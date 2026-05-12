-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LEITURISTA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PAGO', 'PENDENTE', 'ATRASADO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidade" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "bloco" TEXT,
    "proprietario" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leitura" (
    "id" SERIAL NOT NULL,
    "unidadeId" INTEGER NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "leituraAnterior" DOUBLE PRECISION NOT NULL,
    "leituraAtual" DOUBLE PRECISION NOT NULL,
    "consumo" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "statusPagamento" "Status" NOT NULL DEFAULT 'PENDENTE',
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leitura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Leitura" ADD CONSTRAINT "Leitura_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
