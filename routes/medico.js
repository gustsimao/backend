const express = require('express');
const router = express.Router();
const gerarSenha = require('../utils/gerarSenha');
//const enviarEmail = require('../services/email');
const supabase = require('../services/supabase');

// Rota para cadastrar médico
router.post('/cadastro-medico', async (req, res) => {
  const { nome, email, crm, nascimento, endereco } = req.body;

  const senha = gerarSenha(); // Ex: G8kd3z

  const { error } = await supabase.from('medicos').insert([
    { nome, email, crm, nascimento, endereco, senha }
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao cadastrar médico.' });
  }

  // Enviar e-mail com a senha
  await enviarEmail({
    to: email,
    subject: 'Cadastro realizado com sucesso',
    text: `Olá Dr(a). ${nome},\n\nSeu cadastro foi realizado com sucesso!\nLogin: ${email}\nSenha: ${senha}`
  });

  res.json({ mensagem: 'Cadastro realizado com sucesso!' });
});

// Rota para login
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

module.exports = router;
