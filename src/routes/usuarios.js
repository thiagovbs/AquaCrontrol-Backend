const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// Listar usuários (Somente ADMIN deveria acessar, mas vamos simplificar)
router.get('/', auth, async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true } // Não retornamos a senha!
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Criar/Atualizar via Painel
router.post('/', auth, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });
    res.status(201).json({ msg: "Usuário criado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let updateData = { name, email, role };
    
    // Se enviou senha nova, atualiza. Se não, mantém a atual.
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });
    res.json({ msg: "Usuário atualizado" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ msg: "Usuário deletado" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

module.exports = router;