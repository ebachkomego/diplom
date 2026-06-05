exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('settings');
  if (exists) return;

  await knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.string('key', 100).notNullable().unique();
    table.text('value');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex('settings').insert([
    { key: 'notification_email', value: 'bgdfs0422@gmail.com' }
  ]);
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('settings');
};
