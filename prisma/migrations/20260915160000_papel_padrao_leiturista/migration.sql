-- O padrao do papel era ADMIN, o que tornava grave qualquer caminho que
-- deixasse de informar o campo: o usuario nascia administrador. Passa a ser
-- LEITURISTA, o menor privilegio.
--
-- Altera apenas o default da coluna; as linhas existentes nao sao tocadas, e
-- os administradores atuais continuam administradores.

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'LEITURISTA';
