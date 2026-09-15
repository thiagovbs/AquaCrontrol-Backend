/**
 * Configuração validada no carregamento do módulo.
 *
 * O JWT_SECRET tinha fallback para 'secreta123' em dois pontos. Se a variável
 * faltasse, a aplicação subia assinando tokens com um valor presente no código:
 * qualquer um poderia forjar um token de administrador. Agora a ausência
 * derruba o boot, em vez de degradar em silêncio.
 */

const JWT_SECRET = (process.env.JWT_SECRET || '').trim();

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET não definido (ou vazio). A aplicação não sobe sem ele: ' +
      'defina um valor longo e aleatório no ambiente.'
  );
}

module.exports = { JWT_SECRET };
