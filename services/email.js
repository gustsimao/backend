const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // false para TLS (porta 587), true para SSL (porta 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Envia um e-mail utilizando as credenciais do transporter
 * @param {string} destinatario - E-mail de destino
 * @param {string} assunto - Assunto do e-mail
 * @param {string} corpoHtml - Conteúdo HTML do e-mail
 */
async function enviarEmail(destinatario, assunto, corpoHtml) {
  try {
    const info = await transporter.sendMail({
      from: `"Sistema de Monitoramento" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: corpoHtml,
    });

    console.log(`✅ E-mail enviado para ${destinatario} | ID: ${info.messageId}`);
    return info;
  } catch (erro) {
    console.error(`❌ Falha ao enviar e-mail para ${destinatario}:`, erro.message);
    throw erro;
  }
}

module.exports = enviarEmail;

