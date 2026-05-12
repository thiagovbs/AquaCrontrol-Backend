module.exports = (req, res, next) => {
  // O middleware de auth anterior já deve ter colocado o user na requisição
  if (req.user && req.user.role === 'ADMIN') {
    next(); // É admin, pode passar
  } else {
    res.status(403).json({ error: 'Acesso negado. Requer cargo de Administrador.' });
  }
};
