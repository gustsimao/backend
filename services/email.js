const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para porta 465, false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail(destinatario, assunto, corpoHtml) {
  try {
    const info = await transporter.sendMail({
      from: `"Sistema de Monitoramento" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: corpoHtml,
    });

    console.log(`✉️ E-mail enviado para ${destinatario}: ${info.messageId}`);
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro);
    throw erro;
  }
}

module.exports = enviarEmail;
