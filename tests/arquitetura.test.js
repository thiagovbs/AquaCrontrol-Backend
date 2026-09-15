/**
 * Testes de arquitetura.
 *
 * Não exercitam comportamento: leem o código e afirmam invariantes estruturais.
 * Cada item abaixo já foi um defeito real neste projeto, e nenhum seria pego
 * por um teste funcional — o sistema continuava "funcionando" com o defeito
 * presente.
 *
 * Rodam sem banco, sem servidor e sem dependência nenhuma: node:test é nativo.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const RAIZ = join(__dirname, '..');
const ROTAS = join(RAIZ, 'src', 'routes');

const ler = (caminho) => readFileSync(join(RAIZ, caminho), 'utf-8');
const server = () => ler(join('src', 'server.js'));

const arquivosDeRota = () =>
  readdirSync(ROTAS)
    .filter((n) => n.endsWith('.js'))
    .map((nome) => ({ nome: nome.replace('.js', ''), conteudo: readFileSync(join(ROTAS, nome), 'utf-8') }));

/** Rotas que podem ser públicas. Só o login entra aqui. */
const PUBLICAS = new Set(['auth']);

describe('autenticação', () => {
  // Três handlers ficaram sem `auth` porque a proteção era declarada handler a
  // handler: GET /unidades, GET /leituras e PATCH /leituras/:id/faturar, este
  // último gravando. A proteção passou a ser declarada uma vez por router.
  it('todo router não-público exige autenticação no módulo ou na montagem', () => {
    const desprotegidos = [];

    for (const { nome, conteudo } of arquivosDeRota()) {
      if (PUBLICAS.has(nome)) continue;

      const noModulo = /^router\.use\(auth\);/m.test(conteudo);
      // A montagem precisa ter `auth` como middleware, não apenas um nome que
      // comece com "auth" (authRoutes casaria por engano).
      const naMontagem = new RegExp(`app\\.use\\('/api/${nome}',\\s*auth\\b`).test(server());

      if (!noModulo && !naMontagem) desprotegidos.push(nome);
    }

    assert.deepEqual(
      desprotegidos,
      [],
      'Routers sem autenticação:\n' + desprotegidos.map((r) => `  - /api/${r}`).join('\n')
    );
  });

  it('nenhum handler depende de `auth` declarado individualmente', () => {
    // Declarar por handler é o padrão que produziu o defeito: basta esquecer
    // em um e ele nasce aberto, sem nada acusar.
    const porHandler = [];

    for (const { nome, conteudo } of arquivosDeRota()) {
      if (PUBLICAS.has(nome)) continue;
      const casos = conteudo.match(/router\.(get|post|put|patch|delete)\([^,]+,\s*auth\b/g) || [];
      if (casos.length > 0) porHandler.push(`${nome} (${casos.length})`);
    }

    assert.deepEqual(
      porHandler,
      [],
      'Use router.use(auth) no topo do módulo em vez de repetir por handler.'
    );
  });

  it('a rota pública contém apenas o login', () => {
    // POST /register era público, aceitava `role` do corpo e o schema tinha
    // @default(ADMIN): um POST sem autenticação criava um administrador.
    const auth = ler(join('src', 'routes', 'auth.js'));
    const declaradas = (auth.match(/router\.(get|post|put|patch|delete)\('([^']+)'/g) || []).map((l) =>
      l.replace(/router\.\w+\('/, '').replace("'", '')
    );

    assert.deepEqual(declaradas, ['/login'], 'A rota pública não pode expor mais que o login.');
  });
});

describe('papel do usuário', () => {
  it('o padrão do papel é o de menor privilégio', () => {
    const schema = ler(join('prisma', 'schema.prisma'));
    const padrao = schema.match(/role\s+Role\s+@default\((\w+)\)/);

    assert.ok(padrao, 'O campo role precisa declarar um default explícito.');
    assert.notEqual(
      padrao[1],
      'ADMIN',
      'Com @default(ADMIN), qualquer caminho que esqueça o papel cria um administrador.'
    );
  });

  it('toda rota que grava o papel valida o valor recebido', () => {
    const usuarios = ler(join('src', 'routes', 'usuarios.js'));

    assert.ok(
      usuarios.includes('const PAPEIS'),
      'O papel vinha do corpo sem validação; um valor fora do enum virava 500 do Prisma.'
    );

    // Verificar só se o padrão existe em algum lugar do arquivo deixaria passar
    // um dos handlers sem validação. Cada um é conferido no seu próprio corpo.
    const semValidacao = [];
    for (const metodo of ['post', 'put']) {
      const inicio = usuarios.indexOf(`router.${metodo}(`);
      assert.notEqual(inicio, -1, `Rota ${metodo.toUpperCase()} de /usuarios não encontrada.`);

      const corpo = usuarios.slice(inicio, inicio + 700);
      if (!/PAPEIS\.includes\(role\)/.test(corpo)) semValidacao.push(metodo.toUpperCase());
    }

    assert.deepEqual(
      semValidacao,
      [],
      'Handlers que gravam `role` sem validar: ' + semValidacao.join(', ')
    );
  });
});

describe('segredo de assinatura', () => {
  it('nenhum arquivo define um fallback para JWT_SECRET', () => {
    const comFallback = [];

    for (const pasta of ['routes', 'middleware']) {
      const dir = join(RAIZ, 'src', pasta);
      for (const nome of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
        const codigo = readFileSync(join(dir, nome), 'utf-8')
          .split('\n')
          .filter((l) => !l.trimStart().startsWith('//') && !l.trimStart().startsWith('*'))
          .join('\n');

        if (/process\.env\.JWT_SECRET\s*\|\|/.test(codigo)) comFallback.push(`${pasta}/${nome}`);
      }
    }

    assert.deepEqual(comFallback, [], 'JWT_SECRET não pode ter valor padrão no código.');
  });

  it('o segredo vem de um único módulo que valida no carregamento', () => {
    const config = ler(join('src', 'config.js'));
    assert.ok(config.includes('throw new Error'), 'config.js precisa derrubar o boot sem JWT_SECRET.');
  });
});

describe('CORS', () => {
  // A configuração restritiva estava declarada DEPOIS das rotas e por isso
  // nunca era alcançada: o handler da rota respondia antes. O que valia era um
  // app.use(cors()) aberto, e a allowlist era código morto.
  it('é configurado antes de qualquer rota ser montada', () => {
    const linhas = server().split('\n');
    const posCors = linhas.findIndex((l) => /^app\.use\(cors\(/.test(l));
    const posPrimeiraRota = linhas.findIndex((l) => /^app\.use\('\/api\//.test(l));

    assert.notEqual(posCors, -1, 'CORS não encontrado no server.js.');
    assert.notEqual(posPrimeiraRota, -1, 'Nenhuma rota encontrada no server.js.');
    assert.ok(
      posCors < posPrimeiraRota,
      `CORS na linha ${posCors + 1} e a primeira rota na ${posPrimeiraRota + 1}: ` +
        'declarado depois das rotas, ele nunca é alcançado.'
    );
  });

  it('não existe CORS aberto a qualquer origem', () => {
    const codigo = server()
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('//'))
      .join('\n');

    assert.ok(
      !/app\.use\(cors\(\)\)/.test(codigo),
      'cors() sem opções libera qualquer origem e anula a allowlist.'
    );
  });

  it('a allowlist ignora variáveis de ambiente não definidas', () => {
    assert.ok(
      server().includes('.filter(Boolean)'),
      'Sem FRONTEND_URL definida, a lista de origens conteria undefined.'
    );
  });
});
