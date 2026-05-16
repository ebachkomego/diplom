/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('chart_templates');
  if (exists) {
    return;
  }

  await knex.schema.createTable('chart_templates', (table) => {
    table.increments('id').primary();
    table.string('name', 200).notNullable();
    table.text('config_json').notNullable();
    table.string('scope', 20).notNullable().defaultTo('private'); // private, role, public
    table.string('role', 50).nullable();
    table.integer('owner_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('chart_templates');
};
