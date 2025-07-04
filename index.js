require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const cors = require('cors');

// Configure CORS para aceitar só seu frontend (mais seguro)
app.use(cors({
  origin: 'https://gustsimao.github.io'
}));


const authRoutes = require('./routes/auth');
const medicoRoutes = require('./routes/medico');
const pacienteRoutes = require('./routes/paciente');

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(express.json()); // Permite JSON no body das requisições

// Rotas
app.use('/auth', authRoutes);           // ex: /auth/cadastrar-medico
app.use('/medico', medicoRoutes);       // ex: /medico/listar-pacientes
app.use('/paciente', pacienteRoutes);   // ex: /paciente/registrar-pressao

// Rota raiz
app.get('/', (req, res) => {
  res.send('✅ Backend funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
