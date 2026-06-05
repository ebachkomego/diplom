const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendLoginNotification = async (toEmail, user, ip, userAgent) => {
  if (!toEmail || !process.env.SMTP_USER) return;

  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #1a5276; margin: 0;">&#9888;&#65039; Оповещение о входе</h2>
        <p style="color: #666; font-size: 14px;">ОАО «ТАиМ» — Система управления производством</p>
      </div>
      <div style="background: #f8f9fa; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 8px; color: #555; width: 120px;">Пользователь</td><td style="padding: 6px 8px; font-weight: 600;">${user.full_name} (${user.username})</td></tr>
          <tr><td style="padding: 6px 8px; color: #555;">Роль</td><td style="padding: 6px 8px;">${user.role.replace(/_/g, ' ')}</td></tr>
          <tr><td style="padding: 6px 8px; color: #555;">Дата и время</td><td style="padding: 6px 8px; font-weight: 600;">${dateStr}</td></tr>
          <tr><td style="padding: 6px 8px; color: #555;">IP-адрес</td><td style="padding: 6px 8px; font-family: monospace;">${ip || 'не определён'}</td></tr>
          <tr><td style="padding: 6px 8px; color: #555;">Браузер</td><td style="padding: 6px 8px; font-size: 12px; color: #666;">${userAgent || 'не определён'}</td></tr>
        </table>
      </div>
      <div style="background: #fff3cd; border-radius: 6px; padding: 12px; font-size: 13px; color: #856404;">
        Если это были не Вы, <strong>немедленно смените пароль</strong> и свяжитесь с администратором системы.
      </div>
      <p style="color: #999; font-size: 11px; margin-top: 20px; text-align: center;">
        Автоматическое уведомление. Отвечать не требуется.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: 'Оповещение о входе в систему — ОАО «ТАиМ»',
      html,
    });
  } catch (err) {
    console.error('Ошибка отправки email-уведомления:', err.message);
  }
};

module.exports = { sendLoginNotification };
