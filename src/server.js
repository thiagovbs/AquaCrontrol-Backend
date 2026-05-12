const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const unidadeRoutes = require('./routes/unidades');
const proprietarioRoutes = require('./routes/proprietarios');
const usuarioRoutes = require('./routes/usuarios');
const leituraRoutes = require('./routes/leituras');
const dashboardRoutes = require('./routes/dashboard');
const configRoutes = require('./routes/config');
const isAdmin = require('./middlewares/isAdmin');
const auth = require('./middlewares/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/unidades', unidadeRoutes);
app.use('/api/proprietarios', proprietarioRoutes);
app.use('/api/leituras', leituraRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', auth, isAdmin, configRoutes);
app.use('/api/usuarios', auth, isAdmin, usuarioRoutes);

// Configuração do CORS para produção
app.use(cors({
  origin: (origin, callback) => {
    // Permite localhost (desenvolvimento) ou a URL que a Vercel vai nos dar
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:3000',
      process.env.FRONTEND_URL // Variável que definiremos no Render
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ 
    mensagem: "API do Sistema de Controle de Água rodando com sucesso!", 
    status: "Online",
    versao: "1.0.0"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
