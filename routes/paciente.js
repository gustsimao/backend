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
  const { nome, email, nascimento, endereco, medicamento, codigo_medico } = req.body;

  const codigo = gerarCodigoNumerico();

  // Inserir no Supabase
const { data, error } = await supabase
  .from('pacientes')
  .insert([{ nome, email, nascimento, endereco, medicamento, codigo_medico, codigo }]);

if (error) {
  console.error('Erro ao inserir paciente:', error);  // Mostra detalhes
  return res.status(500).json({ erro: `Erro ao cadastrar paciente: ${error.message}` });
}

  try {
    // E-mail para o paciente
    await enviarEmail({
      to: email,
      subject: 'Cadastro no Appressão',
      html: `<p>Olá ${nome},</p>
             <p>Você foi cadastrado no sistema de monitoramento de pressão <strong>Appressão</strong>.</p>
             <p>Seu código de acesso é: <strong>${codigo}</strong></p>
             <p>Em caso de dúvidas, entre em contato com seu médico.</p>`
    });

    // E-mail para o médico
    await enviarEmail({
      to: codigo_medico,
      subject: 'Novo paciente cadastrado no Appressão',
      html: `<p>Olá,</p>
             <p>O paciente <strong>${nome}</strong> foi cadastrado com sucesso.</p>
             <p>Código do paciente: <strong>${codigo}</strong></p>`
    });

    res.json({ mensagem: 'Paciente cadastrado com sucesso.' });

  } catch (erro) {
    console.error('Erro ao enviar e-mails:', erro);
    res.status(500).json({ erro: 'Paciente cadastrado, mas houve erro ao enviar e-mails.' });
  }
});

module.exports = router;
