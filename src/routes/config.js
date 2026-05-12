const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Busca o valor atual (Sempre pega o ID 1)
router.get('/', async (req, res) => {
  console.log("=> Rota GET /api/config acessada");
  try {
    console.log("=> Tentando buscar no banco...");
    const config = await prisma.configuracao.findUnique({ where: { id: 1 } });
    console.log("=> Resultado do banco:", config);
    if (!config) {
      console.log("=> Config não encontrada, criando padrão...");
      config = await prisma.configuracao.create({ data: { id: 1, valorMetroCubico: 0 } });
    }
    res.json(config);
  } catch (error) {
    console.error("❌ ERRO FATAL NO PRISMA:", error.message);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// Atualiza o valor
router.put('/', async (req, res) => {
  const { valorMetroCubico } = req.body;
  try {
    const config = await prisma.configuracao.update({
      where: { id: 1 },
      data: { valorMetroCubico: parseFloat(valorMetroCubico) }
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar valor' });
  }
});

module.exports = router;
