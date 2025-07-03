const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const gerarSenha = require('../utils/gerarSenha');
const enviarEmail = require('../services/email');

// Cadastro de médico
router.post('/cadastro-medico', async (req, res) => {
  const { nome, email, crm, nascimento, endereco } = req.body;

  const senha = gerarSenha();
  const { data, error } = await supabase
    .from('medicos')
    .insert([{ nome, email, crm, nascimento, endereco, senha }]);

  if (error) {
    return res.status(500).json({ erro: 'Erro ao cadastrar médico', detalhes: error.message });
  }

  await enviarEmail(email, 'Cadastro realizado', `Seu login é: ${email}\nSua senha: ${senha}`);
  res.status(201).json({ mensagem: 'Médico cadastrado com sucesso' });
});

// Login de médico
router.post('/login-medico', async (req, res) => {
  const { email, senha } = req.body;

  const { data, error } = await supabase
    .from('medicos')
    .select('*')
    .eq('email', email)
    .eq('senha', senha)
    .single();

  if (error || !data) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  res.status(200).json({ mensagem: 'Login realizado com sucesso', medico: data });
});

// Cadastro de paciente
router.post('/cadastro-paciente', async (req, res) => {
  const { nome, email, nascimento, endereco, codigo_medico, medicamento } = req.body;

  const senha = gerarSenha();
  const { data, error } = await supabase
    .from('pacientes')
    .insert([{ nome, email, nascimento, endereco, codigo_medico, medicamento, senha }]);

  if (error) {
    return res.status(500).json({ erro: 'Erro ao cadastrar paciente', detalhes: error.message });
  }

  await enviarEmail(email, 'Cadastro realizado', `Seu login é: ${email}\nSua senha: ${senha}`);
  res.status(201).json({ mensagem: 'Paciente cadastrado com sucesso' });
});

// Login de paciente
router.post('/login-paciente', async (req, res) => {
  const { email, senha } = req.body;

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('email', email)
    .eq('senha', senha)
    .single();

  if (error || !data) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  res.status(200).json({ mensagem: 'Login realizado com sucesso', paciente: data });
});

module.exports = router;
