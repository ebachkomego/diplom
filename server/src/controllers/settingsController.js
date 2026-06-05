const db = require('../database/connection');

const getNotificationEmail = async (req, res, next) => {
  try {
    const row = await db('settings').where({ key: 'notification_email' }).first();
    res.json({ email: row?.value || 'bgdfs0422@gmail.com' });
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

module.exports = { getNotificationEmail, updateNotificationEmail };
