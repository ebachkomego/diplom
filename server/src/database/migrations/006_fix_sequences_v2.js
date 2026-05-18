// Миграция: исправление sequence v2 — используем прямое имя sequence
// (предыдущая миграция могла не сработать из-за timing в serverless)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const client = knex.client.config.client;
  if (client !== 'pg') {
    console.log('Sequence fix v2: skipping (not PostgreSQL)');
    return;
  }

  // Прямые имена sequence в PostgreSQL (формат: tableName_id_seq)
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
    'chart_templates',
    'workshop_transfers',
  ];

  for (const table of tables) {
    try {
      const exists = await knex.schema.hasTable(table);
      if (!exists) continue;

      // Используем прямой SQL для обновления sequence
      await knex.raw(`
        DO $$
        DECLARE
          max_id BIGINT;
          seq_name TEXT;
        BEGIN
          EXECUTE 'SELECT COALESCE(MAX(id), 0) FROM "' || ? || '"' INTO max_id;
          seq_name := ? || '_id_seq';
          PERFORM setval(seq_name, GREATEST(max_id, 1));
        END $$;
      `, [table, table]);

      console.log(`✅ Sequence synced: ${table}_id_seq`);
    } catch (err) {
      console.log(`⚠️ ${table}: ${err.message}`);
    }
  }
};

exports.down = function() { return Promise.resolve(); };
