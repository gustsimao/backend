const express = require('express');
const router = express.Router();
const gerarSenha = require('../utils/gerarSenha');
const enviarEmail = require('../services/email');
const supabase = require('../services/supabase');
const enviarEmailPaciente = require('../services/email-paciente');


// routes/medico.js
const express = require('express');
const router = express.Router();

const pacientes = [
  { id: 1, nome: 'João Silva', idade: 30 },
  { id: 2, nome: 'Maria Souza', idade: 25 },
  { id: 3, nome: 'Carlos Pereira', idade: 40 },
];

router.post('/listar-pacientes', (req, res) => {
  res.json(pacientes);
});



// 📌 Cadastro de médico
router.post('/cadastro-medico', async (req, res) => {
  const { nome, email, crm, nascimento, endereco } = req.body;
  const senha = gerarSenha();

  const { error } = await supabase
    .from('medicos')
    .insert([{ nome, email, crm, nascimento, endereco, senha }]);

  if (error) {
    console.error('❌ Erro ao cadastrar médico:', error.message);
    return res.status(500).json({ erro: 'Erro ao cadastrar médico.' });
  }

  const corpoHtml = `
    <h2>Olá Dr(a). ${nome},</h2>
    <p>Seu cadastro foi realizado com sucesso no sistema de monitoramento.</p>
    <p><strong>Login:</strong> ${email}</p>
    <p><strong>Senha:</strong> ${senha}</p>
  `;

  await enviarEmail(email, 'Cadastro realizado com sucesso', corpoHtml);

  res.json({ mensagem: 'Cadastro realizado com sucesso!' });
});

// 📌 Login de médico
router.post('/login-medico', async (req, res) => {
  const { email, senha } = req.body;

  const { data, error } = await supabase
    .from('medicos')
    .select('*')
    .eq('email', email)
    .eq('senha', senha)
    .single();

  if (error || !data) {
    return res.status(401).json({ erro: 'Login ou senha inválidos.' });
  }

  res.json({ mensagem: 'Login bem-sucedido', medico: data });
});

// 📌 Cadastro de paciente (feito por médico)
// 📌 Cadastro de paciente (feito por médico)
router.post('/cadastro-paciente', async (req, res) => {
  const { nome, email, nascimento, endereco, medicamentos, medico_id } = req.body;
  const codigo = gerarSenha();

  console.log('📥 Tentando cadastrar paciente:', {
    nome, email, nascimento, endereco, medicamentos, medico_id
  });

  const { error } = await supabase
    .from('pacientes')
    .insert([{ nome, email, nascimento, endereco, medicamentos, codigo, medico_id }]);

  if (error) {
    console.error('❌ Erro ao cadastrar paciente no Supabase:', error.message);
    return res.status(500).json({ erro: 'Erro ao cadastrar paciente.' });
  }

  try {
    await enviarEmailPaciente(email, nome, codigo, medico_id); // ✅ envia para paciente e médico
    console.log(`✅ Paciente ${nome} cadastrado e e-mails enviados.`);
    res.json({ mensagem: 'Paciente cadastrado com sucesso!' });
  } catch (erro) {
    console.error('⚠️ Paciente cadastrado, mas erro ao enviar e-mail:', erro.message);
    res.status(500).json({ erro: 'Paciente cadastrado, mas houve erro ao enviar e-mail.' });
  }
});


module.exports = router;
