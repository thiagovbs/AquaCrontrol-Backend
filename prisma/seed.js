/**
 * Cria o primeiro administrador de um ambiente novo.
 *
 * Substitui o antigo POST /register, que era público e criava ADMIN. Aqui as
 * credenciais vêm do ambiente e nada é exposto pela API.
 *
 * É idempotente e conservador: se já existir qualquer ADMIN, não faz nada.
 * Nunca altera senha de usuário existente — rodar em um ambiente que já está
 * no ar é seguro e não tem efeito.
 *
 * Uso:
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run seed
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim();
  const senha = process.env.SEED_ADMIN_PASSWORD || '';
  const nome = (process.env.SEED_ADMIN_NAME || 'Administrador').trim();

  const existente = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existente) {
    console.log(
      `Já existe administrador (id ${existente.id}). Nada a fazer — ` +
        'o seed não altera usuários existentes.'
    );
    return;
  }

  if (!email || !senha) {
    throw new Error(
      'Nenhum administrador no banco e SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD ' +
        'não foram definidos. Informe os dois para criar o primeiro acesso.'
    );
  }

  if (senha.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD deve ter ao menos 12 caracteres.');
  }

  // O e-mail é @unique: se estiver em uso por um não-ADMIN, avisa em vez de
  // estourar a constraint.
  const emailEmUso = await prisma.user.findUnique({ where: { email } });
  if (emailEmUso) {
    throw new Error(
      `O e-mail ${email} já pertence ao usuário ${emailEmUso.id} ` +
        `(${emailEmUso.role}). Use outro e-mail ou promova esse usuário.`
    );
  }

  const hash = await bcrypt.hash(senha, await bcrypt.genSalt(10));
  const admin = await prisma.user.create({
    data: { name: nome, email, password: hash, role: 'ADMIN' },
  });

  console.log(`Administrador criado: ${admin.email} (id ${admin.id}).`);
}

main()
  .catch((erro) => {
    console.error(erro.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
