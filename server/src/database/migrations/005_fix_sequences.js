// Миграция: синхронизация PostgreSQL-последовательностей после seed-данных
// Это нужно потому что seed-скрипт вставлял записи с явными ID,
// из-за чего счётчики sequences остались на 1, а данные уже на 10-100+

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Работаем только с PostgreSQL
  const client = knex.client.config.client;
  if (client !== 'pg' && client !== 'postgres' && client !== 'postgresql') {
    console.log('⚠️ Sequence fix: skipping (not PostgreSQL)');
    return;
  }

  const tables = [
    'users',
    'customers',
    'products',
    'materials',
    'product_materials',
    'warehouse',
    'orders',
    'order_items',
    'resources',
    'production_stages',
    'production_tasks',
    'task_stages',
  ];

  console.log('🔧 Synchronizing PostgreSQL sequences...');
  
  for (const table of tables) {
    try {
      // Проверяем что таблица существует
      const exists = await knex.schema.hasTable(table);
      if (!exists) {
        console.log(`⚠️ Table ${table} not found, skipping.`);
        continue;
      }
      
      // Сбрасываем sequence на max(id) + 1
      await knex.raw(`
        SELECT setval(
          pg_get_serial_sequence(?, 'id'),
          COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1,
          false
        )
      `, [table]);
      
      console.log(`✅ Sequence for ${table} synchronized.`);
    } catch (err) {
      console.log(`⚠️ Could not sync sequence for ${table}: ${err.message}`);
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Невозможно откатить синхронизацию sequence — это безопасная операция
  return Promise.resolve();
};
