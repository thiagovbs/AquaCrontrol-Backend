const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Isso vai nos ajudar a ver o que o banco está fazendo
});

module.exports = prisma;
