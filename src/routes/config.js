const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Busca o valor atual (Sempre pega o ID 1)
router.get('/', async (req, res) => {
  try {
    let config = await prisma.configuracao.findUnique({ where: { id: 1 } });
    if (!config) {
      config = await prisma.configuracao.create({ data: { id: 1, valorMetroCubico: 0 } });
    }
    res.json(config);
  } catch (error) {
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
