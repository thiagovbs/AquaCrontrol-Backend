const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();


// Listar todos os proprietários
router.get('/', auth, async (req, res) => {
  try {
    const proprietarios = await prisma.proprietario.findMany({
      include: { unidades: true } // Traz as unidades vinculadas junto
    });
    res.json(proprietarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar proprietários" });
  }
});

// Criar proprietário
router.post('/', auth, async (req, res) => {
  const { nome, telefone, email } = req.body;
  try {
    const novo = await prisma.proprietario.create({
      data: { nome, telefone, email }
    });
    res.status(201).json(novo);
  } catch (error) {
    console.log("ERRO DO PRISMA:", error);
    res.status(500).json({ error: "Erro ao cadastrar proprietário" });
  }
});

// Atualizar proprietário
router.put('/:id', auth, async (req, res) => {
  const { nome, telefone, email } = req.body;
  try {
    const atualizado = await prisma.proprietario.update({
      where: { id: parseInt(req.params.id) },
      data: { nome, telefone, email }
    });
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar proprietário" });
  }
});

// Deletar proprietário
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.proprietario.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ msg: "Proprietário excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir. Verifique se existem unidades vinculadas." });
  }
});

module.exports = router;
