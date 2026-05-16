// Точка входа серверного приложения ИС ОАО «ТАиМ»
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Сервер ТАиМ запущен на порту ${PORT}`);
  console.log(`📡 API доступен: http://localhost:${PORT}/api`);
});
