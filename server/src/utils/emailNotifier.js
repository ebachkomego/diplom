const nodemailer = require('nodemailer');
const db = require('../database/connection');

const getTransporter = async () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    const [userRow, passRow] = await Promise.all([
      db('settings').where({ key: 'smtp_user' }).first(),
      db('settings').where({ key: 'smtp_pass' }).first(),
    ]);
    user = userRow?.value;
    pass = passRow?.value;
  }

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });
};

const sendLoginNotification = async (toEmail, user, ip, userAgent) => {
  if (!toEmail) return;

  const transporter = await getTransporter();
  if (!transporter) return;

  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1a5276, #2e86c1); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 8px;">&#128274;</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Оповещение о входе в систему</h1>
        <p style="color: #d4e6f1; margin: 6px 0 0 0; font-size: 14px;">ОАО «ТАиМ» — Система управления производством</p>
      </div>
      <div style="border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">
        <p style="color: #333; font-size: 15px; margin: 0 0 20px 0;">Зафиксирован вход в систему. Ниже приведены подробности:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 12px; color: #888; width: 130px;">Пользователь</td>
            <td style="padding: 10px 12px; font-weight: 600; color: #1a1a1a;">${user.full_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 12px; color: #888;">Логин</td>
            <td style="padding: 10px 12px; font-weight: 600; color: #1a1a1a;">${user.username}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 12px; color: #888;">Роль</td>
            <td style="padding: 10px 12px;">${user.role.replace(/_/g, ' ')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 12px; color: #888;">Дата и время</td>
            <td style="padding: 10px 12px; font-weight: 600; color: #1a1a1a;">${dateStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 12px; color: #888;">IP-адрес</td>
            <td style="padding: 10px 12px; font-family: 'Consolas', monospace; color: #1a1a1a;">${ip || 'не определён'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; color: #888;">Браузер</td>
            <td style="padding: 10px 12px; font-size: 13px; color: #666; word-break: break-all;">${userAgent || 'не определён'}</td>
          </tr>
        </table>
        <div style="background: #fff8e1; border-left: 4px solid #f9a825; border-radius: 6px; padding: 14px 16px; margin-top: 20px; font-size: 13px; color: #6d4c00;">
          &#9888;&#65039; Если это были не Вы, <strong>немедленно смените пароль</strong> и обратитесь к администратору системы.
        </div>
        <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 24px 0 12px 0;">
        <p style="color: #aaa; font-size: 12px; margin: 0; text-align: center;">
          Автоматическое уведомление, сформированное системой управления производством ОАО «ТАиМ». Ответ не требуется.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: user,
      to: toEmail,
      subject: 'Оповещение о входе в систему — ОАО «ТАиМ»',
      html,
    });
  } catch (err) {
    console.error('Ошибка отправки email-уведомления:', err.message);
  }
};

module.exports = { sendLoginNotification };