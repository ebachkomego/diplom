// Централизованный обработчик ошибок Express

// Перехватывает все необработанные ошибки и формирует единообразный ответ
const errorHandler = (err, req, res, next) => {
  console.error('❌ Ошибка:', err.message);
  console.error('Stack:', err.stack);

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
