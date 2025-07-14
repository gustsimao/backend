const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const enviarEmail = require('../services/email');

// Função para gerar código numérico aleatório de 6 dígitos
function gerarCodigoNumerico() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rota para cadastro de paciente
router.post('/cadastro-paciente', async (req, res) => {
  const { nome, email, nascimento, endereco, medicamentos, medico_id } = req.body;

  const codigo = gerarCodigoNumerico();

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
      medicamentos,  // campo correto conforme sua tabela
      codigo,
      medico_id
    }]);

  if (error) {
    console.error('❌ Erro ao inserir paciente no Supabase:', error.message);
    return res.status(500).json({ erro: 'Erro ao cadastrar paciente.' });
  }

  try {
    // Enviar e-mail para o paciente
    await enviarEmail(
      email,
      'Cadastro no Appressão',
      `<p>Olá ${nome},</p>
       <p>Você foi cadastrado no sistema de monitoramento de pressão "Appressão".</p>
       <p>Seu código de acesso é: <strong>${codigo}</strong></p>
       <p>Em caso de dúvidas, entre em contato com seu médico responsável.</p>`
    );

    // (Opcional) Buscar e-mail do médico a partir do UUID, se quiser enviar também para o médico:
    // const { data: medico, error: erroMedico } = await supabase.from('medicos').select('email').eq('id', medico_id).single();
    // if (!erroMedico && medico?.email) {
    //   await enviarEmail(medico.email, 'Novo paciente cadastrado', `O paciente ${nome} foi cadastrado.`);
    // }

    console.log(`✅ Paciente ${nome} cadastrado com sucesso.`);

    res.json({ mensagem: 'Paciente cadastrado com sucesso.' });

  } catch (erro) {
    console.error('⚠️ Erro ao enviar e-mail:', erro);
    res.status(500).json({ erro: 'Paciente cadastrado, mas houve erro ao enviar e-mail.' });
  }
});

module.exports = router;
