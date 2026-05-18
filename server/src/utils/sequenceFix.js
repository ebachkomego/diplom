const db = require('../database/connection');

/**
 * Fixes a broken PostgreSQL sequence for a table by resetting it to MAX(id).
 * Called automatically when a duplicate key error on the primary key is detected.
 * @param {string} tableName 
 */
async function fixSequence(tableName) {
  try {
    await db.raw(`
      SELECT setval(
        '${tableName}_id_seq',
        COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) + 1,
        false
      )
    `);
    console.log(`✅ Fixed sequence for ${tableName}`);
  } catch (err) {
    console.error(`⚠️ Could not fix sequence for ${tableName}:`, err.message);
  }
}

/**
 * Checks if an error is a PostgreSQL duplicate primary key error.
 * @param {Error} err 
 * @returns {boolean}
 */
function isDuplicatePkeyError(err) {
  return err.message && err.message.includes('duplicate key value violates unique constraint') && err.message.includes('_pkey');
}

/**
 * Extracts table name from a duplicate pkey error message.
 * Example: "duplicate key value violates unique constraint "orders_pkey""  -> "orders"
 * @param {Error} err 
 * @returns {string|null}
 */
function extractTableFromError(err) {
  const match = err.message.match(/"(\w+)_pkey"/);
  return match ? match[1] : null;
}

module.exports = { fixSequence, isDuplicatePkeyError, extractTableFromError };
