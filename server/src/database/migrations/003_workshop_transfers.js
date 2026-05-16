// Миграция — создание таблицы для передачи деталей между цехами (WIP transfers)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Таблица передачи деталей между цехами (WIP - Work In Progress)
    .createTable('wip_transfers', (table) => {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable()
        .references('id').inTable('production_tasks').onDelete('CASCADE');
      table.integer('from_resource_id').unsigned()
        .references('id').inTable('resources').onDelete('SET NULL');
      table.integer('to_resource_id').unsigned()
        .references('id').inTable('resources').onDelete('SET NULL');
      table.string('from_workshop', 50).notNullable(); // Цех отправитель
      table.string('to_workshop', 50).notNullable(); // Цех получатель
      table.integer('stage_id').unsigned()
        .references('id').inTable('production_stages').onDelete('SET NULL');
      table.string('part_name', 255).notNullable(); // Название детали/узла
      table.integer('quantity').notNullable().defaultTo(1);
      table.string('status', 30).defaultTo('в_ожидании'); // в_ожидании, в_пути, принято, отклонено
      table.datetime('transfer_date'); // Дата отправки
      table.datetime('receive_date'); // Дата получения
      table.integer('transferred_by').unsigned() // Кто передал
        .references('id').inTable('users').onDelete('SET NULL');
      table.integer('received_by').unsigned() // Кто принял
        .references('id').inTable('users').onDelete('SET NULL');
      table.text('notes');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    // Добавляем поля для отслеживания качества станков
    .alterTable('resources', (table) => {
      table.string('quality_grade', 20).defaultTo('стандарт'); // премиум, стандарт, эконом
      table.integer('precision_grade').defaultTo(7); // Класс точности (1-12)
      table.string('workshop_type', 50); // тип цеха: механообработка, сборка
      table.integer('year_manufactured').unsigned();
      table.string('manufacturer', 100);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('wip_transfers')
    .alterTable('resources', (table) => {
      table.dropColumn('quality_grade');
      table.dropColumn('precision_grade');
      table.dropColumn('workshop_type');
      table.dropColumn('year_manufactured');
      table.dropColumn('manufacturer');
    });
};
