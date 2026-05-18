// Централизованный обработчик ошибок Express

const { isDuplicatePkeyError, extractTableFromError, fixSequence } = require('../utils/sequenceFix');

// Перехватывает все необработанные ошибки и формирует единообразный ответ
const errorHandler = async (err, req, res, next) => {
  console.error('❌ Ошибка:', err.message);

  // Автоматическое исправление PostgreSQL-sequence при duplicate key на PK
  if (isDuplicatePkeyError(err)) {
    const tableName = extractTableFromError(err);
    if (tableName) {
      console.log(`🔧 Обнаружен сломанный sequence для таблицы "${tableName}", исправляем...`);
      await fixSequence(tableName);
    }
  }

  // Определяем HTTP-код ответа
  const statusCode = err.statusCode || 500;

  // Формируем ответ об ошибке
  const response = {
    error: err.message || 'Внутренняя ошибка сервера',
    status: statusCode
  };

  // В режиме разработки добавляем стек вызовов
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

