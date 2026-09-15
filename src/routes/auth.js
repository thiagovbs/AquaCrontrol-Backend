/**
 * Autenticação.
 *
 * POST /register foi removido. Era público, aceitava `role` do corpo e o
 * schema tinha @default(ADMIN): um POST sem autenticação nenhuma criava um
 * administrador. Não era chamado por frontend nem mobile, e POST /api/usuarios
 * (protegido por auth + isAdmin) já cobre a criação de usuários. O primeiro
 * administrador de um ambiente novo vem de `npm run seed`.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { JWT_SECRET } = require('../config');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas' });
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
  } catch (err) { res.status(500).send('Erro no servidor'); }
});

module.exports = router;
