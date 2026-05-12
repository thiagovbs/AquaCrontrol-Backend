const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'Acesso negado. Token não fornecido.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secreta123');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ msg: 'Token inválido.' });
  }
};
