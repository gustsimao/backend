require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Permite requisições do GitHub Pages
app.use(cors({
  origin: 'https://gustsimao.github.io'
}));

app.use(express.json());

const authRoutes = require('./routes/auth');
const medicoRoutes = require('./routes/medico');
const pacienteRoutes = require('./routes/paciente');

app.use('/auth', authRoutes);
app.use('/medico', medicoRoutes);
app.use('/paciente', pacienteRoutes);

app.get('/', (req, res) => {
  res.send('✅ Backend funcionando!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
