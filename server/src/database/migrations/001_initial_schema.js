// Миграция — создание всех таблиц базы данных ИС ОАО «ТАиМ»

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Таблица пользователей системы
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username', 50).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('full_name', 150).notNullable();
      table.string('role', 50).notNullable(); // администратор, менеджер, начальник_производства, мастер, кладовщик
      table.string('email', 150);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Таблица клиентов-заказчиков
    .createTable('customers', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('contact_person', 150);
      table.string('phone', 30);
      table.string('email', 150);
      table.text('address');
      table.string('inn', 20).unique();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Справочник выпускаемой продукции
    .createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('article', 50).unique();
      table.text('description');
      table.string('unit', 20).defaultTo('шт.');
      table.decimal('price', 12, 2).defaultTo(0);
      table.decimal('production_time_hours', 8, 2).defaultTo(1);
      table.string('category', 100);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Справочник материалов и комплектующих
    .createTable('materials', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('article', 50).unique();
      table.string('unit', 20).defaultTo('шт.');
      table.decimal('min_stock', 12, 2).defaultTo(0);
      table.decimal('price', 12, 2).defaultTo(0);
      table.string('category', 100);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Спецификации (BOM) — состав изделия
    .createTable('product_materials', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().notNullable()
        .references('id').inTable('products').onDelete('CASCADE');
      table.integer('material_id').unsigned().notNullable()
        .references('id').inTable('materials').onDelete('CASCADE');
      table.decimal('quantity', 12, 4).notNullable();
    })

    // Складские остатки
    .createTable('warehouse', (table) => {
      table.increments('id').primary();
      table.string('item_type', 20).notNullable(); // material, product
      table.integer('item_id').unsigned().notNullable();
      table.decimal('quantity', 12, 2).defaultTo(0);
      table.decimal('reserved', 12, 2).defaultTo(0);
      table.string('location', 100);
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // Заказы клиентов
    .createTable('orders', (table) => {
      table.increments('id').primary();
      table.string('order_number', 30).notNullable().unique();
      table.integer('customer_id').unsigned().notNullable()
        .references('id').inTable('customers').onDelete('RESTRICT');
      table.integer('created_by').unsigned()
        .references('id').inTable('users').onDelete('SET NULL');
      table.string('status', 30).notNullable().defaultTo('новый');
      // Статусы: новый, на_согласовании, подтверждён, в_производстве, готов, отгружен, завершён, отклонён
      table.string('priority', 20).defaultTo('средний'); // низкий, средний, высокий, критический
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.date('planned_date');
      table.date('completed_date');
      table.decimal('total_cost', 14, 2).defaultTo(0);
      table.text('notes');
    })

    // Позиции (строки) заказов
    .createTable('order_items', (table) => {
      table.increments('id').primary();
      table.integer('order_id').unsigned().notNullable()
        .references('id').inTable('orders').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable()
        .references('id').inTable('products').onDelete('RESTRICT');
      table.integer('quantity').notNullable().defaultTo(1);
      table.decimal('unit_price', 12, 2).defaultTo(0);
      table.decimal('total_price', 14, 2).defaultTo(0);
    })

    // Ресурсы (оборудование и мощности)
    .createTable('resources', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('type', 50); // станок, линия, участок
      table.integer('capacity').defaultTo(1); // пропускная способность (единиц/день)
      table.string('status', 30).defaultTo('активен'); // активен, на_обслуживании, неисправен
      table.string('location', 100);
      table.text('notes');
    })

    // Этапы производства (технологическая карта изделия)
    .createTable('production_stages', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().notNullable()
        .references('id').inTable('products').onDelete('CASCADE');
      table.integer('stage_number').notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.decimal('duration_hours', 8, 2).notNullable();
      table.integer('resource_id').unsigned()
        .references('id').inTable('resources').onDelete('SET NULL');
    })

    // Производственные задания
    .createTable('production_tasks', (table) => {
      table.increments('id').primary();
      table.integer('order_id').unsigned().notNullable()
        .references('id').inTable('orders').onDelete('CASCADE');
      table.integer('order_item_id').unsigned()
        .references('id').inTable('order_items').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable()
        .references('id').inTable('products').onDelete('RESTRICT');
      table.string('status', 30).defaultTo('ожидание'); // ожидание, в_работе, завершено, отменено
      table.integer('assigned_to').unsigned()
        .references('id').inTable('users').onDelete('SET NULL');
      table.date('start_date');
      table.date('end_date');
      table.integer('quantity').defaultTo(1);
      table.text('notes');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Выполнение этапов производственных заданий
    .createTable('task_stages', (table) => {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable()
        .references('id').inTable('production_tasks').onDelete('CASCADE');
      table.integer('stage_id').unsigned().notNullable()
        .references('id').inTable('production_stages').onDelete('CASCADE');
      table.string('status', 30).defaultTo('ожидание'); // ожидание, в_работе, завершено
      table.datetime('start_date');
      table.datetime('end_date');
      table.decimal('actual_duration', 8, 2);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('task_stages')
    .dropTableIfExists('production_tasks')
    .dropTableIfExists('production_stages')
    .dropTableIfExists('resources')
    .dropTableIfExists('order_items')
    .dropTableIfExists('orders')
    .dropTableIfExists('warehouse')
    .dropTableIfExists('product_materials')
    .dropTableIfExists('materials')
    .dropTableIfExists('products')
    .dropTableIfExists('customers')
    .dropTableIfExists('users');
};
