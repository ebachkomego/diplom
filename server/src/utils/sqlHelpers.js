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

module.exports = {
  formatMonth,
  daysFromNow,
  currentMonth
};
