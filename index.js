require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const cors = require('cors');

// Inicializa o app ANTES de usar
const app = express();
const PORT = process.env.PORT || 10000;

// Configure CORS corretamente
app.use(cors({
  origin: 'https://gustsimao.github.io'
}));

// Middlewares
app.use(express.json()); // Permite JSON no body das requisições

// Rotas
const authRoutes = require('./routes/auth');
const medicoRoutes = require('./routes/medico');
const pacienteRoutes = require('./routes/paciente');

app.use('/auth', authRoutes);           
app.use('/medico', medicoRoutes);       
app.use('/paciente', pacienteRoutes);   

// Rota raiz
app.get('/', (req, res) => {
  res.send('✅ Backend funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
