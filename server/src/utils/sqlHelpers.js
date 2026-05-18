const db = require('../database/connection');

/**
 * Возвращает SQL-выражение для форматирования месяца в зависимости от типа БД
 * @param {string} column Имя колонки
 * @returns {string} SQL-выражение
 */
const formatMonth = (column) => {
  const isSqlite = db.client.config.client === 'sqlite3';
  return isSqlite 
    ? `strftime('%Y-%m', ${column})` 
    : `to_char(${column}, 'YYYY-MM')`;
};

/**
 * Возвращает SQL-выражение для разницы в днях от текущего момента
 * @param {string} column Имя колонки
 * @returns {string} SQL-выражение
 */
const daysFromNow = (column) => {
  const isSqlite = db.client.config.client === 'sqlite3';
  return isSqlite
    ? `julianday(${column}) - julianday('now')`
    : `EXTRACT(DAY FROM (${column} - CURRENT_TIMESTAMP))`;
};

/**
 * Возвращает SQL-выражение для текущего месяца в формате YYYY-MM
 * @returns {string} SQL-выражение
 */
const currentMonth = () => {
  const isSqlite = db.client.config.client === 'sqlite3';
  return isSqlite
    ? "strftime('%Y-%m', 'now')"
    : "to_char(CURRENT_DATE, 'YYYY-MM')";
};

/**
 * Выполняет вставку и безопасно возвращает ID созданной записи,
 * скрывая различия в поведении Knex с SQLite (возвращает [id]) и PostgreSQL (требует .returning('id')).
 * @param {string} tableName Имя таблицы
 * @param {object} data Данные для вставки
 * @param {object} [trx] Объект транзакции (опционально)
 * @returns {Promise<number|string>} ID созданной записи
 */
const insertAndGetId = async (tableName, data, trx = db) => {
  const isSqlite = db.client.config.client === 'sqlite3';
  if (isSqlite) {
    const [id] = await trx(tableName).insert(data);
    return id;
  } else {
    const result = await trx(tableName).insert(data).returning('id');
    if (result && result[0]) {
      return typeof result[0] === 'object' ? result[0].id : result[0];
    }
    return null;
  }
};

module.exports = {
  formatMonth,
  daysFromNow,
  currentMonth,
  insertAndGetId
};
