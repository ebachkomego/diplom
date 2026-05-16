// Модуль подключения к базе данных
const knex = require('knex');
const knexConfig = require('../../knexfile');

// Определяем окружение (development или production)
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Создаём экземпляр подключения к БД
const db = knex(config);

// Выполняем специфичные для SQLite настройки только если используется sqlite3
if (config.client === 'sqlite3') {
  // Включаем WAL-режим для улучшения производительности при конкурентном доступе
  db.raw('PRAGMA journal_mode=WAL').then(() => {
    console.log('✅ SQLite: WAL-режим активирован');
  });

  // Включаем поддержку внешних ключей
  db.raw('PRAGMA foreign_keys=ON').then(() => {
    console.log('✅ SQLite: Внешние ключи включены');
  });
} else {
  console.log(`🚀 База данных инициализирована в режиме: ${environment} (клиент: ${config.client})`);
}

module.exports = db;
