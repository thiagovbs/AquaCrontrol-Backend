const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    // Busca todas as leituras e traz junto os dados da unidade e do proprietário
    const leituras = await prisma.leitura.findMany({
      include: {
        unidade: {
          include: { proprietario: true }
        }
      },
      orderBy: { dataVencimento: 'asc' } // Ordena pelos vencimentos mais antigos
    });

    let receitaPrevista = 0;
    let contasPagas = 0;
    let contasAtrasadas = 0;
    let consumoTotal = 0;
    const inadimplentes = [];

    // Faz os cálculos e separações
    leituras.forEach(l => {
      receitaPrevista += l.valorTotal;
      consumoTotal += l.consumo;

      if (l.statusPagamento === 'PAGO') {
        contasPagas += 1;
      } else if (l.statusPagamento === 'ATRASADO') {
        contasAtrasadas += 1;
        inadimplentes.push(l);
      }
    });

    res.json({
      stats: {
        receitaPrevista,
        contasPagas,
        contasAtrasadas,
        consumoTotal
      },
      inadimplentes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao carregar os dados do dashboard" });
  }
});

module.exports = router;