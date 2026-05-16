require('dotenv').config();
// Настройка Express-приложения ИС ОАО «ТАиМ»
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Импорт маршрутов
const authRoutes = require('./src/routes/auth');
const ordersRoutes = require('./src/routes/orders');
const productsRoutes = require('./src/routes/products');
const customersRoutes = require('./src/routes/customers');
const warehouseRoutes = require('./src/routes/warehouse');
const productionRoutes = require('./src/routes/production');
const resourcesRoutes = require('./src/routes/resources');
const reportsRoutes = require('./src/routes/reports');
const usersRoutes = require('./src/routes/users');
const uiRoutes = require('./src/routes/ui');
const transfersRoutes = require('./src/routes/transfers');

// Импорт обработчика ошибок
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ==================== MIDDLEWARE ====================

// Разрешаем CORS
app.use(cors({
  origin: true, // Разрешает запросы с любого источника (удобно для Vercel)
  credentials: true
}));

// Парсинг JSON-тела запросов
app.use(express.json());

// Логирование HTTP-запросов
app.use(morgan('dev'));

// ==================== МАРШРУТЫ API ====================
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ui', uiRoutes);
app.use('/api/transfers', transfersRoutes);

// Проверка работоспособности сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер ИС ОАО «ТАиМ» работает', timestamp: new Date().toISOString() });
});

// ==================== ОБРАБОТКА ОШИБОК ====================
app.use(errorHandler);

module.exports = app;
