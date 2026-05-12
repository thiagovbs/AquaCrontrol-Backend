const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();

// Busca o valor atual (Sempre pega o ID 1)
router.get('/', async (req, res) => {
// LOG DE DIAGNÓSTICO: Vamos ver o que o Prisma realmente tem disponível
  console.log("Modelos disponíveis no Prisma:", Object.keys(prisma));
  
  console.log("=> Rota GET /api/config acessada");
  try {

    // Se o seu modelo no schema.prisma for 'Configuracao'
    // O Prisma pode estar expondo como 'configuracao'
    const modelName = 'configuracao'; 
    
    if (!prisma[modelName]) {
       throw new Error(`O modelo ${modelName} não existe no Prisma Client. Modelos: ${Object.keys(prisma).join(', ')}`);
    }
    
    console.log("=> Tentando buscar no banco...");
    let config = await prisma.configuracao.findUnique({ where: { id: 1 } });
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
