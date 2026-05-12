const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const leituras = await prisma.leitura.findMany({
      include: {
        unidade: {
          include: {
            proprietario: true // Traz o dono junto
          }
        }
      },
      orderBy: { criadoEm: 'desc' } // As mais recentes primeiro
    });
    res.json(leituras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar leituras' });
  }
});

// Criar nova leitura (Manual via Web)
router.post('/', auth, async (req, res) => {
  const { unidadeId, mesReferencia, anoReferencia, leituraAnterior, leituraAtual, valorTotal, dataVencimento, statusPagamento } = req.body;
  
  const consumo = parseFloat(leituraAtual) - parseFloat(leituraAnterior);

  try {
    const leitura = await prisma.leitura.create({
      data: {
        unidadeId: parseInt(unidadeId),
        mesReferencia: parseInt(mesReferencia),
        anoReferencia: parseInt(anoReferencia),
        leituraAnterior: parseFloat(leituraAnterior),
        leituraAtual: parseFloat(leituraAtual),
        consumo,
        valorTotal: parseFloat(valorTotal),
        dataVencimento: new Date(dataVencimento),
        statusPagamento: statusPagamento || 'PENDENTE'
      }
    });
    res.status(201).json(leitura);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar leitura" });
  }
});

// Atualizar leitura (Ex: Mudar para PAGO ou corrigir medição)
router.put('/:id', auth, async (req, res) => {
  const { mesReferencia, anoReferencia, leituraAnterior, leituraAtual, valorTotal, dataVencimento, statusPagamento } = req.body;
  
  const consumo = parseFloat(leituraAtual) - parseFloat(leituraAnterior);

  try {
    const leitura = await prisma.leitura.update({
      where: { id: parseInt(req.params.id) },
      data: {
        mesReferencia: parseInt(mesReferencia),
        anoReferencia: parseInt(anoReferencia),
        leituraAnterior: parseFloat(leituraAnterior),
        leituraAtual: parseFloat(leituraAtual),
        consumo,
        valorTotal: parseFloat(valorTotal),
        dataVencimento: new Date(dataVencimento),
        statusPagamento
      }
    });
    res.json(leitura);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar leitura" });
  }
});

// Deletar leitura
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.leitura.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ msg: "Leitura excluída" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir leitura" });
  }
});

module.exports = router;
