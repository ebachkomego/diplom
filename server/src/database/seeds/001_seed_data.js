// Начальные данные для ИС ОАО «ТАиМ»
// Продукция: тормозная аппаратура, пневмоцилиндры, механизмы для МАЗ, КАМАЗ, прицепов
const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Очищаем таблицы в правильном порядке (с учётом зависимостей)
  await knex('task_stages').del();
  await knex('production_tasks').del();
  await knex('production_stages').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('warehouse').del();
  await knex('product_materials').del();
  await knex('resources').del();
  await knex('materials').del();
  await knex('products').del();
  await knex('customers').del();
  await knex('users').del();

  // ==================== ПОЛЬЗОВАТЕЛИ ====================
  const passwordHash = await bcrypt.hash('password123', 10);

  await knex('users').insert([
    { id: 1, username: 'admin', password_hash: passwordHash, full_name: 'Иванов Пётр Сергеевич', role: 'администратор', email: 'admin@taim.by', is_active: true },
    { id: 2, username: 'manager', password_hash: passwordHash, full_name: 'Козлова Анна Викторовна', role: 'менеджер', email: 'kozlova@taim.by', is_active: true },
    { id: 3, username: 'production', password_hash: passwordHash, full_name: 'Сидоров Виктор Николаевич', role: 'начальник_производства', email: 'sidorov@taim.by', is_active: true },
    { id: 4, username: 'master', password_hash: passwordHash, full_name: 'Петров Алексей Дмитриевич', role: 'мастер', email: 'petrov@taim.by', is_active: true },
    { id: 5, username: 'warehouse', password_hash: passwordHash, full_name: 'Кузнецова Елена Ивановна', role: 'кладовщик', email: 'kuznecova@taim.by', is_active: true },
  ]);

  // ==================== КЛИЕНТЫ ====================
  await knex('customers').insert([
    { id: 1, name: 'ОАО «МАЗ» — Минский автомобильный завод', contact_person: 'Громов Д.А.', phone: '+375 17 217-22-22', email: 'zakaz@maz.by', address: 'г. Минск, ул. Социалистическая, 2', inn: '100156487' },
    { id: 2, name: 'ПАО «КАМАЗ»', contact_person: 'Фёдоров И.К.', phone: '+7 8552 37-20-00', email: 'supply@kamaz.ru', address: 'г. Набережные Челны, пр. Автозаводский, 2', inn: '1650032058' },
    { id: 3, name: 'ОАО «БелАЗ»', contact_person: 'Хомич С.В.', phone: '+375 1775 3-47-47', email: 'snab@belaz.by', address: 'г. Жодино, ул. 40 лет Октября, 4', inn: '600034534' },
    { id: 4, name: 'ОАО «Гомсельмаш»', contact_person: 'Лебедев В.Г.', phone: '+375 232 52-30-50', email: 'zakupki@gomselmash.by', address: 'г. Гомель, ул. Шоссейная, 41', inn: '400081523' },
    { id: 5, name: 'ОАО «Амкодор»', contact_person: 'Новиков А.П.', phone: '+375 17 337-23-23', email: 'supply@amkodor.by', address: 'г. Минск, ул. Бабушкина, 37', inn: '100253978' },
    { id: 6, name: 'ОАО «МТЗ» — Минский тракторный завод', contact_person: 'Романов Е.С.', phone: '+375 17 246-47-47', email: 'oms@mtz.by', address: 'г. Минск, ул. Долгобродская, 29', inn: '100058697' },
    { id: 7, name: 'ОАО «Могилёвтрансмаш»', contact_person: 'Савченко Т.И.', phone: '+375 222 42-11-00', email: 'zakaz@mtmash.by', address: 'г. Могилёв, ул. Челюскинцев, 73', inn: '700018456' },
    { id: 8, name: 'ОАО «НефАЗ»', contact_person: 'Юсупов Р.Ш.', phone: '+7 34783 5-66-00', email: 'snab@nefaz.ru', address: 'г. Нефтекамск, ул. Янаульская, 3', inn: '0264009637' },
    { id: 9, name: 'ОАО «МЗКТ»', contact_person: 'Борисов К.Л.', phone: '+375 17 344-46-90', email: 'omts@mzkt.by', address: 'г. Минск, ул. Машиностроителей, 29', inn: '100789234' },
    { id: 10, name: 'ЗАО «МАЗ-Купава»', contact_person: 'Жуков В.Н.', phone: '+375 2251 5-62-22', email: 'kupava@tut.by', address: 'г. Осиповичи, ул. Заводская, 1', inn: '700523411' },
  ]);

  // ==================== ПРОДУКЦИЯ ОАО «ТАиМ» ====================
  await knex('products').insert([
    { id: 1, name: 'Кран тормозной двухсекционный', article: '100-3514108', description: 'Кран тормозной двухсекционный для автомобилей МАЗ. Обеспечивает управление рабочей тормозной системой.', unit: 'шт.', price: 4500.00, production_time_hours: 8, category: 'Тормозная аппаратура' },
    { id: 2, name: 'Кран тормозной обратного действия', article: '100-3537010', description: 'Кран обратного действия с ручным управлением для стояночной тормозной системы.', unit: 'шт.', price: 3200.00, production_time_hours: 6, category: 'Тормозная аппаратура' },
    { id: 3, name: 'Камера тормозная тип 24', article: '100-3519210', description: 'Камера тормозная передняя диафрагменная тип 24 для автомобилей МАЗ.', unit: 'шт.', price: 2800.00, production_time_hours: 4, category: 'Тормозная аппаратура' },
    { id: 4, name: 'Камера тормозная тип 20/20', article: '100-3519100', description: 'Камера тормозная задняя с пружинным энергоаккумулятором тип 20/20.', unit: 'шт.', price: 5600.00, production_time_hours: 10, category: 'Тормозная аппаратура' },
    { id: 5, name: 'Энергоаккумулятор тип 24/24', article: '25-3519100', description: 'Пружинный энергоаккумулятор с тормозной камерой тип 24/24 для тяжёлых автомобилей.', unit: 'шт.', price: 7200.00, production_time_hours: 12, category: 'Тормозная аппаратура' },
    { id: 6, name: 'Регулятор давления', article: '100-3512010', description: 'Регулятор давления воздуха в пневмосистеме. Поддерживает давление 0.62–0.75 МПа.', unit: 'шт.', price: 3800.00, production_time_hours: 5, category: 'Пневмоаппаратура' },
    { id: 7, name: 'Клапан защитный четырёхконтурный', article: '100-3515410', description: 'Клапан распределяет воздух по контурам и защищает их при повреждении одного из контуров.', unit: 'шт.', price: 4100.00, production_time_hours: 7, category: 'Пневмоаппаратура' },
    { id: 8, name: 'Клапан ускорительный', article: '100-3518010', description: 'Ускоряет срабатывание тормозных камер задней оси за счёт сокращения длины магистрали.', unit: 'шт.', price: 2400.00, production_time_hours: 3, category: 'Пневмоаппаратура' },
    { id: 9, name: 'Пневмоцилиндр управления КПП', article: '100-1702010', description: 'Пневматический цилиндр для дистанционного управления коробкой переключения передач.', unit: 'шт.', price: 3600.00, production_time_hours: 6, category: 'Пневмоцилиндры' },
    { id: 10, name: 'Пневмоцилиндр привода заслонок', article: '100-3570010', description: 'Пневмоцилиндр для управления заслонками моторного тормоза-замедлителя.', unit: 'шт.', price: 2900.00, production_time_hours: 5, category: 'Пневмоцилиндры' },
    { id: 11, name: 'Кран управления стояночным тормозом', article: '100-3537110', description: 'Кран ручного управления стояночной и запасной тормозными системами.', unit: 'шт.', price: 3100.00, production_time_hours: 5, category: 'Тормозная аппаратура' },
    { id: 12, name: 'Клапан контрольного вывода', article: '100-3515110', description: 'Клапан для подсоединения контрольно-измерительных приборов к пневмосистеме.', unit: 'шт.', price: 850.00, production_time_hours: 1.5, category: 'Пневмоаппаратура' },
    { id: 13, name: 'Ресивер воздушный 20л', article: '100-3513015', description: 'Ресивер (баллон) для хранения запаса сжатого воздуха в пневматической системе, объём 20 литров.', unit: 'шт.', price: 4800.00, production_time_hours: 6, category: 'Пневмоаппаратура' },
    { id: 14, name: 'Механизм вспомогательного тормоза', article: '6430-3570010', description: 'Механизм управления моторным тормозом-замедлителем для автомобилей МАЗ-6430.', unit: 'шт.', price: 5200.00, production_time_hours: 8, category: 'Тормозная аппаратура' },
    { id: 15, name: 'Кран пневматический разобщительный', article: '100-3520010', description: 'Кран для подключения/отключения пневмосистемы прицепа от тягача.', unit: 'шт.', price: 1600.00, production_time_hours: 2.5, category: 'Пневмоаппаратура' },
  ]);

  // ==================== МАТЕРИАЛЫ ====================
  await knex('materials').insert([
    { id: 1, name: 'Корпус чугунный литой (кран тормозной)', article: 'М-001', unit: 'шт.', min_stock: 50, price: 850.00, category: 'Литьё' },
    { id: 2, name: 'Поршень алюминиевый Ø60', article: 'М-002', unit: 'шт.', min_stock: 100, price: 320.00, category: 'Механообработка' },
    { id: 3, name: 'Диафрагма резиновая тип 24', article: 'М-003', unit: 'шт.', min_stock: 200, price: 180.00, category: 'РТИ' },
    { id: 4, name: 'Пружина возвратная Ø56×120', article: 'М-004', unit: 'шт.', min_stock: 150, price: 95.00, category: 'Пружины' },
    { id: 5, name: 'Манжета уплотнительная Ø50', article: 'М-005', unit: 'шт.', min_stock: 300, price: 45.00, category: 'РТИ' },
    { id: 6, name: 'Болт М10×45 оцинкованный', article: 'М-006', unit: 'шт.', min_stock: 1000, price: 8.50, category: 'Крепёж' },
    { id: 7, name: 'Гайка М10 оцинкованная', article: 'М-007', unit: 'шт.', min_stock: 1000, price: 4.20, category: 'Крепёж' },
    { id: 8, name: 'Шток стальной Ø16×200', article: 'М-008', unit: 'шт.', min_stock: 80, price: 210.00, category: 'Механообработка' },
    { id: 9, name: 'Цилиндр стальной Ø80×150', article: 'М-009', unit: 'шт.', min_stock: 60, price: 480.00, category: 'Механообработка' },
    { id: 10, name: 'Клапан обратный латунный Ø12', article: 'М-010', unit: 'шт.', min_stock: 100, price: 135.00, category: 'Комплектующие' },
    { id: 11, name: 'Пружина силовая Ø80×250', article: 'М-011', unit: 'шт.', min_stock: 60, price: 280.00, category: 'Пружины' },
    { id: 12, name: 'Кольцо уплотнительное Ø45', article: 'М-012', unit: 'шт.', min_stock: 500, price: 22.00, category: 'РТИ' },
    { id: 13, name: 'Фланец стальной Ø100', article: 'М-013', unit: 'шт.', min_stock: 40, price: 350.00, category: 'Механообработка' },
    { id: 14, name: 'Баллон стальной сварной 20л', article: 'М-014', unit: 'шт.', min_stock: 30, price: 1800.00, category: 'Сварка' },
    { id: 15, name: 'Штуцер М16×1.5', article: 'М-015', unit: 'шт.', min_stock: 200, price: 65.00, category: 'Комплектующие' },
    { id: 16, name: 'Мембрана резиновая тип 20', article: 'М-016', unit: 'шт.', min_stock: 200, price: 150.00, category: 'РТИ' },
    { id: 17, name: 'Крышка алюминиевая литая', article: 'М-017', unit: 'шт.', min_stock: 80, price: 410.00, category: 'Литьё' },
    { id: 18, name: 'Шайба пружинная М10', article: 'М-018', unit: 'шт.', min_stock: 2000, price: 2.50, category: 'Крепёж' },
    { id: 19, name: 'Трубка медная Ø8×1', article: 'М-019', unit: 'м', min_stock: 100, price: 120.00, category: 'Комплектующие' },
    { id: 20, name: 'Краска порошковая RAL 9005', article: 'М-020', unit: 'кг', min_stock: 50, price: 380.00, category: 'Покрытия' },
  ]);

  // ==================== СПЕЦИФИКАЦИИ (BOM) ====================
  // Кран тормозной двухсекционный (id=1)
  await knex('product_materials').insert([
    { product_id: 1, material_id: 1, quantity: 1 },
    { product_id: 1, material_id: 2, quantity: 2 },
    { product_id: 1, material_id: 5, quantity: 4 },
    { product_id: 1, material_id: 4, quantity: 2 },
    { product_id: 1, material_id: 10, quantity: 2 },
    { product_id: 1, material_id: 12, quantity: 6 },
    { product_id: 1, material_id: 6, quantity: 8 },
    { product_id: 1, material_id: 7, quantity: 8 },
    // Камера тормозная тип 24 (id=3)
    { product_id: 3, material_id: 3, quantity: 1 },
    { product_id: 3, material_id: 8, quantity: 1 },
    { product_id: 3, material_id: 4, quantity: 1 },
    { product_id: 3, material_id: 13, quantity: 1 },
    { product_id: 3, material_id: 6, quantity: 6 },
    { product_id: 3, material_id: 7, quantity: 6 },
    // Энергоаккумулятор тип 24/24 (id=5)
    { product_id: 5, material_id: 9, quantity: 1 },
    { product_id: 5, material_id: 11, quantity: 1 },
    { product_id: 5, material_id: 3, quantity: 1 },
    { product_id: 5, material_id: 8, quantity: 1 },
    { product_id: 5, material_id: 5, quantity: 4 },
    { product_id: 5, material_id: 12, quantity: 4 },
    // Регулятор давления (id=6)
    { product_id: 6, material_id: 1, quantity: 1 },
    { product_id: 6, material_id: 2, quantity: 1 },
    { product_id: 6, material_id: 4, quantity: 2 },
    { product_id: 6, material_id: 5, quantity: 3 },
    { product_id: 6, material_id: 10, quantity: 1 },
    // Пневмоцилиндр управления КПП (id=9)
    { product_id: 9, material_id: 9, quantity: 1 },
    { product_id: 9, material_id: 8, quantity: 1 },
    { product_id: 9, material_id: 5, quantity: 2 },
    { product_id: 9, material_id: 12, quantity: 2 },
    { product_id: 9, material_id: 4, quantity: 1 },
    // Ресивер воздушный 20л (id=13)
    { product_id: 13, material_id: 14, quantity: 1 },
    { product_id: 13, material_id: 15, quantity: 2 },
    { product_id: 13, material_id: 20, quantity: 0.5 },
  ]);

  // ==================== РЕСУРСЫ (ОБОРУДОВАНИЕ) — 15 СТАНКОВ В 2 ЦЕХАХ ====================
  // Цех №1 — Механообработка (8 станков разного качества и точности)
  // Цех №2 — Сборка и испытания (7 станков/линий)
  await knex('resources').insert([
    // === ЦЕХ №1 — МЕХАНООБРАБОТКА ===
    // Токарные станки
    { id: 1, name: 'Токарный станок с ЧПУ DMG MORI NLX-2500', type: 'токарный', capacity: 20, status: 'активен', location: 'Цех №1', notes: 'Высокоточная обработка корпусов и штоков', quality_grade: 'премиум', precision_grade: 5, workshop_type: 'механообработка', year_manufactured: 2022, manufacturer: 'DMG MORI (Германия)' },
    { id: 2, name: 'Токарный станок с ЧПУ HAAS ST-30', type: 'токарный', capacity: 18, status: 'активен', location: 'Цех №1', notes: 'Обработка поршней и фланцев среднего размера', quality_grade: 'премиум', precision_grade: 6, workshop_type: 'механообработка', year_manufactured: 2021, manufacturer: 'HAAS (США)' },
    { id: 3, name: 'Токарный станок 16К20Т1', type: 'токарный', capacity: 12, status: 'активен', location: 'Цех №1', notes: 'Универсальная токарная обработка', quality_grade: 'стандарт', precision_grade: 7, workshop_type: 'механообработка', year_manufactured: 2018, manufacturer: 'КЗТС (Россия)' },
    { id: 4, name: 'Токарный станок 1М63Н', type: 'токарный', capacity: 10, status: 'на_обслуживании', location: 'Цех №1', notes: 'Крупногабаритная обработка', quality_grade: 'эконом', precision_grade: 8, workshop_type: 'механообработка', year_manufactured: 2015, manufacturer: 'КЗТС (Россия)' },
    // Фрезерные станки
    { id: 5, name: 'Фрезерный обрабатывающий центр DMG DMU 65 monoBLOCK', type: 'фрезерный', capacity: 15, status: 'активен', location: 'Цех №1', notes: '5-осевая обработка сложных корпусов', quality_grade: 'премиум', precision_grade: 4, workshop_type: 'механообработка', year_manufactured: 2023, manufacturer: 'DMG MORI (Германия)' },
    { id: 6, name: 'Фрезерный станок с ЧПУ HAAS VF-4', type: 'фрезерный', capacity: 14, status: 'активен', location: 'Цех №1', notes: 'Вертикальное фрезерование плоскостей', quality_grade: 'стандарт', precision_grade: 6, workshop_type: 'механообработка', year_manufactured: 2020, manufacturer: 'HAAS (США)' },
    { id: 7, name: 'Фрезерный станок 6Р13', type: 'фрезерный', capacity: 8, status: 'активен', location: 'Цех №1', notes: 'Универсальное фрезерование', quality_grade: 'эконом', precision_grade: 8, workshop_type: 'механообработка', year_manufactured: 2016, manufacturer: 'Станкозавод (Россия)' },
    // Шлифовальные и специальные
    { id: 8, name: 'Круглошлифовальный станок JUNKER QuickPoint 5000', type: 'шлифовальный', capacity: 12, status: 'активен', location: 'Цех №1', notes: 'Высокоточное шлифование штоков и поршней', quality_grade: 'премиум', precision_grade: 3, workshop_type: 'механообработка', year_manufactured: 2022, manufacturer: 'JUNKER (Германия)' },
    
    // === ЦЕХ №2 — СБОРКА И ИСПЫТАНИЯ ===
    // Линии сборки
    { id: 9, name: 'Автоматическая линия сборки тормозных кранов', type: 'линия_сборки', capacity: 50, status: 'активен', location: 'Цех №2', notes: 'Роботизированная сборка кранов с автоподачей', quality_grade: 'премиум', precision_grade: 5, workshop_type: 'сборка', year_manufactured: 2023, manufacturer: 'KUKA Systems (Германия)' },
    { id: 10, name: 'Линия сборки тормозных камер (полуавтомат)', type: 'линия_сборки', capacity: 40, status: 'активен', location: 'Цех №2', notes: 'Сборка камер и энергоаккумуляторов', quality_grade: 'стандарт', precision_grade: 6, workshop_type: 'сборка', year_manufactured: 2021, manufacturer: 'Bosch Rexroth (Германия)' },
    { id: 11, name: 'Сборочный участок пневмоцилиндров', type: 'участок_сборки', capacity: 30, status: 'активен', location: 'Цех №2', notes: 'Ручная сборка цилиндров КПП и заслонок', quality_grade: 'стандарт', precision_grade: 7, workshop_type: 'сборка', year_manufactured: 2019, manufacturer: 'Оборудование РБ' },
    // Испытательное оборудование
    { id: 12, name: 'Стенд испытательный пневматический прецизионный', type: 'испытательный', capacity: 60, status: 'активен', location: 'Цех №2', notes: 'Высокоточное тестирование на герметичность (0.001 бар)', quality_grade: 'премиум', precision_grade: 2, workshop_type: 'сборка', year_manufactured: 2024, manufacturer: 'Festo (Германия)' },
    { id: 13, name: 'Стенд испытательный стандартный', type: 'испытательный', capacity: 40, status: 'активен', location: 'Цех №2', notes: 'Стандартное тестирование изделий', quality_grade: 'стандарт', precision_grade: 5, workshop_type: 'сборка', year_manufactured: 2020, manufacturer: 'ОАО «ТАиМ» (Саморазработка)' },
    // Покраска и финиш
    { id: 14, name: 'Камера порошковой покраски с конвейером', type: 'покраска', capacity: 80, status: 'активен', location: 'Цех №2', notes: 'Автоматическая покраска порошком RAL', quality_grade: 'премиум', precision_grade: 6, workshop_type: 'сборка', year_manufactured: 2022, manufacturer: 'Wagner (Швейцария)' },
    { id: 15, name: 'Участок маркировки и упаковки', type: 'упаковка', capacity: 100, status: 'активен', location: 'Цех №2', notes: 'Лазерная маркировка и упаковка в гофрокартон', quality_grade: 'стандарт', precision_grade: 7, workshop_type: 'сборка', year_manufactured: 2021, manufacturer: 'Videojet (США)' },
  ]);

  // ==================== ЭТАПЫ ПРОИЗВОДСТВА (С УЧЕТОМ НОВЫХ СТАНКОВ) ====================
  // Кран тормозной двухсекционный (id=1) — этапы с передачей между цехами
  await knex('production_stages').insert([
    { product_id: 1, stage_number: 1, name: 'Фрезерование корпуса (5-осевое)', description: 'Высокоточная 5-осевая обработка на DMG DMU 65', duration_hours: 1.5, resource_id: 5 },
    { product_id: 1, stage_number: 2, name: 'Токарная обработка поршней (премиум)', description: 'Точение на DMG MORI NLX-2500 с классом точности 5', duration_hours: 1.0, resource_id: 1 },
    { product_id: 1, stage_number: 3, name: 'Шлифование штоков', description: 'Высокоточное шлифование на JUNKER QuickPoint', duration_hours: 0.8, resource_id: 8 },
    { product_id: 1, stage_number: 4, name: 'ПЕРЕДАЧА: Цех №1 → Цех №2', description: 'Транспортировка деталей в цех сборки', duration_hours: 0.2, resource_id: null },
    { product_id: 1, stage_number: 5, name: 'Сборка крана (автолиния)', description: 'Роботизированная сборка на линии KUKA Systems', duration_hours: 2.5, resource_id: 9 },
    { product_id: 1, stage_number: 6, name: 'Прецизионное испытание', description: 'Тестирование на стенде Festo (0.001 бар)', duration_hours: 0.8, resource_id: 12 },
    { product_id: 1, stage_number: 7, name: 'Покраска и маркировка', description: 'Порошковое покрытие Wagner + лазерная маркировка', duration_hours: 0.5, resource_id: 14 },
    { product_id: 1, stage_number: 8, name: 'Упаковка', description: 'Упаковка в гофрокартон Videojet', duration_hours: 0.2, resource_id: 15 },
    
    // Камера тормозная тип 24 (id=3)
    { product_id: 3, stage_number: 1, name: 'Фрезерование корпуса камеры', description: 'Обработка на HAAS VF-4', duration_hours: 0.8, resource_id: 6 },
    { product_id: 3, stage_number: 2, name: 'Токарная обработка штока', description: 'Точение на HAAS ST-30', duration_hours: 0.5, resource_id: 2 },
    { product_id: 3, stage_number: 3, name: 'Шлифование штока', description: 'Точное шлифование на JUNKER', duration_hours: 0.3, resource_id: 8 },
    { product_id: 3, stage_number: 4, name: 'ПЕРЕДАЧА: Цех №1 → Цех №2', description: 'Транспортировка в цех сборки', duration_hours: 0.2, resource_id: null },
    { product_id: 3, stage_number: 5, name: 'Сборка камеры', description: 'Сборка на линии Bosch Rexroth', duration_hours: 1.2, resource_id: 10 },
    { product_id: 3, stage_number: 6, name: 'Испытание (стандарт)', description: 'Тестирование на стандартном стенде', duration_hours: 0.4, resource_id: 13 },
    { product_id: 3, stage_number: 7, name: 'Покраска и упаковка', description: 'Покраска Wagner + упаковка Videojet', duration_hours: 0.4, resource_id: 14 },
    
    // Энергоаккумулятор тип 24/24 (id=5) — сложное изделие с множеством этапов
    { product_id: 5, stage_number: 1, name: 'Токарная обработка цилиндра', description: 'Расточка на DMG MORI NLX-2500', duration_hours: 1.5, resource_id: 1 },
    { product_id: 5, stage_number: 2, name: 'Хонингование цилиндра', description: 'Обработка на DMG DMU 65', duration_hours: 0.5, resource_id: 5 },
    { product_id: 5, stage_number: 3, name: 'Токарная обработка поршней', description: 'Точение на HAAS ST-30', duration_hours: 0.8, resource_id: 2 },
    { product_id: 5, stage_number: 4, name: 'Шлифование поршней', description: 'Точное шлифование на JUNKER', duration_hours: 0.6, resource_id: 8 },
    { product_id: 5, stage_number: 5, name: 'ПЕРЕДАЧА: Цех №1 → Цех №2 (этап 1)', description: 'Отправка деталей в цех сборки', duration_hours: 0.2, resource_id: null },
    { product_id: 5, stage_number: 6, name: 'Сборка пружинного механизма', description: 'Сборка на линии Bosch Rexroth', duration_hours: 2.0, resource_id: 10 },
    { product_id: 5, stage_number: 7, name: 'Сборка тормозной секции', description: 'Монтаж диафрагменной части', duration_hours: 1.5, resource_id: 10 },
    { product_id: 5, stage_number: 8, name: 'Соединение секций', description: 'Финальная стыковка', duration_hours: 1.0, resource_id: 11 },
    { product_id: 5, stage_number: 9, name: 'Контрольные испытания (премиум)', description: 'Испытание на стенде Festo', duration_hours: 1.5, resource_id: 12 },
    { product_id: 5, stage_number: 10, name: 'Покраска и упаковка', description: 'Покраска Wagner + упаковка', duration_hours: 0.5, resource_id: 15 },
    
    // Пневмоцилиндр КПП (id=9)
    { product_id: 9, stage_number: 1, name: 'Токарная обработка цилиндра', description: 'Точение на HAAS ST-30', duration_hours: 0.8, resource_id: 2 },
    { product_id: 9, stage_number: 2, name: 'Фрезерование посадок', description: 'Обработка на HAAS VF-4', duration_hours: 0.5, resource_id: 6 },
    { product_id: 9, stage_number: 3, name: 'Токарная обработка штока', description: 'Точение на 16К20Т1', duration_hours: 0.5, resource_id: 3 },
    { product_id: 9, stage_number: 4, name: 'Шлифование штока', description: 'Шлифование на JUNKER', duration_hours: 0.3, resource_id: 8 },
    { product_id: 9, stage_number: 5, name: 'ПЕРЕДАЧА: Цех №1 → Цех №2', description: 'Транспортировка в цех сборки', duration_hours: 0.2, resource_id: null },
    { product_id: 9, stage_number: 6, name: 'Сборка цилиндра (ручная)', description: 'Ручная сборка на участке', duration_hours: 1.5, resource_id: 11 },
    { product_id: 9, stage_number: 7, name: 'Испытание', description: 'Тестирование на стенде', duration_hours: 0.5, resource_id: 13 },
    { product_id: 9, stage_number: 8, name: 'Покраска и упаковка', description: 'Финальная обработка', duration_hours: 0.3, resource_id: 14 },
    
    // Ресивер воздушный (id=13) — требует сварки (будет на станке 6Р13 для фрезерования штуцеров)
    { product_id: 13, stage_number: 1, name: 'Токарная обработка днищ', description: 'Точение на 16К20Т1', duration_hours: 1.0, resource_id: 3 },
    { product_id: 13, stage_number: 2, name: 'Фрезерование штуцеров', description: 'Обработка на 6Р13', duration_hours: 0.5, resource_id: 7 },
    { product_id: 13, stage_number: 3, name: 'ПЕРЕДАЧА: Цех №1 → Цех №2 (сварка)', description: 'Отправка в цех для сварки', duration_hours: 0.2, resource_id: null },
    { product_id: 13, stage_number: 4, name: 'Сварка компонентов', description: 'Сварка днищ и обечайки', duration_hours: 1.5, resource_id: 11 },
    { product_id: 13, stage_number: 5, name: 'Гидроиспытание', description: 'Проверка на герметичность', duration_hours: 1.0, resource_id: 13 },
    { product_id: 13, stage_number: 6, name: 'Покраска и упаковка', description: 'Завершение', duration_hours: 0.5, resource_id: 15 },
  ]);

  // ==================== СКЛАДСКИЕ ОСТАТКИ ====================
  // Остатки материалов
  const materialStocks = [
    { item_type: 'material', item_id: 1, quantity: 120, reserved: 20, location: 'Склад №1, стеллаж А1' },
    { item_type: 'material', item_id: 2, quantity: 250, reserved: 40, location: 'Склад №1, стеллаж А2' },
    { item_type: 'material', item_id: 3, quantity: 400, reserved: 60, location: 'Склад №2, стеллаж Б1' },
    { item_type: 'material', item_id: 4, quantity: 300, reserved: 0, location: 'Склад №1, стеллаж А3' },
    { item_type: 'material', item_id: 5, quantity: 600, reserved: 100, location: 'Склад №2, стеллаж Б2' },
    { item_type: 'material', item_id: 6, quantity: 2500, reserved: 200, location: 'Склад №1, стеллаж В1' },
    { item_type: 'material', item_id: 7, quantity: 2500, reserved: 200, location: 'Склад №1, стеллаж В1' },
    { item_type: 'material', item_id: 8, quantity: 150, reserved: 30, location: 'Склад №1, стеллаж А4' },
    { item_type: 'material', item_id: 9, quantity: 80, reserved: 15, location: 'Склад №1, стеллаж А5' },
    { item_type: 'material', item_id: 10, quantity: 180, reserved: 0, location: 'Склад №1, стеллаж Г1' },
    { item_type: 'material', item_id: 11, quantity: 90, reserved: 10, location: 'Склад №1, стеллаж А6' },
    { item_type: 'material', item_id: 12, quantity: 800, reserved: 100, location: 'Склад №2, стеллаж Б3' },
    { item_type: 'material', item_id: 13, quantity: 60, reserved: 0, location: 'Склад №1, стеллаж Г2' },
    { item_type: 'material', item_id: 14, quantity: 25, reserved: 5, location: 'Склад №3, площадка 1' },
    { item_type: 'material', item_id: 15, quantity: 350, reserved: 50, location: 'Склад №1, стеллаж Г3' },
    { item_type: 'material', item_id: 16, quantity: 380, reserved: 0, location: 'Склад №2, стеллаж Б4' },
    { item_type: 'material', item_id: 17, quantity: 100, reserved: 20, location: 'Склад №1, стеллаж Д1' },
    { item_type: 'material', item_id: 18, quantity: 3000, reserved: 0, location: 'Склад №1, стеллаж В2' },
    { item_type: 'material', item_id: 19, quantity: 150, reserved: 0, location: 'Склад №1, стеллаж Г4' },
    { item_type: 'material', item_id: 20, quantity: 75, reserved: 10, location: 'Склад №4, участок ЛКМ' },
  ];
  // Остатки готовой продукции
  const productStocks = [
    { item_type: 'product', item_id: 1, quantity: 45, reserved: 10, location: 'Склад ГП, ряд 1' },
    { item_type: 'product', item_id: 2, quantity: 30, reserved: 5, location: 'Склад ГП, ряд 1' },
    { item_type: 'product', item_id: 3, quantity: 80, reserved: 20, location: 'Склад ГП, ряд 2' },
    { item_type: 'product', item_id: 4, quantity: 40, reserved: 15, location: 'Склад ГП, ряд 2' },
    { item_type: 'product', item_id: 5, quantity: 25, reserved: 8, location: 'Склад ГП, ряд 3' },
    { item_type: 'product', item_id: 6, quantity: 55, reserved: 0, location: 'Склад ГП, ряд 3' },
    { item_type: 'product', item_id: 7, quantity: 35, reserved: 10, location: 'Склад ГП, ряд 4' },
    { item_type: 'product', item_id: 8, quantity: 70, reserved: 0, location: 'Склад ГП, ряд 4' },
    { item_type: 'product', item_id: 9, quantity: 20, reserved: 5, location: 'Склад ГП, ряд 5' },
    { item_type: 'product', item_id: 10, quantity: 30, reserved: 0, location: 'Склад ГП, ряд 5' },
    { item_type: 'product', item_id: 11, quantity: 40, reserved: 0, location: 'Склад ГП, ряд 1' },
    { item_type: 'product', item_id: 12, quantity: 120, reserved: 30, location: 'Склад ГП, ряд 6' },
    { item_type: 'product', item_id: 13, quantity: 15, reserved: 5, location: 'Склад ГП, ряд 7' },
    { item_type: 'product', item_id: 14, quantity: 18, reserved: 0, location: 'Склад ГП, ряд 3' },
    { item_type: 'product', item_id: 15, quantity: 90, reserved: 20, location: 'Склад ГП, ряд 6' },
  ];
  await knex('warehouse').insert([...materialStocks, ...productStocks]);

  // ==================== ЗАКАЗЫ ====================
  await knex('orders').insert([
    { id: 1, order_number: 'ЗК-2026-001', customer_id: 1, created_by: 2, status: 'завершён', priority: 'высокий', created_at: '2026-01-15 09:00:00', planned_date: '2026-02-15', completed_date: '2026-02-12', total_cost: 252000.00, notes: 'Плановая поставка тормозных кранов для МАЗ-6430' },
    { id: 2, order_number: 'ЗК-2026-002', customer_id: 2, created_by: 2, status: 'завершён', priority: 'средний', created_at: '2026-01-20 10:30:00', planned_date: '2026-02-28', completed_date: '2026-02-25', total_cost: 336000.00, notes: 'Камеры тормозные для КАМАЗа' },
    { id: 3, order_number: 'ЗК-2026-003', customer_id: 1, created_by: 2, status: 'завершён', priority: 'высокий', created_at: '2026-02-01 08:00:00', planned_date: '2026-03-01', completed_date: '2026-02-28', total_cost: 504000.00, notes: 'Энергоаккумуляторы для новой серии МАЗ' },
    { id: 4, order_number: 'ЗК-2026-004', customer_id: 3, created_by: 2, status: 'отгружен', priority: 'средний', created_at: '2026-02-10 11:00:00', planned_date: '2026-03-20', completed_date: '2026-03-18', total_cost: 198000.00, notes: 'Пневмоцилиндры для БелАЗ' },
    { id: 5, order_number: 'ЗК-2026-005', customer_id: 4, created_by: 2, status: 'готов', priority: 'средний', created_at: '2026-02-20 14:00:00', planned_date: '2026-03-25', total_cost: 164000.00, notes: 'Клапаны защитные для Гомсельмаш' },
    { id: 6, order_number: 'ЗК-2026-006', customer_id: 5, created_by: 2, status: 'в_производстве', priority: 'высокий', created_at: '2026-03-01 09:30:00', planned_date: '2026-04-10', total_cost: 432000.00, notes: 'Крупный заказ кранов тормозных для Амкодор' },
    { id: 7, order_number: 'ЗК-2026-007', customer_id: 6, created_by: 2, status: 'в_производстве', priority: 'средний', created_at: '2026-03-05 10:00:00', planned_date: '2026-04-15', total_cost: 288000.00, notes: 'Ресиверы для МТЗ' },
    { id: 8, order_number: 'ЗК-2026-008', customer_id: 1, created_by: 2, status: 'в_производстве', priority: 'критический', created_at: '2026-03-10 08:00:00', planned_date: '2026-04-05', total_cost: 560000.00, notes: 'СРОЧНО: Комплект тормозной аппаратуры для МАЗ' },
    { id: 9, order_number: 'ЗК-2026-009', customer_id: 7, created_by: 2, status: 'подтверждён', priority: 'средний', created_at: '2026-03-15 11:30:00', planned_date: '2026-04-25', total_cost: 186000.00, notes: 'Регуляторы давления' },
    { id: 10, order_number: 'ЗК-2026-010', customer_id: 8, created_by: 2, status: 'подтверждён', priority: 'низкий', created_at: '2026-03-20 09:00:00', planned_date: '2026-05-01', total_cost: 144000.00, notes: 'Клапаны ускорительные для НефАЗ' },
    { id: 11, order_number: 'ЗК-2026-011', customer_id: 9, created_by: 2, status: 'на_согласовании', priority: 'высокий', created_at: '2026-03-25 14:00:00', planned_date: '2026-04-30', total_cost: 720000.00, notes: 'Расширенный комплект для МЗКТ' },
    { id: 12, order_number: 'ЗК-2026-012', customer_id: 10, created_by: 2, status: 'на_согласовании', priority: 'средний', created_at: '2026-03-28 10:00:00', planned_date: '2026-05-10', total_cost: 96000.00, notes: 'Краны разобщительные для МАЗ-Купава' },
    { id: 13, order_number: 'ЗК-2026-013', customer_id: 2, created_by: 2, status: 'новый', priority: 'средний', created_at: '2026-04-01 09:00:00', planned_date: '2026-05-15', total_cost: 468000.00, notes: 'Квартальный заказ КАМАЗ' },
    { id: 14, order_number: 'ЗК-2026-014', customer_id: 1, created_by: 2, status: 'новый', priority: 'высокий', created_at: '2026-04-05 08:30:00', planned_date: '2026-05-10', total_cost: 380000.00, notes: 'Дополнительный заказ МАЗ' },
    { id: 15, order_number: 'ЗК-2026-015', customer_id: 3, created_by: 2, status: 'новый', priority: 'низкий', created_at: '2026-04-10 11:00:00', planned_date: '2026-06-01', total_cost: 210000.00, notes: 'Плановый заказ БелАЗ Q2' },
  ]);

  // ==================== ПОЗИЦИИ ЗАКАЗОВ ====================
  await knex('order_items').insert([
    // Заказ 1 (МАЗ — краны тормозные)
    { order_id: 1, product_id: 1, quantity: 40, unit_price: 4500, total_price: 180000 },
    { order_id: 1, product_id: 2, quantity: 20, unit_price: 3200, total_price: 64000 },
    { order_id: 1, product_id: 12, quantity: 10, unit_price: 850, total_price: 8500 },
    // Заказ 2 (КАМАЗ — камеры тормозные)
    { order_id: 2, product_id: 3, quantity: 60, unit_price: 2800, total_price: 168000 },
    { order_id: 2, product_id: 4, quantity: 30, unit_price: 5600, total_price: 168000 },
    // Заказ 3 (МАЗ — энергоаккумуляторы)
    { order_id: 3, product_id: 5, quantity: 70, unit_price: 7200, total_price: 504000 },
    // Заказ 4 (БелАЗ — пневмоцилиндры)
    { order_id: 4, product_id: 9, quantity: 30, unit_price: 3600, total_price: 108000 },
    { order_id: 4, product_id: 10, quantity: 30, unit_price: 2900, total_price: 87000 },
    // Заказ 5 (Гомсельмаш — клапаны)
    { order_id: 5, product_id: 7, quantity: 40, unit_price: 4100, total_price: 164000 },
    // Заказ 6 (Амкодор — краны)
    { order_id: 6, product_id: 1, quantity: 60, unit_price: 4500, total_price: 270000 },
    { order_id: 6, product_id: 11, quantity: 50, unit_price: 3100, total_price: 155000 },
    // Заказ 7 (МТЗ — ресиверы)
    { order_id: 7, product_id: 13, quantity: 60, unit_price: 4800, total_price: 288000 },
    // Заказ 8 (МАЗ — СРОЧНО, комплект)
    { order_id: 8, product_id: 1, quantity: 30, unit_price: 4500, total_price: 135000 },
    { order_id: 8, product_id: 3, quantity: 50, unit_price: 2800, total_price: 140000 },
    { order_id: 8, product_id: 5, quantity: 20, unit_price: 7200, total_price: 144000 },
    { order_id: 8, product_id: 7, quantity: 10, unit_price: 4100, total_price: 41000 },
    // Заказ 9 (Могилёвтрансмаш — регуляторы)
    { order_id: 9, product_id: 6, quantity: 40, unit_price: 3800, total_price: 152000 },
    { order_id: 9, product_id: 15, quantity: 20, unit_price: 1600, total_price: 32000 },
    // Заказ 10 (НефАЗ — клапаны)
    { order_id: 10, product_id: 8, quantity: 60, unit_price: 2400, total_price: 144000 },
    // Заказ 11 (МЗКТ — расширенный комплект)
    { order_id: 11, product_id: 1, quantity: 50, unit_price: 4500, total_price: 225000 },
    { order_id: 11, product_id: 5, quantity: 40, unit_price: 7200, total_price: 288000 },
    { order_id: 11, product_id: 14, quantity: 40, unit_price: 5200, total_price: 208000 },
    // Заказ 12 (МАЗ-Купава — краны разобщительные)
    { order_id: 12, product_id: 15, quantity: 60, unit_price: 1600, total_price: 96000 },
    // Заказ 13 (КАМАЗ — квартальный)
    { order_id: 13, product_id: 3, quantity: 80, unit_price: 2800, total_price: 224000 },
    { order_id: 13, product_id: 4, quantity: 40, unit_price: 5600, total_price: 224000 },
    { order_id: 13, product_id: 8, quantity: 40, unit_price: 2400, total_price: 96000 },
    // Заказ 14 (МАЗ — допзаказ)
    { order_id: 14, product_id: 1, quantity: 40, unit_price: 4500, total_price: 180000 },
    { order_id: 14, product_id: 6, quantity: 50, unit_price: 3800, total_price: 190000 },
    // Заказ 15 (БелАЗ — плановый)
    { order_id: 15, product_id: 9, quantity: 40, unit_price: 3600, total_price: 144000 },
    { order_id: 15, product_id: 14, quantity: 12, unit_price: 5200, total_price: 62400 },
  ]);

  // ==================== ПРОИЗВОДСТВЕННЫЕ ЗАДАНИЯ ====================
  await knex('production_tasks').insert([
    // Задания для завершённых заказов
    { id: 1, order_id: 1, order_item_id: 1, product_id: 1, status: 'завершено', assigned_to: 4, start_date: '2026-01-20', end_date: '2026-02-05', quantity: 40, notes: 'Выполнено в срок' },
    { id: 2, order_id: 1, order_item_id: 2, product_id: 2, status: 'завершено', assigned_to: 4, start_date: '2026-01-22', end_date: '2026-02-08', quantity: 20 },
    { id: 3, order_id: 2, order_item_id: 4, product_id: 3, status: 'завершено', assigned_to: 4, start_date: '2026-01-25', end_date: '2026-02-15', quantity: 60 },
    { id: 4, order_id: 2, order_item_id: 5, product_id: 4, status: 'завершено', assigned_to: 4, start_date: '2026-01-28', end_date: '2026-02-20', quantity: 30 },
    { id: 5, order_id: 3, order_item_id: 6, product_id: 5, status: 'завершено', assigned_to: 4, start_date: '2026-02-05', end_date: '2026-02-25', quantity: 70 },
    // Задания для заказов в производстве
    { id: 6, order_id: 6, order_item_id: 10, product_id: 1, status: 'в_работе', assigned_to: 4, start_date: '2026-03-15', end_date: '2026-04-05', quantity: 60, notes: 'Партия 1/2: 30 шт. готово' },
    { id: 7, order_id: 6, order_item_id: 11, product_id: 11, status: 'в_работе', assigned_to: 4, start_date: '2026-03-18', end_date: '2026-04-08', quantity: 50 },
    { id: 8, order_id: 7, order_item_id: 12, product_id: 13, status: 'в_работе', assigned_to: 4, start_date: '2026-03-20', end_date: '2026-04-10', quantity: 60, notes: 'Сварка баллонов — 40 шт. готово' },
    { id: 9, order_id: 8, order_item_id: 13, product_id: 1, status: 'в_работе', assigned_to: 4, start_date: '2026-03-15', end_date: '2026-04-01', quantity: 30, notes: 'СРОЧНО — приоритет' },
    { id: 10, order_id: 8, order_item_id: 14, product_id: 3, status: 'в_работе', assigned_to: 4, start_date: '2026-03-18', end_date: '2026-04-03', quantity: 50 },
    { id: 11, order_id: 8, order_item_id: 15, product_id: 5, status: 'ожидание', assigned_to: 4, start_date: '2026-03-25', end_date: '2026-04-05', quantity: 20 },
    { id: 12, order_id: 8, order_item_id: 16, product_id: 7, status: 'ожидание', assigned_to: 4, start_date: '2026-03-28', end_date: '2026-04-05', quantity: 10 },
  ]);

  // ==================== НОВЫЕ ЗАКАЗЫ С РАЗНЫМИ ДЕТАЛЯМИ ====================
  // Дополнительные заказы для демонстрации работы двух цехов
  await knex('orders').insert([
    { id: 16, order_number: 'ЗК-2026-016', customer_id: 1, created_by: 2, status: 'в_производстве', priority: 'высокий', created_at: '2026-04-12 08:00:00', planned_date: '2026-05-01', total_cost: 580000.00, notes: 'Крупная партия кранов для МАЗ с требованием премиум-качества (класс точности 5)' },
    { id: 17, order_number: 'ЗК-2026-017', customer_id: 2, created_by: 2, status: 'в_производстве', priority: 'средний', created_at: '2026-04-15 10:30:00', planned_date: '2026-05-15', total_cost: 320000.00, notes: 'Камеры тормозные для КАМАЗ — стандартное качество' },
    { id: 18, order_number: 'ЗК-2026-018', customer_id: 4, created_by: 2, status: 'подтверждён', priority: 'высокий', created_at: '2026-04-18 09:00:00', planned_date: '2026-05-20', total_cost: 450000.00, notes: 'Энергоаккумуляторы для Гомсельмаш — усиленный контроль качества' },
    { id: 19, order_number: 'ЗК-2026-019', customer_id: 6, created_by: 2, status: 'подтверждён', priority: 'средний', created_at: '2026-04-20 11:00:00', planned_date: '2026-06-01', total_cost: 280000.00, notes: 'Ресиверы и пневмоцилиндры для МТЗ' },
    { id: 20, order_number: 'ЗК-2026-020', customer_id: 3, created_by: 2, status: 'новый', priority: 'критический', created_at: '2026-04-25 07:30:00', planned_date: '2026-05-10', total_cost: 720000.00, notes: 'СРОЧНО: Комплект тормозной аппаратуры для БелАЗ-7513 (большегруз)' },
  ]);

  // Позиции новых заказов
  await knex('order_items').insert([
    // Заказ 16 (МАЗ — премиум краны)
    { order_id: 16, product_id: 1, quantity: 80, unit_price: 5000, total_price: 400000 },
    { order_id: 16, product_id: 2, quantity: 50, unit_price: 3600, total_price: 180000 },
    // Заказ 17 (КАМАЗ — стандарт камеры)
    { order_id: 17, product_id: 3, quantity: 70, unit_price: 2800, total_price: 196000 },
    { order_id: 17, product_id: 4, quantity: 20, unit_price: 5600, total_price: 112000 },
    // Заказ 18 (Гомсельмаш — энергоаккумуляторы)
    { order_id: 18, product_id: 5, quantity: 50, unit_price: 7200, total_price: 360000 },
    { order_id: 18, product_id: 6, quantity: 20, unit_price: 4500, total_price: 90000 },
    // Заказ 19 (МТЗ — смешанный)
    { order_id: 19, product_id: 9, quantity: 40, unit_price: 3600, total_price: 144000 },
    { order_id: 19, product_id: 13, quantity: 25, unit_price: 4800, total_price: 120000 },
    { order_id: 19, product_id: 10, quantity: 20, unit_price: 2900, total_price: 58000 },
    // Заказ 20 (БелАЗ — критический, комплект)
    { order_id: 20, product_id: 5, quantity: 30, unit_price: 7200, total_price: 216000 },
    { order_id: 20, product_id: 3, quantity: 60, unit_price: 2800, total_price: 168000 },
    { order_id: 20, product_id: 7, quantity: 40, unit_price: 4100, total_price: 164000 },
    { order_id: 20, product_id: 14, quantity: 25, unit_price: 5200, total_price: 130000 },
  ]);

  // ==================== ПЕРЕДАЧИ МЕЖДУ ЦЕХАМИ (WIP TRANSFERS) ====================
  // Демонстрация активных передач между Цехом №1 и Цехом №2
  await knex('wip_transfers').insert([
    // Передача для заказа 16 (МАЗ — краны премиум)
    { task_id: 6, from_resource_id: 1, to_resource_id: 9, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 4, part_name: 'Корпуса и поршни кранов тормозных (премиум)', quantity: 30, status: 'принято', transfer_date: '2026-03-20 14:00:00', receive_date: '2026-03-20 16:30:00', transferred_by: 4, received_by: 4, notes: 'Партия 1/2 — обработка на DMG MORI NLX-2500 и DMG DMU 65' },
    { task_id: 6, from_resource_id: 5, to_resource_id: 12, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 4, part_name: 'Корпуса кранов (второй этап)', quantity: 20, status: 'в_пути', transfer_date: '2026-04-15 10:00:00', transferred_by: 4, notes: 'Транспортировка через внутренний конвейер' },
    
    // Передача для заказа 17 (КАМАЗ — камеры)
    { task_id: 3, from_resource_id: 2, to_resource_id: 10, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 4, part_name: 'Штоки и корпуса камер', quantity: 50, status: 'принято', transfer_date: '2026-02-18 09:00:00', receive_date: '2026-02-18 11:00:00', transferred_by: 4, received_by: 4, notes: 'Стандартная обработка на HAAS ST-30' },
    
    // Передача для заказа 8 (МАЗ — срочный)
    { task_id: 9, from_resource_id: 5, to_resource_id: 9, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 4, part_name: 'Корпуса кранов (срочно)', quantity: 15, status: 'принято', transfer_date: '2026-03-16 08:00:00', receive_date: '2026-03-16 10:00:00', transferred_by: 4, received_by: 4, notes: 'Срочная передач — приоритетное производство на DMG DMU 65' },
    { task_id: 9, from_resource_id: 1, to_resource_id: 9, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 4, part_name: 'Поршни кранов (срочно)', quantity: 15, status: 'в_пути', transfer_date: '2026-04-20 14:00:00', transferred_by: 4, notes: 'Второй этап срочного заказа' },
    
    // Передача для энергоаккумуляторов (заказ 11 — МЗКТ)
    { task_id: 5, from_resource_id: 8, to_resource_id: 10, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 5, part_name: 'Цилиндры и поршни энергоаккумуляторов', quantity: 40, status: 'принято', transfer_date: '2026-03-22 11:00:00', receive_date: '2026-03-22 13:00:00', transferred_by: 4, received_by: 4, notes: 'Высокоточная обработка — шлифование на JUNKER' },
    
    // Текущие (в ожидании) передачи для демонстрации
    { task_id: 7, from_resource_id: 3, to_resource_id: 11, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 5, part_name: 'Детали кранов стояночного тормоза', quantity: 25, status: 'в_ожидании', notes: 'Ожидание завершения обработки на 16К20Т1' },
    { task_id: 8, from_resource_id: 3, to_resource_id: 11, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 3, part_name: 'Днища ресиверов', quantity: 40, status: 'в_ожидании', notes: 'Готово к передаче — требуется транспортировка в цех сварки' },
    { task_id: 10, from_resource_id: 6, to_resource_id: 10, from_workshop: 'Цех №1', to_workshop: 'Цех №2', stage_id: 4, part_name: 'Корпуса камер (срочный заказ)', quantity: 25, status: 'в_работе', transfer_date: '2026-04-22 09:00:00', transferred_by: 4, notes: 'Срочная передача для заказа МАЗ' },
  ]);
};
