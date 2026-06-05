const db = require('../database/connection');

const getNotificationEmail = async (req, res, next) => {
  try {
    const row = await db('settings').where({ key: 'notification_email' }).first();
    res.json({ email: row?.value || 'wioltut25012007@gmail.com' });
  } catch (error) { next(error); }
};

const updateNotificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email обязателен' });

    const existing = await db('settings').where({ key: 'notification_email' }).first();
    if (existing) {
      await db('settings').where({ key: 'notification_email' }).update({ value: email, updated_at: new Date().toISOString() });
    } else {
      await db('settings').insert({ key: 'notification_email', value: email });
    }

    res.json({ email, message: 'Email уведомлений сохранён' });
  } catch (error) { next(error); }
};

const getSmtpSettings = async (req, res, next) => {
  try {
    const userRow = await db('settings').where({ key: 'smtp_user' }).first();
    const passRow = await db('settings').where({ key: 'smtp_pass' }).first();
    res.json({
      smtp_user: userRow?.value || '',
      smtp_pass: passRow?.value || '',
    });
  } catch (error) { next(error); }
};

const updateSmtpSettings = async (req, res, next) => {
  try {
    const { smtp_user, smtp_pass } = req.body;
    if (!smtp_user || !smtp_pass) return res.status(400).json({ error: 'SMTP user и pass обязательны' });

    const upsert = async (key, value) => {
      const existing = await db('settings').where({ key }).first();
      if (existing) {
        await db('settings').where({ key }).update({ value, updated_at: new Date().toISOString() });
      } else {
        await db('settings').insert({ key, value });
      }
    };

    await upsert('smtp_user', smtp_user);
    await upsert('smtp_pass', smtp_pass);

    res.json({ message: 'SMTP настройки сохранены' });
  } catch (error) { next(error); }
};

module.exports = { getNotificationEmail, updateNotificationEmail, getSmtpSettings, updateSmtpSettings };
