const express = require('express');
const router = express.Router();
const gerarSenha = require('../utils/gerarSenha');
const supabase = require('../services/supabase');
const enviarEmailPaciente = require('../services/email-paciente'); // Nome corrigido

//rota para visualização de dados
router.post('/obter-dados', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ erro: 'ID do paciente não fornecido.' });
  }

  const { data, error } = await supabase
    .from('pacientes')
    .select('id, nome, email, nascimento, endereco, medicamentos')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ erro: 'Paciente não encontrado.' });
  }

  res.json(data);
});


// Rota para cadastro de paciente
router.post('/cadastro-paciente', async (req, res) => {
  const { nome, email, nascimento, endereco, medicamentos, medico_id } = req.body;

  const codigo = gerarSenha(); // Ex: G8kd3z

  console.log('📥 Recebendo dados para cadastro de paciente:', {
    nome, email, nascimento, endereco, medicamentos, medico_id
  });

  // Inserir paciente no Supabase
  const { error } = await supabase
    .from('pacientes')
    .insert([{
      nome,
      email,
      nascimento,
      endereco,
      medicamentos,
      codigo,
      medico_id
    }]);

  if (error) {
    console.error('❌ Erro ao inserir paciente no Supabase:', error.message);
    return res.status(500).json({ erro: 'Erro ao cadastrar paciente.' });
  }

  // Buscar e-mail do médico
  const { data: medico, error: erroMedico } = await supabase
    .from('medicos')
    .select('email')
    .eq('id', medico_id)
    .single();

  if (erroMedico || !medico?.email) {
    console.warn('⚠️ Paciente cadastrado, mas não foi possível recuperar e-mail do médico.');
  }

  // Enviar e-mails
  const corpoPaciente = `
    <h2>Olá ${nome},</h2>
    <p>Você foi cadastrado no sistema de monitoramento de pressão "Appressão".</p>
    <p><strong>Seu código de acesso:</strong> ${codigo}</p>
    <p>Em caso de dúvidas, entre em contato com seu médico.</p>
  `;

  const corpoMedico = `
    <h2>Olá,</h2>
    <p>O paciente <strong>${nome}</strong> foi cadastrado com sucesso.</p>
    <p><strong>Código do paciente:</strong> ${codigo}</p>
  `;

  try {
    await enviarEmailPaciente(email, 'Cadastro no Appressão', corpoPaciente);

    if (medico?.email) {
      await enviarEmailPaciente(medico.email, 'Novo paciente cadastrado no Appressão', corpoMedico);
    }

    console.log(`✅ Paciente ${nome} cadastrado e e-mails enviados.`);
    res.json({ mensagem: 'Paciente cadastrado com sucesso.' });

  } catch (erro) {
    console.error('⚠️ Erro ao enviar e-mail:', erro);
    res.status(500).json({ erro: 'Paciente cadastrado, mas houve erro ao enviar e-mails.' });
  }
});

module.exports = router;
