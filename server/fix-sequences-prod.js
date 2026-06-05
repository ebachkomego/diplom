// Скрипт для одноразового исправления всех PostgreSQL-последовательностей
// Запускать: NODE_ENV=production node fix-sequences-prod.js

require('dotenv').config();
process.env.NODE_ENV = 'production';

const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: 'postgresql://postgres.ezcvpwwueqkqfnjtwyra:StOk9y7L22wdQMwE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  }
});

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

async function run() {
  console.log('🔧 Connecting to Supabase production database...');
  
  for (const table of tables) {
    try {
      const result = await db.raw(`
        SELECT setval(
          '${table}_id_seq',
          COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1,
          false
        )
      `);
      const maxRow = await db(table).max('id as maxId').first();
      console.log(`✅ ${table}_id_seq → next will be: ${(maxRow?.maxId || 0) + 1}`);
    } catch (err) {
      console.log(`⚠️  ${table}: ${err.message.split('\n')[0]}`);
    }
  }
  
  console.log('\n✅ Done! All sequences are now synced.');
  await db.destroy();
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
