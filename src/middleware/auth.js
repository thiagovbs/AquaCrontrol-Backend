const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'Acesso negado. Token não fornecido.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ msg: 'Token inválido.' });
  }
};
