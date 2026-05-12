const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// Listar unidades com dados do proprietário
router.get('/', auth, async (req, res) => {
  try {
    const unidades = await prisma.unidade.findMany({
      include: { proprietario: true }
    });
    res.json(unidades);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar unidades" });
  }
});

// Criar unidade vinculada a um proprietário
router.post('/', auth, async (req, res) => {
  const { numero, bloco, proprietarioId } = req.body;
  try {
    const unidade = await prisma.unidade.create({
      data: { 
        numero, 
        bloco, 
        proprietarioId: proprietarioId ? parseInt(proprietarioId) : null 
      }
    });
    res.status(201).json(unidade);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar unidade" });
  }
});

// Atualizar unidade
router.put('/:id', auth, async (req, res) => {
  const { numero, bloco, proprietarioId } = req.body;
  try {
    const unidade = await prisma.unidade.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        numero, 
        bloco, 
        proprietarioId: proprietarioId ? parseInt(proprietarioId) : null 
      }
    });
    res.json(unidade);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});

// Excluir unidade
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.unidade.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ msg: "Unidade excluída" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir" });
  }
});

module.exports = router;