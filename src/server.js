if (process.env.NODE_ENV === 'production') {
    try {
        delete require.cache[require.resolve('@prisma/client')];
    } catch (e) {}
}

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const unidadeRoutes = require('./routes/unidades');
const proprietarioRoutes = require('./routes/proprietarios');
const usuarioRoutes = require('./routes/usuarios');
const leituraRoutes = require('./routes/leituras');
const dashboardRoutes = require('./routes/dashboard');
const configRoutes = require('./routes/config');
const isAdmin = require('./middleware/isAdmin');
const auth = require('./middleware/auth');

const app = express();

// O CORS restritivo estava declarado DEPOIS das rotas e por isso nunca era
// alcançado: para qualquer requisição que casasse com uma rota, o handler
// respondia antes. O que valia era um app.use(cors()) aberto a qualquer
// origem, e a allowlist abaixo era código morto.
app.use(cors({
  origin: (origin, callback) => {
    // Permite localhost (desenvolvimento) ou a URL que a Vercel vai nos dar.
    // FRONTEND_URL pode não estar definida; filtrar evita um `undefined` na
    // lista de origens permitidas.
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Sem Origin são chamadas que não vêm de navegador — o app mobile e
    // ferramentas como curl. Essas seguem autenticadas pelo Bearer token.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // false apenas omite os cabeçalhos de CORS e o navegador bloqueia.
      // Lançar um Error aqui viraria 500 no servidor, ruído sem ganho.
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: "online",
    message: "pong",
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/unidades', unidadeRoutes);
app.use('/api/proprietarios', proprietarioRoutes);
app.use('/api/leituras', leituraRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', auth, isAdmin, configRoutes);
app.use('/api/usuarios', auth, isAdmin, usuarioRoutes);


app.get('/', (req, res) => {
  res.json({ 
    mensagem: "API do Sistema de Controle de Água rodando com sucesso!", 
    status: "Online",
    versao: "1.0.0"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
