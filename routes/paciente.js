const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const enviarEmail = require('../services/email');
const gerarSenha = require('../utils/gerarSenha');

// Rota para cadastro de paciente
router.post('/cadastro-paciente', async (req, res) => {
  const { nome, email, nascimento, endereco } = req.body;

  const senha = gerarSenha(); // Gera senha aleatória

  const { error } = await supabase
    .from('pacientes')
    .insert([{ nome, nascimento, endereco, senha }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao cadastrar paciente.' });
  }

   //Enviar email com a senha
 await enviarEmail({
    to: email,
   subject: 'Cadastro de paciente realizado',
    text: `Olá ${nome},\n\nSeu cadastro foi realizado com sucesso!\nLogin: ${email}\nSenha: ${senha}`
 });

  res.json({ mensagem: 'Cadastro realizado com sucesso!' });
});

// Rota de login do paciente
router.post('/login-paciente', async (req, res) => {
  const { email, senha } = req.body;

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('email', email)
    .eq('senha', senha)
    .single();

  if (error || !data) {
    return res.status(401).json({ erro: 'Login ou senha inválidos.' });
  }

  res.json({ mensagem: 'Login bem-sucedido', paciente: data });
});

module.exports = router;
