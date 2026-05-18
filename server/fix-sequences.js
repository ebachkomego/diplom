const db = require('./src/database/connection');

async function fixSequences() {
  try {
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
      'workshop_transfers'
    ];

    console.log('Synchronizing PostgreSQL sequences...');

    for (const table of tables) {
      try {
        // Find the maximum ID in the table
        const result = await db(table).max('id as maxId').first();
        const maxId = result && result.maxId ? result.maxId : 0;
        
        if (maxId > 0) {
          // Set the sequence to the maximum ID + 1
          await db.raw(`SELECT setval('${table}_id_seq', ?)`, [maxId]);
          console.log(`✅ ${table}_id_seq updated to ${maxId}`);
        } else {
          console.log(`ℹ️ ${table} is empty, skipping sequence update.`);
        }
      } catch (err) {
        // Some tables might not exist or might not have id_seq if we are on SQLite
        console.log(`⚠️ Skipped ${table}: ${err.message}`);
      }
    }
    
    console.log('All sequences synchronized successfully!');
  } catch (error) {
    console.error('Error synchronizing sequences:', error);
  } finally {
    db.destroy();
  }
}

fixSequences();
