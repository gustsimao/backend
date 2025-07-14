const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USUARIO,
    pass: process.env.EMAIL_SENHA
  }
});

async function enviarEmailPaciente(emailPaciente, nomePaciente, codigo, emailMedico) {
  // E-mail para o paciente
  await transporter.sendMail({
    from: `"Appressão" <${process.env.EMAIL_USUARIO}>`,
    to: emailPaciente,
    subject: 'Cadastro no Appressão',
    html: `
      <p>Olá ${nomePaciente},</p>
      <p>Você foi cadastrado no sistema de monitoramento de pressão "Appressão".</p>
      <p>Seu código de acesso é: <strong>${codigo}</strong></p>
      <p>Em caso de dúvidas, entre em contato com seu médico responsável.</p>
    `
  });

  // E-mail para o médico
  await transporter.sendMail({
    from: `"Appressão" <${process.env.EMAIL_USUARIO}>`,
    to: emailMedico,
    subject: 'Novo paciente cadastrado no Appressão',
    html: `
      <p>Olá,</p>
      <p>O paciente <strong>${nomePaciente}</strong> foi cadastrado com sucesso.</p>
      <p>Código do paciente: <strong>${codigo}</strong></p>
    `
  });
}

module.exports = enviarEmailPaciente;
