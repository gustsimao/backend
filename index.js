require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const medicoRoutes = require('./routes/medico');
const pacienteRoutes = require('./routes/paciente');

const app = express();
const PORT = process.env.PORT || 10000;




app.use(express.json());

const medicoRoutes = require('./routes/medico');

app.use('/medico', medicoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});





// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/medico', medicoRoutes);
app.use('/paciente', pacienteRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send('✅ Backend funcionando!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
