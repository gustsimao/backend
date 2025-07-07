const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', // padrão para Gmail
  port: process.env.EMAIL_PORT || 587,               // porta TLS para Gmail
  secure: false, // false para TLS (porta 587), true para SSL (porta 465)
  auth: {
    user: process.env.gsrwebconsulting@gmail.com,
    pass: process.env.EMAIL_PASS, // deve ser senha de app do Gmail
  },
  tls: {
    rejectUnauthorized: false,  // evita erros com certificados autoassinados
  }
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
    return info;
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro);
    throw erro;  // propaga o erro para o chamador tratar
  }
}

module.exports = enviarEmail;
