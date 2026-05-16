// Middleware валидации входных данных с помощью Joi-схем

// Создаёт middleware для валидации тела запроса по указанной Joi-схеме
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,      // Собираем все ошибки, а не только первую
      stripUnknown: true,      // Удаляем неизвестные поля
      allowUnknown: false      // Не допускаем неизвестные поля
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Ошибка валидации данных',
        details: errors
      });
    }

    // Заменяем тело запроса на валидированные и отформатированные данные
    req.body = value;
    next();
  };
};

module.exports = validate;
