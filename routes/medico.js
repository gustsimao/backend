const express = require('express');
const router = express.Router();
const gerarSenha = require('../utils/gerarSenha');
const enviarEmail = require('../services/email');
const supabase = require('../services/supabase');
const enviarEmailPaciente = require('../services/email-paciente');


// routes/medico.js

router.post('/listar-pacientes', async (req, res) => {
  const { emailMedico } = req.body;

  console.log('📨 Requisição recebida com emailMedico:', emailMedico);

  try {
    // Busca todos os médicos cadastrados (para debug)
    const { data: todosMedicos, error: erroTodos } = await supabase
      .from('medicos')
      .select('id, email');

    if (erroTodos) {
      console.error('❌ Erro ao buscar todos os médicos:', erroTodos.message);
    } else {
      console.log('👨‍⚕️ Médicos cadastrados no Supabase:');
      console.table(todosMedicos);
    }

    // Busca o médico pelo email
    const { data: medico, error: erroMedico } = await supabase
      .from('medicos')
      .select('id')
      .eq('email', emailMedico)
      .limit(1);

    if (erroMedico || !medico) {
      console.warn('⚠️ Médico não encontrado com email:', emailMedico);
      return res.status(404).json({ erro: 'Médico não encontrado.' });
    }

    console.log('✅ Médico encontrado com ID:', medico.id);

    // Busca os pacientes vinculados ao médico
    const { data: pacientes, error: erroPacientes } = await supabase
      .from('pacientes')
      .select('id, nome, email, nascimento')
      .eq('medico_id', medico.id);

    if (erroPacientes) {
      console.error('❌ Erro ao buscar pacientes:', erroPacientes.message);
      return res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
    }

    console.log(`👥 ${pacientes.length} pacientes encontrados para o médico.`);

    res.json(pacientes);
  } catch (err) {
    console.error('❌ Erro inesperado ao listar pacientes:', err.message);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
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
    .limit(1);

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
