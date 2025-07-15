const nodemailer = require('nodemailer');
require('dotenv').config();
const supabase = require('./supabase'); // ✅ Importa conexão com Supabase

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Envia e-mails ao paciente e ao médico após cadastro
 * @param {string} emailPaciente - Email do paciente
 * @param {string} nomePaciente - Nome do paciente
 * @param {string} codigo - Código de acesso do paciente
 * @param {string} medico_id - UUID do médico responsável
 */
async function enviarEmailPaciente(emailPaciente, nomePaciente, codigo, medico_id) {
  try {
    // 🔎 Busca o e-mail do médico no Supabase
    const { data: medico, error } = await supabase
      .from('medicos')
      .select('email')
      .eq('id', medico_id)
      .single();

    if (error || !medico) {
      throw new Error('Não foi possível obter o e-mail do médico.');
    }

    const emailMedico = medico.email;

    // 📧 E-mail para o paciente
    const infoPaciente = await transporter.sendMail({
      from: `"Appressão" <${process.env.EMAIL_USER}>`,
      to: emailPaciente,
      subject: 'Cadastro no Appressão',
      html: `
        <h2>Olá ${nomePaciente},</h2>
        <p>Você foi cadastrado no sistema de monitoramento de pressão "Appressão".</p>
        <p>Seu código de acesso é: <strong>${codigo}</strong></p>
        <p>Em caso de dúvidas, entre em contato com seu médico responsável.</p>
      `
    });
    console.log(`📧 E-mail enviado ao paciente: ${emailPaciente} | ID: ${infoPaciente.messageId}`);

    // 📧 E-mail para o médico
    const infoMedico = await transporter.sendMail({
      from: `"Appressão" <${process.env.EMAIL_USER}>`,
      to: emailMedico,
      subject: 'Novo paciente cadastrado no Appressão',
      html: `
        <h2>Olá,</h2>
        <p>O paciente <strong>${nomePaciente}</strong> foi cadastrado com sucesso.</p>
        <p>Código do paciente: <strong>${codigo}</strong></p>
      `
    });
    console.log(`📧 E-mail enviado ao médico: ${emailMedico} | ID: ${infoMedico.messageId}`);

  } catch (erro) {
    console.error('❌ Erro ao enviar e-mail para paciente ou médico:', erro.message);
    throw erro;
  }
}

module.exports = enviarEmailPaciente;
