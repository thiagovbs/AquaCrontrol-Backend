const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) return res.status(400).json({ msg: 'Usuário já existe' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await prisma.user.create({ data: { name, email, password: hashedPassword, role } });
    res.status(201).json({ msg: 'Usuário registrado com sucesso' });
  } catch (err) { res.status(500).send('Erro no servidor'); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas' });
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secreta123', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
  } catch (err) { res.status(500).send('Erro no servidor'); }
});

module.exports = router;
