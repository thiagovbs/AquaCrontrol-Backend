module.exports = (req, res, next) => {
  const usuario = req.user.user || req.user;
  // O middleware de auth anterior já deve ter colocado o user na requisição
  if (usuario && usuario.role === 'ADMIN') {
    next(); // É admin, pode passar
  } else {
    res.status(403).json({ error: 'Acesso negado. Requer cargo de Administrador.' });
  }
};
